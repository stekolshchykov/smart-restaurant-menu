import { api } from '$lib/api/client';
import type {
  ApiError,
  OrderListItemResponse,
  OrderStatus,
} from '@digital-menu/api-client';

function getErrorMessage(err: unknown): string {
  const apiError = err as ApiError | undefined;
  if (apiError?.message) return apiError.message;
  if (err instanceof Error) return err.message;
  return 'Что-то пошло не так. Попробуйте ещё раз.';
}

function createOrdersStore() {
  let orders = $state<OrderListItemResponse[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let autoRefreshInterval = $state<ReturnType<typeof setInterval> | null>(null);

  async function loadOrders(
    projectId: string,
    statusFilter?: OrderStatus,
  ): Promise<OrderListItemResponse[]> {
    loading = true;
    error = null;

    try {
      const list = await api.getOrders(projectId, statusFilter);
      orders = list;
      return list;
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  async function updateOrderStatus(
    projectId: string,
    orderId: string,
    status: OrderStatus,
  ): Promise<void> {
    loading = true;
    error = null;

    try {
      const updated = await api.updateOrderStatus(projectId, orderId, status);
      orders = orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: updated.status,
              total: updated.total,
              items: updated.items,
            }
          : order,
      );
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  function startAutoRefresh(projectId: string, statusFilter?: OrderStatus) {
    stopAutoRefresh();
    autoRefreshInterval = setInterval(() => {
      void loadOrders(projectId, statusFilter);
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
    get orders() {
      return orders;
    },
    get loading() {
      return loading;
    },
    get error() {
      return error;
    },
    loadOrders,
    updateOrderStatus,
    startAutoRefresh,
    stopAutoRefresh,
    clearError,
  };
}

export const orders = createOrdersStore();
export type { OrderStatus };
