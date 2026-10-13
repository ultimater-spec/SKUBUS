import axios from 'axios';

// Normalize API URL to avoid missing /api and preflight redirects
const getBaseURL = () => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  url = url.trim().replace(/\/+$/, '');
  
  // Force HTTPS on remote/hosted domains to prevent 301/308 preflight redirects
  if (url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
    url = url.replace('http://', 'https://');
  }

  // Ensure /api is appended if user configured VITE_API_URL without /api on Vercel
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // if using cookies for auth
});

// Attach Authorization Bearer token from localStorage for cross-site hosting compatibility
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Save token from login/auth responses
api.interceptors.response.use(
  (response) => {
    if (response?.data?.data?.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;

