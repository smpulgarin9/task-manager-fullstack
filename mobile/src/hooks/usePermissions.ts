import {useAuthStore} from '../store/authStore';

/**
 * Hook que retorna funciones booleanas para verificar permisos
 * del usuario actual según su rol.
 */
export const usePermissions = () => {
  const user = useAuthStore(state => state.user);
  const role = user?.role ?? 'MEMBER';

  const isAdmin = (): boolean => role === 'ADMIN';

  const isProjectManager = (): boolean => role === 'PROJECT_MANAGER';

  const canCreateProject = (): boolean =>
    role === 'ADMIN' || role === 'PROJECT_MANAGER';

  const canEditProject = (): boolean =>
    role === 'ADMIN' || role === 'PROJECT_MANAGER';

  const canDeleteProject = (): boolean => role === 'ADMIN';

  const canManageMembers = (): boolean =>
    role === 'ADMIN' || role === 'PROJECT_MANAGER';

  const canManageBoards = (): boolean =>
    role === 'ADMIN' || role === 'PROJECT_MANAGER';

  const canDeleteTask = (): boolean =>
    role === 'ADMIN' || role === 'PROJECT_MANAGER';

  return {
    isAdmin,
    isProjectManager,
    canCreateProject,
    canEditProject,
    canDeleteProject,
    canManageMembers,
    canManageBoards,
    canDeleteTask,
    role,
  };
};
