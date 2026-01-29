import axios from 'axios';
import Cookies from 'js-cookie';
import { refreshToken } from './authService';

// Prod domen: https://advokat.cdcgroup.uz -> API: https://advokatapi.cdcgroup.uz/api
const detectBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL as string | undefined;
    if (envUrl) return envUrl;

    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        // Production domenlar
        if (host === 'advokat.cdcgroup.uz' || host.includes('cdcgroup.uz')) {
            return 'https://advokatapi.cdcgroup.uz/api';
        }
        // Development uchun
        if (host === 'localhost' || host === '127.0.0.1') {
            return 'http://localhost:8000/api';
        }
    }
    // Default production
    return 'https://advokatapi.cdcgroup.uz/api';
};

const API_URL = detectBaseUrl();

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Cookies yuborish uchun
});

api.interceptors.request.use(
    (config) => {
        // Har bir so'rovga JWT tokenni Authorization header orqali qo'shamiz
        const token = Cookies.get('access_token');
        if (token) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        
        // 401 xatosi va token refresh qilinmagan bo'lsa
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Token refresh qilamiz
                await refreshToken();
                // Yangi token bilan so'rovni qayta yuboramiz
                const token = Cookies.get('access_token');
                if (token) {
                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                }
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh ham ishlamasa, xatoni qaytaramiz
                console.error("Token refresh failed:", refreshError);
                return Promise.reject(error);
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
export { API_URL };
