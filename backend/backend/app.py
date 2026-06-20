import os
import datetime
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_swagger_ui import get_swaggerui_blueprint

from config import Config
from controllers.auth_controller import auth_bp
from controllers.appointment_controller import appointment_bp

# Initialize Flask app
# Set static_folder to the Vite build distribution folder
app = Flask(__name__, static_folder="../frontend/dist", static_url_path="")
app.config.from_object(Config)

# Enable CORS for APIs
CORS(app)

# Configure JWT
app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(hours=24)
jwt = JWTManager(app)

# Register API blueprints
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(appointment_bp, url_prefix="/api")

# Swagger UI Route configuration
SWAGGER_URL = "/swagger"
API_URL = "/swagger.json"

@app.route("/swagger.json")
def serve_swagger_json():
    # Serves the OpenAPI json documentation from backend/swagger/
    return send_from_directory("swagger", "swagger.json")

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        "app_name": "Hospital Appointment Booking API",
        "persistAuthorization": True # Keeps the JWT Bearer token saved on page reloads in Swagger
    }
)
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

# Custom JWT Error Handlers for professional JSON error responses
@jwt.unauthorized_loader
def unauthorized_response(callback):
    return jsonify({"message": "Missing or invalid authorization header"}), 401

@jwt.expired_token_loader
def expired_token_response(jwt_header, jwt_payload):
    return jsonify({"message": "Token has expired"}), 401

@jwt.invalid_token_loader
def invalid_token_response(callback):
    return jsonify({"message": "Invalid token"}), 401

# Serve React static frontend build
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    # Check if the requested path corresponds to a static file in the built directory (e.g. assets, favicon)
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    # Otherwise, fallback to serving index.html for React Router to handle routing client-side
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
