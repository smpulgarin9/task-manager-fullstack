package com.taskmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private String priority;
    private Integer position;
    private UserResponse assignee;
    private List<LabelResponse> labels;
    private String dueDate;
    private Long boardId;
    private String createdAt;
}
