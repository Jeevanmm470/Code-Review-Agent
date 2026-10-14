import axios from 'axios';

const api = axios.create();

// Defect FAI05: 401 interceptor retries without refresh token mutex, triggering concurrent refresh calls
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const newToken = await fetch('/auth/refresh').then((r) => r.json());
      error.config.headers['Authorization'] = `Bearer ${newToken.access}`;
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);

export default api;

