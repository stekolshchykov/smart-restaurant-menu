import type {
  ApiError,
  AuthResponse,
  HealthResponse,
  LoginRequest,
  RegisterRequest,
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
    const headers = new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    if (options?.headers) {
      new Headers(options.headers).forEach((value, key) => {
        headers.set(key, value);
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
}

export function createApiClient(baseUrl: string, token?: string): ApiClient {
  return new ApiClient(baseUrl, token);
}
