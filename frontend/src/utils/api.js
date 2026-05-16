import { auth } from '../config/firebase';

const getBackendUrl = () => {
  const configuredUrl = import.meta.env.VITE_BACKEND_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:5000';
  }

  throw new Error('Missing VITE_BACKEND_URL. Set it before building the frontend.');
};

export const API_BASE_URL = `${getBackendUrl()}/api`;

/**
 * Helper utility to fetch the Firebase JWT Token.
 */
const getAuthToken = async () => {
  if (auth.currentUser) {
    return await auth.currentUser.getIdToken();
  }
  return null;
};

export const apiFetch = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const bodyPreview = await response.text().catch(() => '');
    throw new Error(
      `Expected JSON from API but received ${contentType || 'unknown content type'} from ${response.url}. ` +
      `Check VITE_BACKEND_URL. Response preview: ${bodyPreview.slice(0, 80)}`
    );
  }

  const data = await response.json();

  if (!response.ok) {
    const message = data.message || data.error || 'API Request Failed';
    const details = Array.isArray(data.errors) ? data.errors : [];
    const error = new Error(details.length > 0 ? `${message} ${details.join(' ')}` : message);
    error.status = response.status;
    error.details = details;
    throw error;
  }

  return data;
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

  return apiFetch(endpoint, {
    ...options,
    headers,
  });
};
