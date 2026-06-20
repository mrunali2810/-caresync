import os
import datetime

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flasgger import Swagger

from config import Config
from controllers.auth_controller import auth_bp
from controllers.appointment_controller import appointment_bp

# -----------------------------
# Flask App
# -----------------------------
app = Flask(
    __name__,
    static_folder="../frontend/dist",
    static_url_path=""
)

app.config.from_object(Config)

# -----------------------------
# CORS
# -----------------------------
CORS(app, resources={r"/api/*": {"origins": "*"}})

# -----------------------------
# JWT Config
# -----------------------------
app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(hours=24)

jwt = JWTManager(app)

# -----------------------------
# Swagger Config
# -----------------------------
RENDER_URL = os.environ.get("RENDER_EXTERNAL_URL", "")  # Render sets this automatically

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "Hospital Appointment API",
        "description": "Hospital Appointment Booking System APIs",
        "version": "1.0.0"
    },
    # ✅ FIX 1: Tell Swagger the correct host on Render
    "host": RENDER_URL.replace("https://", "").replace("http://", ""),
    "schemes": ["https"] if RENDER_URL else ["http"],
    "basePath": "/",
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "Enter JWT Token as: Bearer <token>"
        }
    },
    # ✅ FIX 2: Apply Bearer security globally to all endpoints
    "security": [{"Bearer": []}]
}

swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": "apispec",
            "route": "/swagger.json",
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/swagger/"
}

Swagger(
    app,
    template=swagger_template,
    config=swagger_config
)

# -----------------------------
# Register APIs
# -----------------------------
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(appointment_bp, url_prefix="/api")

# -----------------------------
# JWT Error Handlers
# -----------------------------
@jwt.unauthorized_loader
def unauthorized_response(callback):
    return jsonify({"message": "Missing or invalid authorization header"}), 401

@jwt.expired_token_loader
def expired_token_response(jwt_header, jwt_payload):
    return jsonify({"message": "Token has expired"}), 401

@jwt.invalid_token_loader
def invalid_token_response(callback):
    return jsonify({"message": "Invalid token"}), 401

# -----------------------------
# Health Check
# -----------------------------
@app.route("/health")
def health():
    return {"status": "success", "message": "Hospital API Running"}

# -----------------------------
# ✅ FIX 3: Exclude Swagger & API routes from catch-all
# -----------------------------
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    # Let Swagger and API routes pass through — don't catch them here
    if path.startswith("swagger") or path.startswith("flasgger") or path.startswith("api"):
        from flask import abort
        abort(404)

    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)

    return send_from_directory(app.static_folder, "index.html")

# -----------------------------
# Run Server
# -----------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(
        host="0.0.0.0",
        port=port,
        debug=False  # ✅ FIX 4: Never debug=True in production
    )