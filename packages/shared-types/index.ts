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

export type AvailabilityStatus = 'available' | 'unavailable' | 'hidden';

export interface Category {
  id: string;
  projectId: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithItems extends Category {
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  price: string;
  imageUrl: string | null;
  images: string[];
  ingredients: string[];
  status: AvailabilityStatus;
  quickAdd: boolean;
  sortOrder: number;
  allergens: Allergen[];
  tags: Tag[];
  modifierGroups: ModifierGroup[];
  createdAt: string;
  updatedAt: string;
}

export type MenuItemResponse = MenuItem;

export interface ModifierGroup {
  id: string;
  itemId: string;
  name: string;
  required: boolean;
  minOptions: number;
  maxOptions: number;
  sortOrder: number;
  options: ModifierOption[];
  createdAt: string;
  updatedAt: string;
}

export interface ModifierOption {
  id: string;
  groupId: string;
  name: string;
  price: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Allergen {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuTreeResponse {
  categories: CategoryWithItems[];
}

export interface CreateCategoryRequest {
  name: string;
  sortOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  sortOrder?: number;
}

export interface CreateMenuItemRequest {
  name: string;
  shortDescription?: string;
  description?: string;
  price: string;
  imageUrl?: string;
  images?: string[];
  ingredients?: string[];
  status?: AvailabilityStatus;
  quickAdd?: boolean;
  sortOrder?: number;
  allergenIds?: string[];
  tagIds?: string[];
}

export interface UpdateMenuItemRequest {
  name?: string;
  shortDescription?: string | null;
  description?: string | null;
  price?: string;
  imageUrl?: string | null;
  images?: string[];
  ingredients?: string[];
  status?: AvailabilityStatus;
  quickAdd?: boolean;
  sortOrder?: number;
  allergenIds?: string[];
  tagIds?: string[];
}

export interface CreateModifierGroupRequest {
  name: string;
  required?: boolean;
  minOptions?: number;
  maxOptions?: number;
  sortOrder?: number;
}

export interface UpdateModifierGroupRequest {
  name?: string;
  required?: boolean;
  minOptions?: number;
  maxOptions?: number;
  sortOrder?: number;
}

export interface CreateModifierOptionRequest {
  name: string;
  price: string;
  sortOrder?: number;
}

export interface UpdateModifierOptionRequest {
  name?: string;
  price?: string;
  sortOrder?: number;
}

export interface CreateAllergenRequest {
  name: string;
}

export interface CreateTagRequest {
  name: string;
}

export interface ImageUploadResponse {
  url: string;
}

export interface Table {
  id: string;
  projectId: string;
  label: string;
  token: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TableResponse = Table;

export interface CreateTableRequest {
  label: string;
  active?: boolean;
}

export interface UpdateTableRequest {
  label?: string;
  active?: boolean;
}

export interface BulkCreateTablesRequest {
  prefix: string;
  start: number;
  end: number;
}

export interface ReadinessCheck {
  id: string;
  label: string;
  passed: boolean;
  message?: string;
}

export interface PublicationStatusResponse {
  projectId: string;
  published: boolean;
  url?: string;
  domain?: string;
  publishedAt?: string;
  readiness: ReadinessCheck[];
}
