import type {
  AddToCartRequest,
  Allergen,
  ApiError,
  AuthResponse,
  BulkCreateTablesRequest,
  CartSessionResponse,
  Category,
  CategoryWithItems,
  CreateAllergenRequest,
  CreateCategoryRequest,
  CreateMenuItemRequest,
  CreateModifierGroupRequest,
  CreateModifierOptionRequest,
  CreateProjectRequest,
  CreateServiceRequestRequest,
  CreateTableRequest,
  CreateTagRequest,
  HealthResponse,
  ImageUploadResponse,
  LoginRequest,
  MenuItem,
  MenuItemResponse,
  MenuTreeResponse,
  ModifierGroup,
  ModifierOption,
  OrderDetailResponse,
  OrderListItemResponse,
  OrderResponse,
  OrderStatus,
  PlaceOrderResponse,
  ProjectResponse,
  ProjectThemeResponse,
  PublicMenuResponse,
  PublicProjectResponse,
  PublicationStatusResponse,
  PublicTableResponse,
  RegisterRequest,
  ServiceRequestDetailResponse,
  ServiceRequestListItemResponse,
  ServiceRequestResponse,
  ServiceRequestStatus,
  ServiceRequestType,
  Table,
  Tag,
  UpdateCategoryRequest,
  UpdateMenuItemRequest,
  UpdateModifierGroupRequest,
  UpdateModifierOptionRequest,
  UpdateOrderStatusRequest,
  UpdateProjectRequest,
  UpdateProjectThemeRequest,
  UpdateServiceRequestStatusRequest,
  UpdateTableRequest,
  UserResponse,
} from '@digital-menu/shared-types';
export * from '@digital-menu/shared-types';

export class ApiClient {
  private token: string | null = null;

  constructor(
    private readonly baseUrl: string,
    token?: string,
  ) {
    if (token) {
      this.token = token;
    }
  }

