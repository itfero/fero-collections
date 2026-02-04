// lib/auth/AuthContext.tsx
// Enhanced Auth Context with reducer pattern
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import { authReducer, initialAuthState, AuthState, AuthAction } from './authReducer';
// import { saveToken, getToken, removeToken, saveUser, getUser, removeUser } from '../services/tokenService';
import { loginApi, logoutApi, validateApi } from '../api/authApi';
// import { attachInterceptors } from '../middleware/apiInterceptor';
import { useRouter } from 'expo-router';
import { setUnauthorizedHandler } from '../middleware/apiInterceptor';
import * as SplashScreen from 'expo-splash-screen';
import { getToken, removeToken, removeUser, saveToken } from '../services/tokenService';
import { saveUser } from '../auth';

import { attachInterceptors } from '../middleware/apiInterceptor';
import { useRef } from 'react';
import { suppressUnauthorizedFor } from './authSuppress';
type AuthContextType = AuthState & {
  dispatch: React.Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  validateSession: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const router = useRouter();
  // Initialize interceptors once (attach global fetch wrapper)
  useEffect(() => {
    try {
      attachInterceptors();
    } catch (e) {
      console.warn('[Auth] attachInterceptors failed:', e);
    }
  }, []);

// prevent multiple simultaneous unauthorized handling

const handlingUnauthorizedRef = useRef(false);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      // If an unauthorized handling is already in progress, ignore duplicates
      if (handlingUnauthorizedRef.current) {
        console.debug('[Auth] unauthorized handler already running - ignoring duplicate');
        return;
      }
      handlingUnauthorizedRef.current = true;

      // Small delay to allow in-flight login/saveToken to finish (avoids spurious logout)
      await new Promise((res) => setTimeout(res, 150));

      try {
        // Confirm whether token still exists (if not, nothing to do)
        const tokenNow = await getToken();
        if (!tokenNow) {
          console.debug('[Auth] no token present on unauthorized handler - skipping');
          return;
        }

        console.debug('[Auth] handling unauthorized: clearing local data and logging out');

        // Clear local storage
        try {
          await removeToken();
          await removeUser();
        } catch (e) {
          console.warn('[Auth] error clearing storage during unauthorized handling', e);
        }

        // Update auth state
        dispatch({ type: 'LOGOUT' });

        // Hide splash if visible and navigate
        SplashScreen.hideAsync().catch(() => {});
        try {
          router.replace('/(auth)/login');
        } catch (e) {
          console.warn('[Auth] Failed to navigate to login:', e);
        }
      } finally {
        // Allow future unauthorized handling after short cooldown
        setTimeout(() => {
          handlingUnauthorizedRef.current = false;
        }, 800);
      }
    });

    return () => setUnauthorizedHandler(null);
  }, [router, dispatch]);

  // Initialize interceptors once
  // useEffect(() => {
  //   attachInterceptors();
  // }, []);
  // register a handler so the interceptor can inform us about 401s
  useEffect(() => {
    setUnauthorizedHandler(async () => {
      console.debug('[Auth] unauthorized handler invoked');

      // ensure local storage is cleared
      try {
        await removeToken();
        await removeUser();
      } catch (e) {
        console.warn('[Auth] error clearing storage during unauthorized handling', e);
      }

      // update auth state
      dispatch({ type: 'LOGOUT' });

      // hide splash if it's still visible
      SplashScreen.hideAsync().catch(() => {});

      // navigate to login
      try {
        router.replace('/(auth)/login');
      } catch (e) {
        console.warn('[Auth] Failed to navigate to login:', e);
      }
    });

    // cleanup on unmount
    return () => setUnauthorizedHandler(null);
  }, [router, dispatch]);


  // Bootstrap auth session on app start
  useEffect(() => {
    // run bootstrap on mount
    bootstrap().catch((err) => {
      console.error('[Auth] bootstrap failed:', err);
    });
  }, []);
useEffect(() => {
  console.debug('[Auth] state changed', state);
}, [state]);
  const bootstrap = async () => {
    try {
      const token = await getToken();
      if (token) {
        // Token exists, validate with backend
        try {
          const res = await validateApi();
          const user = res?.data?.user;
          if (user) {
            dispatch({
              type: 'RESTORE_TOKEN',
              user,
              token,
            });
          } else {
            // Token invalid
            await removeToken();
            await removeUser();
            dispatch({ type: 'LOGOUT' });
          }debugger
        } catch (error: any) {
          console.error('[Auth] Token validation failed:', error.message);
          await removeToken();
          await removeUser();
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        // No token, user not logged in
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error: any) {
      console.error('[Auth] Bootstrap error:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const login = async (email: string, password: string) => {
    
  // suppress 401 handling for a short window (e.g., 1000ms)
  suppressUnauthorizedFor(1000);
    dispatch({ type: 'LOGIN_START' });
    try {
      const res = await loginApi(email, password);
      const { token, user } = res;

      if (!token || !user) {
        throw new Error('Invalid login response');
      }
debugger
      // Save token and user
      await saveToken(token);
      await saveUser(user);

      // Update state
      dispatch({
        type: 'LOGIN_SUCCESS',
        user,
        token,
      });
       console.debug('[Auth] LOGIN_SUCCESS dispatched', { user, token });
       
const storedToken = await getToken();
console.debug('[Auth] token saved? ', !!storedToken, { storedToken });
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Login failed';
      console.error('[Auth] Login error:', errorMsg);
      dispatch({
        type: 'LOGIN_FAILURE',
        error: errorMsg,
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint
      await logoutApi();
    } catch (error: any) {
      console.warn('[Auth] Logout API call failed, clearing local data anyway:', error.message);
    } finally {
      // Always clear local data
      await removeToken();
      await removeUser();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const validateSession = async () => {
    try {
      const res = await validateApi();
      const user = res?.data?.user;
      const token = await getToken();

      if (user && token) {
        dispatch({
          type: 'RESTORE_TOKEN',
          user,
          token,
        });
      } else {
        await removeToken();
        await removeUser();
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error: any) {
      console.error('[Auth] Session validation failed:', error.message);
      await removeToken();
      await removeUser();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      await loginApi({ email: state.user?.email, password: oldPassword } as any);
      // TODO: Call change password endpoint after implementing in backend
      console.log('[Auth] Password change successful');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Password change failed';
      console.error('[Auth] Password change error:', errorMsg);
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    dispatch,
    login,
    logout,
    validateSession,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
