import { Platform } from 'react-native';
import { getToken, removeToken, removeUser } from '../services/tokenService';
import * as Router from 'expo-router';

// Store original fetch
const originalFetch = global.fetch;

export const attachInterceptors = () => {
  // Override global fetch with interceptor
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

      // Response interceptor: Handle errors
      if (response.ok) {
        return response;
      }

      const status = response.status;
      const contentType = response.headers.get('content-type');
      let errorData: any = {};

      try {
        if (contentType?.includes('application/json')) {
          errorData = await response.clone().json();
        }
      } catch {
        // Handle non-JSON responses
      }

      // Handle session expired (force logout) - check both old and new error codes
      const errorCode = errorData?.code;
      const errorMessage = errorData?.error;
      
      if (
        errorCode === 'SESSION_EXPIRED' ||
        errorCode === 'INVALID_TOKEN' ||
        errorMessage === 'Session expired' ||
        status === 401 ||
        status === 403
      ) {
        console.warn('[Auth] Session expired or unauthorized:', errorCode || status);
        await removeToken();
        await removeUser();

        // Navigate to login (platform-specific)
        if (Platform.OS === 'web') {
          window.location.href = '/(auth)/login';
        } else {
          try {
            const router = Router.useRouter();
            router.replace('/(auth)/login');
          } catch (e) {
            console.error('[Auth] Failed to navigate to login:', e);
          }
        }
      }

      // Handle other 4xx/5xx errors
      if (status === 400 || status === 422) {
        console.error(
          '[API] Validation error:',
          errorData?.message || errorData?.errors
        );
      } else if (status >= 500) {
        console.error(
          '[API] Server error:',
          errorData?.message || 'Unknown server error'
        );
      }

      return response;
    } catch (error) {
      console.error('[API] Fetch error:', error);
      throw error;
    }
  };
};
