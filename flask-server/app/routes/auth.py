from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash, generate_password_hash

from ..extensions import db
from ..models import User
from ..serializers import serialize_user

auth_bp = Blueprint("auth", __name__)


def _parse_birth_date(value):
    if not value:
        return None
    for pattern in ("%Y-%m-%d", "%d/%m/%Y"):
        try:
            return datetime.strptime(value, pattern).date()
        except ValueError:
            continue
    return None


def _split_identifier(identifier: str) -> tuple[str | None, str | None]:
    normalized = identifier.strip().lower()
    if "@" in normalized:
        return normalized, None
    return None, normalized


def _auth_response(user: User):
    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": serialize_user(user)})


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    identifier = (data.get("identifier") or data.get("email_or_phone") or "").strip().lower()
    password = data.get("password") or ""

    if not identifier or not password:
        return jsonify({"message": "Informe email/telefone e senha."}), 400

    user = User.query.filter((User.email == identifier) | (User.phone == identifier)).first()
    if not user or not user.password_hash or not check_password_hash(user.password_hash, password):
        return jsonify({"message": "Credenciais invalidas."}), 401

    return _auth_response(user)


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    identifier = (data.get("identifier") or "").strip()
    password = data.get("password") or ""
    name = (data.get("name") or "").strip()
    birth_date = _parse_birth_date(data.get("birth_date") or "")

    if not identifier or not password or not name or not birth_date:
        return jsonify({"message": "Preencha identificador, senha, nome e data de nascimento."}), 400

    email, phone = _split_identifier(identifier)
    existing = None
    if email:
        existing = User.query.filter_by(email=email).first()
    if phone and not existing:
        existing = User.query.filter_by(phone=phone).first()
    if existing:
        return jsonify({"message": "Ja existe uma conta com esse email ou telefone."}), 409

    user = User(
        name=name,
        email=email,
        phone=phone,
        password_hash=generate_password_hash(password),
        birth_date=birth_date,
        auth_provider="manual",
    )
    db.session.add(user)
    db.session.commit()

    return _auth_response(user), 201


@auth_bp.post("/google")
def google_login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "gustavo@email.com").strip().lower()
    name = (data.get("name") or "Gustavo").strip()

    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(name=name, email=email, auth_provider="google")
        db.session.add(user)
        db.session.commit()

    return _auth_response(user)
