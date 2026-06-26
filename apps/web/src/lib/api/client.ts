import { ApiClient } from '@digital-menu/api-client';

const origin = import.meta.env?.PUBLIC_API_ORIGIN ?? 'http://localhost:3001';

export const api = new ApiClient(origin);
