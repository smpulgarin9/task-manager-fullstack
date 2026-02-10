package com.taskmanager.service;

import com.taskmanager.dto.*;
import com.taskmanager.entity.*;
import com.taskmanager.enums.Permission;
import com.taskmanager.enums.Priority;
import com.taskmanager.exception.AccessDeniedException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    private final LabelRepository labelRepository;
    private final PermissionService permissionService;

    @Transactional
    public TaskResponse createTask(TaskRequest request, User currentUser) {
        permissionService.checkPermission(currentUser, Permission.TASK_CREATE);

        Board board = boardRepository.findById(request.getBoardId())
                .orElseThrow(() -> new ResourceNotFoundException("Board no encontrado con id: " + request.getBoardId()));

        validateMemberAccess(board.getProject(), currentUser);

        // Asignar position al final del board
        List<Task> existingTasks = taskRepository.findByBoardIdOrderByPositionAsc(board.getId());
        int nextPosition = existingTasks.isEmpty() ? 0 : existingTasks.get(existingTasks.size() - 1).getPosition() + 1;

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? Priority.valueOf(request.getPriority()) : Priority.MEDIUM)
                .position(nextPosition)
                .board(board)
                .labels(new HashSet<>())
                .build();

        // Asignar assignee si viene
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + request.getAssigneeId()));
            task.setAssignee(assignee);
        }

        // Asignar labels si vienen
        if (request.getLabelIds() != null && !request.getLabelIds().isEmpty()) {
            Set<Label> labels = new HashSet<>(labelRepository.findAllById(request.getLabelIds()));
            task.setLabels(labels);
        }

        // Asignar dueDate si viene
        if (request.getDueDate() != null && !request.getDueDate().isEmpty()) {
            task.setDueDate(LocalDate.parse(request.getDueDate()));
        }

        Task saved = taskRepository.save(task);
        return mapToResponse(saved);
    }

    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con id: " + id));
        return mapToResponse(task);
    }

    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request, User currentUser) {
        permissionService.checkPermission(currentUser, Permission.TASK_EDIT);

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con id: " + id));

        validateMemberAccess(task.getBoard().getProject(), currentUser);

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());

        if (request.getPriority() != null) {
            task.setPriority(Priority.valueOf(request.getPriority()));
        }

        // Cambiar de board si es diferente
        if (request.getBoardId() != null && !request.getBoardId().equals(task.getBoard().getId())) {
            Board newBoard = boardRepository.findById(request.getBoardId())
                    .orElseThrow(() -> new ResourceNotFoundException("Board no encontrado con id: " + request.getBoardId()));
            task.setBoard(newBoard);
        }

        // Actualizar assignee
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + request.getAssigneeId()));
            task.setAssignee(assignee);
        } else {
            task.setAssignee(null);
        }

        // Actualizar labels
        if (request.getLabelIds() != null) {
            Set<Label> labels = new HashSet<>(labelRepository.findAllById(request.getLabelIds()));
            task.setLabels(labels);
        }

        // Actualizar dueDate
        if (request.getDueDate() != null && !request.getDueDate().isEmpty()) {
            task.setDueDate(LocalDate.parse(request.getDueDate()));
        } else {
            task.setDueDate(null);
        }

        Task saved = taskRepository.save(task);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteTask(Long id, User currentUser) {
        permissionService.checkPermission(currentUser, Permission.TASK_DELETE);

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con id: " + id));

        validateMemberAccess(task.getBoard().getProject(), currentUser);

        // Reordenar posiciones del board original
        List<Task> boardTasks = taskRepository.findByBoardIdOrderByPositionAsc(task.getBoard().getId());
        boardTasks.remove(task);
        for (int i = 0; i < boardTasks.size(); i++) {
            boardTasks.get(i).setPosition(i);
        }
        taskRepository.saveAll(boardTasks);

        taskRepository.delete(task);
    }

    /**
     * MÉTODO CLAVE PARA DRAG & DROP
     * Mueve una tarea a otro board y/o posición de forma atómica.
     */
    @Transactional
    public TaskResponse moveTask(Long taskId, TaskMoveRequest request, User currentUser) {
        permissionService.checkPermission(currentUser, Permission.TASK_MOVE);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con id: " + taskId));

        validateMemberAccess(task.getBoard().getProject(), currentUser);

        Board targetBoard = boardRepository.findById(request.getTargetBoardId())
                .orElseThrow(() -> new ResourceNotFoundException("Board destino no encontrado con id: " + request.getTargetBoardId()));

        Board sourceBoard = task.getBoard();
        int newPosition = request.getNewPosition();

        // a) Quitar la tarea del board original y reordenar
        List<Task> sourceTasks = taskRepository.findByBoardIdOrderByPositionAsc(sourceBoard.getId());
        sourceTasks.remove(task);
        for (int i = 0; i < sourceTasks.size(); i++) {
            sourceTasks.get(i).setPosition(i);
        }
        taskRepository.saveAll(sourceTasks);

        // b) Si es diferente board, o el mismo board
        List<Task> targetTasks;
        if (sourceBoard.getId().equals(targetBoard.getId())) {
            // Mismo board — ya reordenamos, ahora insertar
            targetTasks = sourceTasks;
        } else {
            // Diferente board — cargar tareas del destino
            targetTasks = taskRepository.findByBoardIdOrderByPositionAsc(targetBoard.getId());
        }

        // c) Incrementar posición de las tareas >= newPosition en el board destino
        for (Task t : targetTasks) {
            if (t.getPosition() >= newPosition) {
                t.setPosition(t.getPosition() + 1);
            }
        }
        taskRepository.saveAll(targetTasks);

        // d) Setear nueva posición y board a la tarea
        task.setBoard(targetBoard);
        task.setPosition(newPosition);
        Task saved = taskRepository.save(task);

        return mapToResponse(saved);
    }

    // --- Validación de acceso ---

    private void validateMemberAccess(Project project, User currentUser) {
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        boolean isMember = project.getMembers().stream()
                .anyMatch(m -> m.getId().equals(currentUser.getId()));

        if (!isOwner && !isMember) {
            throw new AccessDeniedException("No tienes acceso a este proyecto");
        }
    }

    // --- Mapper ---

    private TaskResponse mapToResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority() != null ? task.getPriority().name() : null)
                .position(task.getPosition())
                .assignee(task.getAssignee() != null
                        ? UserResponse.builder()
                            .id(task.getAssignee().getId())
                            .email(task.getAssignee().getEmail())
                            .fullName(task.getAssignee().getFullName())
                            .role(task.getAssignee().getRole().name())
                            .build()
                        : null)
                .labels(task.getLabels() != null
                        ? task.getLabels().stream()
                            .map(l -> LabelResponse.builder().id(l.getId()).name(l.getName()).color(l.getColor()).build())
                            .collect(Collectors.toList())
                        : new ArrayList<>())
                .dueDate(task.getDueDate() != null ? task.getDueDate().toString() : null)
                .boardId(task.getBoard().getId())
                .createdAt(task.getCreatedAt() != null ? task.getCreatedAt().toString() : null)
                .build();
    }
}
