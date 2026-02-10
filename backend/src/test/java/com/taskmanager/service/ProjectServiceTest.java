package com.taskmanager.service;

import com.taskmanager.dto.ProjectDetailResponse;
import com.taskmanager.dto.ProjectRequest;
import com.taskmanager.entity.Board;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.User;
import com.taskmanager.enums.Permission;
import com.taskmanager.enums.Role;
import com.taskmanager.exception.AccessDeniedException;
import com.taskmanager.repository.BoardRepository;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PermissionService permissionService;

    @InjectMocks
    private ProjectService projectService;

    private User adminUser;
    private User pmUser;
    private User memberUser;

    @BeforeEach
    void setUp() {
        adminUser = User.builder()
                .id(1L)
                .email("admin@test.com")
                .fullName("Admin User")
                .role(Role.ADMIN)
                .build();

        pmUser = User.builder()
                .id(2L)
                .email("pm@test.com")
                .fullName("Project Manager")
                .role(Role.PROJECT_MANAGER)
                .build();

        memberUser = User.builder()
                .id(3L)
                .email("member@test.com")
                .fullName("Member User")
                .role(Role.MEMBER)
                .build();
    }

    @Test
    @DisplayName("createProject - con rol MEMBER lanza AccessDeniedException")
    void createProject_conRolMember_lanzaAccessDenied() {
        ProjectRequest request = ProjectRequest.builder()
                .name("Proyecto Test")
                .description("Descripción")
                .build();

        doThrow(new AccessDeniedException("No tienes permiso para realizar esta acción"))
                .when(permissionService).checkPermission(memberUser, Permission.PROJECT_CREATE);

        assertThatThrownBy(() -> projectService.createProject(request, memberUser))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("No tienes permiso");

        verify(permissionService).checkPermission(memberUser, Permission.PROJECT_CREATE);
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    @DisplayName("createProject - con rol PROJECT_MANAGER crea correctamente")
    void createProject_conRolProjectManager_creaCorrectamente() {
        ProjectRequest request = ProjectRequest.builder()
                .name("Proyecto PM")
                .description("Descripción PM")
                .build();

        doNothing().when(permissionService).checkPermission(pmUser, Permission.PROJECT_CREATE);

        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project saved = invocation.getArgument(0);
            saved.setId(10L);
            return saved;
        });

        List<Board> defaultBoards = List.of(
                Board.builder().id(1L).name("Por Hacer").position(0).tasks(new ArrayList<>()).build(),
                Board.builder().id(2L).name("En Progreso").position(1).tasks(new ArrayList<>()).build(),
                Board.builder().id(3L).name("Hecho").position(2).tasks(new ArrayList<>()).build()
        );
        when(boardRepository.saveAll(anyList())).thenReturn(defaultBoards);

        ProjectDetailResponse response = projectService.createProject(request, pmUser);

        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Proyecto PM");
        assertThat(response.getOwner().getEmail()).isEqualTo("pm@test.com");
        assertThat(response.getBoards()).hasSize(3);

        verify(permissionService).checkPermission(pmUser, Permission.PROJECT_CREATE);
        verify(projectRepository).save(any(Project.class));
        verify(boardRepository).saveAll(anyList());
    }

    @Test
    @DisplayName("addMember - con rol MEMBER lanza AccessDeniedException")
    void addMember_conRolMember_lanzaAccessDenied() {
        doThrow(new AccessDeniedException("No tienes permiso para realizar esta acción"))
                .when(permissionService).checkPermission(memberUser, Permission.MEMBER_ADD);

        assertThatThrownBy(() -> projectService.addMember(1L, "new@test.com", memberUser))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("No tienes permiso");

        verify(permissionService).checkPermission(memberUser, Permission.MEMBER_ADD);
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    @DisplayName("deleteProject - con rol MEMBER lanza AccessDeniedException")
    void deleteProject_conRolMember_lanzaAccessDenied() {
        doThrow(new AccessDeniedException("No tienes permiso para realizar esta acción"))
                .when(permissionService).checkPermission(memberUser, Permission.PROJECT_DELETE);

        assertThatThrownBy(() -> projectService.deleteProject(1L, memberUser))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("No tienes permiso");

        verify(permissionService).checkPermission(memberUser, Permission.PROJECT_DELETE);
        verify(projectRepository, never()).delete(any(Project.class));
    }
}
