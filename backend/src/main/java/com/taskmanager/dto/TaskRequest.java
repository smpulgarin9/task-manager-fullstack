package com.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {

    @NotBlank(message = "El título de la tarea es obligatorio")
    private String title;

    private String description;

    private String priority;

    @NotNull(message = "El boardId es obligatorio")
    private Long boardId;

    private Long assigneeId;

    private List<Long> labelIds;

    private String dueDate;
}
