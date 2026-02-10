package com.taskmanager.service;

import com.taskmanager.dto.AuthResponse;
import com.taskmanager.dto.LoginRequest;
import com.taskmanager.dto.RegisterRequest;
import com.taskmanager.entity.User;
import com.taskmanager.enums.Role;
import com.taskmanager.exception.DuplicateResourceException;
import com.taskmanager.exception.UnauthorizedException;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("sara@test.com")
                .password("encodedPassword")
                .fullName("Sara Pulgarin")
                .role(Role.MEMBER)
                .build();
    }

    @Test
    @DisplayName("register - con datos válidos retorna AuthResponse con token")
    void register_conDatosValidos_retornaAuthResponse() {
        RegisterRequest request = RegisterRequest.builder()
                .email("sara@test.com")
                .password("123456")
                .fullName("Sara Pulgarin")
                .build();

        when(userRepository.existsByEmail("sara@test.com")).thenReturn(false);
        when(passwordEncoder.encode("123456")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token-123");

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("jwt-token-123");
        assertThat(response.getEmail()).isEqualTo("sara@test.com");
        assertThat(response.getFullName()).isEqualTo("Sara Pulgarin");
        assertThat(response.getRole()).isEqualTo("MEMBER");

        verify(userRepository).existsByEmail("sara@test.com");
        verify(userRepository).save(any(User.class));
        verify(jwtService).generateToken(any(User.class));
    }

    @Test
    @DisplayName("register - con email duplicado lanza DuplicateResourceException")
    void register_conEmailDuplicado_lanzaDuplicateResourceException() {
        RegisterRequest request = RegisterRequest.builder()
                .email("sara@test.com")
                .password("123456")
                .fullName("Sara Pulgarin")
                .build();

        when(userRepository.existsByEmail("sara@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("sara@test.com");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("login - con credenciales válidas retorna token")
    void login_conCredencialesValidas_retornaToken() {
        LoginRequest request = LoginRequest.builder()
                .email("sara@test.com")
                .password("123456")
                .build();

        when(userRepository.findByEmail("sara@test.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("123456", "encodedPassword")).thenReturn(true);
        when(jwtService.generateToken(testUser)).thenReturn("jwt-token-456");

        AuthResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("jwt-token-456");
        assertThat(response.getEmail()).isEqualTo("sara@test.com");
        assertThat(response.getFullName()).isEqualTo("Sara Pulgarin");
        assertThat(response.getRole()).isEqualTo("MEMBER");

        verify(jwtService).generateToken(testUser);
    }

    @Test
    @DisplayName("login - con password incorrecto lanza UnauthorizedException")
    void login_conPasswordIncorrecto_lanzaUnauthorizedException() {
        LoginRequest request = LoginRequest.builder()
                .email("sara@test.com")
                .password("wrongpassword")
                .build();

        when(userRepository.findByEmail("sara@test.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongpassword", "encodedPassword")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Credenciales inválidas");

        verify(jwtService, never()).generateToken(any());
    }

    @Test
    @DisplayName("login - con email inexistente lanza UnauthorizedException")
    void login_conEmailInexistente_lanzaUnauthorizedException() {
        LoginRequest request = LoginRequest.builder()
                .email("noexiste@test.com")
                .password("123456")
                .build();

        when(userRepository.findByEmail("noexiste@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Credenciales inválidas");

        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }
}
