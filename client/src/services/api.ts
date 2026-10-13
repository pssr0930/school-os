import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const path = window.location.pathname;
  let token: string | null = null;

  if (path.startsWith('/staff')) {
    token = localStorage.getItem('school_os_staff_token');
  } else if (path.startsWith('/admin')) {
    token = localStorage.getItem('school_os_admin_token');
  } else if (path.startsWith('/agent')) {
    token = localStorage.getItem('agent_token');
  }

  // Fallback if specific portal token is not set
  if (!token) {
    token = localStorage.getItem('school_os_admin_token') || 
            localStorage.getItem('school_os_staff_token') || 
            localStorage.getItem('agent_token') || 
            localStorage.getItem('school_os_token');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized session');
    }
    return Promise.reject(error);
  }
);

export default api;
