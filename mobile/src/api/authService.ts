import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './client';
import {AuthResponse} from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      // Guardar ambos tokens en AsyncStorage
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al iniciar sesión';
      throw new Error(message);
    }
  },

  async register(
    email: string,
    password: string,
    fullName: string,
  ): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', {
        email,
        password,
        fullName,
      });
      // Guardar ambos tokens en AsyncStorage
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al registrarse';
      throw new Error(message);
    }
  },

  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No hay refresh token');
      }
      const response = await apiClient.post<AuthResponse>('/auth/refresh', {
        refreshToken,
      });
      await AsyncStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al renovar sesión';
      throw new Error(message);
    }
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.post('/auth/logout', {refreshToken});
      }
    } catch {
      // Ignorar errores de logout — siempre limpiar localmente
    } finally {
      await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
    }
  },
};
