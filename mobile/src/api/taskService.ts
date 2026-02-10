import apiClient from './client';

export interface TaskRequest {
  title: string;
  description?: string;
  priority?: string;
  boardId: number;
  assigneeId?: number | null;
  labelIds?: number[];
  dueDate?: string | null;
}

export interface TaskResponse {
  id: number;
  title: string;
  description: string;
  priority: string;
  position: number;
  assignee: {id: number; email: string; fullName: string; role: string} | null;
  labels: {id: number; name: string; color: string}[];
  dueDate: string | null;
  boardId: number;
  createdAt: string;
}

export const taskService = {
  async createTask(data: TaskRequest): Promise<TaskResponse> {
    try {
      const response = await apiClient.post<TaskResponse>('/tasks', data);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al crear tarea';
      throw new Error(message);
    }
  },

  async updateTask(
    id: number,
    data: TaskRequest,
  ): Promise<TaskResponse> {
    try {
      const response = await apiClient.put<TaskResponse>(
        `/tasks/${id}`,
        data,
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al actualizar tarea';
      throw new Error(message);
    }
  },

  async deleteTask(id: number): Promise<void> {
    try {
      await apiClient.delete(`/tasks/${id}`);
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al eliminar tarea';
      throw new Error(message);
    }
  },

  async moveTask(
    taskId: number,
    targetBoardId: number,
    newPosition: number,
  ): Promise<TaskResponse> {
    try {
      const response = await apiClient.put<TaskResponse>(
        `/tasks/${taskId}/move`,
        {targetBoardId, newPosition},
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al mover tarea';
      throw new Error(message);
    }
  },
};
