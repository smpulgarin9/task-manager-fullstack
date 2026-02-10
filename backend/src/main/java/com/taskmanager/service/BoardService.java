package com.taskmanager.service;

import com.taskmanager.dto.BoardRequest;
import com.taskmanager.dto.BoardReorderRequest;
import com.taskmanager.entity.Board;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.User;
import com.taskmanager.exception.AccessDeniedException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.BoardRepository;
import com.taskmanager.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final ProjectRepository projectRepository;

    @Transactional
    public Board createBoard(Long projectId, BoardRequest request, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con id: " + projectId));

        validateMemberAccess(project, currentUser);

        // Asignar position al final
        List<Board> existingBoards = boardRepository.findByProjectIdOrderByPositionAsc(projectId);
        int nextPosition = existingBoards.isEmpty() ? 0 : existingBoards.get(existingBoards.size() - 1).getPosition() + 1;

        Board board = Board.builder()
                .name(request.getName())
                .position(nextPosition)
                .project(project)
                .tasks(new ArrayList<>())
                .build();

        return boardRepository.save(board);
    }

    @Transactional
    public Board updateBoard(Long boardId, BoardRequest request, User currentUser) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board no encontrado con id: " + boardId));

        validateMemberAccess(board.getProject(), currentUser);

        board.setName(request.getName());
        return boardRepository.save(board);
    }

    @Transactional
    public void deleteBoard(Long boardId, User currentUser) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board no encontrado con id: " + boardId));

        validateMemberAccess(board.getProject(), currentUser);

        boardRepository.delete(board);
    }

    @Transactional
    public void reorderBoards(Long projectId, BoardReorderRequest request, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con id: " + projectId));

        validateMemberAccess(project, currentUser);

        List<Long> boardIds = request.getBoardIds();
        for (int i = 0; i < boardIds.size(); i++) {
            Board board = boardRepository.findById(boardIds.get(i))
                    .orElseThrow(() -> new ResourceNotFoundException("Board no encontrado"));
            board.setPosition(i);
            boardRepository.save(board);
        }
    }

    private void validateMemberAccess(Project project, User currentUser) {
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        boolean isMember = project.getMembers().stream()
                .anyMatch(m -> m.getId().equals(currentUser.getId()));

        if (!isOwner && !isMember) {
            throw new AccessDeniedException("No tienes acceso a este proyecto");
        }
    }
}
