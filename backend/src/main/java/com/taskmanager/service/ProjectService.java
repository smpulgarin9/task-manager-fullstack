package com.taskmanager.service;

import com.taskmanager.dto.*;
import com.taskmanager.entity.Board;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.User;
import com.taskmanager.enums.Permission;
import com.taskmanager.exception.AccessDeniedException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.BoardRepository;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    private final PermissionService permissionService;

    @Transactional
    public ProjectDetailResponse createProject(ProjectRequest request, User currentUser) {
        permissionService.checkPermission(currentUser, Permission.PROJECT_CREATE);

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(currentUser)
                .members(new HashSet<>())
                .boards(new ArrayList<>())
                .build();

        // Agregar al owner como member
        project.getMembers().add(currentUser);

        projectRepository.save(project);

        // Crear 3 boards por defecto
        List<Board> defaultBoards = List.of(
                Board.builder().name("Por Hacer").position(0).project(project).tasks(new ArrayList<>()).build(),
                Board.builder().name("En Progreso").position(1).project(project).tasks(new ArrayList<>()).build(),
                Board.builder().name("Hecho").position(2).project(project).tasks(new ArrayList<>()).build()
        );
        boardRepository.saveAll(defaultBoards);
        project.setBoards(defaultBoards);

        return mapToDetailResponse(project);
    }

    public List<ProjectResponse> getMyProjects(User currentUser) {
        List<Project> projects = projectRepository.findByOwnerOrMember(currentUser.getId());
        return projects.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public ProjectDetailResponse getProjectById(Long id, User currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con id: " + id));

        validateMemberAccess(project, currentUser);

        // Cargar boards con tareas ordenadas
        List<Board> boards = boardRepository.findByProjectIdOrderByPositionAsc(id);
        project.setBoards(boards);

        return mapToDetailResponse(project);
    }

    @Transactional
    public ProjectDetailResponse updateProject(Long id, ProjectRequest request, User currentUser) {
        permissionService.checkPermission(currentUser, Permission.PROJECT_EDIT);

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con id: " + id));

        validateOwnerAccess(project, currentUser);

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        projectRepository.save(project);

        List<Board> boards = boardRepository.findByProjectIdOrderByPositionAsc(id);
        project.setBoards(boards);

        return mapToDetailResponse(project);
    }

    @Transactional
    public void deleteProject(Long id, User currentUser) {
        permissionService.checkPermission(currentUser, Permission.PROJECT_DELETE);

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con id: " + id));

        validateOwnerAccess(project, currentUser);

        projectRepository.delete(project);
    }

    @Transactional
    public ProjectDetailResponse addMember(Long projectId, String email, User currentUser) {
        permissionService.checkPermission(currentUser, Permission.MEMBER_ADD);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con id: " + projectId));

        validateOwnerAccess(project, currentUser);

        User newMember = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));

        project.getMembers().add(newMember);
        projectRepository.save(project);

        List<Board> boards = boardRepository.findByProjectIdOrderByPositionAsc(projectId);
        project.setBoards(boards);

        return mapToDetailResponse(project);
    }

    @Transactional
    public ProjectDetailResponse removeMember(Long projectId, Long userId, User currentUser) {
        permissionService.checkPermission(currentUser, Permission.MEMBER_REMOVE);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con id: " + projectId));

        validateOwnerAccess(project, currentUser);

        project.getMembers().removeIf(member -> member.getId().equals(userId));
        projectRepository.save(project);

        List<Board> boards = boardRepository.findByProjectIdOrderByPositionAsc(projectId);
        project.setBoards(boards);

        return mapToDetailResponse(project);
    }

    // --- Validaciones de acceso ---

    private void validateOwnerAccess(Project project, User currentUser) {
        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Solo el owner puede realizar esta acción");
        }
    }

    private void validateMemberAccess(Project project, User currentUser) {
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        boolean isMember = project.getMembers().stream()
                .anyMatch(m -> m.getId().equals(currentUser.getId()));

        if (!isOwner && !isMember) {
            throw new AccessDeniedException("No tienes acceso a este proyecto");
        }
    }

    // --- Mappers ---

    private ProjectResponse mapToResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .ownerName(project.getOwner().getFullName())
                .memberCount(project.getMembers().size())
                .createdAt(project.getCreatedAt() != null ? project.getCreatedAt().toString() : null)
                .build();
    }

    public ProjectDetailResponse mapToDetailResponse(Project project) {
        return ProjectDetailResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .owner(mapToUserResponse(project.getOwner()))
                .members(project.getMembers().stream().map(this::mapToUserResponse).collect(Collectors.toList()))
                .boards(project.getBoards().stream().map(this::mapToBoardResponse).collect(Collectors.toList()))
                .createdAt(project.getCreatedAt() != null ? project.getCreatedAt().toString() : null)
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    private BoardResponse mapToBoardResponse(Board board) {
        return BoardResponse.builder()
                .id(board.getId())
                .name(board.getName())
                .position(board.getPosition())
                .tasks(board.getTasks() != null
                        ? board.getTasks().stream().map(this::mapToTaskResponse).collect(Collectors.toList())
                        : new ArrayList<>())
                .build();
    }

    private TaskResponse mapToTaskResponse(com.taskmanager.entity.Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority() != null ? task.getPriority().name() : null)
                .position(task.getPosition())
                .assignee(task.getAssignee() != null ? mapToUserResponse(task.getAssignee()) : null)
                .labels(task.getLabels() != null
                        ? task.getLabels().stream().map(l -> LabelResponse.builder()
                                .id(l.getId()).name(l.getName()).color(l.getColor()).build())
                        .collect(Collectors.toList())
                        : new ArrayList<>())
                .dueDate(task.getDueDate() != null ? task.getDueDate().toString() : null)
                .boardId(task.getBoard().getId())
                .createdAt(task.getCreatedAt() != null ? task.getCreatedAt().toString() : null)
                .build();
    }
}
