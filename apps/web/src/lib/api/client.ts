import { ApiClient } from '@digital-menu/api-client';
import { env } from '$env/dynamic/public';

const origin = (env.PUBLIC_API_ORIGIN || 'http://localhost:3001').replace(/\/$/, '');

export const api = new ApiClient(origin);
