package com.taskmanager.service;

import com.taskmanager.entity.RefreshToken;
import com.taskmanager.entity.User;
import com.taskmanager.enums.Role;
import com.taskmanager.exception.UnauthorizedException;
import com.taskmanager.repository.RefreshTokenRepository;
import com.taskmanager.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("sara@test.com")
                .fullName("Sara Pulgarin")
                .role(Role.MEMBER)
                .build();
    }

    @Test
    @DisplayName("createRefreshToken - genera token válido con expiración a 7 días")
    void createRefreshToken_generaTokenValido() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(invocation -> {
                    RefreshToken saved = invocation.getArgument(0);
                    saved.setId(1L);
                    return saved;
                });

        RefreshToken result = refreshTokenService.createRefreshToken(1L);

        assertThat(result).isNotNull();
        assertThat(result.getToken()).isNotBlank();
        assertThat(result.getUser()).isEqualTo(testUser);
        assertThat(result.getExpiryDate()).isAfter(LocalDateTime.now());
        assertThat(result.getExpiryDate()).isBefore(LocalDateTime.now().plusDays(8));

        verify(userRepository).findById(1L);
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("verifyExpiration - token válido retorna el mismo token")
    void verifyExpiration_tokenValido_retornaToken() {
        RefreshToken validToken = RefreshToken.builder()
                .id(1L)
                .token("valid-token")
                .user(testUser)
                .expiryDate(LocalDateTime.now().plusDays(5))
                .build();

        RefreshToken result = refreshTokenService.verifyExpiration(validToken);

        assertThat(result).isEqualTo(validToken);
        verify(refreshTokenRepository, never()).delete(any());
    }

    @Test
    @DisplayName("verifyExpiration - token expirado lanza UnauthorizedException y elimina token")
    void verifyExpiration_tokenExpirado_lanzaExcepcion() {
        RefreshToken expiredToken = RefreshToken.builder()
                .id(1L)
                .token("expired-token")
                .user(testUser)
                .expiryDate(LocalDateTime.now().minusDays(1))
                .build();

        assertThatThrownBy(() -> refreshTokenService.verifyExpiration(expiredToken))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Refresh token expirado");

        verify(refreshTokenRepository).delete(expiredToken);
    }

    @Test
    @DisplayName("findByToken - token existente retorna RefreshToken")
    void findByToken_existente_retornaToken() {
        RefreshToken token = RefreshToken.builder()
                .id(1L)
                .token("existing-token")
                .user(testUser)
                .expiryDate(LocalDateTime.now().plusDays(5))
                .build();

        when(refreshTokenRepository.findByToken("existing-token"))
                .thenReturn(Optional.of(token));

        RefreshToken result = refreshTokenService.findByToken("existing-token");

        assertThat(result).isEqualTo(token);
    }

    @Test
    @DisplayName("findByToken - token inexistente lanza UnauthorizedException")
    void findByToken_inexistente_lanzaExcepcion() {
        when(refreshTokenRepository.findByToken("no-existe"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> refreshTokenService.findByToken("no-existe"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Refresh token no encontrado");
    }

    @Test
    @DisplayName("deleteByUserId - elimina todos los tokens del usuario")
    void deleteByUserId_eliminaTodosLosTokens() {
        refreshTokenService.deleteByUserId(1L);

        verify(refreshTokenRepository).deleteByUserId(1L);
    }
}
