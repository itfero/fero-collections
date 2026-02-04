import { API_PREFIX } from '../config';
import { getToken } from '../services/tokenService';
import { Platform } from 'react-native';

async function fetchWithTimeout(
  input: RequestInfo,
  init?: RequestInit,
  timeout = 15000
) {
  const controller =
    typeof AbortController !== 'undefined' ? new AbortController() : null;
  const signal = controller ? controller.signal : undefined;
  const timer = controller
    ? setTimeout(() => controller.abort(), timeout)
    : null;
  try {
    const res = await fetch(input, { ...(init || {}), signal } as any);
    if (!res.ok) {
      const error: any = new Error(`HTTP ${res.status}`);
      error.response = {
        status: res.status,
        data: await res.json().catch(() => ({})),
      };
      throw error;
    }
    return res;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// ✅ Login endpoint
export async function loginApi(email: string, password: string) {
  const url = `${API_PREFIX}/auth/login`;
  const res = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        appVersion: '1.0.0',
        platform: Platform.OS,
      }),
    },
    15000
  );

  const data = await res.json();

  if (!data.success) {
    const error: any = new Error(data.error || 'Login failed');
    error.response = { status: res.status, data };
    throw error;
  }

  return {
    token: data.data.token,
    user: data.data.user,
    session: data.data.session??[],
  };
}

// ✅ Logout endpoint (current session)
export async function logoutApi() {
  const url = `${API_PREFIX}/auth/logout`;
  const token = await getToken();

  const res = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({}),
    },
    15000
  );

  const data = await res.json();

  if (!data.success) {
    const error: any = new Error(data.error || 'Logout failed');
    error.response = { status: res.status, data };
    throw error;
  }

  return data;
}

// ✅ Force logout (all other devices)
export async function forceLogoutApi() {
  const url = `${API_PREFIX}/auth/forceLogout`;
  const token = await getToken();

  const res = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({}),
    },
    15000
  );

  const data = await res.json();

  if (!data.success) {
    const error: any = new Error(data.error || 'Force logout failed');
    error.response = { status: res.status, data };
    throw error;
  }

  return data;
}

// ✅ Change password
export async function changePasswordApi(
  oldPassword: string,
  newPassword: string
) {
  const url = `${API_PREFIX}/auth/changePassword`;
  const token = await getToken();

  const res = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    },
    15000
  );

  const data = await res.json();

  if (!data.success) {
    const error: any = new Error(data.error || 'Password change failed');
    error.response = { status: res.status, data };
    throw error;
  }

  return data;
}

// ✅ Forgot password
export async function forgotPasswordApi(email: string) {
  const url = `${API_PREFIX}/auth/forgotPassword`;

  const res = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    },
    15000
  );

  const data = await res.json();

  if (!data.success) {
    const error: any = new Error(data.error || 'Forgot password request failed');
    error.response = { status: res.status, data };
    throw error;
  }

  return data;
}

// ✅ Reset password
export async function resetPasswordApi(token: string, newPassword: string) {
  const url = `${API_PREFIX}/auth/resetPassword`;

  const res = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    },
    15000
  );

  const data = await res.json();

  if (!data.success) {
    const error: any = new Error(data.error || 'Password reset failed');
    error.response = { status: res.status, data };
    throw error;
  }

  return data;
}

// ✅ Validate session / Get current user
export async function validateApi() {
  const url = `${API_PREFIX}/auth/validate`;
  const token = await getToken();
debugger
  const res = await fetchWithTimeout(
    url,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      // body: JSON.stringify({}),
    },
    15000
  );

  const data = await res.json();

  if (!data.success) {
    const error: any = new Error(data.error || 'Validation failed');
    error.response = { status: res.status, data };
    throw error;
  }

  return data;
}
