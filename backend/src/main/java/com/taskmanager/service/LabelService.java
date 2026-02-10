package com.taskmanager.service;

import com.taskmanager.dto.LabelRequest;
import com.taskmanager.dto.LabelResponse;
import com.taskmanager.entity.Label;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.User;
import com.taskmanager.exception.AccessDeniedException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.LabelRepository;
import com.taskmanager.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabelService {

    private final LabelRepository labelRepository;
    private final ProjectRepository projectRepository;

    public List<LabelResponse> getLabels(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con id: " + projectId));

        validateMemberAccess(project, currentUser);

        return labelRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public LabelResponse createLabel(Long projectId, LabelRequest request, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con id: " + projectId));

        validateMemberAccess(project, currentUser);

        Label label = Label.builder()
                .name(request.getName())
                .color(request.getColor())
                .project(project)
                .build();

        Label saved = labelRepository.save(label);
        return mapToResponse(saved);
    }

    @Transactional
    public LabelResponse updateLabel(Long projectId, Long labelId, LabelRequest request, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con id: " + projectId));

        validateMemberAccess(project, currentUser);

        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new ResourceNotFoundException("Etiqueta no encontrada con id: " + labelId));

        label.setName(request.getName());
        label.setColor(request.getColor());

        Label saved = labelRepository.save(label);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteLabel(Long projectId, Long labelId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con id: " + projectId));

        validateMemberAccess(project, currentUser);

        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new ResourceNotFoundException("Etiqueta no encontrada con id: " + labelId));

        labelRepository.delete(label);
    }

    private void validateMemberAccess(Project project, User currentUser) {
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        boolean isMember = project.getMembers().stream()
                .anyMatch(m -> m.getId().equals(currentUser.getId()));

        if (!isOwner && !isMember) {
            throw new AccessDeniedException("No tienes acceso a este proyecto");
        }
    }

    private LabelResponse mapToResponse(Label label) {
        return LabelResponse.builder()
                .id(label.getId())
                .name(label.getName())
                .color(label.getColor())
                .build();
    }
}
