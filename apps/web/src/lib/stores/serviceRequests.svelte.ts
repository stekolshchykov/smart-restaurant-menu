import { api } from '$lib/api/client';
import type {
  ApiError,
  ServiceRequestListItemResponse,
  ServiceRequestStatus,
} from '@digital-menu/api-client';

function getErrorMessage(err: unknown): string {
  const apiError = err as ApiError | undefined;
  if (apiError?.message) return apiError.message;
  if (err instanceof Error) return err.message;
  return 'Что-то пошло не так. Попробуйте ещё раз.';
}

function createServiceRequestsStore() {
  let requests = $state<ServiceRequestListItemResponse[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let autoRefreshInterval = $state<ReturnType<typeof setInterval> | null>(null);

  async function loadRequests(
    projectId: string,
    statusFilter?: ServiceRequestStatus,
  ): Promise<ServiceRequestListItemResponse[]> {
    loading = true;
    error = null;

    try {
      const list = await api.getServiceRequests(projectId, statusFilter);
      requests = list;
      return list;
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  async function updateRequestStatus(
    projectId: string,
    requestId: string,
    status: ServiceRequestStatus,
  ): Promise<void> {
    loading = true;
    error = null;

    try {
      const updated = await api.updateServiceRequestStatus(projectId, requestId, status);
      requests = requests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: updated.status,
              updatedAt: updated.updatedAt,
            }
          : request,
      );
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  function startAutoRefresh(projectId: string, statusFilter?: ServiceRequestStatus) {
    stopAutoRefresh();
    autoRefreshInterval = setInterval(() => {
      void loadRequests(projectId, statusFilter);
    }, 5000);
  }

  function stopAutoRefresh() {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      autoRefreshInterval = null;
    }
  }

  function clearError() {
    error = null;
  }

  return {
    get requests() {
      return requests;
    },
    get loading() {
      return loading;
    },
    get error() {
      return error;
    },
    loadRequests,
    updateRequestStatus,
    startAutoRefresh,
    stopAutoRefresh,
    clearError,
  };
}

export const serviceRequests = createServiceRequestsStore();
export type { ServiceRequestStatus };
