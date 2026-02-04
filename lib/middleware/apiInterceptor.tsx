// lib/middleware/apiInterceptor.tsx
import { Platform } from 'react-native';
import { getToken } from '../services/tokenService';
import { isUnauthorizedSuppressed } from '../auth/authSuppress';

const originalFetch = global.fetch;

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export const attachInterceptors = () => {
  (global as any).fetch = async (input: RequestInfo, init?: RequestInit) => {
    // Request interceptor: Add Bearer token
    const token = await getToken();
    const headers = new Headers(init?.headers || {});
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    const requestInit = { ...(init || {}), headers };

    try {
      const response = await originalFetch(input, requestInit);

      if (response.ok) return response;

      const status = response.status;
      const contentType = response.headers.get('content-type');
      let errorData: any = {};

      try {
        if (contentType?.includes('application/json')) {
          errorData = await response.clone().json();
        } else {
          errorData = { message: await response.clone().text() };
        }
      } catch (e) {
        errorData = { message: 'Failed to parse error body' };
      }

    if (status === 401) {
  if (isUnauthorizedSuppressed()) {
    console.warn('[Auth][Interceptor] 401 ignored due to suppression window:', String(input));
    const err: any = new Error(errorData?.message || `HTTP ${status}`);
    err.response = { status, data: errorData };
    return Promise.reject(err);
  }

  // existing logging + notify handler...
  if (onUnauthorized) { void onUnauthorized(); }
}

      const err: any = new Error(errorData?.message || `HTTP ${status}`);
      err.response = { status, data: errorData };
      return Promise.reject(err);
    } catch (err) {
      return Promise.reject(err);
    }
  };
};

export default {};