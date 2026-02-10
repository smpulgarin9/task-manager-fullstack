package com.taskmanager.service;

import com.taskmanager.dto.TaskMoveRequest;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.entity.Board;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.enums.Priority;
import com.taskmanager.enums.Role;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.BoardRepository;
import com.taskmanager.repository.LabelRepository;
import com.taskmanager.repository.TaskRepository;
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
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LabelRepository labelRepository;

    @InjectMocks
    private TaskService taskService;

    private User owner;
    private Project project;
    private Board boardTodo;
    private Board boardInProgress;
    private Task task1;
    private Task task2;

    @BeforeEach
    void setUp() {
        owner = User.builder()
                .id(1L)
                .email("sara@test.com")
                .fullName("Sara Pulgarin")
                .role(Role.MEMBER)
                .build();

        project = Project.builder()
                .id(1L)
                .name("Proyecto Test")
                .owner(owner)
                .members(new HashSet<>(Set.of(owner)))
                .boards(new ArrayList<>())
                .build();

        boardTodo = Board.builder()
                .id(1L)
                .name("Por Hacer")
                .position(0)
                .project(project)
                .tasks(new ArrayList<>())
                .build();

        boardInProgress = Board.builder()
                .id(2L)
                .name("En Progreso")
                .position(1)
                .project(project)
                .tasks(new ArrayList<>())
                .build();

        task1 = Task.builder()
                .id(1L)
                .title("Tarea 1")
                .description("Descripción 1")
                .priority(Priority.HIGH)
                .position(0)
                .board(boardTodo)
                .labels(new HashSet<>())
                .build();

        task2 = Task.builder()
                .id(2L)
                .title("Tarea 2")
                .description("Descripción 2")
                .priority(Priority.LOW)
                .position(1)
                .board(boardTodo)
                .labels(new HashSet<>())
                .build();
    }

    @Test
    @DisplayName("createTask - en board válido crea correctamente")
    void createTask_enBoardValido_creaCorrectamente() {
        TaskRequest request = TaskRequest.builder()
                .title("Nueva Tarea")
                .description("Descripción")
                .priority("HIGH")
                .boardId(1L)
                .build();

        when(boardRepository.findById(1L)).thenReturn(Optional.of(boardTodo));
        when(taskRepository.findByBoardIdOrderByPositionAsc(1L)).thenReturn(new ArrayList<>());
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task saved = invocation.getArgument(0);
            saved.setId(10L);
            return saved;
        });

        TaskResponse response = taskService.createTask(request, owner);

        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Nueva Tarea");
        assertThat(response.getPriority()).isEqualTo("HIGH");
        assertThat(response.getPosition()).isEqualTo(0);
        assertThat(response.getBoardId()).isEqualTo(1L);

        verify(boardRepository).findById(1L);
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    @DisplayName("moveTask - a otro board actualiza posiciones correctamente")
    void moveTask_aOtroBoard_actualizaPosiciones() {
        TaskMoveRequest moveRequest = TaskMoveRequest.builder()
                .targetBoardId(2L)
                .newPosition(0)
                .build();

        when(taskRepository.findById(1L)).thenReturn(Optional.of(task1));
        when(boardRepository.findById(2L)).thenReturn(Optional.of(boardInProgress));
        when(taskRepository.findByBoardIdOrderByPositionAsc(1L))
                .thenReturn(new ArrayList<>(List.of(task1, task2)));
        when(taskRepository.findByBoardIdOrderByPositionAsc(2L))
                .thenReturn(new ArrayList<>());
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(taskRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        TaskResponse response = taskService.moveTask(1L, moveRequest, owner);

        assertThat(response).isNotNull();
        assertThat(response.getBoardId()).isEqualTo(2L);
        assertThat(response.getPosition()).isEqualTo(0);

        // Verifica que se reordenaron las tareas del board origen
        verify(taskRepository, atLeast(2)).saveAll(anyList());
        // Verifica que la tarea se guardó con el nuevo board
        verify(taskRepository).save(task1);
    }

    @Test
    @DisplayName("moveTask - a board inexistente lanza ResourceNotFoundException")
    void moveTask_aBoardInexistente_lanzaResourceNotFoundException() {
        TaskMoveRequest moveRequest = TaskMoveRequest.builder()
                .targetBoardId(999L)
                .newPosition(0)
                .build();

        when(taskRepository.findById(1L)).thenReturn(Optional.of(task1));
        when(boardRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.moveTask(1L, moveRequest, owner))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Board destino no encontrado");
    }

    @Test
    @DisplayName("deleteTask - existente elimina correctamente y reordena")
    void deleteTask_existente_eliminaCorrectamente() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task1));
        when(taskRepository.findByBoardIdOrderByPositionAsc(1L))
                .thenReturn(new ArrayList<>(List.of(task1, task2)));

        taskService.deleteTask(1L, owner);

        verify(taskRepository).delete(task1);
        verify(taskRepository).saveAll(anyList());
        // task2 debería haber sido reordenada a position 0
        assertThat(task2.getPosition()).isEqualTo(0);
    }
}
