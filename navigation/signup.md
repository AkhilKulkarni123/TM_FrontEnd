---
layout: page 
title: Sign Up
permalink: /signup
search_exclude: true
---



<style>
.signup-container {
    max-width: 500px;
    margin: 50px auto;
    padding: 30px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #333;
}

.form-group input, .form-group select {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
    box-sizing: border-box;
}

.form-group input:focus, .form-group select:focus {
    outline: none;
    border-color: #2196F3;
}

.submit-button {
    width: 100%;
    padding: 12px;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.3s;
}

.submit-button:hover {
    background: #0b7dda;
}

.submit-button:disabled {
    background: #cccccc;
    cursor: not-allowed;
}

.message {
    margin-top: 15px;
    padding: 10px;
    border-radius: 5px;
    text-align: center;
}

.message.success {
    background: #e8f5e9;
    color: #2e7d32;
}

.message.error {
    background: #ffebee;
    color: #c62828;
}

.login-link {
    text-align: center;
    margin-top: 20px;
}

.login-link a {
    color: #2196F3;
    text-decoration: none;
}

.login-link a:hover {
    text-decoration: underline;
}
</style>

<div class="signup-container">
    <h1>Create Account</h1>
    <p style="text-align: center; color: #666;">Join our platform today</p>
    
    <form id="signupForm">
        <div class="form-group">
            <label for="name">Full Name</label>
            <input type="text" id="name" name="name" required>
        </div>
        
        <div class="form-group">
            <label for="signupUid">Username (GitHub ID)</label>
            <input type="text" id="signupUid" name="signupUid" required>
        </div>
        
        <div class="form-group">
            <label for="signupPassword">Password</label>
            <input type="password" id="signupPassword" name="signupPassword" required minlength="8">
        </div>
        
        <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" name="confirmPassword" required>
        </div>
        
        <button type="submit" class="submit-button" id="signupButton">Create Account</button>
        
        <div id="signupMessage" class="message" style="display: none;"></div>
    </form>
    
    <div class="login-link">
        Already have an account? <a href="{{ site.baseurl }}/login">Login here</a>
    </div>
</div>

<script type="module">
    import { pythonURI } from '{{ site.baseurl }}/assets/js/api/config.js';

    const form = document.getElementById('signupForm');
    const signupButton = document.getElementById('signupButton');
    const messageDiv = document.getElementById('signupMessage');

    function showMessage(message, isError = false) {
        messageDiv.textContent = message;
        messageDiv.className = isError ? 'message error' : 'message success';
        messageDiv.style.display = 'block';
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate passwords
        if (password !== confirmPassword) {
            showMessage('Passwords do not match', true);
            return;
        }

        if (password.length < 8) {
            showMessage('Password must be at least 8 characters', true);
            return;
        }

        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            uid: document.getElementById('signupUid').value.trim(),
            password: password
        };

        // Disable button
        signupButton.disabled = true;
        signupButton.textContent = 'Creating Account...';
        messageDiv.style.display = 'none';

        try {
            const response = await fetch(`${pythonURI}/api/user/guest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Account created successfully! Redirecting to login...', false);
                
                // Store user data
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                localStorage.setItem('isAuthenticated', 'true');

                // Redirect after 1.5 seconds
                setTimeout(() => {
                    window.location.href = '{{ site.baseurl }}/profile';
                }, 1500);
            } else {
                showMessage(data.message || 'Signup failed. Please try again.', true);
                signupButton.disabled = false;
                signupButton.textContent = 'Create Account';
            }
        } catch (error) {
            console.error('Signup error:', error);
            showMessage('Network error. Please make sure the backend is running.', true);
            signupButton.disabled = false;
            signupButton.textContent = 'Create Account';
        }
    });

    // Check if already logged in
    if (localStorage.getItem('isAuthenticated') === 'true') {
        window.location.href = '{{ site.baseurl }}/profile';
    }
</script>
