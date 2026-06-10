from decimal import Decimal, InvalidOperation

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models import Favorite, PromotionUse, Restaurant, User
from ..serializers import serialize_restaurant, serialize_user, user_state_sets

restaurants_bp = Blueprint("restaurants", __name__)


def current_user() -> User:
    return db.session.get(User, int(get_jwt_identity()))


def _truthy(value: str | None) -> bool:
    return (value or "").lower() in {"1", "true", "sim", "yes"}


def _matches_search(restaurant: dict, search: str) -> bool:
    if not search:
        return True
    promotion = restaurant.get("promotion") or {}
    haystack = " ".join(
        [
            restaurant["name"],
            restaurant["segment"],
            restaurant["neighborhood"],
            restaurant["address"],
            promotion.get("title") or "",
            promotion.get("description") or "",
        ]
    ).lower()
    return search.lower() in haystack


@restaurants_bp.get("/restaurants")
@jwt_required()
def list_restaurants():
    user = current_user()
    favorite_ids, visited_ids = user_state_sets(user.id)
    restaurants = Restaurant.query.filter_by(active=True).order_by(Restaurant.distance_meters.asc()).all()
    serialized = [serialize_restaurant(item, favorite_ids, visited_ids) for item in restaurants]

    search = request.args.get("search", "").strip()
    neighborhood = request.args.get("neighborhood", "").strip().lower()
    segment = request.args.get("segment", "").strip().lower()

    filtered = [item for item in serialized if _matches_search(item, search)]
    if neighborhood:
        filtered = [item for item in filtered if item["neighborhood"].lower() == neighborhood]
    if segment:
        filtered = [item for item in filtered if item["segment"].lower() == segment]
    if _truthy(request.args.get("favorites")):
        filtered = [item for item in filtered if item["is_favorite"]]
    if _truthy(request.args.get("visited")):
        filtered = [item for item in filtered if item["is_visited"]]
    if _truthy(request.args.get("not_visited")):
        filtered = [item for item in filtered if not item["is_visited"]]
    if _truthy(request.args.get("delivery")):
        filtered = [item for item in filtered if item["accepts_delivery"]]
    if _truthy(request.args.get("in_person")):
        filtered = [item for item in filtered if item["accepts_in_person"]]
    if _truthy(request.args.get("pet_friendly")):
        filtered = [item for item in filtered if item["pet_friendly"]]
    if _truthy(request.args.get("kids_area")):
        filtered = [item for item in filtered if item["kids_area"]]

    return jsonify({"restaurants": filtered})


@restaurants_bp.get("/restaurants/<int:restaurant_id>")
@jwt_required()
def get_restaurant(restaurant_id: int):
    user = current_user()
    restaurant = db.session.get(Restaurant, restaurant_id)
    if not restaurant or not restaurant.active:
        return jsonify({"message": "Restaurante nao encontrado."}), 404

    favorite_ids, visited_ids = user_state_sets(user.id)
    return jsonify({"restaurant": serialize_restaurant(restaurant, favorite_ids, visited_ids)})


@restaurants_bp.post("/restaurants/<int:restaurant_id>/favorite")
@jwt_required()
def add_favorite(restaurant_id: int):
    user = current_user()
    restaurant = db.session.get(Restaurant, restaurant_id)
    if not restaurant or not restaurant.active:
        return jsonify({"message": "Restaurante nao encontrado."}), 404

    favorite = Favorite.query.filter_by(user_id=user.id, restaurant_id=restaurant_id).first()
    if not favorite:
        db.session.add(Favorite(user_id=user.id, restaurant_id=restaurant_id))
        db.session.commit()

    favorite_ids, visited_ids = user_state_sets(user.id)
    return jsonify({"restaurant": serialize_restaurant(restaurant, favorite_ids, visited_ids)})


@restaurants_bp.delete("/restaurants/<int:restaurant_id>/favorite")
@jwt_required()
def remove_favorite(restaurant_id: int):
    user = current_user()
    restaurant = db.session.get(Restaurant, restaurant_id)
    if not restaurant or not restaurant.active:
        return jsonify({"message": "Restaurante nao encontrado."}), 404

    Favorite.query.filter_by(user_id=user.id, restaurant_id=restaurant_id).delete()
    db.session.commit()

    favorite_ids, visited_ids = user_state_sets(user.id)
    return jsonify({"restaurant": serialize_restaurant(restaurant, favorite_ids, visited_ids)})


@restaurants_bp.post("/restaurants/<int:restaurant_id>/uses")
@jwt_required()
def create_promotion_use(restaurant_id: int):
    user = current_user()
    restaurant = db.session.get(Restaurant, restaurant_id)
    if not restaurant or not restaurant.active:
        return jsonify({"message": "Restaurante nao encontrado."}), 404

    data = request.get_json(silent=True) or {}
    try:
        savings_value = Decimal(str(data.get("savings_value", "")).replace(",", "."))
    except InvalidOperation:
        return jsonify({"message": "Informe um valor economizado valido."}), 400

    if savings_value <= 0:
        return jsonify({"message": "O valor economizado deve ser maior que zero."}), 400

    existing = PromotionUse.query.filter_by(user_id=user.id, restaurant_id=restaurant_id).first()
    if existing:
        return jsonify({"message": "Promocao ja registrada para este restaurante."}), 409

    promotion = next((item for item in restaurant.promotions if item.active), None)
    if not promotion:
        return jsonify({"message": "Restaurante sem promocao ativa."}), 400

    use = PromotionUse(
        user_id=user.id,
        restaurant_id=restaurant.id,
        promotion_id=promotion.id,
        savings_value=savings_value,
        photo_url=data.get("photo_url") or None,
    )
    db.session.add(use)
    db.session.commit()

    favorite_ids, visited_ids = user_state_sets(user.id)
    return (
        jsonify(
            {
                "restaurant": serialize_restaurant(restaurant, favorite_ids, visited_ids),
                "user": serialize_user(user),
            }
        ),
        201,
    )
