const loginBtn = document.querySelector('.login-btn');
const signupBtn = document.querySelector('.signup-btn');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const closeLogin = document.getElementById('closeLogin');
const closeSignup = document.getElementById('closeSignup');
const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');
const authButtons = document.getElementById('authButtons');
const userProfile = document.getElementById('userProfile');
const profileBtn = document.getElementById('profileBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const logoutBtn = document.getElementById('logoutBtn');

// Check if user is logged in
function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user && user.name) {
        authButtons.style.display = 'none';
        userProfile.style.display = 'block';
        document.getElementById('mainContent').style.display = 'block';
        
        const initial = user.name.charAt(0).toUpperCase();
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userAvatar').textContent = initial;
        document.getElementById('avatarLarge').textContent = initial;
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('profileEmail').textContent = user.email;
        
        // Get command count
        const commandCount = localStorage.getItem('commandCount') || 0;
        document.getElementById('commandCount').textContent = commandCount;
        
        // Calculate days active
        const signupDate = localStorage.getItem('signupDate') || new Date().toISOString();
        const days = Math.floor((new Date() - new Date(signupDate)) / (1000 * 60 * 60 * 24)) + 1;
        document.getElementById('loginDays').textContent = days;
    } else {
        // Show signup modal if not logged in
        document.getElementById('mainContent').style.display = 'none';
        signupModal.style.display = 'block';
    }
}

checkLoginStatus();

const viewHistoryBtn = document.getElementById('viewHistoryBtn');
const settingsBtn = document.getElementById('settingsBtn');
const historyModal = document.getElementById('historyModal');
const settingsModal = document.getElementById('settingsModal');
const closeHistory = document.getElementById('closeHistory');
const closeSettings = document.getElementById('closeSettings');

viewHistoryBtn.addEventListener('click', async () => {
    historyModal.style.display = 'block';
    dropdownMenu.classList.remove('show');
    await loadHistory();
});

settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'block';
    dropdownMenu.classList.remove('show');
    loadSettings();
});

closeHistory.addEventListener('click', () => {
    historyModal.style.display = 'none';
});

closeSettings.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

async function loadHistory() {
    const historyList = document.getElementById('historyList');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!window.dbGet || !window.dbRef || !window.database) {
        historyList.innerHTML = '<p class="no-data">Firebase not connected</p>';
        return;
    }
    
    try {
        const snapshot = await window.dbGet(window.dbChild(window.dbRef(window.database), 'voiceCommands'));
        
        if (snapshot.exists()) {
            const commands = snapshot.val();
            const userCommands = Object.entries(commands)
                .filter(([_, data]) => data.userEmail === user.email)
                .sort((a, b) => new Date(b[1].timestamp) - new Date(a[1].timestamp));
            
            if (userCommands.length === 0) {
                historyList.innerHTML = '<p class="no-data">No commands yet. Start using voice commands!</p>';
            } else {
                historyList.innerHTML = userCommands.map(([id, data]) => `
                    <div class="history-item">
                        <div class="history-command">🎤 ${data.command}</div>
                        <div class="history-time">${new Date(data.timestamp).toLocaleString()}</div>
                    </div>
                `).join('');
            }
        } else {
            historyList.innerHTML = '<p class="no-data">No commands yet. Start using voice commands!</p>';
        }
    } catch (error) {
        historyList.innerHTML = '<p class="no-data">Error loading history</p>';
    }
}

function loadSettings() {
    document.getElementById('autoListen').checked = localStorage.getItem('autoListen') === 'true';
    document.getElementById('soundEffects').checked = localStorage.getItem('soundEffects') !== 'false';
    document.getElementById('saveHistory').checked = localStorage.getItem('saveHistory') !== 'false';
}

document.getElementById('autoListen').addEventListener('change', (e) => {
    localStorage.setItem('autoListen', e.target.checked);
});

document.getElementById('soundEffects').addEventListener('change', (e) => {
    localStorage.setItem('soundEffects', e.target.checked);
});

document.getElementById('saveHistory').addEventListener('change', (e) => {
    localStorage.setItem('saveHistory', e.target.checked);
});

document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all history?')) {
        localStorage.setItem('commandCount', 0);
        alert('History cleared!');
        checkLoginStatus();
    }
});

document.getElementById('changePasswordBtn').addEventListener('click', () => {
    alert('Change password feature coming soon!');
});

document.getElementById('deleteAccountBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to delete your account? This cannot be undone!')) {
        localStorage.clear();
        location.reload();
    }
});

profileBtn.addEventListener('click', () => {
    dropdownMenu.classList.toggle('show');
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    authButtons.style.display = 'flex';
    userProfile.style.display = 'none';
    dropdownMenu.classList.remove('show');
    document.getElementById('mainContent').style.display = 'none';
    signupModal.style.display = 'block';
    alert('Logged out successfully!');
});

window.addEventListener('click', (e) => {
    if (!e.target.closest('.profile-dropdown')) {
        dropdownMenu.classList.remove('show');
    }
});

loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
});

signupBtn.addEventListener('click', () => {
    signupModal.style.display = 'block';
});

closeLogin.addEventListener('click', () => {
    loginModal.style.display = 'none';
});

closeSignup.addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
        alert('Please sign up to access the website!');
        return;
    }
    signupModal.style.display = 'none';
});

switchToSignup.addEventListener('click', () => {
    loginModal.style.display = 'none';
    signupModal.style.display = 'block';
});

switchToLogin.addEventListener('click', () => {
    signupModal.style.display = 'none';
    loginModal.style.display = 'block';
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
    if (e.target === signupModal) {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user) {
            return; // Don't close if not logged in
        }
        signupModal.style.display = 'none';
    }
    if (e.target === historyModal) {
        historyModal.style.display = 'none';
    }
    if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});

document.querySelectorAll('.auth-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const isLogin = form.closest('#loginModal');
        
        if (isLogin) {
            const email = form.querySelector('input[type="email"]').value;
            const password = form.querySelector('input[type="password"]').value;
            
            try {
                const snapshot = await window.dbGet(window.dbChild(window.dbRef(window.database), 'users'));
                if (snapshot.exists()) {
                    const users = snapshot.val();
                    const userKey = Object.keys(users).find(key => 
                        users[key].email === email && users[key].password === password
                    );
                    
                    if (userKey) {
                        alert('Login successful!');
                        localStorage.setItem('user', JSON.stringify(users[userKey]));
                        loginModal.style.display = 'none';
                        checkLoginStatus();
                    } else {
                        alert('Invalid credentials!');
                    }
                } else {
                    alert('No users found!');
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        } else {
            const inputs = form.querySelectorAll('input');
            const name = inputs[0].value;
            const email = inputs[1].value;
            const password = inputs[2].value;
            const confirmPassword = inputs[3].value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            try {
                const userId = Date.now().toString();
                await window.dbSet(window.dbRef(window.database, 'users/' + userId), {
                    name: name,
                    email: email,
                    password: password
                });
                
                alert('Signup successful!');
                const userData = { name, email };
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('signupDate', new Date().toISOString());
                localStorage.setItem('commandCount', 0);
                signupModal.style.display = 'none';
                checkLoginStatus();
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
    });
});
