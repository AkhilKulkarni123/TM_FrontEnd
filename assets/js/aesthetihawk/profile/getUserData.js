// assets/js/getUserData.js
import { pythonURI } from 'assets/js/api/config.js';

/**
 * Fetch the currently authenticated user's data.
 * Returns a JSON object with user information, or throws on error.
 */
export async function getUserData() {
    try {
        // Include Bearer token from localStorage for cross-origin reliability
        const token = localStorage.getItem('token');
        const headers = {
            "Content-Type": "application/json"
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${pythonURI}/api/id`, {
            method: "GET",
            credentials: "include",   // Required so JWT cookie is sent
            headers
        });

        if (!response.ok) {
            // 401 = User not logged in (JWT cookie missing or expired)
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();

    } catch (err) {
        console.error("error fetching user data:", err);
        throw err;
    }
}
