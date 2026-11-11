/**
 * Middleware Logger - NemuSnack
 * Mencatat setiap request HTTP yang diterima backend beserta status akhir response.
 * Informasi yang didokumentasikan dalam format JSON:
 * - Metode HTTP (GET, POST, PUT, DELETE, dsb.)
 * - Path / Endpoint yang diakses
 * - Status response HTTP (200, 201, 302, 400, 404, 500, dsb.)
 * - Timestamp / Waktu request
 * - Waktu pemrosesan (response time dalam ms)
 * - Request Payload / Form Body (tersanitasi)
 * - Response Data / JSON Body
 */

const db = require('../config/db');

// In-Memory Ring Buffer untuk aksi terbaru (maksimal 50 log terakhir)
const memoryLogs = [];

// ANSI Color codes untuk visualisasi terminal yang rapi
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

const getStatusColor = (status) => {
  if (status >= 500) return colors.red;
  if (status >= 400) return colors.yellow;
  if (status >= 300) return colors.cyan;
  if (status >= 200) return colors.green;
  return colors.reset;
};

const getMethodColor = (method) => {
  switch (method) {
    case 'GET': return colors.cyan;
    case 'POST': return colors.green;
    case 'PUT': return colors.yellow;
    case 'DELETE': return colors.red;
    default: return colors.magenta;
  }
};

/**
 * Sanitasi data request agar password/kredensial rahasia tidak terekspos dalam log
 */
const sanitizePayload = (data) => {
  if (!data || typeof data !== 'object') return data;
  const clone = Array.isArray(data) ? [...data] : { ...data };
  for (const key of Object.keys(clone)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('pass') || lowerKey.includes('secret') || lowerKey.includes('token')) {
      clone[key] = '••••••••';
    } else if (typeof clone[key] === 'object' && clone[key] !== null) {
      clone[key] = sanitizePayload(clone[key]);
    }
  }
  return clone;
};

/**
 * Penentuan nama aksi yang deskriptif dan manusiawi berdasarkan route & method
 */
const determineActionName = (method, url) => {
  // Auth
  if (url === '/register') return method === 'POST' ? 'Daftar Akun Baru (POST)' : 'Buka Halaman Register (GET)';
  if (url === '/login') return method === 'POST' ? 'Autentikasi Masuk Akun (POST)' : 'Buka Halaman Login (GET)';
  if (url === '/logout') return 'Keluar Akun / Logout';

  // API Produk
  if (url === '/api/produk') {
    if (method === 'GET') return 'Ambil Seluruh Katalog Jajanan (GET)';
    if (method === 'POST') return 'Tambah Jajanan Baru (POST)';
  }
  if (url.startsWith('/api/produk/')) {
    if (url.endsWith('/reviews') && method === 'POST') return `Kirim Ulasan & Rating Jajanan (${url})`;
    if (method === 'GET') return `Ambil Detail Jajanan by ID (${url})`;
    if (method === 'PUT') return `Perbarui Data Jajanan (${url})`;
    if (method === 'DELETE') return `Hapus Data Jajanan (${url})`;
  }

  // API lainnya
  if (url.startsWith('/api/rekomendasi')) return 'Pencarian Rekomendasi Jajanan AI (GET)';
  if (url.startsWith('/api/status')) return 'Pemeriksaan Status Server API (GET)';
  if (url.startsWith('/api/logs')) return 'Ambil Riwayat Activity Logs (GET)';

  // Penjual Dashboard & Operasi
  if (url === '/penjual/dashboard') return 'Akses Dashboard Lapak Penjual (GET)';
  if (url === '/penjual/status-location') return 'Perbarui Status Bekerja & Posisi Lapak (POST)';
  if (url === '/penjual/products') return 'Tambah Menu Jajanan Penjual (POST)';
  if (url.startsWith('/penjual/products/') && url.endsWith('/edit')) return method === 'POST' ? 'Simpan Perubahan Menu Penjual (POST)' : 'Buka Form Edit Menu (GET)';
  if (url.startsWith('/penjual/products/') && url.endsWith('/delete')) return 'Hapus Menu Jajanan Penjual (POST)';

  // Admin Dashboard & Operasi
  if (url === '/admin/dashboard') return 'Akses Dashboard Monitoring Admin (GET)';
  if (url.startsWith('/admin/users/') && url.endsWith('/role')) return 'Ubah Role Pengguna oleh Admin (POST)';
  if (url.startsWith('/admin/users/') && url.endsWith('/delete')) return 'Hapus Pengguna oleh Admin (POST)';
  if (url.startsWith('/admin/products/') && url.endsWith('/delete')) return 'Moderasi Hapus Jajanan oleh Admin (POST)';

  // Halaman Publik
  if (url === '/') return 'Akses Halaman Utama / Home (GET)';
  if (url === '/menu' || url.startsWith('/menu?')) return 'Akses Katalog Jajanan PKL (GET)';
  if (url.startsWith('/produk/')) return `Lihat Detail Jajanan (${url})`;

  return `${method} ${url}`;
};

const loggerMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const requestDate = new Date();

  // 1. Tangkap response data yang dikirim Express (JSON, Redirect, atau View)
  const originalJson = res.json;
  const originalSend = res.send;
  const originalRedirect = res.redirect;
  const originalRender = res.render;

  let capturedResponseData = null;

  res.json = function(data) {
    capturedResponseData = data;
    return originalJson.apply(this, arguments);
  };

  res.redirect = function(url) {
    capturedResponseData = {
      redirect: true,
      targetUrl: url,
      statusCode: res.statusCode || 302,
      statusMessage: 'Navigasi dialihkan (Redirect)',
      message: `Aksi ${req.method} ${req.originalUrl} berhasil diproses, browser dialihkan ke: ${url}`
    };
    return originalRedirect.apply(this, arguments);
  };

  res.render = function(view, options) {
    // Simpan metadata EJS view yang dirender dalam format JSON ringkas
    capturedResponseData = {
      view: view,
      statusCode: res.statusCode || 200,
      title: (options && options.title) || view,
      error: (options && options.error) || null,
      success: (options && options.success) || null
    };
    return originalRender.apply(this, arguments);
  };

  res.send = function(body) {
    if (!capturedResponseData) {
      if (typeof body === 'object') {
        capturedResponseData = body;
      } else if (typeof body === 'string') {
        if (body.startsWith('{') || body.startsWith('[')) {
          try { capturedResponseData = JSON.parse(body); } catch (_) { capturedResponseData = { data: body }; }
        } else if (body.startsWith('<!DOCTYPE') || body.startsWith('<html')) {
          capturedResponseData = {
            type: 'HTML Document',
            contentLength: body.length,
            statusCode: res.statusCode
          };
        } else {
          capturedResponseData = { message: body, statusCode: res.statusCode };
        }
      }
    }
    return originalSend.apply(this, arguments);
  };

  // 2. Saat response selesai dikirim (res.on('finish'))
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const timestamp = requestDate.toISOString();
    const methodColor = getMethodColor(req.method);
    const statusColor = getStatusColor(res.statusCode);

    // Format log terminal sesuai spesifikasi:
    // [TIMESTAMP] METHOD PATH - STATUS (DURATION ms)
    console.log(
      `${colors.gray}[${timestamp}]${colors.reset} ` +
      `${methodColor}${req.method}${colors.reset} ` +
      `${req.originalUrl} - ` +
      `${statusColor}${res.statusCode}${colors.reset} ` +
      `${colors.gray}(${duration}ms)${colors.reset}`
    );

    // Filter aset statis
    const isStaticAsset = req.originalUrl.startsWith('/assets') || 
                          req.originalUrl.endsWith('.ico') || 
                          req.originalUrl.endsWith('.css') || 
                          req.originalUrl.endsWith('.js') ||
                          req.originalUrl.endsWith('.png') ||
                          req.originalUrl.endsWith('.jpg');

    if (!isStaticAsset) {
      const user = req.session ? req.session.user : null;
      const userId = user ? user.id : null;
      const userEmail = user ? user.email : null;
      const userRole = user ? user.role : 'guest';
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

      const actionName = determineActionName(req.method, req.originalUrl);

      // Tentukan request payload dalam format JSON bersih
      let payload = null;
      if (req.body && Object.keys(req.body).length > 0) {
        payload = sanitizePayload(req.body);
      } else if (req.query && Object.keys(req.query).length > 0) {
        payload = sanitizePayload(req.query);
      } else {
        payload = { info: 'Tidak ada parameter body/query dalam request' };
      }

      const responseJson = capturedResponseData || {
        statusCode: res.statusCode,
        statusMessage: res.statusMessage || 'OK'
      };

      const logRecord = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        timestamp,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        action: actionName,
        user_email: userEmail,
        user_role: userRole,
        ip,
        request_payload: payload,
        response_data: responseJson
      };

      // Tambahkan ke in-memory ring buffer (paling baru di index 0)
      memoryLogs.unshift(logRecord);
      if (memoryLogs.length > 50) memoryLogs.pop();

      // Simpan log terakhir ke session agar halaman tujuan redirect langsung bisa membacanya
      if (req.session) {
        req.session.lastActivityLog = logRecord;
      }

      // Catat ke PostgreSQL activity_logs secara asinkron
      db.query(
        `INSERT INTO activity_logs (user_id, user_email, user_role, method, path, status_code, duration, request_payload, response_data, action, ip)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          userId, 
          userEmail, 
          userRole, 
          req.method, 
          req.originalUrl, 
          res.statusCode, 
          duration, 
          JSON.stringify(payload), 
          JSON.stringify(responseJson), 
          actionName, 
          ip
        ]
      ).catch(() => {
        // Jangan menghentikan alur aplikasi jika log ke database gagal
      });
    }
  });

  next();
};

loggerMiddleware.getMemoryLogs = () => memoryLogs;
loggerMiddleware.getLatestMemoryLog = () => memoryLogs.length > 0 ? memoryLogs[0] : null;

module.exports = loggerMiddleware;
