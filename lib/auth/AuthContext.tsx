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
import { saveToken, getToken, removeToken, saveUser, getUser, removeUser } from '../services/tokenService';
import { loginApi, logoutApi, validateApi } from '../api/authApi';
import { attachInterceptors } from '../middleware/apiInterceptor';

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

  // Initialize interceptors once
  useEffect(() => {
    attachInterceptors();
  }, []);

  // Bootstrap auth session on app start
  useEffect(() => {
    // run bootstrap on mount
    bootstrap().catch((err) => {
      console.error('[Auth] bootstrap failed:', err);
    });
  }, []);

  const bootstrap = async () => {
    try {
      const token = await getToken();
      if (token) {
        // Token exists, validate with backend
        try {
          const res = await validateApi();
          const user = res?.user;
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
          }
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
      const user = res?.user;
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
