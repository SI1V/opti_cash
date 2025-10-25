import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен к каждому запросу
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Обрабатываем ошибки авторизации
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  verifyToken: () => api.get('/auth/verify-token'),
};

// Banks API
export const banksApi = {
  getAll: () => api.get('/banks'),
  getOne: (id) => api.get(`/banks/${id}`),
  create: (data) => api.post('/banks', data),
  update: (id, data) => api.put(`/banks/${id}`, data),
  delete: (id) => api.delete(`/banks/${id}`),
};

// Cards API
export const cardsApi = {
  getByBank: (bankId) => api.get(`/banks/${bankId}/cards`),
  create: (bankId, data) => api.post(`/banks/${bankId}/cards`, data),
  update: (cardId, data) => api.put(`/banks/cards/${cardId}`, data),
  delete: (cardId) => api.delete(`/banks/cards/${cardId}`),
};

// Cashback Categories API
export const cashbackApi = {
  getCategories: (params) => api.get('/cashback/categories', { params }),
  createCategory: (cardId, data) => api.post(`/cashback/cards/${cardId}/categories`, data),
  updateCategory: (categoryId, data) => api.put(`/cashback/categories/${categoryId}`, data),
  deleteCategory: (categoryId) => api.delete(`/cashback/categories/${categoryId}`),
  getRecommendations: (category, params) => api.get(`/cashback/recommendations/${category}`, { params }),
};

// OCR API
export const ocrApi = {
  processScreenshot: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/ocr/screenshot', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  processScreenshotBase64: (base64Data) => api.post('/ocr/screenshot-base64', { image_base64: base64Data }),
};

export default api;
