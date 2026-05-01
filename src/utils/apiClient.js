const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('auth_refresh_token');
  if (!refreshToken) return null;

  const response = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    localStorage.removeItem('auth_access_token');
    localStorage.removeItem('auth_refresh_token');
    return null;
  }

  localStorage.setItem('auth_access_token', data.access_token);
  if (data.refresh_token) {
    localStorage.setItem('auth_refresh_token', data.refresh_token);
  }

  return data.access_token;
}

export async function authFetch(path, options = {}) {
  const accessToken = localStorage.getItem('auth_access_token');
  const headers = {
    ...(options.headers || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  let response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status !== 401) {
    return response;
  }

  const newAccessToken = await refreshAccessToken();
  if (!newAccessToken) {
    return response;
  }

  response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${newAccessToken}`,
    },
  });

  return response;
}

export async function fetchMe() {
  const response = await authFetch('/api/auth/me', { method: 'GET' });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, data };
}
