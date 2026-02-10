import apiClient from './client';
import {AuthResponse} from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
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
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al registrarse';
      throw new Error(message);
    }
  },
};
