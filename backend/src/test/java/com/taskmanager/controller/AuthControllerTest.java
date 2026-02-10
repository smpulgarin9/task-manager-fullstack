package com.taskmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.dto.AuthResponse;
import com.taskmanager.dto.LoginRequest;
import com.taskmanager.dto.RegisterRequest;
import com.taskmanager.exception.GlobalExceptionHandler;
import com.taskmanager.security.JwtAuthenticationFilter;
import com.taskmanager.security.JwtService;
import com.taskmanager.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    @DisplayName("POST /api/auth/register - con datos válidos retorna 201")
    void register_conDatosValidos_retorna201() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("sara@test.com")
                .password("123456")
                .fullName("Sara Pulgarin")
                .build();

        AuthResponse response = AuthResponse.builder()
                .token("jwt-token-123")
                .refreshToken("refresh-token-uuid")
                .email("sara@test.com")
                .fullName("Sara Pulgarin")
                .role("MEMBER")
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt-token-123"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token-uuid"))
                .andExpect(jsonPath("$.email").value("sara@test.com"))
                .andExpect(jsonPath("$.fullName").value("Sara Pulgarin"))
                .andExpect(jsonPath("$.role").value("MEMBER"));
    }

    @Test
    @DisplayName("POST /api/auth/register - con email inválido retorna 400")
    void register_conEmailInvalido_retorna400() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("email-invalido")
                .password("123456")
                .fullName("Sara Pulgarin")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/login - con datos válidos retorna 200")
    void login_conDatosValidos_retorna200() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("sara@test.com")
                .password("123456")
                .build();

        AuthResponse response = AuthResponse.builder()
                .token("jwt-token-456")
                .refreshToken("refresh-token-uuid")
                .email("sara@test.com")
                .fullName("Sara Pulgarin")
                .role("MEMBER")
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token-456"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token-uuid"))
                .andExpect(jsonPath("$.email").value("sara@test.com"))
                .andExpect(jsonPath("$.fullName").value("Sara Pulgarin"))
                .andExpect(jsonPath("$.role").value("MEMBER"));
    }
}
