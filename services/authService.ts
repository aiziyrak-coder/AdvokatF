import api from './api';
import Cookies from 'js-cookie';

export const login = async (username, password) => {
    const response = await api.post('/auth/login/', {
        username,
        password
    });
    if (response.data.access) {
        // Frontend uchun JS o'qiy oladigan cookie'ga ham saqlaymiz
        Cookies.set('access_token', response.data.access, {
            sameSite: 'Lax',
        });
    }
    if (response.data.refresh) {
        Cookies.set('refresh_token', response.data.refresh, {
            sameSite: 'Lax',
        });
    }
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
};

export const logout = async () => {
    await api.post('/auth/logout/');
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
};

export const refreshToken = async () => {
    const refreshTokenValue = Cookies.get('refresh_token');
    if (!refreshTokenValue) {
        throw new Error("Refresh token not found");
    }
    try {
        const response = await api.post('/auth/token/refresh/', {
            refresh: refreshTokenValue
        });
        if (response.data.access) {
            Cookies.set('access_token', response.data.access, {
                sameSite: 'Lax',
            });
        }
        return response.data;
    } catch (error) {
        // Agar refresh ham ishlamasa, logout qilamiz
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        throw error;
    }
};

export const getCurrentUser = async () => {
    const accessToken = Cookies.get('access_token');
    if (!accessToken) {
        return Promise.reject(new Error("Access token not found in cookies."));
    }
    const response = await api.get('/auth/profile/');
    return response.data;
};
