import axios from 'axios';

// In production (Render static site), VITE_API_URL points to the backend service.
// In development, Vite proxy forwards /api to localhost:5000 so baseURL stays '/api'.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const client = axios.create({ baseURL });

// Attach JWT to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('stugig_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — clear stale token and redirect to login
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('stugig_token');
      localStorage.removeItem('stugig_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
