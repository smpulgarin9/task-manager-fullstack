package com.taskmanager.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskMoveRequest {

    @NotNull(message = "El targetBoardId es obligatorio")
    private Long targetBoardId;

    @Min(value = 0, message = "La posición debe ser mayor o igual a 0")
    private int newPosition;
}
