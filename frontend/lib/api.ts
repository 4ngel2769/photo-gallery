import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_APP_URL_BACKEND || 'http://localhost:5000';

// Create axios instance with API_URL/api as baseURL

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
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

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string; displayName?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
};

// Photos API
export const photosAPI = {
  getAll: (params?: { page?: number; limit?: number; category?: string; mood?: string; search?: string; sort?: string }) =>
    api.get('/photos', { params }),
  getById: (id: string) => api.get(`/photos/${id}`),
  create: (formData: FormData) =>
    api.post('/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: unknown) => api.put(`/photos/${id}`, data),
  delete: (id: string) => api.delete(`/photos/${id}`),
  like: (id: string, sessionId?: string) =>
    api.post(`/photos/${id}/like`, { sessionId }),
  getLikeStatus: (id: string, sessionId?: string) =>
    api.get(`/photos/${id}/like-status`, { params: { sessionId } }),
  trackView: (id: string, fingerprint: string) =>
    api.post(`/photos/${id}/view`, { fingerprint }),
};

// Comments API
export const commentsAPI = {
  getByPhoto: (photoId: string) => api.get(`/comments/${photoId}`),
  create: (photoId: string, content: string) =>
    api.post(`/comments/${photoId}`, { content }),
  update: (id: string, content: string) =>
    api.put(`/comments/${id}`, { content }),
  delete: (id: string) => api.delete(`/comments/${id}`),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
};

// Themes API
export const themesAPI = {
  getActive: () => api.get('/themes/active'),
  getAll: () => api.get('/themes'),
  createOrUpdate: (data: { name?: string; customCSS?: string; colors?: Record<string, string> }) =>
    api.post('/themes', data),
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data: {
    siteName?: string;
    siteDescription?: string;
    showLikes?: boolean;
    showViews?: boolean;
    showComments?: boolean;
    enableImageZoom?: boolean;
    navbarTitleEnabled?: boolean;
    navbarTitle?: string;
    navbarColor?: string;
    navbarColorEnd?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    ogImage?: string;
    twitterHandle?: string;
    socialLinks?: {
      instagram?: string;
      pixabay?: string;
      pexels?: string;
    };
  }) => api.put('/settings', data),
};

export default api;
