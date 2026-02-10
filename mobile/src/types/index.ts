export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'MEMBER';
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  owner: User;
  memberCount: number;
  createdAt: string;
}

export interface Board {
  id: number;
  name: string;
  position: number;
  tasks: Task[];
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  position: number;
  assignee: User | null;
  labels: Label[];
  dueDate: string | null;
  boardId: number;
}

export interface Label {
  id: number;
  name: string;
  color: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}