  setToken(token: string | null): void {
    this.token = token;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const isFormData = options?.body instanceof FormData;
    const headers = new Headers({
      Accept: 'application/json',
    });

    if (!isFormData) {
      headers.set('Content-Type', 'application/json');
    }

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    if (options?.headers) {
      new Headers(options.headers).forEach((value, key) => {
        if (value === '' && isFormData && key.toLowerCase() === 'content-type') {
          headers.delete(key);
        } else {
          headers.set(key, value);
        }
      });
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      let error: ApiError;
      try {
        error = (await response.json()) as ApiError;
      } catch {
        error = {
          code: `http_${response.status}`,
          message: response.statusText || `HTTP ${response.status}`,
        };
      }
      throw error;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  register(body: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  login(body: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  logout(): Promise<void> {
    return this.request<void>('/auth/logout', { method: 'POST' });
  }

  getMe(): Promise<UserResponse> {
    return this.request<UserResponse>('/auth/me');
  }

  refresh(): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/refresh', { method: 'POST' });
  }

  getProjects(): Promise<ProjectResponse[]> {
    return this.request<ProjectResponse[]>('/projects');
  }

  getProject(id: string): Promise<ProjectResponse> {
    return this.request<ProjectResponse>(`/projects/${id}`);
  }

  createProject(body: CreateProjectRequest): Promise<ProjectResponse> {
    return this.request<ProjectResponse>('/projects', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  updateProject(id: string, body: UpdateProjectRequest): Promise<ProjectResponse> {
    return this.request<ProjectResponse>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  deleteProject(id: string): Promise<void> {
    return this.request<void>(`/projects/${id}`, { method: 'DELETE' });
  }

  updateProjectTheme(id: string, body: UpdateProjectThemeRequest): Promise<ProjectResponse> {
    return this.request<ProjectResponse>(`/projects/${id}/theme`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  getMenu(projectId: string): Promise<MenuTreeResponse> {
    return this.request<MenuTreeResponse>(`/projects/${projectId}/menu`);
  }

  createCategory(projectId: string, body: CreateCategoryRequest): Promise<Category> {
    return this.request<Category>(`/projects/${projectId}/categories`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  updateCategory(id: string, body: UpdateCategoryRequest): Promise<Category> {
    return this.request<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  deleteCategory(id: string): Promise<void> {
    return this.request<void>(`/categories/${id}`, { method: 'DELETE' });
  }

  createItem(categoryId: string, body: CreateMenuItemRequest): Promise<MenuItemResponse> {
    return this.request<MenuItemResponse>(`/categories/${categoryId}/items`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  getItem(id: string): Promise<MenuItemResponse> {
    return this.request<MenuItemResponse>(`/items/${id}`);
  }

  updateItem(id: string, body: UpdateMenuItemRequest): Promise<MenuItemResponse> {
    return this.request<MenuItemResponse>(`/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  deleteItem(id: string): Promise<void> {
    return this.request<void>(`/items/${id}`, { method: 'DELETE' });
  }

  createModifierGroup(itemId: string, body: CreateModifierGroupRequest): Promise<ModifierGroup> {
    return this.request<ModifierGroup>(`/items/${itemId}/modifier-groups`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  updateModifierGroup(id: string, body: UpdateModifierGroupRequest): Promise<ModifierGroup> {
    return this.request<ModifierGroup>(`/modifier-groups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  deleteModifierGroup(id: string): Promise<void> {
    return this.request<void>(`/modifier-groups/${id}`, { method: 'DELETE' });
  }

  createModifierOption(groupId: string, body: CreateModifierOptionRequest): Promise<ModifierOption> {
    return this.request<ModifierOption>(`/modifier-groups/${groupId}/options`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  updateModifierOption(id: string, body: UpdateModifierOptionRequest): Promise<ModifierOption> {
    return this.request<ModifierOption>(`/modifier-options/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  deleteModifierOption(id: string): Promise<void> {
    return this.request<void>(`/modifier-options/${id}`, { method: 'DELETE' });
  }

  getAllergens(projectId: string): Promise<Allergen[]> {
    return this.request<Allergen[]>(`/projects/${projectId}/allergens`);
  }

  createAllergen(projectId: string, body: CreateAllergenRequest): Promise<Allergen> {
    return this.request<Allergen>(`/projects/${projectId}/allergens`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  getTags(projectId: string): Promise<Tag[]> {
    return this.request<Tag[]>(`/projects/${projectId}/tags`);
  }

  createTag(projectId: string, body: CreateTagRequest): Promise<Tag> {
    return this.request<Tag>(`/projects/${projectId}/tags`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  uploadImage(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<ImageUploadResponse>('/uploads/image', {
      method: 'POST',
      body: formData,
    });
  }

  getTables(projectId: string): Promise<Table[]> {
    return this.request<Table[]>(`/projects/${projectId}/tables`);
  }

  createTable(projectId: string, body: CreateTableRequest): Promise<Table> {
    return this.request<Table>(`/projects/${projectId}/tables`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  bulkCreateTables(projectId: string, body: BulkCreateTablesRequest): Promise<Table[]> {
    return this.request<Table[]>(`/projects/${projectId}/tables/bulk`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  updateTable(id: string, body: UpdateTableRequest): Promise<Table> {
    return this.request<Table>(`/tables/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  deleteTable(id: string): Promise<void> {
    return this.request<void>(`/tables/${id}`, { method: 'DELETE' });
  }

  getTableQrUrl(id: string): string {
    return `${this.baseUrl}/tables/${id}/qr`;
  }

  getTableQrPdfUrl(id: string): string {
    return `${this.baseUrl}/tables/${id}/qr-pdf`;
  }

  publishProject(projectId: string): Promise<PublicationStatusResponse> {
    return this.request<PublicationStatusResponse>(`/projects/${projectId}/publish`, {
      method: 'POST',
    });
  }

  unpublishProject(projectId: string): Promise<PublicationStatusResponse> {
    return this.request<PublicationStatusResponse>(`/projects/${projectId}/unpublish`, {
      method: 'POST',
    });
  }

  getPublicationStatus(projectId: string): Promise<PublicationStatusResponse> {
    return this.request<PublicationStatusResponse>(`/projects/${projectId}/publication-status`);
  }

  getPublicProject(slug: string): Promise<PublicProjectResponse> {
    return this.request<PublicProjectResponse>(`/public/projects/${slug}`);
  }

  getPublicMenu(slug: string): Promise<PublicMenuResponse> {
    return this.request<PublicMenuResponse>(`/public/projects/${slug}/menu`);
  }

  getPublicTable(token: string): Promise<PublicTableResponse> {
    return this.request<PublicTableResponse>(`/public/tables/${token}`);
  }

  getCart(token: string): Promise<CartSessionResponse> {
    return this.request<CartSessionResponse>(`/public/tables/${token}/cart`);
  }

  addToCart(token: string, body: AddToCartRequest): Promise<CartSessionResponse> {
    return this.request<CartSessionResponse>(`/public/tables/${token}/cart/items`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  updateCartItem(token: string, itemId: string, quantity: number): Promise<CartSessionResponse> {
    return this.request<CartSessionResponse>(`/public/tables/${token}/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  removeCartItem(token: string, itemId: string): Promise<CartSessionResponse> {
    return this.request<CartSessionResponse>(`/public/tables/${token}/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  placeOrder(token: string): Promise<PlaceOrderResponse> {
    return this.request<PlaceOrderResponse>(`/public/tables/${token}/orders`, {
      method: 'POST',
    });
  }

  getOrder(orderToken: string): Promise<OrderResponse> {
    return this.request<OrderResponse>(`/public/orders/${orderToken}`);
  }

  getOrders(projectId: string, status?: OrderStatus): Promise<OrderListItemResponse[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.request<OrderListItemResponse[]>(`/projects/${projectId}/orders${query}`);
  }

  getProjectOrder(projectId: string, orderId: string): Promise<OrderDetailResponse> {
    return this.request<OrderDetailResponse>(`/projects/${projectId}/orders/${orderId}`);
  }

  updateOrderStatus(projectId: string, orderId: string, status: OrderStatus): Promise<OrderDetailResponse> {
    return this.request<OrderDetailResponse>(`/projects/${projectId}/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status } satisfies UpdateOrderStatusRequest),
    });
  }

  createServiceRequest(
    token: string,
    body: CreateServiceRequestRequest,
  ): Promise<ServiceRequestResponse> {
    return this.request<ServiceRequestResponse>(`/public/tables/${token}/service-requests`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  getServiceRequests(
    projectId: string,
    status?: ServiceRequestStatus,
  ): Promise<ServiceRequestListItemResponse[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.request<ServiceRequestListItemResponse[]>(`/projects/${projectId}/service-requests${query}`);
  }

  updateServiceRequestStatus(
    projectId: string,
    requestId: string,
    status: ServiceRequestStatus,
  ): Promise<ServiceRequestDetailResponse> {
    return this.request<ServiceRequestDetailResponse>(
      `/projects/${projectId}/service-requests/${requestId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status } satisfies UpdateServiceRequestStatusRequest),
      },
    );
  }
}

export function createApiClient(baseUrl: string, token?: string): ApiClient {
  return new ApiClient(baseUrl, token);
}
