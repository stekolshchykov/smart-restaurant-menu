import { goto } from '$app/navigation';
import { api } from '$lib/api/client';
import type { LocalCartItem } from '$lib/stores/cart.svelte';
import type {
  AddToCartRequest,
  ApiError,
  CartSessionResponse,
  OrderResponse,
  PlaceOrderResponse,
  PublicMenuResponse,
  PublicProjectResponse,
  PublicTableResponse,
  ServiceRequestResponse,
  ServiceRequestType,
} from '@digital-menu/api-client';

function getErrorMessage(err: unknown): string {
  const apiError = err as ApiError | undefined;
  if (apiError?.message) return apiError.message;
  if (err instanceof Error) return err.message;
  return 'Что-то пошло не так. Попробуйте ещё раз.';
}

function createVenueStore() {
  let project = $state<PublicProjectResponse | null>(null);
  let menu = $state<PublicMenuResponse | null>(null);
  let table = $state<PublicTableResponse | null>(null);
  let cart = $state<CartSessionResponse | null>(null);
  let order = $state<OrderResponse | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);

  async function loadProject(slug: string): Promise<PublicProjectResponse> {
    loading = true;
    error = null;

    try {
      const response = await api.getPublicProject(slug);
      project = response;
      return response;
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  async function loadMenu(slug: string): Promise<PublicMenuResponse> {
    loading = true;
    error = null;

    try {
      const response = await api.getPublicMenu(slug);
      menu = response;
      return response;
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  async function loadTable(token: string): Promise<PublicTableResponse> {
    loading = true;
    error = null;

    try {
      const response = await api.getPublicTable(token);
      table = response;
      project = response.project;
      return response;
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  async function loadCart(token: string): Promise<CartSessionResponse> {
    loading = true;
    error = null;

    try {
      const response = await api.getCart(token);
      cart = response;
      return response;
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  async function addToCart(token: string, body: AddToCartRequest): Promise<CartSessionResponse> {
    loading = true;
    error = null;

    try {
      const response = await api.addToCart(token, body);
      cart = response;
      return response;
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  async function updateCartItem(
    token: string,
    itemId: string,
    quantity: number,
  ): Promise<CartSessionResponse> {
    loading = true;
    error = null;

    try {
      const response = await api.updateCartItem(token, itemId, quantity);
      cart = response;
      return response;
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  async function removeCartItem(token: string, itemId: string): Promise<CartSessionResponse> {
    loading = true;
    error = null;

    try {
      const response = await api.removeCartItem(token, itemId);
      cart = response;
      return response;
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  async function placeOrder(
    token: string,
    localItems?: LocalCartItem[],
  ): Promise<PlaceOrderResponse> {
    loading = true;
    error = null;

    try {
      if (localItems && localItems.length > 0) {
        for (const item of localItems) {
          await api.addToCart(token, {
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            addonIds: item.modifiers.map((m) => m.optionId),
            note: item.note || null,
          });
        }
      }

      const response = await api.placeOrder(token);
      await goto(`/order/${response.orderId}`);
      return response;
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  async function loadOrder(orderToken: string): Promise<OrderResponse> {
    loading = true;
    error = null;

    try {
      const response = await api.getOrder(orderToken);
      order = response;
      return response;
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  async function createServiceRequest(
    token: string,
    type: ServiceRequestType,
  ): Promise<ServiceRequestResponse> {
    try {
      return await api.createServiceRequest(token, { type });
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    }
  }

  function clearError() {
    error = null;
  }

  function clearOrder() {
    order = null;
  }

  function reset() {
    project = null;
    menu = null;
    table = null;
    cart = null;
    order = null;
    loading = false;
    error = null;
  }

  return {
    get project() {
      return project;
    },
    get menu() {
      return menu;
    },
    get table() {
      return table;
    },
    get cart() {
      return cart;
    },
    get order() {
      return order;
    },
    get loading() {
      return loading;
    },
    get error() {
      return error;
    },
    loadProject,
    loadMenu,
    loadTable,
    loadCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    placeOrder,
    loadOrder,
    createServiceRequest,
    clearError,
    clearOrder,
    reset,
  };
}

export const venue = createVenueStore();
