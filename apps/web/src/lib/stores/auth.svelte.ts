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

function createAuthStore() {
  let user = $state<UserResponse | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);

  async function loadUser() {
    const token = readStoredToken();
    if (!token) {
      user = null;
      applyToken(null);
      return;
    }

    applyToken(token);
    loading = true;
    error = null;

    try {
      const me = await api.getMe();
      user = me;
    } catch (err) {
      user = null;
      saveToken(null);
      applyToken(null);
      if ((err as ApiError)?.code !== 'unauthorized' && (err as ApiError)?.code !== 'http_401') {
        error = getErrorMessage(err);
      }
    } finally {
      loading = false;
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
    loadUser,
    register,
    login,
    logout,
    clearError,
  };
}

export const auth = createAuthStore();
