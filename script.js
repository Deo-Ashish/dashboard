// Global variables
let currentUser = null;
let appointments = [];
let currentUserRole = '';
let deleteAppointmentId = null;

// Sample data - In real app, this would come from PHP/MySQL
const sampleAppointments = [
    {
        id: 1,
        patientName: "Rahul Sharma",
        mobile: "9876543210",
        doctor: "Dr. John Doe",
        date: "2024-01-15",
        time: "10:00",
        status: "Confirmed",
        notes: "Regular checkup"
    },
    {
        id: 2,
        patientName: "Priya Patel",
        mobile: "8765432109",
        doctor: "Dr. Sarah Smith",
        date: "2024-01-16",
        time: "14:30",
        status: "Pending",
        notes: "Neurology consultation"
    },
    {
        id: 3,
        patientName: "Amit Kumar",
        mobile: "7654321098",
        doctor: "Dr. John Doe",
        date: "2024-01-17",
        time: "11:00",
        status: "Cancelled",
        notes: "Patient requested cancellation"
    },
    {
        id: 4,
        patientName: "Neha Singh",
        mobile: "6543210987",
        doctor: "Dr. Michael Brown",
        date: "2024-01-18",
        time: "09:00",
        status: "Confirmed",
        notes: "Orthopedic consultation"
    }
];

// Modal Management System (replaces Bootstrap modal)
class Modal {
    constructor(element) {
        this.element = element;
        this.isShown = false;
        this.init();
    }

    init() {
        const closeButtons = this.element.querySelectorAll('.btn-close, [data-bs-dismiss="modal"]');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => this.hide());
        });

        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) {
                this.hide();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isShown) {
                this.hide();
            }
        });
    }

    show() {
        this.element.classList.add('show');
        this.element.style.display = 'block';
        this.isShown = true;
        document.body.style.overflow = 'hidden';
    }

    hide() {
        this.element.classList.remove('show');
        this.element.style.display = 'none';
        this.isShown = false;
        document.body.style.overflow = '';
    }
}

// Initialize modals
let appointmentModal, deleteModal;

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    appointmentModal = new Modal(document.getElementById('appointmentModal'));
    deleteModal = new Modal(document.getElementById('deleteModal'));

    // ❌ FIX: always ask login, clear any stored user
    localStorage.removeItem('currentUser');
    currentUser = null;
    currentUserRole = '';

    // Load sample data
    appointments = JSON.parse(localStorage.getItem('appointments')) || sampleAppointments;
    localStorage.setItem('appointments', JSON.stringify(appointments));

    // Setup event listeners
    setupEventListeners();

    // Setup mobile responsiveness
    setupMobileResponsiveness();
});

function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    document.getElementById('patientMobile').addEventListener('input', validateMobile);
    document.getElementById('profileMobile').addEventListener('input', validateMobile);

    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
}

function setupMobileResponsiveness() {
    addMobileSidebarToggle();
    addTableLabels();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
}

function addMobileSidebarToggle() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'sidebar-toggle';
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    toggleBtn.setAttribute('aria-label', 'Toggle navigation');

    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';

    document.body.appendChild(toggleBtn);
    document.body.appendChild(overlay);

    toggleBtn.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', closeSidebar);

    const navLinks = sidebar.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 992) {
                closeSidebar();
            }
        });
    });
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar.classList.contains('show')) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

function openSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.add('show');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.remove('show');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
}

function addTableLabels() {
    const tables = document.querySelectorAll('.table-responsive .table');
    tables.forEach(table => {
        const headers = table.querySelectorAll('thead th');
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                if (headers[index]) {
                    cell.setAttribute('data-label', headers[index].textContent.trim());
                }
            });
        });
    });
}

function handleResize() {
    if (window.innerWidth > 992) {
        closeSidebar();
    }
}

function handleOrientationChange() {
    setTimeout(() => {
        addTableLabels();
    }, 100);
}

function validateMobile(event) {
    const mobile = event.target.value;
    const errorDiv = event.target.id === 'patientMobile' ?
        document.getElementById('mobileError') :
        document.getElementById('profileMobileError');

    if (mobile.length > 0 && mobile.length !== 10) {
        if (errorDiv) errorDiv.classList.remove('hidden');
        event.target.classList.add('is-invalid');
    } else {
        if (errorDiv) errorDiv.classList.add('hidden');
        event.target.classList.remove('is-invalid');
    }
}

