export type UserRole = 'owner' | 'admin' | 'editor';

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserResponse;
}

export type ProjectMode = 'promo_only' | 'menu_only' | 'menu_service' | 'menu_order';

export type ProjectStatus = 'draft' | 'ready' | 'published' | 'attention';

export interface ProjectResponse {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string;
  locale: string;
  currency: string;
  mode: ProjectMode;
  status: ProjectStatus;
  createdAt: string;
}

export type MeResponse = UserResponse;

export type AuthErrorCode =
  | 'invalid_credentials'
  | 'user_already_exists'
  | 'validation_error'
  | 'unauthorized'
  | 'token_expired'
  | 'internal';

export interface ApiError {
  code: AuthErrorCode | string;
  message: string;
  field?: string;
}

export interface HealthResponse {
  status: string;
}
