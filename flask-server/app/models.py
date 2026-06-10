from datetime import datetime, timezone

from sqlalchemy import UniqueConstraint

from .extensions import db


def utc_now():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column("nome", db.String(120), nullable=False)
    email = db.Column(db.String(160), unique=True, nullable=True)
    phone = db.Column("telefone", db.String(40), unique=True, nullable=True)
    password_hash = db.Column("senha_hash", db.String(255), nullable=True)
    birth_date = db.Column("data_nascimento", db.Date, nullable=True)
    auth_provider = db.Column(db.String(30), nullable=False, default="manual")
    created_at = db.Column("data_criacao", db.DateTime(timezone=True), default=utc_now, nullable=False)

    favorites = db.relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    promotion_uses = db.relationship("PromotionUse", back_populates="user", cascade="all, delete-orphan")


class Restaurant(db.Model):
    __tablename__ = "restaurantes"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column("nome", db.String(160), nullable=False, unique=True)
    segment = db.Column("segmento", db.String(80), nullable=False)
    neighborhood = db.Column("bairro", db.String(80), nullable=False)
    address = db.Column("endereco", db.String(220), nullable=False)
    phone = db.Column("telefone", db.String(40), nullable=False)
    instagram = db.Column(db.String(80), nullable=False)
    image_url = db.Column("imagem", db.String(500), nullable=False)
    logo_url = db.Column("logo", db.String(500), nullable=False)
    promotion_book_image_url = db.Column("imagem_promocao_livrinho", db.String(500), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    distance_meters = db.Column("distancia_metros", db.Integer, nullable=False, default=0)
    accepts_in_person = db.Column("presencial", db.Boolean, nullable=False, default=True)
    accepts_delivery = db.Column("delivery", db.Boolean, nullable=False, default=False)
    pet_friendly = db.Column(db.Boolean, nullable=False, default=False)
    kids_area = db.Column("area_kids", db.Boolean, nullable=False, default=False)
    active = db.Column("ativo", db.Boolean, nullable=False, default=True)
    created_at = db.Column("data_criacao", db.DateTime(timezone=True), default=utc_now, nullable=False)

    promotions = db.relationship("Promotion", back_populates="restaurant", cascade="all, delete-orphan")
    favorites = db.relationship("Favorite", back_populates="restaurant", cascade="all, delete-orphan")
    promotion_uses = db.relationship("PromotionUse", back_populates="restaurant", cascade="all, delete-orphan")


class Promotion(db.Model):
    __tablename__ = "promocoes"

    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column("restaurante_id", db.Integer, db.ForeignKey("restaurantes.id"), nullable=False)
    title = db.Column("titulo", db.String(160), nullable=False)
    description = db.Column("descricao", db.Text, nullable=False)
    image_url = db.Column("imagem_promocao", db.String(500), nullable=False)
    rules = db.Column("regras", db.Text, nullable=True)
    active = db.Column("ativo", db.Boolean, nullable=False, default=True)
    created_at = db.Column("data_criacao", db.DateTime(timezone=True), default=utc_now, nullable=False)

    restaurant = db.relationship("Restaurant", back_populates="promotions")


class Favorite(db.Model):
    __tablename__ = "favoritos"
    __table_args__ = (UniqueConstraint("usuario_id", "restaurante_id", name="uq_favorito_usuario_restaurante"),)

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column("usuario_id", db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    restaurant_id = db.Column("restaurante_id", db.Integer, db.ForeignKey("restaurantes.id"), nullable=False)
    created_at = db.Column("data_criacao", db.DateTime(timezone=True), default=utc_now, nullable=False)

    user = db.relationship("User", back_populates="favorites")
    restaurant = db.relationship("Restaurant", back_populates="favorites")


class PromotionUse(db.Model):
    __tablename__ = "usos_promocao"
    __table_args__ = (UniqueConstraint("usuario_id", "restaurante_id", name="uq_uso_usuario_restaurante"),)

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column("usuario_id", db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    restaurant_id = db.Column("restaurante_id", db.Integer, db.ForeignKey("restaurantes.id"), nullable=False)
    promotion_id = db.Column("promocao_id", db.Integer, db.ForeignKey("promocoes.id"), nullable=False)
    savings_value = db.Column("valor_economizado", db.Numeric(10, 2), nullable=False)
    photo_url = db.Column("foto_url", db.String(500), nullable=True)
    used_at = db.Column("data_uso", db.DateTime(timezone=True), default=utc_now, nullable=False)

    user = db.relationship("User", back_populates="promotion_uses")
    restaurant = db.relationship("Restaurant", back_populates="promotion_uses")
    promotion = db.relationship("Promotion")
