import { api } from '$lib/api/client';
import type {
  ApiError,
  BulkCreateTablesRequest,
  CreateTableRequest,
  Table,
  UpdateTableRequest,
} from '@digital-menu/api-client';

function getErrorMessage(err: unknown): string {
  const apiError = err as ApiError | undefined;
  if (apiError?.message) return apiError.message;
  if (err instanceof Error) return err.message;
  return 'Что-то пошло не так. Попробуйте ещё раз.';
}

function createTablesStore() {
  let tables = $state<Table[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);

  async function loadTables(projectId: string): Promise<Table[]> {
    loading = true;
    error = null;

    try {
      const list = await api.getTables(projectId);
      tables = list;
      return list;
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  async function createTable(projectId: string, body: CreateTableRequest): Promise<Table> {
    loading = true;
    error = null;

    try {
      const table = await api.createTable(projectId, body);
      tables = [table, ...tables];
      return table;
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  async function bulkCreate(projectId: string, body: BulkCreateTablesRequest): Promise<Table[]> {
    loading = true;
    error = null;

    try {
      const created = await api.bulkCreateTables(projectId, body);
      tables = [...created, ...tables];
      return created;
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  async function updateTable(id: string, body: UpdateTableRequest): Promise<Table> {
    loading = true;
    error = null;

    try {
      const table = await api.updateTable(id, body);
      tables = tables.map((t) => (t.id === id ? table : t));
      return table;
    } catch (err) {
      error = getErrorMessage(err);
      throw err;
    } finally {
      loading = false;
    }
  }

  async function deleteTable(id: string): Promise<void> {
    loading = true;
    error = null;

    try {
      await api.deleteTable(id);
      tables = tables.filter((t) => t.id !== id);
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
    get tables() {
      return tables;
    },
    get loading() {
      return loading;
    },
    get error() {
      return error;
    },
    loadTables,
    createTable,
    bulkCreate,
    updateTable,
    deleteTable,
    clearError,
  };
}

export const tables = createTablesStore();
