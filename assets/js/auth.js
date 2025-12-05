// Authentication helper functions
// File: assets/js/auth.js

const AUTH_CONFIG = {
    API_URL: 'http://localhost:8001/api',  // Change to your deployed backend URL
    TOKEN_KEY: 'token',
    USER_KEY: 'user',
    AUTH_KEY: 'isAuthenticated'
};

// Check if user is authenticated
export function isAuthenticated() {
    return localStorage.getItem(AUTH_CONFIG.AUTH_KEY) === 'true';
}

// Get current user
export function getCurrentUser() {
    const userStr = localStorage.getItem(AUTH_CONFIG.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
}

// Get authentication token
export function getToken() {
    return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
}

// Logout user
export function logout() {
    // Clear localStorage
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    localStorage.removeItem(AUTH_CONFIG.AUTH_KEY);
    
    // Call logout API
    fetch(`${AUTH_CONFIG.API_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
    }).finally(() => {
        window.location.href = '/login';
    });
}

// Make authenticated API request
export async function authenticatedFetch(url, options = {}) {
    const token = getToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    const response = await fetch(url, mergedOptions);
    
    // If unauthorized, logout and redirect to login
    if (response.status === 401) {
        logout();
        throw new Error('Unauthorized');
    }
    
    return response;
}

// Update user display on page load
export function updateUserDisplay() {
    if (isAuthenticated()) {
        const user = getCurrentUser();
        
        // Update any elements with class 'user-name'
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
            el.textContent = user?.name || 'User';
        });
        
        // Show/hide elements based on authentication
        const authElements = document.querySelectorAll('[data-auth-required="true"]');
        authElements.forEach(el => {
            el.style.display = 'block';
        });
        
        const guestElements = document.querySelectorAll('[data-guest-only="true"]');
        guestElements.forEach(el => {
            el.style.display = 'none';
        });
    } else {
        // Hide authenticated elements
        const authElements = document.querySelectorAll('[data-auth-required="true"]');
        authElements.forEach(el => {
            el.style.display = 'none';
        });
        
        // Show guest elements
        const guestElements = document.querySelectorAll('[data-guest-only="true"]');
        guestElements.forEach(el => {
            el.style.display = 'block';
        });
    }
}

// Protect pages that require authentication
export function protectPage() {
    if (!isAuthenticated()) {
        window.location.href = '/login';
    }
}

// Initialize auth on page load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', updateUserDisplay);
}