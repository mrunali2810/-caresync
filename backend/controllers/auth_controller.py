from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from config import supabase
import bcrypt

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"message": "Email and password are required"}), 400

        response = (
            supabase
            .table("users")
            .select("*")
            .eq("email", email)
            .execute()
        )

        if not response.data:
            return jsonify({"message": "User not found"}), 404

        user = response.data[0]

        # ✅ Verify password against bcrypt hash
        stored_password = user.get("password", "")
        if not bcrypt.checkpw(password.encode("utf-8"), stored_password.encode("utf-8")):
            return jsonify({"message": "Invalid password"}), 401

        token = create_access_token(identity=str(user.get("id", email)))

        return jsonify({
            "message": "Login Successful",
            "token": token,
            "user": {
                "id": user.get("id"),
                "name": user.get("name"),
                "email": user.get("email")
            }
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"message": "Login Failed", "error": str(e)}), 500