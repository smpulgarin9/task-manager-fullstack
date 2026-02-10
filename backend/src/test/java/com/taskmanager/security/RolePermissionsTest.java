package com.taskmanager.security;

import com.taskmanager.enums.Permission;
import com.taskmanager.enums.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.*;

class RolePermissionsTest {

    @Test
    @DisplayName("ADMIN - tiene todos los permisos")
    void admin_tieneTodosLosPermisos() {
        Set<Permission> adminPermissions = RolePermissions.getPermissions(Role.ADMIN);

        assertThat(adminPermissions).containsExactlyInAnyOrder(Permission.values());

        for (Permission permission : Permission.values()) {
            assertThat(RolePermissions.hasPermission(Role.ADMIN, permission))
                    .as("ADMIN debería tener permiso: %s", permission)
                    .isTrue();
        }
    }

    @Test
    @DisplayName("PROJECT_MANAGER - no tiene ROLE_ASSIGN ni PROJECT_DELETE")
    void projectManager_noTieneRoleAssign() {
        assertThat(RolePermissions.hasPermission(Role.PROJECT_MANAGER, Permission.ROLE_ASSIGN))
                .isFalse();
        assertThat(RolePermissions.hasPermission(Role.PROJECT_MANAGER, Permission.PROJECT_DELETE))
                .isFalse();

        // Sí tiene permisos de gestión
        assertThat(RolePermissions.hasPermission(Role.PROJECT_MANAGER, Permission.PROJECT_CREATE))
                .isTrue();
        assertThat(RolePermissions.hasPermission(Role.PROJECT_MANAGER, Permission.PROJECT_EDIT))
                .isTrue();
        assertThat(RolePermissions.hasPermission(Role.PROJECT_MANAGER, Permission.BOARD_CREATE))
                .isTrue();
        assertThat(RolePermissions.hasPermission(Role.PROJECT_MANAGER, Permission.TASK_DELETE))
                .isTrue();
        assertThat(RolePermissions.hasPermission(Role.PROJECT_MANAGER, Permission.MEMBER_ADD))
                .isTrue();
        assertThat(RolePermissions.hasPermission(Role.PROJECT_MANAGER, Permission.MEMBER_REMOVE))
                .isTrue();
    }

    @Test
    @DisplayName("MEMBER - solo puede ver proyectos, crear/editar/mover tareas")
    void member_soloPuedeVerYCrearTareas() {
        Set<Permission> memberPermissions = RolePermissions.getPermissions(Role.MEMBER);

        assertThat(memberPermissions).containsExactlyInAnyOrder(
                Permission.PROJECT_VIEW,
                Permission.TASK_CREATE,
                Permission.TASK_EDIT,
                Permission.TASK_MOVE
        );
    }

    @Test
    @DisplayName("MEMBER - no puede crear proyectos")
    void member_noPuedeCrearProyectos() {
        assertThat(RolePermissions.hasPermission(Role.MEMBER, Permission.PROJECT_CREATE))
                .isFalse();
        assertThat(RolePermissions.hasPermission(Role.MEMBER, Permission.PROJECT_EDIT))
                .isFalse();
        assertThat(RolePermissions.hasPermission(Role.MEMBER, Permission.PROJECT_DELETE))
                .isFalse();
    }

    @Test
    @DisplayName("MEMBER - no puede eliminar tareas ni gestionar boards")
    void member_noPuedeEliminarTareas() {
        assertThat(RolePermissions.hasPermission(Role.MEMBER, Permission.TASK_DELETE))
                .isFalse();
        assertThat(RolePermissions.hasPermission(Role.MEMBER, Permission.BOARD_CREATE))
                .isFalse();
        assertThat(RolePermissions.hasPermission(Role.MEMBER, Permission.BOARD_EDIT))
                .isFalse();
        assertThat(RolePermissions.hasPermission(Role.MEMBER, Permission.BOARD_DELETE))
                .isFalse();
        assertThat(RolePermissions.hasPermission(Role.MEMBER, Permission.MEMBER_ADD))
                .isFalse();
        assertThat(RolePermissions.hasPermission(Role.MEMBER, Permission.ROLE_ASSIGN))
                .isFalse();
    }
}
