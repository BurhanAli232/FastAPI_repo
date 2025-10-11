// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const appContainer = document.getElementById('appContainer');
const welcomeSection = document.getElementById('welcomeSection');
const patientSection = document.getElementById('patientSection');
const patientsGrid = document.getElementById('patientsGrid');
const formModal = document.getElementById('formModal');
const detailsModal = document.getElementById('detailsModal');
const patientForm = document.getElementById('patientForm');
const connectionStatus = document.getElementById('connectionStatus');
const statusText = document.getElementById('statusText');
const notificationContainer = document.getElementById('notificationContainer');
const addPatientBtn = document.getElementById('addPatientBtn');
const getStartedBtn = document.getElementById('getStartedBtn');
const closeFormBtn = document.getElementById('closeFormBtn');
const closeDetailsBtn = document.getElementById('closeDetailsBtn');
const cancelBtn = document.getElementById('cancelBtn');
const searchInput = document.getElementById('searchInput');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');

// Global state
let patients = [];
let isEditing = false;
let currentPatientId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Simulate loading
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
            checkAPIStatus();
            updateStats();
        }, 500);
    }, 2000);

    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    addPatientBtn.addEventListener('click', () => openForm());
    getStartedBtn.addEventListener('click', showPatientSection);
    closeFormBtn.addEventListener('click', () => closeForm());
    closeDetailsBtn.addEventListener('click', () => closeDetails());
    cancelBtn.addEventListener('click', () => closeForm());
    patientForm.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', handleSearch);
    
    // Close modals when clicking outside
    [formModal, detailsModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                if (modal === formModal) closeForm();
                if (modal === detailsModal) closeDetails();
            }
        });
    });
}

