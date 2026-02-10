package com.taskmanager.controller;

import com.taskmanager.dto.BoardRequest;
import com.taskmanager.dto.BoardReorderRequest;
import com.taskmanager.entity.Board;
import com.taskmanager.entity.User;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.service.BoardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects/{projectId}/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Board> createBoard(
            @PathVariable Long projectId,
            @Valid @RequestBody BoardRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getUserFromDetails(userDetails);
        return new ResponseEntity<>(boardService.createBoard(projectId, request, currentUser), HttpStatus.CREATED);
    }

    @PutMapping("/{boardId}")
    public ResponseEntity<Board> updateBoard(
            @PathVariable Long projectId,
            @PathVariable Long boardId,
            @Valid @RequestBody BoardRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getUserFromDetails(userDetails);
        return ResponseEntity.ok(boardService.updateBoard(boardId, request, currentUser));
    }

    @DeleteMapping("/{boardId}")
    public ResponseEntity<Void> deleteBoard(
            @PathVariable Long projectId,
            @PathVariable Long boardId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getUserFromDetails(userDetails);
        boardService.deleteBoard(boardId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorderBoards(
            @PathVariable Long projectId,
            @Valid @RequestBody BoardReorderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = getUserFromDetails(userDetails);
        boardService.reorderBoards(projectId, request, currentUser);
        return ResponseEntity.ok().build();
    }

    private User getUserFromDetails(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}
