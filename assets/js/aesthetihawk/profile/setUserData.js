// assets/js/setUserData.js
import { pythonURI } from 'assets/js/api/config.js';

export async function updateUserData (userData) {
  try {
    const response = await fetch(`${pythonURI}/user/${encodeURIComponent(userData.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error('error updating data:', err);
    throw err;
  }
}
