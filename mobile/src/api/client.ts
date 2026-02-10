import axios, {AxiosError, InternalAxiosRequestConfig} from 'axios';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseURL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api'
    : 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Refresh token state ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
};

// Interceptor de request: agrega token de AsyncStorage
apiClient.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Interceptor de response: maneja 401 con refresh token
apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Solo intentar refresh en 401 y si no es un retry
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // No intentar refresh en endpoints de auth
    if (
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    const refreshToken = await AsyncStorage.getItem('refreshToken');

    if (!refreshToken) {
      // No hay refresh token, limpiar y rechazar
      await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
      return Promise.reject(error);
    }

    // Si ya estamos haciendo refresh, encolar la petición
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            originalRequest._retry = true;
            resolve(apiClient(originalRequest));
          },
          reject: (err: any) => {
            reject(err);
          },
        });
      });
    }

    isRefreshing = true;
    originalRequest._retry = true;

    try {
      // Llamar al endpoint de refresh
      const response = await axios.post(`${baseURL}/auth/refresh`, {
        refreshToken,
      });

      const newAccessToken = response.data.token;

      // Guardar nuevo access token
      await AsyncStorage.setItem('token', newAccessToken);

      // Procesar peticiones encoladas
      processQueue(null, newAccessToken);

      // Reintentar la petición original
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh falló — limpiar todo
      processQueue(refreshError, null);
      await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
