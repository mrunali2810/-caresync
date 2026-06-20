from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
import bcrypt
from config import supabase

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Email and password are required"}), 400
        
    email = data.get("email")
    password = data.get("password")
    
    try:
        # Query user from Supabase
        response = supabase.table("users").select("*").eq("email", email).execute()
        users = response.data
        
        if not users:
            return jsonify({"message": "Invalid email or password"}), 401
            
        user = users[0]
        
        # Verify password using bcrypt
        stored_hash = user.get("password")
        if not bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8')):
            return jsonify({"message": "Invalid email or password"}), 401
            
        # Generate JWT Token using Flask-JWT-Extended
        # We can store the user's email or ID as the identity
        token = create_access_token(identity=user.get("email"))
        
        return jsonify({
            "token": token,
            "user": {
                "id": user.get("id"),
                "name": user.get("name"),
                "email": user.get("email")
            }
        }), 200
        
    except Exception as e:
        return jsonify({"message": "An error occurred during login", "error": str(e)}), 500
