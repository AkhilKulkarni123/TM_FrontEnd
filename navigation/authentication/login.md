---
layout: page
title: Login
permalink: /login
search_exclude: true
show_reading_time: false
---

<style>
/* Remove any default page styling */
body {
    background-color: #1a1a1a;
    color: #ffffff;
}

.login-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 30px;
    max-width: 1400px;
    margin: 80px auto 50px auto;
    padding: 20px;
    flex-wrap: wrap;
}

.login-card, .signup-card {
    flex: 1;
    min-width: 350px;
    max-width: 500px;
    background: rgba(50, 50, 50, 0.8);
    border: 1px solid #404040;
    border-radius: 10px;
    padding: 40px 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.login-card h1, .signup-card h1 {
    color: #ffffff;
    margin-bottom: 10px;
    font-size: 1.8rem;
}

.login-card hr, .signup-card hr {
    border: none;
    border-top: 1px solid #555;
    margin: 20px 0 30px 0;
}

.form-group {
    margin-bottom: 20px;
}

.form-group input, 
.form-group select {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid #555;
    border-radius: 8px;
    font-size: 14px;
    box-sizing: border-box;
    background: #2a2a2a;
    color: #ffffff;
    transition: border-color 0.3s, background-color 0.3s;
}

.form-group input::placeholder,
.form-group select option {
    color: #888;
}

.form-group input:focus, 
.form-group select:focus {
    outline: none;
    border-color: #4CAF50;
    background: #333;
}

.form-group select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 35px;
}

.submit-button {
    width: 100%;
    padding: 14px;
    background: #5a5a5a;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
    margin-top: 10px;
}

.submit-button:hover {
    background: #6a6a6a;
}

.submit-button:disabled {
    background: #3a3a3a;
    cursor: not-allowed;
    opacity: 0.6;
}

/* Green button for login */
.login-card .submit-button {
    background: #4CAF50;
}

.login-card .submit-button:hover {
    background: #45a049;
}

.error-message {
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
    padding: 12px;
    border-radius: 5px;
    margin-top: 15px;
    display: none;
    font-size: 14px;
    border: 1px solid rgba(255, 107, 107, 0.3);
}

.success-message {
    color: #4CAF50;
    background: rgba(76, 175, 80, 0.1);
    padding: 12px;
    border-radius: 5px;
    margin-top: 15px;
    display: none;
    font-size: 14px;
    border: 1px solid rgba(76, 175, 80, 0.3);
}

.backend-status {
    display: flex;
    justify-content: space-around;
    margin-top: 25px;
    gap: 15px;
}

.status-item {
    flex: 1;
    padding: 12px;
    border-radius: 8px;
    text-align: center;
    background: rgba(50, 50, 50, 0.5);
    border: 1px solid #555;
    font-size: 14px;
}

.status-item .status-icon {
    font-size: 18px;
    margin-right: 5px;
}

.status-item.success {
    background: rgba(76, 175, 80, 0.2);
    border-color: #4CAF50;
    color: #4CAF50;
}

.status-item.error {
    background: rgba(255, 107, 107, 0.2);
    border-color: #ff6b6b;
    color: #ff6b6b;
}

.status-item.pending {
    background: rgba(255, 193, 7, 0.2);
    border-color: #FFC107;
    color: #FFC107;
}

.overall-status {
    margin-top: 20px;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
    font-weight: 600;
    font-size: 14px;
}

.overall-status.success {
    background: rgba(76, 175, 80, 0.2);
    border: 1px solid #4CAF50;
    color: #4CAF50;
}

.overall-status.error {
    background: rgba(255, 107, 107, 0.2);
    border: 1px solid #ff6b6b;
    color: #ff6b6b;
}

.overall-status.partial {
    background: rgba(255, 193, 7, 0.2);
    border: 1px solid #FFC107;
    color: #FFC107;
}

.overall-status.hidden {
    display: none;
}

.switch {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0;
}

.toggle {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
}

.toggle input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #555;
    transition: .4s;
    border-radius: 24px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
}

input:checked + .slider {
    background-color: #4CAF50;
}

input:checked + .slider:before {
    transform: translateX(26px);
}

