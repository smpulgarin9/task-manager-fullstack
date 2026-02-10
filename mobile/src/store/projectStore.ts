import {create} from 'zustand';
import {Board, Task} from '../types';
import {
  ProjectResponse,
  ProjectDetailResponse,
  projectService,
} from '../api/projectService';
import {TaskRequest, taskService} from '../api/taskService';

interface ProjectState {
  projects: ProjectResponse[];
  currentProject: ProjectDetailResponse | null;
  isLoading: boolean;

  // Acciones
  fetchProjects: () => Promise<void>;
  fetchProjectDetail: (id: number) => Promise<void>;
  createProject: (name: string, description: string) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  moveTask: (
    taskId: number,
    sourceBoardId: number,
    targetBoardId: number,
    newPosition: number,
  ) => Promise<void>;
  createTask: (data: TaskRequest) => Promise<void>;
  deleteTask: (taskId: number, boardId: number) => Promise<void>;
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,

  // Carga la lista de proyectos del usuario
  fetchProjects: async () => {
    set({isLoading: true});
    try {
      const projects = await projectService.getMyProjects();
      set({projects, isLoading: false});
    } catch (error) {
      set({isLoading: false});
      throw error;
    }
  },

  // Carga el detalle de un proyecto con sus boards y tareas
  fetchProjectDetail: async (id: number) => {
    set({isLoading: true});
    try {
      const currentProject = await projectService.getProjectDetail(id);
      set({currentProject, isLoading: false});
    } catch (error) {
      set({isLoading: false});
      throw error;
    }
  },

  // Crea un proyecto y lo agrega a la lista local
  createProject: async (name: string, description: string) => {
    set({isLoading: true});
    try {
      const newProject = await projectService.createProject(name, description);
      // Convertimos el detail response a un ProjectResponse para la lista
      const projectForList: ProjectResponse = {
        id: newProject.id,
        name: newProject.name,
        description: newProject.description,
        ownerName: newProject.owner.fullName,
        memberCount: newProject.members.length,
        createdAt: newProject.createdAt,
      };
      set(state => ({
        projects: [...state.projects, projectForList],
        isLoading: false,
      }));
    } catch (error) {
      set({isLoading: false});
      throw error;
    }
  },

  // Elimina un proyecto de la lista local y del backend
  deleteProject: async (id: number) => {
    try {
      await projectService.deleteProject(id);
      set(state => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProject:
          state.currentProject?.id === id ? null : state.currentProject,
      }));
    } catch (error) {
      throw error;
    }
  },

  // Mueve una tarea entre boards con optimistic update para drag & drop fluido
  moveTask: async (
    taskId: number,
    sourceBoardId: number,
    targetBoardId: number,
    newPosition: number,
  ) => {
    const {currentProject} = get();
    if (!currentProject) return;

    // Guardamos el estado previo para revertir si falla
    const previousProject = {...currentProject, boards: currentProject.boards.map(b => ({
      ...b,
      tasks: [...b.tasks],
    }))};

    // a) Optimistic update: actualizamos el estado local inmediatamente
    const updatedBoards = currentProject.boards.map(board => {
      if (board.id === sourceBoardId && sourceBoardId === targetBoardId) {
        // Mover dentro del mismo board: reordenar
        const tasks = [...board.tasks];
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return board;
        const [movedTask] = tasks.splice(taskIndex, 1);
        tasks.splice(newPosition, 0, movedTask);
        // Recalcular posiciones
        const reorderedTasks = tasks.map((t, i) => ({...t, position: i}));
        return {...board, tasks: reorderedTasks};
      }

      if (board.id === sourceBoardId) {
        // Quitar la tarea del board origen
        const tasks = board.tasks.filter(t => t.id !== taskId);
        const reorderedTasks = tasks.map((t, i) => ({...t, position: i}));
        return {...board, tasks: reorderedTasks};
      }

      if (board.id === targetBoardId) {
        // Buscar la tarea en el board origen para moverla
        const sourceBoard = currentProject.boards.find(
          b => b.id === sourceBoardId,
        );
        const movedTask = sourceBoard?.tasks.find(t => t.id === taskId);
        if (!movedTask) return board;

        const tasks = [...board.tasks];
        const updatedTask: Task = {
          ...movedTask,
          boardId: targetBoardId,
          position: newPosition,
        };
        tasks.splice(newPosition, 0, updatedTask);
        const reorderedTasks = tasks.map((t, i) => ({...t, position: i}));
        return {...board, tasks: reorderedTasks};
      }

      return board;
    });

    set({
      currentProject: {...currentProject, boards: updatedBoards},
    });

    // b) Llama al backend
    try {
      await taskService.moveTask(taskId, targetBoardId, newPosition);
    } catch (error) {
      // c) Si falla, revierte al estado anterior
      set({currentProject: previousProject});
      throw error;
    }
  },

  // Crea una tarea y la agrega al board correspondiente en el estado local
  createTask: async (data: TaskRequest) => {
    try {
      const newTask = await taskService.createTask(data);
      const {currentProject} = get();
      if (!currentProject) return;

      // Convertimos TaskResponse a Task para el estado local
      const taskForBoard: Task = {
        id: newTask.id,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority as Task['priority'],
        position: newTask.position,
        assignee: newTask.assignee
          ? {
              id: newTask.assignee.id,
              email: newTask.assignee.email,
              fullName: newTask.assignee.fullName,
              role: newTask.assignee.role as 'ADMIN' | 'MEMBER',
            }
          : null,
        labels: newTask.labels,
        dueDate: newTask.dueDate,
        boardId: newTask.boardId,
      };

      const updatedBoards = currentProject.boards.map(board => {
        if (board.id === data.boardId) {
          return {...board, tasks: [...board.tasks, taskForBoard]};
        }
        return board;
      });

      set({
        currentProject: {...currentProject, boards: updatedBoards},
      });
    } catch (error) {
      throw error;
    }
  },

  // Elimina una tarea del estado local y del backend
  deleteTask: async (taskId: number, boardId: number) => {
    const {currentProject} = get();
    if (!currentProject) return;

    // Eliminamos del estado local primero (optimistic)
    const updatedBoards = currentProject.boards.map(board => {
      if (board.id === boardId) {
        const tasks = board.tasks
          .filter(t => t.id !== taskId)
          .map((t, i) => ({...t, position: i}));
        return {...board, tasks};
      }
      return board;
    });

    set({
      currentProject: {...currentProject, boards: updatedBoards},
    });

    try {
      await taskService.deleteTask(taskId);
    } catch (error) {
      // Si falla, recargamos el proyecto completo
      if (currentProject.id) {
        const refreshed = await projectService.getProjectDetail(
          currentProject.id,
        );
        set({currentProject: refreshed});
      }
      throw error;
    }
  },
}));
