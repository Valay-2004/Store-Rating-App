import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updatePassword: (passwordData) => api.put('/auth/password', passwordData),
  verifyToken: () => api.get('/auth/verify')
};

// User API calls
export const userAPI = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
  getUserRatings: (id) => api.get(`/users/${id}/ratings`)
};

// Store API calls
export const storeAPI = {
  getAllStores: (params) => api.get('/stores', { params }),
  getStoreById: (id) => api.get(`/stores/${id}`),
  createStore: (storeData) => api.post('/stores', storeData),
  updateStore: (id, storeData) => api.put(`/stores/${id}`, storeData),
  deleteStore: (id) => api.delete(`/stores/${id}`),
  getStoreDashboard: () => api.get('/stores/dashboard/my-store')
};

// Rating API calls
export const ratingAPI = {
  rateStore: (storeId, rating) => api.post(`/ratings/store/${storeId}`, { rating }),
  getUserStoreRating: (storeId) => api.get(`/ratings/store/${storeId}/my-rating`),
  updateRating: (id, rating) => api.put(`/ratings/${id}`, { rating }),
  deleteRating: (id) => api.delete(`/ratings/${id}`),
  getUserRatings: () => api.get('/ratings/my-ratings'),
  getStoreRatings: (storeId) => api.get(`/ratings/store/${storeId}`)
};

export default api;
