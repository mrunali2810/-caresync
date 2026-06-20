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
