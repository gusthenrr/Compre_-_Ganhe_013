from flask import Flask, jsonify

from .config import Config
from .extensions import cors, db, jwt
from .routes.auth import auth_bp
from .routes.restaurants import restaurants_bp
from .routes.users import users_bp
from .seed import seed_database


def create_app(config_object=Config):
    app = Flask(__name__)
    app.config.from_object(config_object)

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api")
    app.register_blueprint(restaurants_bp, url_prefix="/api")

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "compre-ganhe-013"})

    @app.cli.command("init-db")
    def init_db_command():
        db.create_all()
        print("Database tables created.")

    @app.cli.command("seed")
    def seed_command():
        db.create_all()
        seed_database()
        print("Seed data ready.")

    return app
