// lib/services/tokenService.ts
// Cross-platform token storage: SecureStore (RN) + localStorage (web) + memory fallback
import { Platform } from 'react-native';

let SecureStore: any = null;

// Lazy load SecureStore only on native
if (Platform.OS !== 'web') {
  try {
    SecureStore = require('expo-secure-store');
  } catch (e) {
    console.warn('SecureStore not available, using fallback');
  }
}

// Check if localStorage is available (web only)
const hasLocalStorage = typeof localStorage !== 'undefined';

// Memory fallback storage
const memoryStorage: Record<string, string> = {};

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const saveToken = async (token: string): Promise<void> => {
  try {
    if (SecureStore) {
      // Prefer SecureStore on native
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else if (hasLocalStorage) {
      // Fallback to localStorage on web
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      // Last resort: memory storage
      memoryStorage[TOKEN_KEY] = token;
    }
  } catch (error) {
    console.error('Error saving token:', error);
    // Try localStorage as fallback
    if (hasLocalStorage) {
      try {
        localStorage.setItem(TOKEN_KEY, token);
      } catch (e) {
        // Use memory storage as last resort
        memoryStorage[TOKEN_KEY] = token;
      }
    } else {
      memoryStorage[TOKEN_KEY] = token;
    }
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    if (SecureStore) {
      // Prefer SecureStore on native
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } else if (hasLocalStorage) {
      // Fallback to localStorage on web
      return localStorage.getItem(TOKEN_KEY);
    } else {
      // Last resort: memory storage
      return memoryStorage[TOKEN_KEY] || null;
    }
  } catch (error) {
    console.error('Error getting token:', error);
    // Try localStorage as fallback
    if (hasLocalStorage) {
      try {
        return localStorage.getItem(TOKEN_KEY);
      } catch (e) {
        // Use memory storage as last resort
        return memoryStorage[TOKEN_KEY] || null;
      }
    }
    return memoryStorage[TOKEN_KEY] || null;
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    if (SecureStore) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } else if (hasLocalStorage) {
      localStorage.removeItem(TOKEN_KEY);
    } else {
      delete memoryStorage[TOKEN_KEY];
    }
  } catch (error) {
    console.error('Error removing token:', error);
    if (hasLocalStorage) {
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch (e) {
        delete memoryStorage[TOKEN_KEY];
      }
    } else {
      delete memoryStorage[TOKEN_KEY];
    }
  }
};

export const saveUser = async (user: any): Promise<void> => {
  try {
    const userJson = JSON.stringify(user);
    if (SecureStore) {
      await SecureStore.setItemAsync(USER_KEY, userJson);
    } else if (hasLocalStorage) {
      localStorage.setItem(USER_KEY, userJson);
    } else {
      memoryStorage[USER_KEY] = userJson;
    }
  } catch (error) {
    console.error('Error saving user:', error);
    if (hasLocalStorage) {
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } catch (e) {
        memoryStorage[USER_KEY] = JSON.stringify(user);
      }
    } else {
      memoryStorage[USER_KEY] = JSON.stringify(user);
    }
  }
};

export const getUser = async (): Promise<any | null> => {
  try {
    if (SecureStore) {
      const data = await SecureStore.getItemAsync(USER_KEY);
      return data ? JSON.parse(data) : null;
    } else if (hasLocalStorage) {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } else {
      const data = memoryStorage[USER_KEY];
      return data ? JSON.parse(data) : null;
    }
  } catch (error) {
    console.error('Error getting user:', error);
    if (hasLocalStorage) {
      try {
        const data = localStorage.getItem(USER_KEY);
        return data ? JSON.parse(data) : null;
      } catch (e) {
        const data = memoryStorage[USER_KEY];
        return data ? JSON.parse(data) : null;
      }
    }
    const data = memoryStorage[USER_KEY];
    return data ? JSON.parse(data) : null;
  }
};

export const removeUser = async (): Promise<void> => {
  try {
    if (SecureStore) {
      await SecureStore.deleteItemAsync(USER_KEY);
    } else if (hasLocalStorage) {
      localStorage.removeItem(USER_KEY);
    } else {
      delete memoryStorage[USER_KEY];
    }
  } catch (error) {
    console.error('Error removing user:', error);
    if (hasLocalStorage) {
      try {
        localStorage.removeItem(USER_KEY);
      } catch (e) {
        delete memoryStorage[USER_KEY];
      }
    } else {
      delete memoryStorage[USER_KEY];
    }
  }
};
