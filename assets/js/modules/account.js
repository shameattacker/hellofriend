import { getUsers, saveUsers, getCurrentUser, setCurrentUser } from '../../utils/storage.js';

let currentUser = getCurrentUser();

function showToastLocal(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const toastMessage = toast.querySelector('.toast-message');
    if (!toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

if (!currentUser) {
    window.location.href = '../index.html';
}

function updateProfileDisplay() {
    if (!currentUser) return;
    const nameParts = currentUser.name.split(' ');
    const initials = nameParts.map(n => n[0]).join('').toUpperCase().substring(0, 2);
    
    document.getElementById('profile-initials-large').textContent = initials;
    document.getElementById('profile-name-large').textContent = currentUser.name;
    document.getElementById('profile-email-large').textContent = currentUser.email;
    document.getElementById('user-initials').textContent = initials;
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-email').textContent = currentUser.email;
    
    if (currentUser.firstName) {
        document.getElementById('profile-first-name').value = currentUser.firstName;
    }
    if (currentUser.lastName) {
        document.getElementById('profile-last-name').value = currentUser.lastName;
    }
    if (currentUser.email) {
        document.getElementById('profile-email').value = currentUser.email;
    }
    if (currentUser.phone) {
        document.getElementById('profile-phone').value = currentUser.phone;
    }
    if (currentUser.address) {
        document.getElementById('profile-address').value = currentUser.address;
    }
    if (currentUser.city) {
        document.getElementById('profile-city').value = currentUser.city;
    }
    if (currentUser.country) {
        document.getElementById('profile-country').value = currentUser.country;
    }
    if (currentUser.bio) {
        document.getElementById('profile-bio').value = currentUser.bio;
    }
}

const profileForm = document.getElementById('profile-form');
if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex] = {
                ...users[userIndex],
                firstName: document.getElementById('profile-first-name').value,
                lastName: document.getElementById('profile-last-name').value,
                email: document.getElementById('profile-email').value,
                phone: document.getElementById('profile-phone').value,
                address: document.getElementById('profile-address').value,
                city: document.getElementById('profile-city').value,
                country: document.getElementById('profile-country').value,
                bio: document.getElementById('profile-bio').value,
                name: document.getElementById('profile-first-name').value + ' ' + document.getElementById('profile-last-name').value
            };
            saveUsers(users);
            const updatedUser = users[userIndex];
            setCurrentUser(updatedUser);
            currentUser = updatedUser;
            updateProfileDisplay();
            showToastLocal('Profile updated successfully!');
        }
    });
}

const settingsForm = document.getElementById('settings-form');
if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;
        
        if (currentPassword !== currentUser.password) {
            showToastLocal('Current password is incorrect');
            return;
        }
        
        if (newPassword.length < 6) {
            showToastLocal('Password must be at least 6 characters');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showToastLocal('Passwords do not match');
            return;
        }
        
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            saveUsers(users);
            const updatedUser = users[userIndex];
            setCurrentUser(updatedUser);
            currentUser = updatedUser;
            settingsForm.reset();
            showToastLocal('Password updated successfully!');
        }
    });
}

const accountNavLinks = document.querySelectorAll('.account-nav-link');
accountNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.getAttribute('data-tab');
        accountNavLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        document.querySelectorAll('.account-tab').forEach(t => t.classList.remove('active'));
        document.getElementById(tab + '-tab').classList.add('active');
    });
});

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        setCurrentUser(null);
        window.location.href = '../index.html';
    });
}

const userAvatarBtn = document.getElementById('user-avatar-btn');
const userDropdown = document.getElementById('user-dropdown');
if (userAvatarBtn && userDropdown) {
    userAvatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
    });
    
    document.addEventListener('click', (e) => {
        if (!userAvatarBtn.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('active');
        }
    });
}

const editProfileBtn = document.getElementById('edit-profile-btn');
if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
        document.querySelectorAll('.account-nav-link').forEach(l => l.classList.remove('active'));
        document.querySelector('[data-tab="profile"]').classList.add('active');
        document.querySelectorAll('.account-tab').forEach(t => t.classList.remove('active'));
        document.getElementById('profile-tab').classList.add('active');
        document.getElementById('profile-first-name').focus();
    });
}

const settingsCheckboxes = document.querySelectorAll('.settings-options input[type="checkbox"]');
settingsCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            if (!users[userIndex].settings) {
                users[userIndex].settings = {};
            }
            users[userIndex].settings[checkbox.name] = checkbox.checked;
            saveUsers(users);
            const updatedUser = users[userIndex];
            setCurrentUser(updatedUser);
            currentUser = updatedUser;
        }
    });
});

if (currentUser && currentUser.settings) {
    if (currentUser.settings.emailNotifications !== undefined) {
        document.querySelector('[name="email-notifications"]').checked = currentUser.settings.emailNotifications;
    }
    if (currentUser.settings.smsNotifications !== undefined) {
        document.querySelector('[name="sms-notifications"]').checked = currentUser.settings.smsNotifications;
    }
    if (currentUser.settings.marketing !== undefined) {
        document.querySelector('[name="marketing"]').checked = currentUser.settings.marketing;
    }
}

updateProfileDisplay();

const hash = window.location.hash.substring(1);
if (hash) {
    const tabLink = document.querySelector(`[data-tab="${hash}"]`);
    if (tabLink) {
        accountNavLinks.forEach(l => l.classList.remove('active'));
        tabLink.classList.add('active');
        document.querySelectorAll('.account-tab').forEach(t => t.classList.remove('active'));
        document.getElementById(hash + '-tab').classList.add('active');
    }
}

function loadUserProjects() {
    const projectsList = document.getElementById('user-projects-list');
    if (!projectsList || !currentUser || !currentUser.projects) return;
    
    if (currentUser.projects.length === 0) {
        projectsList.innerHTML = `
            <div class="empty-state">
                <p>You don't have any saved projects yet.</p>
                <a href="../index.html#projects" class="btn btn-primary">Browse Projects</a>
            </div>
        `;
        return;
    }
    
    projectsList.innerHTML = currentUser.projects.map((project, index) => `
        <div class="project-card">
            <div class="project-image">
                <img src="../${project.image}" alt="${project.title}">
            </div>
            <div class="project-info">
                <div>
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-category">${project.category}</p>
                </div>
                <button class="project-btn remove-project" data-index="${index}">
                    <svg width="10" height="20" viewBox="0 0 10 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L9 10L1 19" stroke="#e74c3c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.remove-project').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-index'));
            const users = getUsers();
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].projects.splice(index, 1);
                saveUsers(users);
                const updatedUser = users[userIndex];
                setCurrentUser(updatedUser);
                currentUser = updatedUser;
                loadUserProjects();
                showToastLocal('Project removed');
            }
        });
    });
}

const projectsTab = document.getElementById('projects-tab');
if (projectsTab) {
    const projectsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadUserProjects();
            }
        });
    }, { threshold: 0.1 });
    projectsObserver.observe(projectsTab);
}

loadUserProjects();
