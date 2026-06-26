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

export type ProjectAppearance = 'light' | 'dark' | 'auto';

export type ProjectCardStyle = 'flat' | 'elevated' | 'outlined';

export type ProjectButtonShape = 'rounded' | 'pill' | 'square';

export interface ProjectThemeResponse {
  id: string;
  projectId: string;
  appearance: ProjectAppearance;
  accentColor: string;
  cardStyle: ProjectCardStyle;
  buttonShape: ProjectButtonShape;
  largePhotos: boolean;
  promoPage: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProjectThemeRequest {
  appearance?: ProjectAppearance;
  accentColor?: string;
  cardStyle?: ProjectCardStyle;
  buttonShape?: ProjectButtonShape;
  largePhotos?: boolean;
  promoPage?: boolean;
}

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
  theme?: ProjectThemeResponse;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  slug: string;
  type: string;
  description: string;
  locale: string;
  currency: string;
  mode: ProjectMode;
}

export interface UpdateProjectRequest {
  name?: string;
  slug?: string;
  type?: string;
  description?: string;
  locale?: string;
  currency?: string;
  mode?: ProjectMode;
  status?: ProjectStatus;
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
