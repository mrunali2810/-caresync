from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from config import supabase
from datetime import date, timedelta

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
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - patient_name
            - email
            - phone
            - doctor_name
            - appointment_date
            - appointment_time
          properties:
            patient_name:
              type: string
              example: John Doe
            email:
              type: string
              example: john@example.com
            phone:
              type: string
              example: "9876543210"
            doctor_name:
              type: string
              example: Dr. Smith
            appointment_date:
              type: string
              example: "2026-06-25"
            appointment_time:
              type: string
              example: "10:00 AM"
            symptoms:
              type: string
              example: Fever and cold
    responses:
      201:
        description: Appointment Created Successfully
      500:
        description: Internal Server Error
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
        return jsonify({"message": "Appointment Created Successfully", "data": response.data}), 201
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
      500:
        description: Internal Server Error
    """
    try:
        response = supabase.table("appointments").select("*").order("appointment_date", desc=True).execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appointment_bp.route("/appointments/<string:id>", methods=["PUT"])
@jwt_required()
def update_appointment(id):
    """
    Update Appointment
    ---
    tags:
      - Appointments
    security:
      - Bearer: []
    parameters:
      - in: path
        name: id
        required: true
        type: string
        example: "uuid-here"
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            patient_name:
              type: string
              example: John Doe
            email:
              type: string
              example: john@example.com
            phone:
              type: string
              example: "9876543210"
            doctor_name:
              type: string
              example: Dr. Smith
            appointment_date:
              type: string
              example: "2026-06-25"
            appointment_time:
              type: string
              example: "10:00 AM"
            symptoms:
              type: string
              example: Fever and cold
            status:
              type: string
              example: Confirmed
    responses:
      200:
        description: Appointment Updated Successfully
      500:
        description: Internal Server Error
    """
    try:
        data = request.get_json()
        response = supabase.table("appointments").update(data).eq("id", id).execute()
        return jsonify({"message": "Appointment Updated Successfully", "data": response.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appointment_bp.route("/appointments/<string:id>", methods=["DELETE"])
@jwt_required()
def delete_appointment(id):
    """
    Delete Appointment
    ---
    tags:
      - Appointments
    security:
      - Bearer: []
    parameters:
      - in: path
        name: id
        required: true
        type: string
        example: "uuid-here"
    responses:
      200:
        description: Appointment Deleted Successfully
      500:
        description: Internal Server Error
    """
    try:
        response = supabase.table("appointments").delete().eq("id", id).execute()
        return jsonify({"message": "Appointment Deleted Successfully", "data": response.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appointment_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def get_dashboard_stats():
    """
    Get Dashboard Stats
    ---
    tags:
      - Dashboard
    security:
      - Bearer: []
    responses:
      200:
        description: Dashboard statistics
      500:
        description: Internal Server Error
    """
    try:
        # Total appointments
        total = supabase.table("appointments").select("*", count="exact").execute()

        # Today's appointments
        today = date.today().isoformat()
        today_res = supabase.table("appointments").select("*", count="exact").eq("appointment_date", today).execute()

        # Pending appointments
        pending_res = supabase.table("appointments").select("*", count="exact").eq("status", "Pending").execute()

        # Last 7 days trend
        trends = []
        for i in range(6, -1, -1):
            day = (date.today() - timedelta(days=i)).isoformat()
            day_res = supabase.table("appointments").select("*", count="exact").eq("appointment_date", day).execute()
            trends.append({
                "date": day[5:],  # MM-DD format e.g. 06-22
                "count": day_res.count or 0
            })

        return jsonify({
            "total_appointments": total.count,
            "today_appointments": today_res.count or 0,
            "pending_appointments": pending_res.count or 0,
            "trends": trends
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500