function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    document.getElementById('loginBtnText').classList.add('hidden');
    document.getElementById('loginBtnLoading').classList.remove('hidden');

    setTimeout(() => {
        if ((email === 'admin@hospital.com' && password === 'admin123' && role === 'admin') ||
            (email === 'doctor@hospital.com' && password === 'doctor123' && role === 'doctor')) {

            currentUser = {
                email: email,
                role: role,
                name: role === 'admin' ? 'Admin User' : 'Dr. John Doe'
            };
            currentUserRole = role;

            // ✅ Save session for current run
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            showDashboard();
        } else {
            alert('Invalid credentials. Please try again.');
        }

        document.getElementById('loginBtnText').classList.remove('hidden');
        document.getElementById('loginBtnLoading').classList.add('hidden');
    }, 1000);
}

function showDashboard() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('dashboardPage').classList.remove('hidden');

    document.getElementById('userNameDisplay').textContent = currentUser.name;
    document.getElementById('userRoleDisplay').textContent = currentUserRole === 'admin' ? 'Administrator' : 'Doctor';

    loadDashboardData();
    showSection('dashboard');
}

function loadDashboardData() {
    let filteredAppointments = appointments;
    if (currentUserRole === 'doctor') {
        filteredAppointments = appointments.filter(apt => apt.doctor === 'Dr. John Doe');
    }

    document.getElementById('totalAppointments').textContent = filteredAppointments.length;
    document.getElementById('pendingAppointments').textContent =
        filteredAppointments.filter(apt => apt.status === 'Pending').length;
    document.getElementById('confirmedAppointments').textContent =
        filteredAppointments.filter(apt => apt.status === 'Confirmed').length;
    document.getElementById('cancelledAppointments').textContent =
        filteredAppointments.filter(apt => apt.status === 'Cancelled').length;

    loadRecentAppointments(filteredAppointments);
    loadAppointmentsTable(filteredAppointments);
}

