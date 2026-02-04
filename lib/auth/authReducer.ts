// lib/auth/authReducer.ts
// Auth state reducer
export type AuthState = {
  user: any;
  token: string | null;
  isAuth: boolean;
  error: string | null;
  loading: boolean;
};

export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; user: any; token: string }
  | { type: 'LOGIN_FAILURE'; error: string }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_TOKEN'; user: any; token: string }
  | { type: 'SET_ERROR'; error: string | null };

export const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuth: false,
  error: null,
  loading: true,
};

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.user,
        token: action.token,
        isAuth: true,
        loading: false,
        error: null,
      };

    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuth: false,
        loading: false,
        error: action.error,
      };

    case 'LOGOUT':
      return {
        ...initialAuthState,
        loading: false,
      };

    case 'RESTORE_TOKEN':
      return {
        ...state,
        user: action.user,
        token: action.token,
        isAuth: true,
        loading: false,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
      };

    default:
      return state;
  }
};
