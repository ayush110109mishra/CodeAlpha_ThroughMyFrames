import axios from 'axios';

/**
 * ==============================================================================
 * Central Axios HTTP Client (Phase 4: Render Wake-Up Aware & JWT Injected)
 * ==============================================================================
 * Centralizes all outbound HTTP requests from our React frontend to the Express API.
 * - In development, Vite dev proxy routes `/api/*` to `http://localhost:5000/api/*`.
 * - In production, `VITE_API_URL` points directly to the deployed backend URL.
 * - Request interceptor injects `Authorization: Bearer <token>` from localStorage.
 * - Response interceptor catches 401 Unauthorized, clears expired tokens, and prompts re-login.
 * - 4-second timeout monitor dispatches `server:waking` event if the server is sleeping (Render free tier).
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'auth_token';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // 45s timeout to allow Render free tier instances to spin up
  headers: {
    'Content-Type': 'application/json',
  },
});

let pendingRequestsCount = 0;
let wakingTimer = null;

const startWakingTimer = () => {
  pendingRequestsCount++;
  if (pendingRequestsCount === 1) {
    wakingTimer = setTimeout(() => {
      if (typeof window !== 'undefined' && pendingRequestsCount > 0) {
        window.dispatchEvent(new CustomEvent('server:waking', { detail: { waking: true } }));
      }
    }, 4000);
  }
};

const stopWakingTimer = () => {
  pendingRequestsCount = Math.max(0, pendingRequestsCount - 1);
  if (pendingRequestsCount === 0) {
    if (wakingTimer) {
      clearTimeout(wakingTimer);
      wakingTimer = null;
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('server:waking', { detail: { waking: false } }));
    }
  }
};

// Request Interceptor: Injects Bearer token from localStorage & starts timer
apiClient.interceptors.request.use(
  (config) => {
    startWakingTimer();
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    stopWakingTimer();
    return Promise.reject(error);
  }
);

// Response Interceptor: Unwraps data envelope & handles 401 session expiration
apiClient.interceptors.response.use(
  (response) => {
    stopWakingTimer();
    // If backend sent standard envelope { success: true, data: ... }, return data directly
    return response.data;
  },
  (error) => {
    stopWakingTimer();
    const status = error.response?.status;
    const url = error.config?.url || '';

    // Handle 401 Unauthorized on protected routes (avoid redirect loops on login/signup failure)
    if (status === 401 && !url.includes('/auth/login') && !url.includes('/auth/signup')) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new CustomEvent('auth:expired'));

      // If in browser and not already on login page, redirect to login
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    }

    const errorMsg =
      error.response?.data?.message ||
      error.message ||
      'Unable to connect to Through My Frames API';

    console.warn(`[API Notice]: ${errorMsg}`);
    return Promise.reject(error);
  }
);

export default apiClient;
