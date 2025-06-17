import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Response interceptor for handling errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Problems API
export const problemsAPI = {
  getAll: (params = {}) => axios.get('/api/problems', { params }),
  getById: (id) => axios.get(`/api/problems/${id}`),
  getStats: (id) => axios.get(`/api/problems/${id}/stats`)
};

// Submissions API
export const submissionsAPI = {
  submit: (data) => axios.post('/api/submissions', data),
  getById: (id) => axios.get(`/api/submissions/${id}`),
  getByUser: (userId, params = {}) => axios.get(`/api/submissions/user/${userId}`, { params }),
  getByProblem: (problemId, params = {}) => axios.get(`/api/submissions/problem/${problemId}`, { params })
};

// Admin API
export const adminAPI = {
  getDashboard: () => axios.get('/api/admin/dashboard'),
  getProblems: (params = {}) => axios.get('/api/admin/problems', { params }),
  createProblem: (data) => axios.post('/api/admin/problems', data),
  updateProblem: (id, data) => axios.put(`/api/admin/problems/${id}`, data),
  deleteProblem: (id) => axios.delete(`/api/admin/problems/${id}`),
  getUsers: (params = {}) => axios.get('/api/admin/users', { params })
};

// Auth API
export const authAPI = {
  login: (data) => axios.post('/api/auth/login', data),
  register: (data) => axios.post('/api/auth/register', data),
  getMe: () => axios.get('/api/auth/me'),
  logout: () => axios.post('/api/auth/logout'),
  googleAuth: () => `${API_URL}/api/auth/google`
};

// Profile API
export const profileAPI = {
  getProfile: () => axios.get('/api/profile/me'),
  getPublicProfile: (id) => axios.get(`/api/profile/${id}`),
  updateProfile: (data) => axios.put('/api/profile/me', data),
  changePassword: (data) => axios.put('/api/profile/change-password', data),
  updateStats: (data) => axios.put('/api/profile/stats', data),
  updateAvatar: (data) => axios.put('/api/profile/avatar', data)
};

export default {
  problems: problemsAPI,
  submissions: submissionsAPI,
  admin: adminAPI,
  auth: authAPI,
  profile: profileAPI
};
