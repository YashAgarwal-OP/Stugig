import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
});

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
