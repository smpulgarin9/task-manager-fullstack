import apiClient from './client';
import {Project, Board, Task, Label} from '../types';

// Response types que coinciden con el backend
export interface ProjectResponse {
  id: number;
  name: string;
  description: string;
  ownerName: string;
  memberCount: number;
  createdAt: string;
}

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export interface ProjectDetailResponse {
  id: number;
  name: string;
  description: string;
  owner: UserResponse;
  members: UserResponse[];
  boards: Board[];
  createdAt: string;
}

export const projectService = {
  async getMyProjects(): Promise<ProjectResponse[]> {
    try {
      const response = await apiClient.get<ProjectResponse[]>('/projects');
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al obtener proyectos';
      throw new Error(message);
    }
  },

  async getProjectDetail(id: number): Promise<ProjectDetailResponse> {
    try {
      const response = await apiClient.get<ProjectDetailResponse>(
        `/projects/${id}`,
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al obtener detalle del proyecto';
      throw new Error(message);
    }
  },

  async createProject(
    name: string,
    description: string,
  ): Promise<ProjectDetailResponse> {
    try {
      const response = await apiClient.post<ProjectDetailResponse>(
        '/projects',
        {name, description},
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al crear proyecto';
      throw new Error(message);
    }
  },

  async updateProject(
    id: number,
    name: string,
    description: string,
  ): Promise<ProjectDetailResponse> {
    try {
      const response = await apiClient.put<ProjectDetailResponse>(
        `/projects/${id}`,
        {name, description},
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al actualizar proyecto';
      throw new Error(message);
    }
  },

  async deleteProject(id: number): Promise<void> {
    try {
      await apiClient.delete(`/projects/${id}`);
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al eliminar proyecto';
      throw new Error(message);
    }
  },

  async addMember(
    projectId: number,
    email: string,
  ): Promise<ProjectDetailResponse> {
    try {
      const response = await apiClient.post<ProjectDetailResponse>(
        `/projects/${projectId}/members`,
        {email},
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al agregar miembro';
      throw new Error(message);
    }
  },

  async removeMember(
    projectId: number,
    userId: number,
  ): Promise<ProjectDetailResponse> {
    try {
      const response = await apiClient.delete<ProjectDetailResponse>(
        `/projects/${projectId}/members/${userId}`,
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al remover miembro';
      throw new Error(message);
    }
  },
};
