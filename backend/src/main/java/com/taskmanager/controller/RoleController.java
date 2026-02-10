package com.taskmanager.controller;

import com.taskmanager.dto.ChangeRoleRequest;
import com.taskmanager.dto.UserResponse;
import com.taskmanager.entity.User;
import com.taskmanager.enums.Permission;
import com.taskmanager.enums.Role;
import com.taskmanager.exception.AccessDeniedException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.service.PermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class RoleController {

    private final UserRepository userRepository;
    private final PermissionService permissionService;

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers(@AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        permissionService.checkPermission(currentUser, Permission.ROLE_ASSIGN);

        List<UserResponse> users = userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }

    @PutMapping("/roles/{userId}")
    public ResponseEntity<UserResponse> changeUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody ChangeRoleRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        permissionService.checkPermission(currentUser, Permission.ROLE_ASSIGN);

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + userId));

        try {
            Role newRole = Role.valueOf(request.getRole().toUpperCase());
            targetUser.setRole(newRole);
            userRepository.save(targetUser);
        } catch (IllegalArgumentException e) {
            throw new AccessDeniedException("Rol inválido: " + request.getRole() + ". Roles válidos: ADMIN, PROJECT_MANAGER, MEMBER");
        }

        return ResponseEntity.ok(mapToUserResponse(targetUser));
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
}
