import axios from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Show success toasts for POST/PUT/DELETE
    if (['post', 'put', 'delete'].includes(response.config.method || '')) {
      toast.success(response.data?.message || 'Operación exitosa');
    }
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || 'Error de conexión con el servidor';
    
    // Don't toast 401s as they are handled by auth store redirect
    if (error.response?.status !== 401) {
      toast.error(message);
    } else {
      useAuthStore.getState().logout();
    }
    
    return Promise.reject(error);
  }
);

export default api;
