const http = require('http');
const fs = require('fs');
const path = require('path');
const { loadEnv } = require('./env');

loadEnv();

const PORT = Number(process.env.PORT || 4000);
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
const FRONTEND_ORIGINS = process.env.FRONTEND_ORIGINS;
const ALLOWED_ORIGINS = (FRONTEND_ORIGINS || FRONTEND_ORIGIN)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('SUPABASE_URL və SUPABASE_ANON_KEY mühit dəyişənləri tələb olunur.');
}

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...extraHeaders,
  });
  res.end(body);
}

function sanitizeText(value, maxLength = 300) {
  return String(value || '').trim().slice(0, maxLength);
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function toInt(value, fallback = 0) {
  const num = parseInt(String(value), 10);
  return Number.isFinite(num) ? num : fallback;
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0] || FRONTEND_ORIGIN;

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';

    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Request body çox böyükdür.'));
        req.destroy();
      }
    });

    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        const parsed = JSON.parse(raw);
        resolve(parsed);
      } catch {
        reject(new Error('JSON formatı yanlışdır.'));
      }
    });

    req.on('error', (err) => reject(err));
  });
}

function getAuthToken(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

function mapSupabaseError(errorObj) {
  if (!errorObj) return 'Supabase xətası baş verdi.';

  return (
    errorObj.msg ||
    errorObj.message ||
    errorObj.error_description ||
    errorObj.error ||
    'Supabase xətası baş verdi.'
  );
}

async function supabaseSignUp(email, password) {
  const url = `${SUPABASE_URL}/auth/v1/signup`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

async function supabaseSignIn(email, password) {
  const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

async function supabaseRefresh(refreshToken) {
  const url = `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

async function supabaseGetUser(accessToken) {
  const url = `${SUPABASE_URL}/auth/v1/user`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

async function supabaseTableRequest({
  token,
  method = 'GET',
  table,
  query = '',
  body,
  prefer,
}) {
  const key = SUPABASE_ANON_KEY;
  const authorizationToken = token;

  if (!authorizationToken) {
    return { ok: false, status: 401, data: { error: 'Authorization token yoxdur.' } };
  }

  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ''}`;
  const headers = {
    apikey: key,
    Authorization: `Bearer ${authorizationToken}`,
  };

  if (prefer) {
    headers.Prefer = prefer;
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  return { ok: response.ok, status: response.status, data };
}

async function getOrCreateProfile(user, token) {
  const query = `select=id,email,full_name,created_at&id=eq.${encodeURIComponent(user.id)}&limit=1`;
  const existing = await supabaseTableRequest({ token, method: 'GET', table: 'profiles', query });

  if (existing.ok && Array.isArray(existing.data) && existing.data[0]) {
    return existing.data[0];
  }

  const insertBody = {
    id: user.id,
    email: user.email || null,
  };

  const created = await supabaseTableRequest({
    token,
    method: 'POST',
    table: 'profiles',
    body: insertBody,
    prefer: 'return=representation',
  });

  if (created.ok && Array.isArray(created.data) && created.data[0]) {
    return created.data[0];
  }

  return {
    id: user.id,
    email: user.email || null,
    full_name: null,
  };
}

async function requireAuth(req, res) {
  const token = getAuthToken(req);
  if (!token) {
    sendJson(res, 401, { error: 'Authorization header tələb olunur.' });
    return null;
  }

  const authResult = await supabaseGetUser(token);
  if (!authResult.ok || !authResult.data || !authResult.data.id) {
    sendJson(res, 401, { error: 'Token etibarsızdır və ya vaxtı bitib.' });
    return null;
  }

  const profile = await getOrCreateProfile(authResult.data, token);
  return { token, user: authResult.data, profile };
}

function validateCredentials(email, password) {
  if (!email || !password) {
    return 'Email və şifrə mütləqdir.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email formatı yanlışdır.';
  }

  if (String(password).length < 6) {
    return 'Şifrə minimum 6 simvol olmalıdır.';
  }

  return null;
}

function mapWarehouseBody(body) {
  return {
    name: sanitizeText(body.name, 120),
    description: sanitizeText(body.description, 600),
  };
}

function mapProductBody(body, warehouseId, userId) {
  return {
    user_id: userId,
    warehouse_id: warehouseId,
    name: sanitizeText(body.name, 120),
    category: sanitizeText(body.category, 120),
    price: toNumber(body.price, 0),
    cost_price: toNumber(body.costPrice, 0),
    status: sanitizeText(body.status || 'Available', 40) || 'Available',
    image: body.image || null,
  };
}

function mapProjectBody(body, userId) {
  return {
    user_id: userId,
    name: sanitizeText(body.name, 140),
    client: sanitizeText(body.client, 140),
    start_date: body.startDate || null,
    end_date: body.endDate || null,
    prepayment: toNumber(body.prepayment, 0),
    budget: toNumber(body.budget, 0),
    notes: sanitizeText(body.notes, 3000),
    status: sanitizeText(body.status || 'Aktiv', 40) || 'Aktiv',
    progress: toInt(body.progress, 0),
  };
}

function mapProjectItemBody(body, projectId, userId) {
  return {
    user_id: userId,
    project_id: projectId,
    warehouse_id: body.warehouseId ? toInt(body.warehouseId, 0) : null,
    product_id: body.productId ? toInt(body.productId, 0) : null,
    name: sanitizeText(body.name, 140),
    days: toInt(body.days, 1),
    price_per_day: toNumber(body.pricePerDay, 0),
    cost_per_day: toNumber(body.costPerDay, 0),
    start_date: body.startDate || null,
    end_date: body.endDate || null,
    provider: sanitizeText(body.provider, 120),
    total: toNumber(body.total, 0),
    cost_total: toNumber(body.costTotal, 0),
    type: sanitizeText(body.type, 40),
  };
}

function parseIdFromPath(pathname, regex) {
  const match = pathname.match(regex);
  if (!match) return null;
  const id = parseInt(match[1], 10);
  return Number.isFinite(id) ? id : null;
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(req, res);
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === 'GET' && pathname === '/api/health') {
    return sendJson(res, 200, {
      ok: true,
      service: 'anbar4-auth-api',
      time: new Date().toISOString(),
    });
  }

  if (req.method === 'POST' && pathname === '/api/auth/register') {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return sendJson(res, 500, { error: 'Server konfiqurasiyası tamam deyil.' });
    }

    try {
      const { email, password } = await readJsonBody(req);
      const validationError = validateCredentials(email, password);
      if (validationError) {
        return sendJson(res, 400, { error: validationError });
      }

      const result = await supabaseSignUp(email, password);
      if (!result.ok) {
        return sendJson(res, result.status, { error: mapSupabaseError(result.data) });
      }

      return sendJson(res, 201, {
        message: 'Qeydiyyat uğurludur. Email təsdiqi aktivdirsə, poçtu yoxlayın.',
        user: result.data.user || null,
        session: result.data.session || null,
      });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || 'Request oxunarkən xəta oldu.' });
    }
  }

  if (req.method === 'POST' && pathname === '/api/auth/login') {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return sendJson(res, 500, { error: 'Server konfiqurasiyası tamam deyil.' });
    }

    try {
      const { email, password } = await readJsonBody(req);
      const validationError = validateCredentials(email, password);
      if (validationError) {
        return sendJson(res, 400, { error: validationError });
      }

      const result = await supabaseSignIn(email, password);
      if (!result.ok) {
        return sendJson(res, result.status, { error: mapSupabaseError(result.data) });
      }

      return sendJson(res, 200, {
        message: 'Giriş uğurludur.',
        access_token: result.data.access_token,
        refresh_token: result.data.refresh_token,
        expires_in: result.data.expires_in,
        token_type: result.data.token_type,
        user: result.data.user || null,
      });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || 'Request oxunarkən xəta oldu.' });
    }
  }

  if (req.method === 'POST' && pathname === '/api/auth/refresh') {
    try {
      const { refresh_token: refreshToken } = await readJsonBody(req);
      if (!refreshToken) {
        return sendJson(res, 400, { error: 'refresh_token mütləqdir.' });
      }

      const result = await supabaseRefresh(refreshToken);
      if (!result.ok) {
        return sendJson(res, result.status, { error: mapSupabaseError(result.data) });
      }

      return sendJson(res, 200, {
        access_token: result.data.access_token,
        refresh_token: result.data.refresh_token,
        expires_in: result.data.expires_in,
        token_type: result.data.token_type,
        user: result.data.user || null,
      });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || 'Request oxunarkən xəta oldu.' });
    }
  }

  if (req.method === 'GET' && (pathname === '/api/auth/me' || pathname === '/api/me')) {
    const context = await requireAuth(req, res);
    if (!context) return;

    return sendJson(res, 200, {
      user: context.user,
      profile: context.profile,
    });
  }

  if (req.method === 'PUT' && pathname === '/api/auth/profile') {
    const context = await requireAuth(req, res);
    if (!context) return;

    try {
      const body = await readJsonBody(req);
      const fullName = sanitizeText(body.full_name, 140);
      const email = sanitizeText(body.email, 220);

      const update = await supabaseTableRequest({
        token: context.token,
        method: 'PATCH',
        table: 'profiles',
        query: `id=eq.${encodeURIComponent(context.user.id)}`,
        body: {
          full_name: fullName || null,
          email: email || context.user.email || null,
        },
        prefer: 'return=representation',
      });

      if (!update.ok) {
        return sendJson(res, update.status, { error: mapSupabaseError(update.data) });
      }

      return sendJson(res, 200, {
        message: 'Profil yeniləndi.',
        profile: Array.isArray(update.data) ? update.data[0] : null,
      });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || 'Request oxunarkən xəta oldu.' });
    }
  }

  if (req.method === 'GET' && pathname === '/api/warehouses') {
    const context = await requireAuth(req, res);
    if (!context) return;

    const result = await supabaseTableRequest({
      token: context.token,
      method: 'GET',
      table: 'warehouses',
      query: `select=id,name,description,created_at&user_id=eq.${encodeURIComponent(context.user.id)}&order=created_at.desc`,
    });

    if (!result.ok) {
      return sendJson(res, result.status, { error: mapSupabaseError(result.data) });
    }

    return sendJson(res, 200, { warehouses: result.data || [] });
  }

  if (req.method === 'POST' && pathname === '/api/warehouses') {
    const context = await requireAuth(req, res);
    if (!context) return;

    try {
      const body = await readJsonBody(req);
      const payload = {
        user_id: context.user.id,
        ...mapWarehouseBody(body),
      };

      if (!payload.name) {
        return sendJson(res, 400, { error: 'Anbar adı mütləqdir.' });
      }

      const result = await supabaseTableRequest({
        token: context.token,
        method: 'POST',
        table: 'warehouses',
        body: payload,
        prefer: 'return=representation',
      });

      if (!result.ok) {
        return sendJson(res, result.status, { error: mapSupabaseError(result.data) });
      }

      return sendJson(res, 201, { warehouse: Array.isArray(result.data) ? result.data[0] : null });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || 'Request oxunarkən xəta oldu.' });
    }
  }

  const warehouseId = parseIdFromPath(pathname, /^\/api\/warehouses\/(\d+)$/);
  if (warehouseId && req.method === 'GET') {
    const context = await requireAuth(req, res);
    if (!context) return;

    const query = `select=id,name,description,created_at&id=eq.${warehouseId}&user_id=eq.${encodeURIComponent(context.user.id)}&limit=1`;
    const result = await supabaseTableRequest({ token: context.token, method: 'GET', table: 'warehouses', query });

    if (!result.ok) {
      return sendJson(res, result.status, { error: mapSupabaseError(result.data) });
    }

    return sendJson(res, 200, { warehouse: Array.isArray(result.data) ? result.data[0] || null : null });
  }

  if (warehouseId && req.method === 'PUT') {
    const context = await requireAuth(req, res);
    if (!context) return;

    try {
      const body = await readJsonBody(req);
      const payload = mapWarehouseBody(body);

      const result = await supabaseTableRequest({
        token: context.token,
        method: 'PATCH',
        table: 'warehouses',
        query: `id=eq.${warehouseId}&user_id=eq.${encodeURIComponent(context.user.id)}`,
        body: payload,
        prefer: 'return=representation',
      });

      if (!result.ok) {
        return sendJson(res, result.status, { error: mapSupabaseError(result.data) });
      }

      return sendJson(res, 200, { warehouse: Array.isArray(result.data) ? result.data[0] || null : null });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || 'Request oxunarkən xəta oldu.' });
    }
  }

  if (warehouseId && req.method === 'DELETE') {
    const context = await requireAuth(req, res);
    if (!context) return;

    const result = await supabaseTableRequest({
      token: context.token,
      method: 'DELETE',
      table: 'warehouses',
      query: `id=eq.${warehouseId}&user_id=eq.${encodeURIComponent(context.user.id)}`,
    });

    if (!result.ok) {
      return sendJson(res, result.status, { error: mapSupabaseError(result.data) });
    }

    return sendJson(res, 200, { message: 'Anbar silindi.' });
  }

  const warehouseProductsId = parseIdFromPath(pathname, /^\/api\/warehouses\/(\d+)\/products$/);
  if (warehouseProductsId && req.method === 'GET') {
    const context = await requireAuth(req, res);
    if (!context) return;

    const result = await supabaseTableRequest({
      token: context.token,
      method: 'GET',
      table: 'products',
      query: `select=id,warehouse_id,name,category,price,cost_price,status,image,created_at&warehouse_id=eq.${warehouseProductsId}&user_id=eq.${encodeURIComponent(context.user.id)}&order=created_at.desc`,
    });

    if (!result.ok) {
      return sendJson(res, result.status, { error: mapSupabaseError(result.data) });
    }

    return sendJson(res, 200, { products: result.data || [] });
  }

  if (warehouseProductsId && req.method === 'POST') {
    const context = await requireAuth(req, res);
    if (!context) return;

    try {
      const body = await readJsonBody(req);
      const payload = mapProductBody(body, warehouseProductsId, context.user.id);
      if (!payload.name) {
        return sendJson(res, 400, { error: 'Məhsul adı mütləqdir.' });
      }

      const result = await supabaseTableRequest({
        token: context.token,
        method: 'POST',
        table: 'products',
        body: payload,
        prefer: 'return=representation',
      });

      if (!result.ok) {
        return sendJson(res, result.status, { error: mapSupabaseError(result.data) });
      }

      return sendJson(res, 201, { product: Array.isArray(result.data) ? result.data[0] || null : null });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || 'Request oxunarkən xəta oldu.' });
    }
  }

  const productId = parseIdFromPath(pathname, /^\/api\/products\/(\d+)$/);
  if (productId && req.method === 'PUT') {
    const context = await requireAuth(req, res);
    if (!context) return;

    try {
      const body = await readJsonBody(req);
      const payload = {
        name: sanitizeText(body.name, 120),
        category: sanitizeText(body.category, 120),
        price: toNumber(body.price, 0),
        cost_price: toNumber(body.costPrice, 0),
        status: sanitizeText(body.status || 'Available', 40),
        image: body.image || null,
      };

      const result = await supabaseTableRequest({
        token: context.token,
        method: 'PATCH',
        table: 'products',
        query: `id=eq.${productId}&user_id=eq.${encodeURIComponent(context.user.id)}`,
        body: payload,
        prefer: 'return=representation',
      });

      if (!result.ok) {
        return sendJson(res, result.status, { error: mapSupabaseError(result.data) });
      }

      return sendJson(res, 200, { product: Array.isArray(result.data) ? result.data[0] || null : null });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || 'Request oxunarkən xəta oldu.' });
    }
  }

  if (productId && req.method === 'DELETE') {
    const context = await requireAuth(req, res);
    if (!context) return;

    const result = await supabaseTableRequest({
      token: context.token,
      method: 'DELETE',
      table: 'products',
      query: `id=eq.${productId}&user_id=eq.${encodeURIComponent(context.user.id)}`,
    });

    if (!result.ok) {
      return sendJson(res, result.status, { error: mapSupabaseError(result.data) });
    }

    return sendJson(res, 200, { message: 'Məhsul silindi.' });
  }

  if (req.method === 'GET' && pathname === '/api/projects') {
    const context = await requireAuth(req, res);
    if (!context) return;

    const result = await supabaseTableRequest({
      token: context.token,
      method: 'GET',
      table: 'projects',
      query: `select=id,name,client,start_date,end_date,prepayment,budget,notes,status,progress,created_at&user_id=eq.${encodeURIComponent(context.user.id)}&order=created_at.desc`,
    });

    if (!result.ok) {
      return sendJson(res, result.status, { error: mapSupabaseError(result.data) });
    }

    return sendJson(res, 200, { projects: result.data || [] });
  }

  if (req.method === 'POST' && pathname === '/api/projects') {
    const context = await requireAuth(req, res);
    if (!context) return;

    try {
      const body = await readJsonBody(req);
      const payload = mapProjectBody(body, context.user.id);
      if (!payload.name) {
        return sendJson(res, 400, { error: 'Layihə adı mütləqdir.' });
      }

      const result = await supabaseTableRequest({
        token: context.token,
        method: 'POST',
        table: 'projects',
        body: payload,
        prefer: 'return=representation',
      });

      if (!result.ok) {
        return sendJson(res, result.status, { error: mapSupabaseError(result.data) });
      }

      return sendJson(res, 201, { project: Array.isArray(result.data) ? result.data[0] || null : null });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || 'Request oxunarkən xəta oldu.' });
    }
  }

  const projectId = parseIdFromPath(pathname, /^\/api\/projects\/(\d+)$/);
  if (projectId && req.method === 'GET') {
    const context = await requireAuth(req, res);
    if (!context) return;

    const result = await supabaseTableRequest({
      token: context.token,
      method: 'GET',
      table: 'projects',
      query: `select=id,name,client,start_date,end_date,prepayment,budget,notes,status,progress,created_at&id=eq.${projectId}&user_id=eq.${encodeURIComponent(context.user.id)}&limit=1`,
    });

    if (!result.ok) {
      return sendJson(res, result.status, { error: mapSupabaseError(result.data) });
    }

    return sendJson(res, 200, { project: Array.isArray(result.data) ? result.data[0] || null : null });
  }

  if (projectId && req.method === 'PUT') {
    const context = await requireAuth(req, res);
    if (!context) return;

    try {
      const body = await readJsonBody(req);
      const payload = mapProjectBody(body, context.user.id);
      delete payload.user_id;

      const result = await supabaseTableRequest({
        token: context.token,
        method: 'PATCH',
        table: 'projects',
        query: `id=eq.${projectId}&user_id=eq.${encodeURIComponent(context.user.id)}`,
        body: payload,
        prefer: 'return=representation',
      });

      if (!result.ok) {
        return sendJson(res, result.status, { error: mapSupabaseError(result.data) });
      }

      return sendJson(res, 200, { project: Array.isArray(result.data) ? result.data[0] || null : null });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || 'Request oxunarkən xəta oldu.' });
    }
  }

  if (projectId && req.method === 'DELETE') {
    const context = await requireAuth(req, res);
    if (!context) return;

    const result = await supabaseTableRequest({
      token: context.token,
      method: 'DELETE',
      table: 'projects',
      query: `id=eq.${projectId}&user_id=eq.${encodeURIComponent(context.user.id)}`,
    });

    if (!result.ok) {
      return sendJson(res, result.status, { error: mapSupabaseError(result.data) });
    }

    return sendJson(res, 200, { message: 'Layihə silindi.' });
  }

  const projectItemsId = parseIdFromPath(pathname, /^\/api\/projects\/(\d+)\/items$/);
  if (projectItemsId && req.method === 'GET') {
    const context = await requireAuth(req, res);
    if (!context) return;

    const result = await supabaseTableRequest({
      token: context.token,
      method: 'GET',
      table: 'project_items',
      query: `select=id,project_id,warehouse_id,product_id,name,days,price_per_day,cost_per_day,start_date,end_date,provider,total,cost_total,type,created_at&project_id=eq.${projectItemsId}&user_id=eq.${encodeURIComponent(context.user.id)}&order=created_at.asc`,
    });

    if (!result.ok) {
      return sendJson(res, result.status, { error: mapSupabaseError(result.data) });
    }

    return sendJson(res, 200, { items: result.data || [] });
  }

  if (projectItemsId && req.method === 'POST') {
    const context = await requireAuth(req, res);
    if (!context) return;

    try {
      const body = await readJsonBody(req);
      const payload = mapProjectItemBody(body, projectItemsId, context.user.id);
      if (!payload.name) {
        return sendJson(res, 400, { error: 'Item adı mütləqdir.' });
      }

      const result = await supabaseTableRequest({
        token: context.token,
        method: 'POST',
        table: 'project_items',
        body: payload,
        prefer: 'return=representation',
      });

      if (!result.ok) {
        return sendJson(res, result.status, { error: mapSupabaseError(result.data) });
      }

      return sendJson(res, 201, { item: Array.isArray(result.data) ? result.data[0] || null : null });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || 'Request oxunarkən xəta oldu.' });
    }
  }

  const projectItemId = parseIdFromPath(pathname, /^\/api\/project-items\/(\d+)$/);
  if (projectItemId && req.method === 'PUT') {
    const context = await requireAuth(req, res);
    if (!context) return;

    try {
      const body = await readJsonBody(req);
      const payload = {
        warehouse_id: body.warehouseId ? toInt(body.warehouseId, 0) : null,
        product_id: body.productId ? toInt(body.productId, 0) : null,
        name: sanitizeText(body.name, 140),
        days: toInt(body.days, 1),
        price_per_day: toNumber(body.pricePerDay, 0),
        cost_per_day: toNumber(body.costPerDay, 0),
        start_date: body.startDate || null,
        end_date: body.endDate || null,
        provider: sanitizeText(body.provider, 120),
        total: toNumber(body.total, 0),
        cost_total: toNumber(body.costTotal, 0),
        type: sanitizeText(body.type, 40),
      };

      const result = await supabaseTableRequest({
        token: context.token,
        method: 'PATCH',
        table: 'project_items',
        query: `id=eq.${projectItemId}&user_id=eq.${encodeURIComponent(context.user.id)}`,
        body: payload,
        prefer: 'return=representation',
      });

      if (!result.ok) {
        return sendJson(res, result.status, { error: mapSupabaseError(result.data) });
      }

      return sendJson(res, 200, { item: Array.isArray(result.data) ? result.data[0] || null : null });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || 'Request oxunarkən xəta oldu.' });
    }
  }

  if (projectItemId && req.method === 'DELETE') {
    const context = await requireAuth(req, res);
    if (!context) return;

    const result = await supabaseTableRequest({
      token: context.token,
      method: 'DELETE',
      table: 'project_items',
      query: `id=eq.${projectItemId}&user_id=eq.${encodeURIComponent(context.user.id)}`,
    });

    if (!result.ok) {
      return sendJson(res, result.status, { error: mapSupabaseError(result.data) });
    }

    return sendJson(res, 200, { message: 'Item silindi.' });
  }

  if (req.method === 'POST' && pathname === '/api/migrate/localstorage') {
    const context = await requireAuth(req, res);
    if (!context) return;

    try {
      const body = await readJsonBody(req);
      const warehouses = Array.isArray(body.warehouses) ? body.warehouses : [];
      const productsByWarehouse = body.productsByWarehouse && typeof body.productsByWarehouse === 'object'
        ? body.productsByWarehouse
        : {};
      const projects = Array.isArray(body.projects) ? body.projects : [];

      const warehouseMap = new Map();
      const productMap = new Map();
      let migratedWarehouses = 0;
      let migratedProducts = 0;
      let migratedProjects = 0;
      let migratedItems = 0;

      for (const wh of warehouses) {
        const whInsert = await supabaseTableRequest({
          token: context.token,
          method: 'POST',
          table: 'warehouses',
          body: {
            user_id: context.user.id,
            name: sanitizeText(wh.name, 120),
            description: sanitizeText(wh.description, 600),
          },
          prefer: 'return=representation',
        });

        if (!whInsert.ok || !Array.isArray(whInsert.data) || !whInsert.data[0]) {
          continue;
        }

        const newWarehouse = whInsert.data[0];
        warehouseMap.set(String(wh.id), newWarehouse.id);
        migratedWarehouses += 1;
      }

      for (const [oldWarehouseId, products] of Object.entries(productsByWarehouse)) {
        const mappedWarehouseId = warehouseMap.get(String(oldWarehouseId));
        if (!mappedWarehouseId || !Array.isArray(products)) continue;

        for (const product of products) {
          const prInsert = await supabaseTableRequest({
            token: context.token,
            method: 'POST',
            table: 'products',
            body: mapProductBody(product, mappedWarehouseId, context.user.id),
            prefer: 'return=representation',
          });

          if (!prInsert.ok || !Array.isArray(prInsert.data) || !prInsert.data[0]) {
            continue;
          }

          const newProduct = prInsert.data[0];
          productMap.set(`${oldWarehouseId}:${product.id}`, newProduct.id);
          migratedProducts += 1;
        }
      }

      for (const project of projects) {
        const pjInsert = await supabaseTableRequest({
          token: context.token,
          method: 'POST',
          table: 'projects',
          body: mapProjectBody(project, context.user.id),
          prefer: 'return=representation',
        });

        if (!pjInsert.ok || !Array.isArray(pjInsert.data) || !pjInsert.data[0]) {
          continue;
        }

        const newProject = pjInsert.data[0];
        migratedProjects += 1;

        const items = Array.isArray(project.items) ? project.items : [];
        for (const item of items) {
          const oldWarehouseId = item.warehouseId ? String(item.warehouseId) : null;
          const mappedWarehouseId = oldWarehouseId ? warehouseMap.get(oldWarehouseId) : null;
          const mappedProductId = oldWarehouseId && item.productId
            ? productMap.get(`${oldWarehouseId}:${item.productId}`)
            : null;

          const itemBody = {
            ...item,
            warehouseId: mappedWarehouseId || null,
            productId: mappedProductId || null,
          };

          const itInsert = await supabaseTableRequest({
            token: context.token,
            method: 'POST',
            table: 'project_items',
            body: mapProjectItemBody(itemBody, newProject.id, context.user.id),
            prefer: 'return=representation',
          });

          if (itInsert.ok) {
            migratedItems += 1;
          }
        }
      }

      return sendJson(res, 200, {
        message: 'LocalStorage məlumatları köçürüldü.',
        summary: {
          warehouses: migratedWarehouses,
          products: migratedProducts,
          projects: migratedProjects,
          project_items: migratedItems,
        },
      });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || 'Migration xətası baş verdi.' });
    }
  }

  // Statik fayllar (React build)
  const BUILD_DIR = path.join(__dirname, '..', 'build');
  if (fs.existsSync(BUILD_DIR)) {
    const MIME = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
    };
    const ext = path.extname(pathname);
    // Fayl varsa birbaşa ver, yoxdursa SPA üçün index.html
    const filePath = ext
      ? path.join(BUILD_DIR, pathname)
      : path.join(BUILD_DIR, 'index.html');
    if (fs.existsSync(filePath)) {
      const mime = MIME[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      return fs.createReadStream(filePath).pipe(res);
    }
    // Fayl yoxdursa SPA fallback
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return fs.createReadStream(path.join(BUILD_DIR, 'index.html')).pipe(res);
  }

  return sendJson(res, 404, { error: 'Endpoint tapılmadı.' });
});

server.listen(PORT, () => {
  console.log(`Auth API işləyir: http://localhost:${PORT}`);
});
