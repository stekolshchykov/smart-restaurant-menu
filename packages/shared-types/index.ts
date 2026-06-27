export type UserRole = 'owner' | 'admin' | 'editor';

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
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
  projectId: string;
  appearance: ProjectAppearance;
  accentColor: string;
  cardStyle: ProjectCardStyle;
  buttonShape: ProjectButtonShape;
  largePhotos: boolean;
  promoPage: boolean;
  logoUrl: string | null;
  heroUrl: string | null;
}

export interface UpdateProjectThemeRequest {
  appearance?: ProjectAppearance;
  accentColor?: string;
  cardStyle?: ProjectCardStyle;
  buttonShape?: ProjectButtonShape;
  largePhotos?: boolean;
  promoPage?: boolean;
  logoUrl?: string | null;
  heroUrl?: string | null;
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
  required: boolean;
  minOptions: number;
  maxOptions: number;
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
  sortOrder: number;
  publicUrl: string;
  qrUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type TableResponse = Table;

export interface CreateTableRequest {
  label: string;
  active?: boolean;
  sortOrder?: number;
}

export interface UpdateTableRequest {
  label?: string;
  active?: boolean;
  sortOrder?: number;
}

export interface BulkCreateTablesRequest {
  prefix: string;
  start: number;
  end: number;
}

export interface PublicationCheck {
  key: string;
  label: string;
  passed: boolean;
}

export interface PublicationChecks {
  hasName: boolean;
  hasMenu: boolean;
  hasTables: boolean;
  themeReady: boolean;
}

export interface PublicationStatusResponse {
  projectId: string;
  slug: string;
  status: ProjectStatus;
  mode: ProjectMode;
  ready: boolean;
  checks: PublicationChecks;
  checklist: PublicationCheck[];
}

export interface PublicProjectResponse {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  locale: string;
  currency: string;
  mode: ProjectMode;
  theme: ProjectThemeResponse;
  contactInfo: null;
}

export type PublicMenuResponse = MenuTreeResponse;

export interface PublicTableResponse {
  tableId: string;
  label: string;
  token: string;
  project: PublicProjectResponse;
}

export interface CartAddon {
  id: string;
  name: string;
  price: string;
  quantity: number;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  basePrice: string;
  addons: CartAddon[];
  quantity: number;
  note: string | null;
}

export interface CartSessionResponse {
  token: string;
  tableId: string;
  items: CartItem[];
  total: string;
}

export interface AddToCartRequest {
  menuItemId: string;
  quantity: number;
  addonIds: string[];
  note: string | null;
}

export type OrderStatus = 'submitted' | 'preparing' | 'ready' | 'served' | 'cancelled';

export interface PlaceOrderResponse {
  orderId: string;
  status: OrderStatus;
  total: string;
  estimatedMinutes: number | null;
}

export interface OrderItemResponse {
  id: string;
  menuItemId: string;
  name: string;
  basePrice: string;
  addons: CartAddon[];
  quantity: number;
  note: string | null;
}

export interface OrderResponse {
  id: string;
  status: OrderStatus;
  total: string;
  items: OrderItemResponse[];
  estimatedMinutes: number | null;
  createdAt: string;
}

export type OrderManagementStatus =
  | 'submitted'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled';

export interface OrderListItemResponse {
  id: string;
  tableId: string;
  tableLabel: string;
  status: OrderManagementStatus;
  total: string;
  itemCount: number;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetailResponse extends OrderListItemResponse {
  estimatedMinutes: number | null;
}

export interface UpdateOrderStatusRequest {
  status: OrderManagementStatus;
}

export type ServiceRequestType = 'waiter' | 'water' | 'napkins' | 'bill';

export type ServiceRequestStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface CreateServiceRequestRequest {
  type: ServiceRequestType;
}

export interface ServiceRequestResponse {
  id: string;
  status: 'pending';
}

export interface ServiceRequestListItemResponse {
  id: string;
  tableId: string;
  tableLabel: string;
  type: ServiceRequestType;
  status: ServiceRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequestDetailResponse extends ServiceRequestListItemResponse {
  elapsedSeconds: number;
}

export interface UpdateServiceRequestStatusRequest {
  status: ServiceRequestStatus;
}
