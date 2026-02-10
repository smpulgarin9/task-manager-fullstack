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
public class ProjectDetailResponse {

    private Long id;
    private String name;
    private String description;
    private UserResponse owner;
    private List<UserResponse> members;
    private List<BoardResponse> boards;
    private String createdAt;
}
