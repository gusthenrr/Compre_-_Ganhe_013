from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from werkzeug.security import check_password_hash, generate_password_hash

from ..extensions import db
from ..models import User
from ..serializers import serialize_user

users_bp = Blueprint("users", __name__)


def current_user() -> User:
    return db.session.get(User, int(get_jwt_identity()))


@users_bp.get("/me")
@jwt_required()
def me():
    return jsonify({"user": serialize_user(current_user())})


@users_bp.patch("/me/password")
@jwt_required()
def change_password():
    user = current_user()
    data = request.get_json(silent=True) or {}
    current_password = data.get("current_password") or ""
    new_password = data.get("new_password") or ""

    if user.auth_provider == "google" and not user.password_hash:
        return jsonify({"message": "Senha gerenciada pela conta Google."}), 400

    if len(new_password) < 6:
        return jsonify({"message": "A nova senha deve ter pelo menos 6 caracteres."}), 400

    if not user.password_hash or not check_password_hash(user.password_hash, current_password):
        return jsonify({"message": "Senha atual invalida."}), 401

    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({"message": "Senha atualizada."})