function loadRecentAppointments(appointmentsList) {
    const tableBody = document.getElementById('recentAppointmentsTable');
    const recentAppointments = appointmentsList.slice(0, 5);

    tableBody.innerHTML = recentAppointments.map(apt => `
        <tr>
            <td data-label="Patient Name">${apt.patientName}</td>
            <td data-label="Doctor">${apt.doctor}</td>
            <td data-label="Date">${formatDate(apt.date)}</td>
            <td data-label="Status"><span class="status-badge status-${apt.status.toLowerCase()}">${apt.status}</span></td>
            <td data-label="Actions">
                <button class="btn btn-sm btn-outline-primary" onclick="editAppointment(${apt.id})">
                    <i class="fas fa-edit"></i>
                </button>
                ${currentUserRole === 'admin' ? `
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteAppointment(${apt.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

function loadAppointmentsTable(appointmentsList) {
    const tableBody = document.getElementById('appointmentsTable');
    tableBody.innerHTML = appointmentsList.map(apt => `
        <tr>
            <td data-label="Patient Name">${apt.patientName}</td>
            <td data-label="Mobile">${apt.mobile}</td>
            <td data-label="Doctor">${apt.doctor}</td>
            <td data-label="Date">${formatDate(apt.date)}</td>
            <td data-label="Time">${apt.time}</td>
            <td data-label="Status"><span class="status-badge status-${apt.status.toLowerCase()}">${apt.status}</span></td>
            <td data-label="Actions">
                <button class="btn btn-sm btn-outline-primary" onclick="editAppointment(${apt.id})">
                    <i class="fas fa-edit"></i>
                </button>
                ${currentUserRole === 'admin' ? `
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteAppointment(${apt.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

function showSection(sectionName) {
    document.getElementById('dashboardSection').classList.add('hidden');
    document.getElementById('appointmentsSection').classList.add('hidden');
    document.getElementById('profileSection').classList.add('hidden');

    document.getElementById(sectionName + 'Section').classList.remove('hidden');

    document.querySelectorAll('.sidebar .nav-link').forEach(link => link.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }

    if (sectionName === 'dashboard') {
        loadDashboardData();
    } else if (sectionName === 'appointments') {
        loadAppointmentsTable(getFilteredAppointments());
    } else if (sectionName === 'profile') {
        loadProfileData();
    }
}

function getFilteredAppointments() {
    let filtered = appointments;
    if (currentUserRole === 'doctor') {
        filtered = filtered.filter(apt => apt.doctor === 'Dr. John Doe');
    }

    const doctorFilter = document.getElementById('doctorFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    if (doctorFilter) {
        filtered = filtered.filter(apt => apt.doctor === doctorFilter);
    }
    if (dateFilter) {
        filtered = filtered.filter(apt => apt.date === dateFilter);
    }
    if (statusFilter) {
        filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    return filtered;
}

function filterAppointments() {
    loadAppointmentsTable(getFilteredAppointments());
}

function showAppointmentModal(appointmentId = null) {
    const title = document.getElementById('appointmentModalTitle');
    const form = document.getElementById('appointmentForm');

    if (appointmentId) {
        title.textContent = 'Edit Appointment';
        const appointment = appointments.find(apt => apt.id === appointmentId);
        if (appointment) {
            document.getElementById('appointmentId').value = appointment.id;
            document.getElementById('patientName').value = appointment.patientName;
            document.getElementById('patientMobile').value = appointment.mobile;
            document.getElementById('appointmentDoctor').value = appointment.doctor;
            document.getElementById('appointmentDate').value = appointment.date;
            document.getElementById('appointmentTime').value = appointment.time;
            document.getElementById('appointmentStatus').value = appointment.status;
            document.getElementById('appointmentNotes').value = appointment.notes || '';
        }
    } else {
        title.textContent = 'New Appointment';
        form.reset();
        document.getElementById('appointmentId').value = '';
    }

    appointmentModal.show();
}

function saveAppointment() {
    const form = document.getElementById('appointmentForm');
    const appointmentId = document.getElementById('appointmentId').value;

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const mobile = document.getElementById('patientMobile').value;
    if (mobile.length !== 10) {
        alert('Mobile number must be exactly 10 digits');
        return;
    }

    const appointmentData = {
        patientName: document.getElementById('patientName').value,
        mobile: mobile,
        doctor: document.getElementById('appointmentDoctor').value,
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('appointmentTime').value,
        status: document.getElementById('appointmentStatus').value,
        notes: document.getElementById('appointmentNotes').value
    };

    if (appointmentId) {
        const index = appointments.findIndex(apt => apt.id === parseInt(appointmentId));
        if (index !== -1) {
            appointments[index] = { ...appointments[index], ...appointmentData };
        }
    } else {
        appointmentData.id = Date.now();
        appointments.push(appointmentData);
    }

    localStorage.setItem('appointments', JSON.stringify(appointments));

    appointmentModal.hide();
    loadDashboardData();

    alert(appointmentId ? 'Appointment updated successfully!' : 'Appointment created successfully!');
}

function editAppointment(appointmentId) {
    showAppointmentModal(appointmentId);
}

function deleteAppointment(appointmentId) {
    deleteAppointmentId = appointmentId;
    deleteModal.show();
}

function confirmDelete() {
    if (deleteAppointmentId) {
        appointments = appointments.filter(apt => apt.id !== deleteAppointmentId);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        loadDashboardData();
        deleteModal.hide();
        alert('Appointment deleted successfully!');
        deleteAppointmentId = null;
    }
}

function loadProfileData() {
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileFullName').value = currentUser.name;
    document.getElementById('profileEmail').value = currentUser.email;
}

function editProfile() {
    document.getElementById('profileForm').querySelectorAll('input, textarea').forEach(input => {
        input.disabled = false;
    });
}

function cancelProfileEdit() {
    document.getElementById('profileForm').querySelectorAll('input, textarea').forEach(input => {
        input.disabled = true;
    });
}

function handleProfileUpdate(event) {
    event.preventDefault();
    currentUser.name = document.getElementById('profileFullName').value;
    currentUser.email = document.getElementById('profileEmail').value;

    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('userNameDisplay').textContent = currentUser.name;

    cancelProfileEdit();
    alert('Profile updated successfully!');
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    currentUserRole = '';

    document.getElementById('dashboardPage').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');

    document.getElementById('loginForm').reset();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
