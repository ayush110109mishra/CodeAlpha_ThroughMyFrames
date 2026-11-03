import axios from 'axios';

/**
 * ==============================================================================
 * Central Axios HTTP Client (Phase 2)
 * ==============================================================================
 * WHY THIS FILE EXISTS:
 * Centralizes all outbound HTTP requests from our React frontend to the Express API.
 * - In development, Vite dev proxy routes `/api/*` to `http://localhost:5000/api/*`.
 * - In production, `VITE_API_URL` points directly to the deployed backend URL.
 * - Interceptors handle response unwrapping and error logging uniformly.
 * - Prepared for Phase 3: JWT token injection in request headers.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Injects auth token when Phase 3 introduces JWT
apiClient.interceptors.request.use(
  (config) => {
    // PHASE 3 TODO: Attach JWT from localStorage:
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extracts payload and handles API errors
apiClient.interceptors.response.use(
  (response) => {
    // If our backend sent our standard envelope { success: true, data: ... }, return that data
    return response.data;
  },
  (error) => {
    const errorMsg =
      error.response?.data?.message ||
      error.message ||
      'Unable to connect to Through My Frames API';

    console.warn(`[API Network Notice]: ${errorMsg}`);
    return Promise.reject(error);
  }
);

export default apiClient;

