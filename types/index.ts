export enum UserRole {
    PATIENT = "patient",
    DOCTOR = "doctor",
    PHARMACY = "pharmacy",
    LAB = "lab",
    ADMIN = "admin",
}

export interface User {
    id: number;
    email?: string;
    phone_number?: string;
    role: UserRole;
    is_verified: boolean;
    is_active: boolean;
    name?: string; // Display name
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: User;
}

export interface ApiError {
    detail: string | { loc: string[]; msg: string; type: string }[];
}

export interface RegisterPayload {
    email: string;
    password: string;
    full_name: string;
    phone_number?: string;
    role?: UserRole;
    terms?: boolean;
}

export interface SearchRequest {
    latitude: number;
    longitude: number;
    radius_km?: number;
    type?: "doctor" | "lab" | "pharmacy";
}

export interface ProviderResponse {
    id: number;
    user_id?: number;
    name: string;
    type: "doctor" | "lab" | "pharmacy";
    address: string;
    city?: string;
    distance_km: number;
    rating: number;
    verified: boolean;
    avatar_url?: string;
    bio?: string;
    contact_phone?: string;
    services_offered?: any[];
    operating_hours?: any;
}

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled"

export interface AppointmentResponse {
    id: number
    patient_id: number
    doctor_id?: number
    lab_id?: number
    appointment_date: string // ISO
    status: AppointmentStatus
    type: string
    notes?: string
    doctor?: { id: number, user_id: number, full_name: string, specialization: string }
    lab?: { id: number, user_id: number, lab_name: string }
}

export interface PrescriptionResponse {
    id: number
    doctor_id: number
    patient_id: number
    pharmacy_id?: number
    medications: any[]
    notes?: string
    expiry_date?: string
    prescription_code?: string
    status: string
}

export interface LabResultResponse {
    id: number
    patient_id: number
    lab_id: number
    test_type: string
    summary?: string
    full_report_url?: string
    raw_data?: any
}

export interface PatientRecordResponse {
    id: number
    patient_id: number
    title: string
    document_type: string
    document_url: string
    description?: string
    created_at: string
}

export interface PatientRecordCreate {
    title: string
    document_type: string
    document_url: string
    description?: string
}

export interface PatientProfileResponse {
    id: number
    user_id: number
    full_name: string
    date_of_birth?: string
    gender?: string
    blood_group?: string
    phone_number?: string
    address?: string
    city?: string
    emergency_contact?: any
    avatar_url?: string
}

export interface PatientProfileUpdate {
    full_name?: string
    date_of_birth?: string
    gender?: string
    blood_group?: string
    phone_number?: string
    address?: string
    city?: string
    avatar_url?: string
}