// Check API status
async function checkAPIStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/patients`);
        if (response.ok) {
            statusText.textContent = 'Connected to API';
            connectionStatus.classList.add('connected');
            loadPatients();
        } else {
            throw new Error('API not responding correctly');
        }
    } catch (error) {
        statusText.textContent = 'API Connection Failed';
        console.error('API connection error:', error);
        showNotification('Cannot connect to the API server. Using demo data.', 'warning');
        // Use sample data for demo
        patients = getSampleData();
        renderPatients(patients);
        updateStats();
    }
}

// Load patients from API
async function loadPatients() {
    try {
        const response = await fetch(`${API_BASE_URL}/patients`);
        if (!response.ok) {
            throw new Error('Failed to fetch patients');
        }
        patients = await response.json();
        renderPatients(patients);
        updateStats();
    } catch (error) {
        console.error('Error loading patients:', error);
        showNotification('Failed to load patient data. Using demo data.', 'error');
        patients = getSampleData();
        renderPatients(patients);
        updateStats();
    }
}

// Show patient section
function showPatientSection() {
    welcomeSection.classList.add('hidden');
    patientSection.classList.remove('hidden');
}

// Open patient form
function openForm(patient = null) {
    if (patient) {
        // Edit mode
        isEditing = true;
        currentPatientId = patient.id;
        formTitle.textContent = 'Edit Patient';
        submitBtn.textContent = 'Update Patient';
        populateForm(patient);
    } else {
        // Add mode
        isEditing = false;
        currentPatientId = null;
        formTitle.textContent = 'Add New Patient';
        submitBtn.textContent = 'Add Patient';
        patientForm.reset();
    }
    formModal.classList.remove('hidden');
}

// Close patient form
function closeForm() {
    formModal.classList.add('hidden');
}

// Populate form with patient data
function populateForm(patient) {
    document.getElementById('patientId').value = patient.id;
    document.getElementById('name').value = patient.name;
    document.getElementById('age').value = patient.age;
    document.getElementById('gender').value = patient.gender;
    document.getElementById('contact').value = patient.contact;
    document.getElementById('address').value = patient.address;
    document.getElementById('disease').value = patient.disease;
    document.getElementById('admissionDate').value = patient.admission_date;
    document.getElementById('doctorAssigned').value = patient.doctor_assigned;
    document.getElementById('weight').value = patient.weight_kg;
    document.getElementById('height').value = patient.height_cm;
    document.getElementById('bloodGroup').value = patient.blood_group;
    document.getElementById('bloodPressure').value = patient.blood_pressure;
    document.getElementById('medicalHistory').value = patient.medical_history.join(', ');
    document.getElementById('status').value = patient.status;
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const patientData = {
        name: document.getElementById('name').value,
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        contact: document.getElementById('contact').value,
        address: document.getElementById('address').value,
        disease: document.getElementById('disease').value,
        admission_date: document.getElementById('admissionDate').value,
        doctor_assigned: document.getElementById('doctorAssigned').value,
        weight_kg: parseFloat(document.getElementById('weight').value),
        height_cm: parseInt(document.getElementById('height').value),
        blood_group: document.getElementById('bloodGroup').value,
        blood_pressure: document.getElementById('bloodPressure').value,
        medical_history: document.getElementById('medicalHistory').value
            .split(',')
            .map(item => item.trim())
            .filter(item => item),
        status: document.getElementById('status').value
    };
    
    // Calculate BMI
    patientData.bmi = calculateBMI(patientData.weight_kg, patientData.height_cm);
    
    try {
        let response;
        if (isEditing) {
            // Update existing patient
            response = await fetch(`${API_BASE_URL}/patients/${currentPatientId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(patientData),
            });
        } else {
            // Add new patient
            response = await fetch(`${API_BASE_URL}/patients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(patientData),
            });
        }
        
        if (!response.ok) {
            throw new Error('Failed to save patient');
        }
        
        const savedPatient = await response.json();
        
        if (isEditing) {
            // Update the patient in our local array
            const index = patients.findIndex(p => p.id === currentPatientId);
            if (index !== -1) {
                patients[index] = { ...savedPatient, id: currentPatientId };
            }
            showNotification('Patient updated successfully!', 'success');
        } else {
            // Add the new patient to our local array
            patients.push(savedPatient);
            showNotification('Patient added successfully!', 'success');
        }
        
        renderPatients(patients);
        updateStats();
        closeForm();
    } catch (error) {
        console.error('Error saving patient:', error);
        showNotification('Failed to save patient. Please try again.', 'error');
    }
}

// Render patients list
function renderPatients(patientsArray) {
    if (patientsArray.length === 0) {
        patientsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-injured" style="font-size: 3rem; color: #bdc3c7; margin-bottom: 1rem;"></i>
                <h3>No patients found</h3>
                <p>Try adjusting your search or add a new patient</p>
            </div>
        `;
        return;
    }
    
    patientsGrid.innerHTML = patientsArray.map(patient => `
        <div class="patient-card">
            <div class="patient-header">
                <div class="patient-name">${patient.name}</div>
                <div class="patient-status status-${patient.status.toLowerCase().replace(' ', '-')}">
                    ${patient.status}
                </div>
            </div>
            <div class="patient-details">
                <div class="detail-row">
                    <span class="detail-label">Age / Gender</span>
                    <span>${patient.age} / ${patient.gender}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Disease</span>
                    <span>${patient.disease}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Doctor</span>
                    <span>${patient.doctor_assigned}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Admission Date</span>
                    <span>${patient.admission_date}</span>
                </div>
            </div>
            <div class="patient-actions">
                <button class="btn btn-primary" onclick="viewPatientDetails(${patient.id})">
                    <i class="fas fa-eye"></i>
                    View Details
                </button>
                <button class="btn btn-secondary" onclick="editPatient(${patient.id})">
                    <i class="fas fa-edit"></i>
                    Edit
                </button>
                <button class="btn btn-danger" onclick="deletePatient(${patient.id})">
                    <i class="fas fa-trash"></i>
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

// View patient details
function viewPatientDetails(id) {
    const patient = patients.find(p => p.id === id);
    if (!patient) return;
    
    const detailsContent = document.getElementById('detailsContent');
    detailsContent.innerHTML = `
        <div class="detail-section">
            <h3>Personal Information</h3>
            <div class="details-grid">
                <div class="detail-item">
                    <strong>Full Name</strong>
                    <span>${patient.name}</span>
                </div>
                <div class="detail-item">
                    <strong>Age</strong>
                    <span>${patient.age}</span>
                </div>
                <div class="detail-item">
                    <strong>Gender</strong>
                    <span>${patient.gender}</span>
                </div>
                <div class="detail-item">
                    <strong>Contact</strong>
                    <span>${patient.contact}</span>
                </div>
                <div class="detail-item">
                    <strong>Address</strong>
                    <span>${patient.address}</span>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Medical Information</h3>
            <div class="details-grid">
                <div class="detail-item">
                    <strong>Disease/Condition</strong>
                    <span>${patient.disease}</span>
                </div>
                <div class="detail-item">
                    <strong>Admission Date</strong>
                    <span>${patient.admission_date}</span>
                </div>
                <div class="detail-item">
                    <strong>Doctor Assigned</strong>
                    <span>${patient.doctor_assigned}</span>
                </div>
                <div class="detail-item">
                    <strong>Status</strong>
                    <span class="patient-status status-${patient.status.toLowerCase().replace(' ', '-')}">${patient.status}</span>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Vital Statistics</h3>
            <div class="details-grid">
                <div class="detail-item">
                    <strong>Weight</strong>
                    <span>${patient.weight_kg} kg</span>
                </div>
                <div class="detail-item">
                    <strong>Height</strong>
                    <span>${patient.height_cm} cm</span>
                </div>
                <div class="detail-item">
                    <strong>BMI</strong>
                    <span>${patient.bmi}</span>
                </div>
                <div class="detail-item">
                    <strong>Blood Group</strong>
                    <span>${patient.blood_group}</span>
                </div>
                <div class="detail-item">
                    <strong>Blood Pressure</strong>
                    <span>${patient.blood_pressure}</span>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Medical History</h3>
            <div class="detail-item">
                <strong>Conditions</strong>
                <span>${patient.medical_history.join(', ')}</span>
            </div>
        </div>
    `;
    
    document.getElementById('patientDetailsTitle').textContent = `Patient Details - ${patient.name}`;
    detailsModal.classList.remove('hidden');
}

// Close patient details
function closeDetails() {
    detailsModal.classList.add('hidden');
}

// Edit patient
function editPatient(id) {
    const patient = patients.find(p => p.id === id);
    if (!patient) return;
    openForm(patient);
}

// Delete patient
async function deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete patient');
        }
        
        // Remove patient from local array
        patients = patients.filter(p => p.id !== id);
        renderPatients(patients);
        updateStats();
        showNotification('Patient deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting patient:', error);
        showNotification('Failed to delete patient. Please try again.', 'error');
    }
}

// Handle search
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        renderPatients(patients);
        return;
    }
    
    const filteredPatients = patients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm) ||
        patient.disease.toLowerCase().includes(searchTerm) ||
        patient.doctor_assigned.toLowerCase().includes(searchTerm) ||
        patient.contact.includes(searchTerm)
    );
    
    renderPatients(filteredPatients);
}

// Update statistics
function updateStats() {
    document.getElementById('totalPatients').textContent = patients.length;
    document.getElementById('activePatients').textContent = 
        patients.filter(p => p.status === 'Under Treatment').length;
    document.getElementById('recoveredPatients').textContent = 
        patients.filter(p => p.status === 'Recovered').length;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
        </div>
        <div class="notification-content">${message}</div>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Calculate BMI
function calculateBMI(weight, height) {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
}

// Sample data for demo purposes
function getSampleData() {
    return [
        {
            "id": 1,
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
            "status": "Under Treatment"
        },
        {
            "id": 2,
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
            "status": "Recovered"
        },
        {
            "id": 3,
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
            "status": "Critical"
        }
    ];
}