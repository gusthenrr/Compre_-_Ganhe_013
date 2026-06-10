from decimal import Decimal

from sqlalchemy import func

from .extensions import db
from .models import Favorite, PromotionUse, Restaurant, User


def money_to_float(value):
    if value is None:
        return 0.0
    if isinstance(value, Decimal):
        return float(value)
    return value


def user_summary(user: User) -> dict:
    visited_count = (
        db.session.query(func.count(func.distinct(PromotionUse.restaurant_id)))
        .filter(PromotionUse.user_id == user.id)
        .scalar()
        or 0
    )
    total_saved = (
        db.session.query(func.coalesce(func.sum(PromotionUse.savings_value), 0))
        .filter(PromotionUse.user_id == user.id)
        .scalar()
        or 0
    )
    active_restaurants = Restaurant.query.filter_by(active=True).count()

    return {
        "visited_count": visited_count,
        "total_saved": money_to_float(total_saved),
        "remaining_promotions": max(active_restaurants - visited_count, 0),
    }


def serialize_user(user: User) -> dict:
    summary = user_summary(user)
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "identifier": user.email or user.phone,
        "birth_date": user.birth_date.isoformat() if user.birth_date else None,
        "auth_provider": user.auth_provider,
        **summary,
    }


def user_state_sets(user_id: int) -> tuple[set[int], set[int]]:
    favorite_ids = {
        item[0]
        for item in db.session.query(Favorite.restaurant_id).filter(Favorite.user_id == user_id).all()
    }
    visited_ids = {
        item[0]
        for item in db.session.query(PromotionUse.restaurant_id)
        .filter(PromotionUse.user_id == user_id)
        .distinct()
        .all()
    }
    return favorite_ids, visited_ids


def serialize_promotion(promotion) -> dict | None:
    if not promotion:
        return None
    return {
        "id": promotion.id,
        "title": promotion.title,
        "description": promotion.description,
        "image_url": promotion.image_url,
        "rules": promotion.rules,
    }


def serialize_restaurant(restaurant: Restaurant, favorite_ids=None, visited_ids=None) -> dict:
    favorite_ids = favorite_ids or set()
    visited_ids = visited_ids or set()
    promotion = next((item for item in restaurant.promotions if item.active), None)
    mode = "Ambos" if restaurant.accepts_in_person and restaurant.accepts_delivery else "Presencial"
    if restaurant.accepts_delivery and not restaurant.accepts_in_person:
        mode = "Delivery"

    return {
        "id": restaurant.id,
        "name": restaurant.name,
        "segment": restaurant.segment,
        "neighborhood": restaurant.neighborhood,
        "address": restaurant.address,
        "phone": restaurant.phone,
        "instagram": restaurant.instagram,
        "image_url": restaurant.image_url,
        "logo_url": restaurant.logo_url,
        "promotion_book_image_url": restaurant.promotion_book_image_url,
        "latitude": restaurant.latitude,
        "longitude": restaurant.longitude,
        "distance_meters": restaurant.distance_meters,
        "accepts_in_person": restaurant.accepts_in_person,
        "accepts_delivery": restaurant.accepts_delivery,
        "service_mode": mode,
        "pet_friendly": restaurant.pet_friendly,
        "kids_area": restaurant.kids_area,
        "is_favorite": restaurant.id in favorite_ids,
        "is_visited": restaurant.id in visited_ids,
        "promotion": serialize_promotion(promotion),
    }
