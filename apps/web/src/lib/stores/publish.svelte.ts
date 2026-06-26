import { api } from '$lib/api/client';
import type { ApiError, PublicationStatusResponse } from '@digital-menu/api-client';

function getErrorMessage(err: unknown): string {
  const apiError = err as ApiError | undefined;
  if (apiError?.message) return apiError.message;
  if (err instanceof Error) return err.message;
  return 'Что-то пошло не так. Попробуйте ещё раз.';
}

function createPublishStore() {
  let status = $state<PublicationStatusResponse | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);

  async function loadStatus(projectId: string): Promise<PublicationStatusResponse> {
    loading = true;
    error = null;

    try {
      const result = await api.getPublicationStatus(projectId);
      status = result;
      return result;
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  async function publish(projectId: string): Promise<PublicationStatusResponse> {
    loading = true;
    error = null;

    try {
      const result = await api.publishProject(projectId);
      status = result;
      return result;
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  async function unpublish(projectId: string): Promise<PublicationStatusResponse> {
    loading = true;
    error = null;

    try {
      const result = await api.unpublishProject(projectId);
      status = result;
      return result;
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  function clearError() {
    error = null;
  }

  return {
    get status() {
      return status;
    },
    get loading() {
      return loading;
    },
    get error() {
      return error;
    },
    loadStatus,
    publish,
    unpublish,
    clearError,
  };
}

export const publish = createPublishStore();
