import { auth } from '../config/firebase';

// Define the backend connection layer to securely communicate with standard MongoDB models
// Points to the flexible environment variable instead of a rigid hardcoded domain
const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

/**
 * Helper utility to fetch the Firebase JWT Token.
 */
const getAuthToken = async () => {
  if (auth.currentUser) {
    return await auth.currentUser.getIdToken();
  }
  return null;
};

/**
 * 
 * Standardized Fetch wrapper for our secure API endpoints
 *
 */
export const secureFetch = async (endpoint, options = {}) => {
  const token = await getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API Request Failed');
  }

  return response.json();
};
