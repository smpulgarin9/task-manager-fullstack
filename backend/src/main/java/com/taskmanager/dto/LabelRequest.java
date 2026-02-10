package com.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabelRequest {

    @NotBlank(message = "El nombre de la etiqueta es obligatorio")
    private String name;

    @NotBlank(message = "El color es obligatorio")
    private String color;
}
