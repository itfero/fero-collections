// lib/middleware/apiInterceptor.ts
import { Platform } from 'react-native';
import { getToken, removeToken, removeUser } from '../services/tokenService';
import * as Router from 'expo-router';

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

      // If response OK just return
      if (response.ok) {
        return response;
      }

      // Handle error response
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

      // 401 → session expired / unauthorized
      if (status === 401) {
        console.warn('[Auth] Session expired or unauthorized:', status);

        // Clear saved tokens
        try {
          await removeToken();
          await removeUser();
        } catch (e) {
          console.warn('[Auth] failed clearing tokens:', e);
        }

        // Notify React layer (AuthContext) to handle logout/navigation
        if (onUnauthorized) {
          try {
            // call but don't await the handler if it is async - keep interceptor non-blocking
            void onUnauthorized();
          } catch (e) {
            console.warn('[Auth] onUnauthorized handler threw:', e);
          }
        } else {
          console.warn('[Auth] No unauthorized handler registered.');
        }
      }

      const error: any = new Error(errorData?.message || `HTTP ${status}`);
      error.response = { status, data: errorData };
      return Promise.reject(error);
    } catch (err) {
      // Network / fetch-level error
      return Promise.reject(err);
    }
  };
};
export default {}; // keep default export shape if other files import default