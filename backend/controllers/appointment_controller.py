from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from config import supabase
import datetime

appointment_bp = Blueprint("appointment", __name__)

@appointment_bp.route("/appointments", methods=["POST"])
@jwt_required()
def create_appointment():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "Invalid request body"}), 400
            
        required_fields = ["patient_name", "email", "phone", "doctor_name", "appointment_date", "appointment_time"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"message": f"Field '{field}' is required"}), 400
                
        new_appointment = {
            "patient_name": data.get("patient_name"),
            "email": data.get("email"),
            "phone": data.get("phone"),
            "doctor_name": data.get("doctor_name"),
            "appointment_date": data.get("appointment_date"),
            "appointment_time": data.get("appointment_time"),
            "symptoms": data.get("symptoms", ""),
            "status": data.get("status", "Pending")
        }
        
        response = supabase.table("appointments").insert(new_appointment).execute()
        
        return jsonify({"message": "Appointment Created Successfully"}), 201
        
    except Exception as e:
        return jsonify({"message": "Failed to create appointment", "error": str(e)}), 500


@appointment_bp.route("/appointments", methods=["GET"])
@jwt_required()
def get_appointments():
    try:
        search = request.args.get("search", "")
        sort = request.args.get("sort", "desc") # 'asc' or 'desc'
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        
        query = supabase.table("appointments").select("*", count="exact")
        
        if search:
            query = query.ilike("patient_name", f"%{search}%")
            
        # Order by appointment date and time
        is_desc = sort.lower() == "desc"
        query = query.order("appointment_date", desc=is_desc).order("appointment_time", desc=is_desc)
        
        # Pagination range
        start = (page - 1) * limit
        end = start + limit - 1
        query = query.range(start, end)
        
        response = query.execute()
        
        total_count = response.count if response.count is not None else 0
        
        res = jsonify(response.data)
        res.headers["X-Total-Count"] = str(total_count)
        res.headers["Access-Control-Expose-Headers"] = "X-Total-Count"
        return res
        
    except Exception as e:
        return jsonify({"message": "Failed to retrieve appointments", "error": str(e)}), 500


@appointment_bp.route("/appointments/<id>", methods=["PUT"])
@jwt_required()
def update_appointment(id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "Invalid request body"}), 400
            
        update_data = {}
        # Support updating specific fields
        allowed_fields = ["patient_name", "email", "phone", "doctor_name", "appointment_date", "appointment_time", "symptoms", "status"]
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
                
        if not update_data:
            return jsonify({"message": "No fields to update"}), 400
            
        response = supabase.table("appointments").update(update_data).eq("id", id).execute()
        
        if not response.data:
            return jsonify({"message": "Appointment not found"}), 404
            
        return jsonify({"message": "Appointment Updated Successfully"}), 200
        
    except Exception as e:
        return jsonify({"message": "Failed to update appointment", "error": str(e)}), 500


@appointment_bp.route("/appointments/<id>", methods=["DELETE"])
@jwt_required()
def delete_appointment(id):
    try:
        response = supabase.table("appointments").delete().eq("id", id).execute()
        
        if not response.data:
            return jsonify({"message": "Appointment not found"}), 404
            
        return jsonify({"message": "Appointment Deleted Successfully"}), 200
        
    except Exception as e:
        return jsonify({"message": "Failed to delete appointment", "error": str(e)}), 500


@appointment_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def get_dashboard_stats():
    try:
        today = datetime.date.today().isoformat()
        
        # Total Appointments
        total_res = supabase.table("appointments").select("id", count="exact").execute()
        total_count = total_res.count if total_res.count is not None else 0
        
        # Pending Appointments
        pending_res = supabase.table("appointments").select("id", count="exact").eq("status", "Pending").execute()
        pending_count = pending_res.count if pending_res.count is not None else 0
        
        # Today's Appointments
        today_res = supabase.table("appointments").select("id", count="exact").eq("appointment_date", today).execute()
        today_count = today_res.count if today_res.count is not None else 0
        
        # Calculate trends for the last 7 days
        trends = []
        for i in range(6, -1, -1):
            date_val = (datetime.date.today() - datetime.timedelta(days=i))
            date_str = date_val.isoformat()
            day_res = supabase.table("appointments").select("id", count="exact").eq("appointment_date", date_str).execute()
            day_count = day_res.count if day_res.count is not None else 0
            trends.append({
                "date": date_val.strftime("%b %d"),
                "count": day_count
            })
            
        return jsonify({
            "total_appointments": total_count,
            "today_appointments": today_count,
            "pending_appointments": pending_count,
            "trends": trends
        }), 200
        
    except Exception as e:
        return jsonify({"message": "Failed to retrieve dashboard stats", "error": str(e)}), 500
