# CareSync | Hospital Appointment Booking Web Application

CareSync is a production-ready Hospital Appointment Booking Web Application built with a React.js (Vite + Tailwind CSS) frontend and a Python Flask backend. The system integrates with Supabase PostgreSQL and is designed for single-domain deployment on Render.

## Features

- **Modern Healthcare UI**: Premium aesthetics using HSL tailored blue/slate colors, glassmorphism panel styles, and smooth micro-animations.
- **Seeded JWT Authentication**: Secure JWT authentication via `Flask-JWT-Extended`.
- **Full CRUD Appointment Manager**: Interactive data table supporting search by patient name, sorting by date, pagination, updating, and deleting appointments.
- **Auto-Generated IDs**: Database trigger-based sequential appointment IDs formatted as `HSP001`, `HSP002`, etc.
- **Analytical Dashboard**: Overview cards for total bookings, today's appointments, pending tasks, and a dynamic 7-day trend chart.
- **Interactive Swagger Docs**: Fully testable API documentation rendered directly at `/swagger`.
- **Single URL Deployment**: Flask builds and serves React production files directly, eliminating CORS mismatches in production.

---

## 1. Supabase SQL Database Setup

Log into your Supabase Console, navigate to the **SQL Editor**, and execute the following commands to initialize the schema:

```sql
-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (for Admin/Staff Authentication)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hashing via bcrypt
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default Admin User: admin@gmail.com / admin123
-- The bcrypt hash of 'admin123' is '$2b$12$7kP2K.pD1rVesxJ1Q/J3vuxq2bCjM4Jdsk6N02j.Yc1dG4y5jW3vK'
INSERT INTO public.users (name, email, password)
VALUES ('Admin', 'admin@gmail.com', '$2b$12$7kP2K.pD1rVesxJ1Q/J3vuxq2bCjM4Jdsk6N02j.Yc1dG4y5jW3vK')
ON CONFLICT (email) DO NOTHING;

-- Appointment ID Sequence
CREATE SEQUENCE IF NOT EXISTS public.appointment_id_seq START WITH 1;

-- Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id VARCHAR(50) UNIQUE,
    patient_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    symptoms TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger Function for appointment_id Autogeneration (e.g. HSP001, HSP002)
CREATE OR REPLACE FUNCTION public.generate_appointment_id()
RETURNS trigger AS $$
BEGIN
    IF NEW.appointment_id IS NULL THEN
        NEW.appointment_id := 'HSP' || lpad(nextval('public.appointment_id_seq')::text, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set Trigger
DROP TRIGGER IF EXISTS set_appointment_id ON public.appointments;
CREATE TRIGGER set_appointment_id
BEFORE INSERT ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.generate_appointment_id();
```

---

## 2. Environment Configurations

Create a `.env` file in the `backend/` directory with the following variables:

```env
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_KEY=<your-supabase-anon-key>
JWT_SECRET_KEY=<generate-a-long-secure-key>
```

---

## 3. Local Development Setup

### Running Backend (Flask)

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   python app.py
   ```
   The backend will start on `http://127.0.0.1:5000`.

### Running Frontend (Vite)

1. Navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install node packages:
   ```bash
   npm install
   ```
3. Run the Vite local development server:
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`. Any API request hitting `/api/*` will automatically proxy to Flask at `http://127.0.0.1:5000`.

---

## 4. Local Single URL Simulation (Production Build)

To verify that Flask is serving the React frontend correctly under a single URL locally:

1. Compile the React build files:
   ```bash
   cd frontend
   npm run build
   ```
   This generates the compiled folder `frontend/dist/`.
2. Start the Flask server:
   ```bash
   cd ../backend
   python app.py
   ```
3. Access `http://127.0.0.1:5000` in your web browser. You will find the complete React application running, communicating with Flask endpoints (`/api/*`), and displaying Swagger UI documentation at `/swagger`.

---

## 5. Render Deployment Instructions

This project is fully pre-configured for Render using the `render.yaml` specification.

1. Create a new **Web Service** on Render connected to your Git repository.
2. Select **python** as the runtime.
3. Render will automatically read `render.yaml` and configure:
   - **Build Command**: `./build.sh` (installs node modules, builds frontend, installs python packages)
   - **Start Command**: `gunicorn --chdir backend app:app` (runs the WSGI server)
4. Add the following **Environment Variables** in the Render Dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `JWT_SECRET_KEY`
5. Deploy! Both frontend and backend will be available under your single Render URL.