.label-text {
    color: #ccc;
    font-size: 14px;
}

.validation-message {
    font-size: 12px;
    margin-top: 8px;
}

.validation-message.success {
    color: #4CAF50;
}

.validation-message.error {
    color: #ff6b6b;
}

#confirmPassword.password-match {
    border-color: #4CAF50;
    background: rgba(76, 175, 80, 0.1);
}

#confirmPassword.password-mismatch {
    border-color: #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
}

#confirmPassword.password-length {
    border-color: #FFC107;
    background: rgba(255, 193, 7, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
    .login-container {
        flex-direction: column;
        align-items: center;
    }
    
    .login-card, .signup-card {
        max-width: 100%;
    }
}
</style>

<div class="login-container">
    <!-- Login Card -->
    <div class="login-card">
        <h1>User Login</h1>
        <hr>
        <form id="loginForm" onsubmit="return false;">
            <div class="form-group">
                <input type="text" id="uid" placeholder="GitHub ID" required>
            </div>
            <div class="form-group">
                <input type="password" id="password" placeholder="Password" required>
            </div>
            <p>
                <button type="button" onclick="handleLogin()" class="submit-button">Login</button>
            </p>
            <div id="loginMessage" class="error-message"></div>
        </form>
    </div>

    <!-- Signup Card -->
    <div class="signup-card">
        <h1>Sign Up</h1>
        <hr>
        <form id="signupForm" onsubmit="return false;">
            <div class="form-group">
                <input type="text" id="signupName" placeholder="Name" required>
            </div>
            <div class="form-group">
                <input type="text" id="signupUid" placeholder="GitHub ID" required>
            </div>
            <div class="form-group">
                <input type="text" id="signupSid" placeholder="Student ID" required>
            </div>
            <div class="form-group">
                <select id="signupSchool" required>
                    <option value="" disabled selected>Select Your High School</option>
                    <option value="Abraxas High School">Abraxas</option>
                    <option value="Del Norte High School">Del Norte</option>
                    <option value="Mt Carmel High School">Mt Carmel</option>
                    <option value="Poway High School">Poway</option>
                    <option value="Poway to Palomar">Poway to Palomar</option>
                    <option value="Rancho Bernardo High School">Rancho Bernardo</option>
                    <option value="Westview High School">Westview</option>
                </select>
            </div>
            <div class="form-group">
                <input type="email" id="signupEmail" placeholder="Personal (not school) Email" required>
            </div>
            <div class="form-group">
                <input type="password" id="signupPassword" placeholder="Password" required minlength="8">
            </div>
            
            <div class="form-group">
                <input type="password" id="confirmPassword" placeholder="Confirm Password" required>
                <div id="password-validation-message" class="validation-message"></div>
            </div>
            <p>
                <label class="switch">
                    <span class="toggle">
                        <input type="checkbox" id="kasmNeeded">
                        <span class="slider"></span>
                    </span>
                    <span class="label-text">Kasm Server Needed</span>
                </label>
            </p>
            <p>
                <button type="button" onclick="handleSignup()" class="submit-button" id="signupButton">Sign Up</button>
            </p>
            
            <!-- Backend Status Display -->
            <div class="backend-status">
                <div id="flaskStatus" class="status-item">
                    <span class="status-icon">⏳</span>
                    <span class="status-text">Flask</span>
                </div>
                <div id="springStatus" class="status-item">
                    <span class="status-icon">⏳</span>
                    <span class="status-text">Spring</span>
                </div>
            </div>
            <div id="overallStatus" class="overall-status hidden"></div>
        </form>
    </div>
</div>

