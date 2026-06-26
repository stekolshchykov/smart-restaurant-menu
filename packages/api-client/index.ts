import type {
  Allergen,
  ApiError,
  AuthResponse,
  Category,
  CategoryWithItems,
  CreateAllergenRequest,
  CreateCategoryRequest,
  CreateMenuItemRequest,
  CreateModifierGroupRequest,
  CreateModifierOptionRequest,
  CreateProjectRequest,
  CreateTagRequest,
  HealthResponse,
  ImageUploadResponse,
  LoginRequest,
  MenuItem,
  MenuItemResponse,
  MenuTreeResponse,
  ModifierGroup,
  ModifierOption,
  ProjectResponse,
  ProjectThemeResponse,
  RegisterRequest,
  Tag,
  UpdateCategoryRequest,
  UpdateMenuItemRequest,
  UpdateModifierGroupRequest,
  UpdateModifierOptionRequest,
  UpdateProjectRequest,
  UpdateProjectThemeRequest,
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

  updateProjectTheme(id: string, body: UpdateProjectThemeRequest): Promise<ProjectThemeResponse> {
    return this.request<ProjectThemeResponse>(`/projects/${id}/theme`, {
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
}

export function createApiClient(baseUrl: string, token?: string): ApiClient {
  return new ApiClient(baseUrl, token);
}
