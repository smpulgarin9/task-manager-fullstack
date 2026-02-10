package com.taskmanager.security;

import com.taskmanager.enums.Permission;
import com.taskmanager.enums.Role;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Mapea cada rol del sistema a sus permisos correspondientes.
 */
public final class RolePermissions {

    private static final Map<Role, Set<Permission>> ROLE_PERMISSIONS = Map.of(
            Role.ADMIN, EnumSet.allOf(Permission.class),

            Role.PROJECT_MANAGER, EnumSet.of(
                    Permission.PROJECT_CREATE,
                    Permission.PROJECT_EDIT,
                    Permission.PROJECT_VIEW,
                    Permission.BOARD_CREATE,
                    Permission.BOARD_EDIT,
                    Permission.BOARD_DELETE,
                    Permission.TASK_CREATE,
                    Permission.TASK_EDIT,
                    Permission.TASK_DELETE,
                    Permission.TASK_MOVE,
                    Permission.MEMBER_ADD,
                    Permission.MEMBER_REMOVE
            ),

            Role.MEMBER, EnumSet.of(
                    Permission.PROJECT_VIEW,
                    Permission.TASK_CREATE,
                    Permission.TASK_EDIT,
                    Permission.TASK_MOVE
            )
    );

    private RolePermissions() {
    }

    public static boolean hasPermission(Role role, Permission permission) {
        Set<Permission> permissions = ROLE_PERMISSIONS.get(role);
        return permissions != null && permissions.contains(permission);
    }

    public static Set<Permission> getPermissions(Role role) {
        return ROLE_PERMISSIONS.getOrDefault(role, EnumSet.noneOf(Permission.class));
    }
}
