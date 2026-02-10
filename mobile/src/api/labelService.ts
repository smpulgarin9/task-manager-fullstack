import apiClient from './client';

interface LabelResponse {
  id: number;
  name: string;
  color: string;
}

export const labelService = {
  async getLabels(projectId: number): Promise<LabelResponse[]> {
    try {
      const response = await apiClient.get<LabelResponse[]>(
        `/projects/${projectId}/labels`,
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al obtener etiquetas';
      throw new Error(message);
    }
  },

  async createLabel(
    projectId: number,
    name: string,
    color: string,
  ): Promise<LabelResponse> {
    try {
      const response = await apiClient.post<LabelResponse>(
        `/projects/${projectId}/labels`,
        {name, color},
      );
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al crear etiqueta';
      throw new Error(message);
    }
  },

  async deleteLabel(projectId: number, labelId: number): Promise<void> {
    try {
      await apiClient.delete(`/projects/${projectId}/labels/${labelId}`);
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al eliminar etiqueta';
      throw new Error(message);
    }
  },
};
