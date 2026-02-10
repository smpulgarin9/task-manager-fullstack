package com.taskmanager.controller;

import com.taskmanager.dto.LabelRequest;
import com.taskmanager.dto.LabelResponse;
import com.taskmanager.entity.User;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.service.LabelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/labels")
@RequiredArgsConstructor
public class LabelController {

    private final LabelService labelService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<LabelResponse>> getLabels(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getUserFromDetails(userDetails);
        return ResponseEntity.ok(labelService.getLabels(projectId, currentUser));
    }

    @PostMapping
    public ResponseEntity<LabelResponse> createLabel(
            @PathVariable Long projectId,
            @Valid @RequestBody LabelRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getUserFromDetails(userDetails);
        return new ResponseEntity<>(labelService.createLabel(projectId, request, currentUser), HttpStatus.CREATED);
    }

    @PutMapping("/{labelId}")
    public ResponseEntity<LabelResponse> updateLabel(
            @PathVariable Long projectId,
            @PathVariable Long labelId,
            @Valid @RequestBody LabelRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getUserFromDetails(userDetails);
        return ResponseEntity.ok(labelService.updateLabel(projectId, labelId, request, currentUser));
    }

    @DeleteMapping("/{labelId}")
    public ResponseEntity<Void> deleteLabel(
            @PathVariable Long projectId,
            @PathVariable Long labelId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getUserFromDetails(userDetails);
        labelService.deleteLabel(projectId, labelId, currentUser);
        return ResponseEntity.noContent().build();
    }

    private User getUserFromDetails(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}
