from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from config import supabase
import datetime

appointment_bp = Blueprint("appointment", __name__)


@appointment_bp.route("/appointments", methods=["POST"])
@jwt_required()
def create_appointment():
    """
    Create Appointment
    ---
    tags:
      - Appointments
    security:
      - Bearer: []
    responses:
      201:
        description: Appointment Created Successfully
    """
    try:
        data = request.get_json()

        appointment = {
            "patient_name": data.get("patient_name"),
            "email": data.get("email"),
            "phone": data.get("phone"),
            "doctor_name": data.get("doctor_name"),
            "appointment_date": data.get("appointment_date"),
            "appointment_time": data.get("appointment_time"),
            "symptoms": data.get("symptoms", ""),
            "status": "Pending"
        }

        response = supabase.table("appointments").insert(appointment).execute()

        return jsonify({
            "message": "Appointment Created Successfully",
            "data": response.data
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appointment_bp.route("/appointments", methods=["GET"])
@jwt_required()
def get_appointments():
    """
    Get All Appointments
    ---
    tags:
      - Appointments
    security:
      - Bearer: []
    responses:
      200:
        description: List of appointments
    """
    try:
        response = supabase.table("appointments").select("*").order(
            "appointment_date",
            desc=True
        ).execute()

        return jsonify(response.data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appointment_bp.route("/appointments/<id>", methods=["PUT"])
@jwt_required()
def update_appointment(id):
    try:
        data = request.get_json()

        response = (
            supabase.table("appointments")
            .update(data)
            .eq("id", id)
            .execute()
        )

        return jsonify({
            "message": "Appointment Updated Successfully",
            "data": response.data
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appointment_bp.route("/appointments/<id>", methods=["DELETE"])
@jwt_required()
def delete_appointment(id):
    try:
        response = (
            supabase.table("appointments")
            .delete()
            .eq("id", id)
            .execute()
        )

        return jsonify({
            "message": "Appointment Deleted Successfully",
            "data": response.data
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appointment_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def get_dashboard_stats():
    try:
        total = (
            supabase.table("appointments")
            .select("*", count="exact")
            .execute()
        )

        return jsonify({
            "total_appointments": total.count
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500