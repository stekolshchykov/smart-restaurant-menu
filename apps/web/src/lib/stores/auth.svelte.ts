import { goto } from '$app/navigation';
import { api } from '$lib/api/client';
import type { ApiError, UserResponse } from '@digital-menu/api-client';

const STORAGE_KEY = 'dm_access_token';

function readStoredToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveToken(token: string | null) {
  if (typeof localStorage === 'undefined') return;
  try {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors.
  }
}

function applyToken(token: string | null) {
  api.setToken(token);
}

function getErrorMessage(err: unknown): string {
  const apiError = err as ApiError | undefined;
  if (apiError?.message) return apiError.message;
  if (err instanceof Error) return err.message;
  return 'Что-то пошло не так. Попробуйте ещё раз.';
}

function isRetryable(err: unknown): boolean {
  const code = (err as ApiError | undefined)?.code;
  return code === 'rate_limited' || code === 'http_429' || code === 'http_503' || code === 'http_502';
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createAuthStore() {
  let user = $state<UserResponse | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let initialized = $state(false);

  async function loadUser() {
    if (initialized) {
      return;
    }

    const token = readStoredToken();
    if (!token) {
      user = null;
      applyToken(null);
      initialized = true;
      return;
    }

    applyToken(token);
    loading = true;
    error = null;

    try {
      const me = await api.getMe();
      user = me;
    } catch (err) {
      if (isRetryable(err)) {
        try {
          await delay(1200);
          const me = await api.getMe();
          user = me;
          return;
        } catch (retryErr) {
          err = retryErr;
        }
      }

      user = null;
      saveToken(null);
      applyToken(null);
      if ((err as ApiError)?.code !== 'unauthorized' && (err as ApiError)?.code !== 'http_401') {
        error = getErrorMessage(err);
      }
    } finally {
      loading = false;
      initialized = true;
    }
  }

  async function register(name: string, email: string, password: string) {
    loading = true;
    error = null;

    try {
      const response = await api.register({ name, email, password });
      user = response.user;
      saveToken(response.accessToken);
      applyToken(response.accessToken);
      initialized = true;
      await goto('/app');
    } catch (err) {
      user = null;
      error = getErrorMessage(err);
    } finally {
      loading = false;
    }
  }

  async function login(email: string, password: string) {
    loading = true;
    error = null;

    try {
      const response = await api.login({ email, password });
      user = response.user;
      saveToken(response.accessToken);
      applyToken(response.accessToken);
      initialized = true;
      await goto('/app');
    } catch (err) {
      user = null;
      error = getErrorMessage(err);
    } finally {
      loading = false;
    }
  }

  async function logout() {
    loading = true;
    error = null;

    try {
      await api.logout();
    } catch {
      // Ignore logout errors on the client; we still clear local state.
    } finally {
      user = null;
      saveToken(null);
      applyToken(null);
      initialized = false;
      loading = false;
      await goto('/login');
    }
  }

  function clearError() {
    error = null;
  }

  return {
    get user() {
      return user;
    },
    get loading() {
      return loading;
    },
    get error() {
      return error;
    },
    get initialized() {
      return initialized;
    },
    loadUser,
    register,
    login,
    logout,
    clearError,
  };
}

// Apply any previously stored token immediately so the first API calls
// before root layout onMount still carry credentials.
applyToken(readStoredToken());

export const auth = createAuthStore();
