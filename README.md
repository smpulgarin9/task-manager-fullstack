# Task Manager Fullstack — Gestor de Proyectos y Tareas Colaborativo

Aplicacion fullstack para la gestion de proyectos y tareas en equipo, con tableros Kanban interactivos y drag & drop.
Inspirada en herramientas como **Trello** y **Jira**, permite organizar el trabajo en columnas, asignar tareas, definir prioridades y colaborar con otros miembros del equipo.

---

## Tecnologias Usadas

| Capa | Tecnologias |
|------|-------------|
| **Backend** | Java 17, Spring Boot 3.2, Spring Security, JWT (jjwt), JPA/Hibernate, PostgreSQL |
| **Mobile** | React Native 0.83, TypeScript, React Navigation 7, Zustand, react-native-draggable-flatlist |
| **Infraestructura** | Docker, Docker Compose |
| **Testing** | JUnit 5, Mockito, Jest |

---

## Arquitectura

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  Mobile App  │──────▶│   REST API   │──────▶│ Spring Boot  │──────▶│  PostgreSQL  │
│ React Native │  HTTP │   (JSON)     │       │   Server     │  JPA  │   Database   │
└──────────────┘       └──────────────┘       └──────────────┘       └──────────────┘
```

**Patron backend:** Controller → Service → Repository

**Autenticacion:** JWT stateless — el cliente envia el token en el header `Authorization: Bearer <token>` en cada peticion.

La autenticación usa un esquema de doble token: un access token JWT de corta duración (15 min)
para las peticiones API, y un refresh token de larga duración (7 días) almacenado en base de datos
para renovar el access token sin requerir login. El logout invalida el refresh token en el servidor.

El sistema implementa 3 roles con permisos granulares:
- ADMIN: acceso completo, gestión de usuarios y roles
- PROJECT_MANAGER: gestión de proyectos, boards y miembros
- MEMBER: visualización de proyectos, creación y gestión de tareas

---

## Modelo de Datos

```
User
├── owns (1:N) ──────────▶ Project
└── member of (N:M) ─────▶ Project

Project
├── contains (1:N) ──────▶ Board
└── contains (1:N) ──────▶ Label

Board
└── contains (1:N) ──────▶ Task

Task
├── assigned to (N:1) ───▶ User (opcional)
└── tagged with (N:M) ───▶ Label
```

**Entidades principales:**

- **User** — email, password, fullName, role
- **Project** — name, description, owner, members
- **Board** — name, position, project
- **Task** — title, description, priority, position, board, assignee, dueDate, labels
- **Label** — name, color, project

---

## Requisitos Previos

- Java 17
- Maven
- Node.js 18+
- Docker y Docker Compose
- React Native CLI
- Android Studio (Android) o Xcode (iOS)

---

## Instrucciones para Correr el Proyecto

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd task-manager-fullstack
```

### 2. Levantar la base de datos

```bash
docker compose up -d postgres
```

### 3. Correr el backend

```bash
cd backend
mvn spring-boot:run
```

El servidor inicia en `http://localhost:8080`.

### 4. Correr la app mobile

```bash
cd mobile
npm install
```

Para Android:
```bash
npx react-native run-android
```

Para iOS:
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

---

## Endpoints Principales de la API

### Autenticacion

| Metodo | Ruta | Descripcion | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Iniciar sesion y obtener JWT | No |
| POST | /api/auth/refresh | Renovar access token      | No (usa refresh token) |
| POST | /api/auth/logout  | Cerrar sesión             | No (usa refresh token) |
| GET    | /api/admin/users           | Listar usuarios           | Sí (solo ADMIN)        |
| PUT    | /api/admin/roles/{userId}  | Cambiar rol de usuario    | Sí (solo ADMIN)        |

### Proyectos

| Metodo | Ruta | Descripcion | Auth |
|--------|------|-------------|------|
| GET | `/api/projects` | Listar proyectos del usuario | Si |
| POST | `/api/projects` | Crear proyecto | Si |
| GET | `/api/projects/{id}` | Obtener proyecto por ID | Si |
| PUT | `/api/projects/{id}` | Actualizar proyecto | Si |
| DELETE | `/api/projects/{id}` | Eliminar proyecto | Si |
| POST | `/api/projects/{id}/members` | Agregar miembro por email | Si |
| DELETE | `/api/projects/{id}/members/{userId}` | Eliminar miembro | Si |

### Boards

| Metodo | Ruta | Descripcion | Auth |
|--------|------|-------------|------|
| POST | `/api/projects/{projectId}/boards` | Crear board | Si |
| PUT | `/api/projects/{projectId}/boards/{boardId}` | Actualizar board | Si |
| DELETE | `/api/projects/{projectId}/boards/{boardId}` | Eliminar board | Si |
| PUT | `/api/projects/{projectId}/boards/reorder` | Reordenar boards | Si |

### Tareas

| Metodo | Ruta | Descripcion | Auth |
|--------|------|-------------|------|
| POST | `/api/tasks` | Crear tarea | Si |
| GET | `/api/tasks/{id}` | Obtener tarea por ID | Si |
| PUT | `/api/tasks/{id}` | Actualizar tarea | Si |
| DELETE | `/api/tasks/{id}` | Eliminar tarea | Si |
| PUT | `/api/tasks/{id}/move` | Mover tarea entre boards | Si |

### Etiquetas

| Metodo | Ruta | Descripcion | Auth |
|--------|------|-------------|------|
| GET | `/api/projects/{projectId}/labels` | Listar etiquetas del proyecto | Si |
| POST | `/api/projects/{projectId}/labels` | Crear etiqueta | Si |
| PUT | `/api/projects/{projectId}/labels/{labelId}` | Actualizar etiqueta | Si |
| DELETE | `/api/projects/{projectId}/labels/{labelId}` | Eliminar etiqueta | Si |

---

## Funcionalidades Implementadas

- ✅ Registro y login con JWT
- ✅ CRUD de proyectos
- ✅ Tablero Kanban con columnas
- ✅ Drag & drop de tareas
- ✅ CRUD de tareas con prioridades
- ✅ Roles de usuario (ADMIN/MEMBER)
- ✅ Etiquetas por proyecto
- ✅ Pruebas unitarias (backend y mobile)
- ✅ Dockerizado
- ✅ Gestión de roles: ADMIN, PROJECT_MANAGER, MEMBER
- ✅ Sistema de permisos granular por rol
- ✅ Refresh tokens para sesiones seguras
- ✅ Endpoint de logout que invalida refresh token
- ✅ Panel de administración para gestionar roles (solo ADMIN)
- ✅ UI adaptada según permisos del usuario

---

## Autora

**Sara Maria Pulgarin Fernandez**
