import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {User} from '../types';
import {authService} from '../api/authService';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Acciones
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      isLoading: false,
      isAuthenticated: false,

      // Inicia sesión, guarda ambos tokens en AsyncStorage y setea user en el store
      login: async (email: string, password: string) => {
        set({isLoading: true});
        try {
          const response = await authService.login(email, password);
          const user: User = {
            id: 0,
            email: response.email,
            fullName: response.fullName,
            role: response.role as 'ADMIN' | 'PROJECT_MANAGER' | 'MEMBER',
          };
          set({
            token: response.token,
            refreshToken: response.refreshToken,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({isLoading: false});
          throw error;
        }
      },

      // Registra usuario, guarda ambos tokens y setea user en el store
      register: async (
        email: string,
        password: string,
        fullName: string,
      ) => {
        set({isLoading: true});
        try {
          const response = await authService.register(
            email,
            password,
            fullName,
          );
          const user: User = {
            id: 0,
            email: response.email,
            fullName: response.fullName,
            role: response.role as 'ADMIN' | 'PROJECT_MANAGER' | 'MEMBER',
          };
          set({
            token: response.token,
            refreshToken: response.refreshToken,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({isLoading: false});
          throw error;
        }
      },

      // Cierra sesión: llama al backend, limpia AsyncStorage y resetea el store
      logout: async () => {
        await authService.logout();
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // Al iniciar la app, lee ambos tokens de AsyncStorage y valida si hay sesión
      loadToken: async () => {
        set({isLoading: true});
        try {
          const token = await AsyncStorage.getItem('token');
          const refreshToken = await AsyncStorage.getItem('refreshToken');
          if (token) {
            const currentUser = get().user;
            set({
              token,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
              user: currentUser,
            });
          } else {
            set({
              token: null,
              refreshToken: null,
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch {
          set({
            token: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Solo persistimos token, refreshToken y user
      partialize: state => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
);
