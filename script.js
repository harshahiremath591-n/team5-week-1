class SparkFlowManager {
    constructor() {
        this.currentUser = null;
        this.allLogins = JSON.parse(localStorage.getItem('globalLogs')) || [];
    }

    // Navigation between Home/Login/Dashboard
    nav(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.add('d-none'));
        document.getElementById('view-' + viewId).classList.remove('d-none');
    }

    // Dashboard Tab Switching
    tab(e, tabId) {
        if (e) e.preventDefault();
        document.querySelectorAll('.dash-tab').forEach(t => t.classList.add('d-none'));
        document.getElementById(tabId).classList.remove('d-none');
        document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
        if (e) e.currentTarget.classList.add('active');

        if (tabId === 'tab-reports') this.renderLogs();
    }

    // Smart Registration
    handleRegister() {
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const pass = document.getElementById('regPass').value;
        const role = document.getElementById('regRole').value;
        const photoFile = document.getElementById('regPhoto').files[0];

        if (!name || !email || !pass) return alert("Please complete all fields.");

        const reader = new FileReader();
        reader.onload = (e) => {
            const user = {
                name, email, pass, role,
                photo: e.target.result,
                history: []
            };
            localStorage.setItem(email, JSON.stringify(user));
            alert("Account Created! You can now log in.");
            this.nav('login');
        };

        if (photoFile) reader.readAsDataURL(photoFile);
        else {
            const user = { name, email, pass, role, photo: 'https://ui-avatars.com/api/?name=' + name, history: [] };
            localStorage.setItem(email, JSON.stringify(user));
            this.nav('login');
        }
    }

    // Smart Login with History Tracking
    handleLogin() {
        const email = document.getElementById('logEmail').value;
        const pass = document.getElementById('logPass').value;
        const data = localStorage.getItem(email);

        if (!data) return alert("Member not found.");
        const user = JSON.parse(data);

        if (user.pass === pass) {
            const now = new Date();
            const logEntry = {
                user: user.name,
                role: user.role,
                date: now.toLocaleDateString(),
                time: now.toLocaleTimeString()
            };

            // Save Global & Private History
            this.allLogins.push(logEntry);
            localStorage.setItem('globalLogs', JSON.stringify(this.allLogins));

            user.history.push(`${logEntry.date} at ${logEntry.time}`);
            localStorage.setItem(email, JSON.stringify(user));

            this.currentUser = user;
            this.loadDashboard(user);
        } else {
            alert("Invalid Password.");
        }
    }

    // Load Dashboard with user data
    loadDashboard(user) {
        // Map data to UI
        document.getElementById('dashUserName').innerText = user.name;
        document.getElementById('dashUserRole').innerText = user.role;
        document.getElementById('dashAvatar').src = user.photo;
        document.getElementById('profImg').src = user.photo;
        document.getElementById('profName').innerText = user.name;
        document.getElementById('profEmail').innerText = user.email;
        document.getElementById('profRole').innerText = user.role;

        // Render recent activity for current user
        const actList = document.getElementById('userActivityList');
        actList.innerHTML = user.history.slice(-5).reverse().map(h =>
            `<li class="list-group-item">Logged in: ${h}</li>`
        ).join('');

        this.nav('dashboard');
        document.getElementById('auth-container').classList.add('d-none');
    }

    // Management Logic
    addElectrician() {
        const name = document.getElementById('eName').value;
        const phone = document.getElementById('ePhone').value;
        if (!name || !phone) return alert("Input details!");

        const id = "ELC-" + Math.floor(100 + Math.random() * 899);
        const row = `
        <tr>
            <td>#${id}</td>
            <td class="eName">${name}</td>
            <td class="ePhone">${phone}</td>
            <td><span class="badge bg-success">Active</span></td>
            <td>
                <button class="btn btn-sm btn-outline-warning me-1" onclick="app.editElectrician(this)"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-success me-1 d-none" onclick="app.saveElectrician(this)"><i class="fas fa-check"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="this.closest('tr').remove()"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
        `;

        document.getElementById('elecTableBody').insertAdjacentHTML('beforeend', row);

        const modal = bootstrap.Modal.getInstance(document.getElementById('addElecModal'));
        modal.hide();
    }

    // Edit Electrician row
    editElectrician(btn) {
        const row = btn.closest('tr');
        const nameCell = row.querySelector('.eName');
        const phoneCell = row.querySelector('.ePhone');

        nameCell.innerHTML = `<input type="text" class="form-control form-control-sm" value="${nameCell.innerText}">`;
        phoneCell.innerHTML = `<input type="text" class="form-control form-control-sm" value="${phoneCell.innerText}">`;

        btn.classList.add('d-none');
        row.querySelector('.btn-outline-success').classList.remove('d-none');
    }

    // Save edited row
    saveElectrician(btn) {
        const row = btn.closest('tr');
        const nameCell = row.querySelector('.eName input');
        const phoneCell = row.querySelector('.ePhone input');

        row.querySelector('.eName').innerText = nameCell.value;
        row.querySelector('.ePhone').innerText = phoneCell.value;

        btn.classList.add('d-none');
        row.querySelector('.btn-outline-warning').classList.remove('d-none');
    }

    // Reporting Logic
    renderLogs() {
        const body = document.getElementById('loginHistoryBody');
        body.innerHTML = [...this.allLogins].reverse().map(log => `
            <tr>
                <td><strong>${log.user}</strong></td>
                <td>${log.role}</td>
                <td>${log.date}</td>
                <td class="text-primary">${log.time}</td>
            </tr>
        `).join('');
    }

    exportToExcel() {
        let csv = "User,Role,Date,Time\n";
        this.allLogins.forEach(r => csv += `${r.user},${r.role},${r.date},${r.time}\n`);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'SparkFlow_Access_Log.csv');
        a.click();
    }

    logout() { 
        if (confirm("Confirm Logout?")) location.reload(); 
    }
}

// Initialize app
const app = new SparkFlowManager();