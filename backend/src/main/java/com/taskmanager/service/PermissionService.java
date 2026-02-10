package com.taskmanager.service;

import com.taskmanager.entity.User;
import com.taskmanager.enums.Permission;
import com.taskmanager.exception.AccessDeniedException;
import com.taskmanager.security.RolePermissions;
import org.springframework.stereotype.Service;

@Service
public class PermissionService {

    /**
     * Verifica que el usuario tenga el permiso requerido según su rol.
     * Lanza AccessDeniedException si no lo tiene.
     */
    public void checkPermission(User user, Permission permission) {
        if (!RolePermissions.hasPermission(user.getRole(), permission)) {
            throw new AccessDeniedException("No tienes permiso para realizar esta acción");
        }
    }
}
