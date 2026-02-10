import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {User} from '../types';
import {authService} from '../api/authService';

interface AuthState {
  token: string | null;
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
      user: null,
      isLoading: false,
      isAuthenticated: false,

      // Inicia sesión, guarda token en AsyncStorage y setea user en el store
      login: async (email: string, password: string) => {
        set({isLoading: true});
        try {
          const response = await authService.login(email, password);
          await AsyncStorage.setItem('token', response.token);
          const user: User = {
            id: 0,
            email: response.email,
            fullName: response.fullName,
            role: response.role as 'ADMIN' | 'MEMBER',
          };
          set({
            token: response.token,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({isLoading: false});
          throw error;
        }
      },

      // Registra usuario, guarda token y setea user en el store
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
          await AsyncStorage.setItem('token', response.token);
          const user: User = {
            id: 0,
            email: response.email,
            fullName: response.fullName,
            role: response.role as 'ADMIN' | 'MEMBER',
          };
          set({
            token: response.token,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({isLoading: false});
          throw error;
        }
      },

      // Cierra sesión: limpia AsyncStorage y resetea el store
      logout: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // Al iniciar la app, lee el token de AsyncStorage y valida si hay sesión
      loadToken: async () => {
        set({isLoading: true});
        try {
          const token = await AsyncStorage.getItem('token');
          if (token) {
            // Si hay token guardado, marcamos como autenticado
            // El user se restaura desde el persist middleware
            const currentUser = get().user;
            set({
              token,
              isAuthenticated: true,
              isLoading: false,
              user: currentUser,
            });
          } else {
            set({
              token: null,
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch {
          set({
            token: null,
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
      // Solo persistimos token y user, no isLoading ni isAuthenticated
      partialize: state => ({
        token: state.token,
        user: state.user,
      }),
    },
  ),
);
