from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from datetime import datetime
import uuid

app = FastAPI(
    title="MediCare Pro API",
    description="Patient Management System Backend",
    version="1.0.0"
)

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Patient model
class Patient(BaseModel):
    id: Optional[str] = None
    name: str
    age: int
    gender: str
    contact: str
    address: str
    disease: str
    admission_date: str
    doctor_assigned: str
    weight_kg: float
    height_cm: int
    bmi: float
    blood_group: str
    blood_pressure: str
    medical_history: List[str]
    status: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

# Data storage file
DATA_FILE = "patients.json"

# Initialize data storage
def initialize_data():
    if not os.path.exists(DATA_FILE):
        sample_data = [
            {
                "id": "1",
                "name": "Ali Raza",
                "age": 34,
                "gender": "Male",
                "contact": "0321-5678901",
                "address": "Lahore, Pakistan",
                "disease": "Diabetes Type 2",
                "admission_date": "2025-10-01",
                "doctor_assigned": "Dr. Ahmed Khan",
                "weight_kg": 82,
                "height_cm": 175,
                "bmi": 26.8,
                "blood_group": "B+",
                "blood_pressure": "130/85 mmHg",
                "medical_history": ["High blood sugar", "Obesity"],
                "status": "Under Treatment",
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T10:30:00Z"
            },
            {
                "id": "2",
                "name": "Ayesha Fatima",
                "age": 27,
                "gender": "Female",
                "contact": "0314-8902345",
                "address": "Karachi, Pakistan",
                "disease": "Asthma",
                "admission_date": "2025-09-25",
                "doctor_assigned": "Dr. Sara Malik",
                "weight_kg": 58,
                "height_cm": 162,
                "bmi": 22.1,
                "blood_group": "O+",
                "blood_pressure": "118/75 mmHg",
                "medical_history": ["Allergic Rhinitis", "Seasonal Asthma"],
                "status": "Recovered",
                "created_at": "2024-01-10T14:20:00Z",
                "updated_at": "2024-01-12T09:15:00Z"
            },
            {
                "id": "3",
                "name": "Usman Ali",
                "age": 45,
                "gender": "Male",
                "contact": "0332-4567890",
                "address": "Islamabad, Pakistan",
                "disease": "Hypertension",
                "admission_date": "2025-09-28",
                "doctor_assigned": "Dr. Hamza Qureshi",
                "weight_kg": 95,
                "height_cm": 180,
                "bmi": 29.3,
                "blood_group": "A+",
                "blood_pressure": "160/100 mmHg",
                "medical_history": ["High Cholesterol", "Smoking"],
                "status": "Critical",
                "created_at": "2024-01-08T16:45:00Z",
                "updated_at": "2024-01-14T11:20:00Z"
            }
        ]
        save_data(sample_data)

# Load data from file
def load_data():
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

# Save data to file
def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# Generate unique ID
def generate_id():
    return str(uuid.uuid4())

# Get current timestamp
def get_current_timestamp():
    return datetime.utcnow().isoformat() + "Z"

# Calculate BMI
def calculate_bmi(weight_kg, height_cm):
    height_m = height_cm / 100
    return round(weight_kg / (height_m ** 2), 1)

# Initialize data on startup
initialize_data()

# API Routes
@app.get("/")
async def root():
    """Health check endpoint"""
    patients = load_data()
    return {
        "status": "healthy",
        "message": "MediCare Pro API is running",
        "timestamp": get_current_timestamp(),
        "total_patients": len(patients),
        "docs_url": "http://localhost:8000/docs"
    }

@app.get("/patients")
async def get_patients():
    """Get all patients"""
    patients = load_data()
    return {"patients": patients, "total": len(patients)}

@app.get("/patients/{patient_id}")
async def get_patient(patient_id: str):
    """Get a specific patient by ID"""
    patients = load_data()
    for patient in patients:
        if patient["id"] == patient_id:
            return patient
    
    raise HTTPException(status_code=404, detail="Patient not found")

@app.post("/patients")
async def create_patient(patient: Patient):
    """Create a new patient"""
    patients = load_data()
    
    # Generate new patient data
    patient_data = patient.dict()
    patient_data["id"] = generate_id()
    patient_data["bmi"] = calculate_bmi(patient_data["weight_kg"], patient_data["height_cm"])
    patient_data["created_at"] = get_current_timestamp()
    patient_data["updated_at"] = get_current_timestamp()
    
    # Add to patients list
    patients.append(patient_data)
    save_data(patients)
    
    return patient_data

@app.put("/patients/{patient_id}")
async def update_patient(patient_id: str, patient: Patient):
    """Update an existing patient"""
    patients = load_data()
    
    for idx, existing_patient in enumerate(patients):
        if existing_patient["id"] == patient_id:
            # Update patient data
            updated_data = patient.dict()
            updated_data["id"] = patient_id
            updated_data["bmi"] = calculate_bmi(updated_data["weight_kg"], updated_data["height_cm"])
            updated_data["created_at"] = existing_patient["created_at"]
            updated_data["updated_at"] = get_current_timestamp()
            
            patients[idx] = updated_data
            save_data(patients)
            
            return updated_data
    
    raise HTTPException(status_code=404, detail="Patient not found")

@app.delete("/patients/{patient_id}")
async def delete_patient(patient_id: str):
    """Delete a patient"""
    patients = load_data()
    
    for idx, patient in enumerate(patients):
        if patient["id"] == patient_id:
            # Remove patient
            deleted_patient = patients.pop(idx)
            save_data(patients)
            
            return {
                "message": "Patient deleted successfully",
                "patient_id": patient_id,
                "patient_name": deleted_patient["name"]
            }
    
    raise HTTPException(status_code=404, detail="Patient not found")

@app.get("/stats/overview")
async def get_stats_overview():
    """Get overview statistics"""
    patients = load_data()
    
    total_patients = len(patients)
    under_treatment = len([p for p in patients if p["status"] == "Under Treatment"])
    recovered = len([p for p in patients if p["status"] == "Recovered"])
    critical = len([p for p in patients if p["status"] == "Critical"])
    
    return {
        "total_patients": total_patients,
        "under_treatment": under_treatment,
        "recovered": recovered,
        "critical": critical,
        "last_updated": get_current_timestamp()
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting MediCare Pro API Server...")
    print("Server will be available at: http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    uvicorn.run(
        app, 
        host="0.0.0.0",  # Listen on all interfaces
        port=8000,
        reload=True  # Enable auto-reload during development
    )