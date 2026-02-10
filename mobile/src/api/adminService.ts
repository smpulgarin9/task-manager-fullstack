import apiClient from './client';

export interface UserItem {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export const adminService = {
  async getUsers(): Promise<UserItem[]> {
    try {
      const response = await apiClient.get<UserItem[]>('/admin/users');
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al obtener usuarios';
      throw new Error(message);
    }
  },

  async changeUserRole(userId: number, role: string): Promise<UserItem> {
    try {
      const response = await apiClient.put<UserItem>(
        `/admin/roles/${userId}`,
        {role},
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al cambiar el rol';
      throw new Error(message);
    }
  },
};
