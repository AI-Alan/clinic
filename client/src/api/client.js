import axios from 'axios';

// Try ports 3456–3465 so we find the server even if one port is in use
const PORTS = [3456, 3457, 3458, 3459, 3460, 3461, 3462, 3463, 3464, 3465];
const STORAGE_KEY = 'clinic_api_port';

function getStoredPort() {
  try {
    const p = parseInt(sessionStorage.getItem(STORAGE_KEY), 10);
    return PORTS.includes(p) ? p : PORTS[0];
  } catch (_) {
    return PORTS[0];
  }
}

function getBaseURL() {
  const port = getStoredPort();
  return `http://127.0.0.1:${port}/api`;
}

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Update baseURL when stored port changes (e.g. after retry)
api.interceptors.request.use((config) => {
  config.baseURL = getBaseURL();
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const isLoginRequest = err.config?.url?.includes('/auth/login');
    if (err.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    // On connection failure, try next port and retry once
    const isNetworkError = !err.response && (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error'));
    if (isNetworkError && err.config && !err.config.__retriedPort) {
      const currentPort = getStoredPort();
      const nextPort = PORTS[PORTS.indexOf(currentPort) + 1];
      if (nextPort) {
        sessionStorage.setItem(STORAGE_KEY, String(nextPort));
        err.config.__retriedPort = true;
        err.config.baseURL = `http://127.0.0.1:${nextPort}/api`;
        return api.request(err.config);
      }
    }
    return Promise.reject(err);
  }
);