<script type="module">
    import { pythonURI, javaURI, fetchOptions } from '{{site.baseurl}}/assets/js/api/config.js';

    
    let validationTimeout = null;


    // Password validation with debouncing
    function validatePasswordsDebounced() {
        
        if (validationTimeout) {
            clearTimeout(validationTimeout);
        }
        
        validationTimeout = setTimeout(() => {
            validatePasswords();
        }, 500);
    }

    function validatePasswords() {
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const confirmField = document.getElementById('confirmPassword');
        const messageDiv = document.getElementById('password-validation-message');

        
        confirmField.classList.remove('password-match', 'password-mismatch', 'password-length');
        messageDiv.classList.remove('success', 'error');

        
        if (confirmPassword === '') {
            messageDiv.textContent = '';
            return true;
        }

        if (password.length < 8) {
            confirmField.classList.add('password-length');
            messageDiv.classList.add('error');
            messageDiv.textContent = '✗ Password must be at least 8 characters';
            return false;
        }

        if (password === confirmPassword) {
            confirmField.classList.add('password-match');
            messageDiv.classList.add('success');
            messageDiv.textContent = '✓ Passwords match';
            return true;
        } else {
            confirmField.classList.add('password-mismatch');
            messageDiv.classList.add('error');
            messageDiv.textContent = '✗ Passwords do not match';
            return false;
        }
    }



    // Backend status management
    function updateBackendStatus(backend, status) {
        const element = document.getElementById(`${backend}Status`);
        const icon = element.querySelector('.status-icon');
        const text = element.querySelector('.status-text');

       
       element.classList.remove('pending', 'success', 'error');

        switch(status) {
            case 'pending':
                element.classList.add('pending');
                icon.textContent = '⏳';
                text.textContent = backend.charAt(0).toUpperCase() + backend.slice(1);
                break;
            case 'success':
                element.classList.add('success');
                icon.textContent = '✅';
                text.textContent = `${backend.charAt(0).toUpperCase() + backend.slice(1)} ✓`;
                break;
            case 'error':
                element.classList.add('error');
                icon.textContent = '❌';
                text.textContent = `${backend.charAt(0).toUpperCase() + backend.slice(1)} ✗`;
                break;
        }
    }

    function updateOverallStatus() {
        const flaskEl = document.getElementById('flaskStatus');
        const springEl = document.getElementById('springStatus');
        const overallEl = document.getElementById('overallStatus');

        const flaskSuccess = flaskEl.classList.contains('success');
        const springSuccess = springEl.classList.contains('success');
        const flaskError = flaskEl.classList.contains('error');
        const springError = springEl.classList.contains('error');

        overallEl.classList.remove('hidden', 'success', 'partial', 'error');

        if (flaskSuccess && springSuccess) {
            overallEl.classList.add('success');
            overallEl.textContent = '🎉 Account created successfully! You can now login.';
        } else if (flaskSuccess && springError) {
            overallEl.classList.add('partial');
            overallEl.textContent = '⚠️ Flask account created! Spring failed but you can still login.';
        } else if (flaskError && springSuccess) {
            overallEl.classList.add('partial');
            overallEl.textContent = '⚠️ Spring account created! Flask failed - you can try logging in.';
        } else if (flaskError && springError) {
            overallEl.classList.add('error');
            overallEl.textContent = '💥 Both backends failed. Please check your information and try again.';
        }
    }

    function showLoginMessage(message, isError = true) {
        const messageDiv = document.getElementById('loginMessage');
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
        messageDiv.className = isError ? 'error-message' : 'success-message';
        messageDiv.style.display = 'block';
    }

    // LOGIN FUNCTION
    window.handleLogin = async function() {
        const uid = document.getElementById('uid').value.trim();
        const password = document.getElementById('password').value;

        if (!uid || !password) {
            showLoginMessage('Please enter both username and password');
            return;
        }

        showLoginMessage('Logging in...', false);

        try {
            // Try Flask login first
            const flaskResponse = await fetch(`${pythonURI}/api/authenticate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ uid, password })
            });

            if (flaskResponse.ok) {
                const data = await flaskResponse.json();
                console.log('Flask login successful:', data);
                
                // Store user data
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                localStorage.setItem('isAuthenticated', 'true');

                // Try Spring login in background (don't block on failure)
                trySpringLogin(uid, password);

                // Redirect to profile
                showLoginMessage('Login successful! Redirecting...', false);
                setTimeout(() => {
                    window.location.href = '{{site.baseurl}}/profile';
                }, 1000);
            } else {
                const errorData = await flaskResponse.json();
                showLoginMessage(errorData.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showLoginMessage('Network error. Please make sure the backend server is running.');
        }
    };

    async function trySpringLogin(uid, password) {
        try {
            const springResponse = await fetch(`${javaURI}/authenticate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ uid, password })
            });

            if (springResponse.ok) {
                console.log('Spring login successful');
            } else {
                console.log('Spring login failed, but continuing with Flask session');
            }
        } catch (error) {
            console.log('Spring login error (non-blocking):', error);
        }
    }

    // SIGNUP FUNCTION
    window.handleSignup = async function() {
        const signupButton = document.getElementById('signupButton');
        
        // Validate passwords match
        if (!validatePasswords()) {
            alert('Please make sure passwords match and are at least 8 characters.');
            return;
        }

        // Get form data
        const formData = {
            name: document.getElementById('signupName').value.trim(),
            uid: document.getElementById('signupUid').value.trim(),
            sid: document.getElementById('signupSid').value.trim(),
            school: document.getElementById('signupSchool').value,
            email: document.getElementById('signupEmail').value.trim(),
            password: document.getElementById('signupPassword').value,
            kasm_server_needed: document.getElementById('kasmNeeded').checked
        };

        // Validate all fields
        if (!formData.name || !formData.uid || !formData.sid || !formData.school || !formData.email || !formData.password) {
            alert('Please fill in all required fields');
            return;
        }

        // Disable button
        signupButton.disabled = true;
        signupButton.textContent = 'Creating Account...';

        // Reset status
        updateBackendStatus('flask', 'pending');
        updateBackendStatus('spring', 'pending');
        document.getElementById('overallStatus').classList.add('hidden');

        // Prepare Spring data
        const springData = {
            uid: formData.uid,
            sid: formData.sid,
            email: formData.email,
            dob: "2000-01-01",
            name: formData.name,
            password: formData.password,
            kasmServerNeeded: formData.kasm_server_needed
        };

        // Flask signup
        const flaskPromise = fetch(`${pythonURI}/api/user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (response.ok) {
                updateBackendStatus('flask', 'success');
                return response.json();
            } else {
                return response.json().then(err => {
                    console.error('Flask error:', err);
                    throw new Error(err.message || 'Flask signup failed');
                });
            }
        })
        .catch(error => {
            console.error('Flask signup error:', error);
            updateBackendStatus('flask', 'error');
            throw error;
        });

        // Spring signup
        const springPromise = fetch(`${javaURI}/api/person/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(springData)
        })
        .then(response => {
            if (response.ok) {
                updateBackendStatus('spring', 'success');
                return response.json();
            } else {
                throw new Error('Spring signup failed');
            }
        })
        .catch(error => {
            console.error('Spring signup error:', error);
            updateBackendStatus('spring', 'error');
            throw error;
        });

        // Handle both
        Promise.allSettled([flaskPromise, springPromise])
            .then(results => {
                const [flaskResult, springResult] = results;
                
                console.log('Flask result:', flaskResult);
                console.log('Spring result:', springResult);

                updateOverallStatus();

                // If Flask succeeded, store user data
                if (flaskResult.status === 'fulfilled' && flaskResult.value) {
                    localStorage.setItem('user', JSON.stringify(flaskResult.value.user));
                    localStorage.setItem('token', flaskResult.value.token);
                    localStorage.setItem('isAuthenticated', 'true');

                    // Auto-redirect after 2 seconds
                    setTimeout(() => {
                        window.location.href = '{{site.baseurl}}/profile';
                    }, 2000);
                }

                // Re-enable button
                signupButton.disabled = false;
                signupButton.textContent = 'Sign Up';
            });
    };

    // Initialize password validation
    window.addEventListener('load', function() {
        const passwordField = document.getElementById('signupPassword');
        const confirmPasswordField = document.getElementById('confirmPassword');

        if (passwordField && confirmPasswordField) {
            passwordField.addEventListener('input', validatePasswordsDebounced);
            confirmPasswordField.addEventListener('input', validatePasswordsDebounced);
        }

        // Check if already logged in
        if (localStorage.getItem('isAuthenticated') === 'true') {
            window.location.href = '{{site.baseurl}}/profile';
        }
    });
</script>
