/**
 * Model Data Pengguna (Users) - NemuSnack
 * Mengelola operasi database PostgreSQL untuk akun Admin, Penjual, dan Pembeli
 */

const db = require('../config/db');
const bcrypt = require('bcryptjs');
const normalizeSellerStatus = require('../utils/sellerStatus');

function normalizeRoutePoints(points) {
  if (typeof points === 'string') {
    try { points = JSON.parse(points); } catch { return []; }
  }
  if (!Array.isArray(points)) return [];
  return points.map(point => {
    const lat = Number(Array.isArray(point) ? point[0] : point.lat);
    const lng = Number(Array.isArray(point) ? point[1] : point.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
      ? [lat, lng]
      : null;
  }).filter(Boolean);
}

const userModel = {
  /**
   * Mencari user berdasarkan email
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    if (!email) return null;
    const result = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    return result.rows[0] || null;
  },

  /**
   * Mencari user berdasarkan ID
   * @param {number|string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return null;
    const result = await db.query(
      `SELECT
        id, name, email, role, phone,
        COALESCE(shop_name, name) AS shop_name,
        shop_description,
        COALESCE(shop_image, '/assets/images/hero-nemusnack.jpg') AS shop_image,
        COALESCE(seller_status, 'Mangkal') AS seller_status,
        COALESCE(seller_location, 'Area Sekitar Kampus') AS seller_location,
        COALESCE(seller_route, 'Standby sore hari') AS seller_route,
        COALESCE(seller_route_points, '[]'::jsonb) AS seller_route_points,
        seller_lat,
        seller_lng,
        created_at, updated_at
       FROM users WHERE id = $1`,
      [numericId]
    );
    if (!result.rows[0]) return null;
    const row = result.rows[0];
    return {
      ...row,
      seller_status: normalizeSellerStatus(row.seller_status),
      seller_route_points: normalizeRoutePoints(row.seller_route_points),
      seller_lat: row.seller_lat ? parseFloat(row.seller_lat) : -7.7660,
      seller_lng: row.seller_lng ? parseFloat(row.seller_lng) : 110.3800
    };
  },

  /**
   * Membuat user baru dengan password yang di-hash
   * @param {Object} userData
   * @returns {Promise<Object>}
   */
  async createUser({ name, email, password, role = 'pembeli', phone = '' }) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql = `
      INSERT INTO users (name, email, password, role, phone)
      VALUES ($1, LOWER($2), $3, $4, $5)
      RETURNING id, name, email, role, phone, created_at;
    `;
    const result = await db.query(sql, [name.trim(), email.trim(), hashedPassword, role, phone.trim()]);
    return result.rows[0];
  },

  /**
   * Memverifikasi kecocokan password plaintext dengan hash
   * @param {string} plainPassword
   * @param {string} hashedPassword
   * @returns {Promise<boolean>}
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  /**
   * Mengambil semua user (Untuk Dashboard Admin)
   * @returns {Promise<Array>}
   */
  async getAllUsers() {
    const sql = `
      SELECT
        u.id, u.name, u.email, u.role, u.phone, u.created_at,
        COUNT(p.id)::int AS "productCount"
      FROM users u
      LEFT JOIN products p ON u.id = p.seller_id
      GROUP BY u.id
      ORDER BY u.id ASC;
    `;
    const result = await db.query(sql);
    return result.rows;
  },

  /**
   * Mengubah role pengguna (Khusus Admin)
   * @param {number} id
   * @param {string} role
   * @returns {Promise<Object|null>}
   */
  async updateRole(id, role) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return null;

    const result = await db.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, role;',
      [role, numericId]
    );
    return result.rows[0] || null;
  },

  /**
   * Menghapus akun user (Khusus Admin)
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async deleteUser(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return false;

    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id;', [numericId]);
    return result.rowCount > 0;
  },

  /**
   * Mengambil statistik ringkasan dashboard Admin
   * @returns {Promise<Object>}
   */
  async getDashboardStats() {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM users) AS "totalUsers",
        (SELECT COUNT(*) FROM users WHERE role = 'penjual') AS "totalSellers",
        (SELECT COUNT(*) FROM users WHERE role = 'pembeli') AS "totalBuyers",
        (SELECT COUNT(*) FROM products) AS "totalProducts",
        (SELECT COUNT(*) FROM reviews) AS "totalReviews",
        (SELECT COUNT(*) FROM activity_logs) AS "totalLogs";
    `;
    const result = await db.query(sql);
    const row = result.rows[0];
    return {
      totalUsers: parseInt(row.totalUsers, 10) || 0,
      totalSellers: parseInt(row.totalSellers, 10) || 0,
      totalBuyers: parseInt(row.totalBuyers, 10) || 0,
      totalProducts: parseInt(row.totalProducts, 10) || 0,
      totalReviews: parseInt(row.totalReviews, 10) || 0,
      totalLogs: parseInt(row.totalLogs, 10) || 0
    };
  },

  /**
   * Mengambil semua pedagang/lapak PKL beserta agregasi rating dan katalog produk
   * @returns {Promise<Array>}
   */
  async getAllSellers() {
    const sql = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        COALESCE(u.shop_name, u.name) AS shop_name,
        COALESCE(u.shop_description, 'Lapak jajanan kaki lima mitra resmi NemuSnack') AS shop_description,
        COALESCE(u.shop_image, '/assets/images/hero-nemusnack.jpg') AS shop_image,
        COALESCE(u.seller_status, 'Mangkal') AS seller_status,
        COALESCE(u.seller_location, 'Area Sekitar Kampus') AS seller_location,
        COALESCE(u.seller_route, 'Standby sore hari') AS seller_route,
        COALESCE(u.seller_route_points, '[]'::jsonb) AS seller_route_points,
        COALESCE(u.seller_lat, -7.7660) AS lat,
        COALESCE(u.seller_lng, 110.3800) AS lng,
        COUNT(DISTINCT p.id)::int AS "productCount",
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS rating,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT p.category), NULL) AS categories,
        COUNT(DISTINCT r.id)::int AS "reviewsCount"
      FROM users u
      LEFT JOIN products p ON u.id = p.seller_id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE u.role = 'penjual'
      GROUP BY u.id
      ORDER BY u.id ASC;
    `;
    const result = await db.query(sql);
    return result.rows.map(row => ({
      ...row,
      seller_status: normalizeSellerStatus(row.seller_status),
      seller_route_points: normalizeRoutePoints(row.seller_route_points),
      lat: row.lat ? parseFloat(row.lat) : -7.7660,
      lng: row.lng ? parseFloat(row.lng) : 110.3800,
      rating: parseFloat(row.rating) || 0,
      categories: row.categories || []
    }));
  },

  /**
   * Mengambil satu pedagang/lapak secara mendalam berdasarkan ID
   * @param {number|string} id
   * @returns {Promise<Object|null>}
   */
  async getSellerById(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return null;

    const sql = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        COALESCE(u.shop_name, u.name) AS shop_name,
        COALESCE(u.shop_description, 'Lapak jajanan kaki lima mitra resmi NemuSnack') AS shop_description,
        COALESCE(u.shop_image, '/assets/images/hero-nemusnack.jpg') AS shop_image,
        COALESCE(u.seller_status, 'Mangkal') AS seller_status,
        COALESCE(u.seller_location, 'Area Sekitar Kampus') AS seller_location,
        COALESCE(u.seller_route, 'Standby sore hari') AS seller_route,
        COALESCE(u.seller_route_points, '[]'::jsonb) AS seller_route_points,
        COALESCE(u.seller_lat, -7.7660) AS lat,
        COALESCE(u.seller_lng, 110.3800) AS lng,
        COUNT(DISTINCT p.id)::int AS "productCount",
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS rating,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT p.category), NULL) AS categories,
        COUNT(DISTINCT r.id)::int AS "reviewsCount"
      FROM users u
      LEFT JOIN products p ON u.id = p.seller_id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE u.id = $1 AND u.role = 'penjual'
      GROUP BY u.id;
    `;
    const result = await db.query(sql, [numericId]);
    if (result.rows.length === 0) return null;

    const seller = result.rows[0];
    seller.seller_status = normalizeSellerStatus(seller.seller_status);

    // Ambil produk-produk milik seller ini
    const productsRes = await db.query(`
      SELECT
        p.*,
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS rating,
        COUNT(r.id)::int AS "reviewsCount"
      FROM products p
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.seller_id = $1
      GROUP BY p.id
      ORDER BY p.id ASC;
    `, [numericId]);

    seller.products = productsRes.rows.map(p => ({
      ...p,
      price: Number(p.price),
      rating: parseFloat(p.rating) || 0
    }));

    seller.seller_route_points = normalizeRoutePoints(seller.seller_route_points);
    seller.categories = seller.categories || [];
    seller.lat = seller.lat ? parseFloat(seller.lat) : -7.7660;
    seller.lng = seller.lng ? parseFloat(seller.lng) : 110.3800;
    seller.rating = parseFloat(seller.rating) || 0;

    return seller;
  },

  /**
   * Mengambil data lapak/pedagang aktif untuk pemetaan peta (1 pin per lapak)
   * Hanya menampilkan pedagang yang statusnya sedang beroperasi (Mangkal / Sedang Berjalan)
   * Lapak dengan status 'Tutup' atau 'Libur' otomatis disembunyikan dari peta.
   * @returns {Promise<Array>}
   */
  async getActiveSellersForMap() {
    const sql = `
      SELECT
        u.id,
        u.name,
        u.phone,
        COALESCE(u.shop_name, u.name) AS shop_name,
        COALESCE(u.shop_description, 'Lapak jajanan terverifikasi') AS shop_description,
        COALESCE(u.shop_image, '/assets/images/hero-nemusnack.jpg') AS shop_image,
        COALESCE(u.seller_status, 'Mangkal') AS seller_status,
        COALESCE(u.seller_location, 'Area Sekitar Kampus') AS seller_location,
        COALESCE(u.seller_route, 'Standby sore') AS seller_route,
        COALESCE(u.seller_route_points, '[]'::jsonb) AS seller_route_points,
        COALESCE(u.seller_lat, -7.7660) AS lat,
        COALESCE(u.seller_lng, 110.3800) AS lng,
        COUNT(DISTINCT p.id)::int AS "productCount",
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS rating,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT p.category), NULL) AS categories,
        COUNT(DISTINCT r.id)::int AS "reviewsCount"
      FROM users u
      LEFT JOIN products p ON u.id = p.seller_id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE u.role = 'penjual'
        AND COALESCE(u.seller_status, 'Mangkal') IN ('Mangkal', 'Sedang Berjalan', 'Berjalan')
      GROUP BY u.id
      ORDER BY u.id ASC;
    `;
    const result = await db.query(sql);

    // Ambil daftar ringkas produk untuk setiap lapak
    const sellers = [];
    for (const row of result.rows) {
      const prodRes = await db.query(`
        SELECT id, name, price, category, image
        FROM products
        WHERE seller_id = $1
        ORDER BY id ASC
        LIMIT 4;
      `, [row.id]);

      sellers.push({
        ...row,
        seller_status: normalizeSellerStatus(row.seller_status),
        seller_route_points: normalizeRoutePoints(row.seller_route_points),
        lat: row.lat ? parseFloat(row.lat) : -7.7660,
        lng: row.lng ? parseFloat(row.lng) : 110.3800,
        rating: parseFloat(row.rating) || 0,
        categories: row.categories || [],
        products: prodRes.rows.map(p => ({ ...p, price: Number(p.price) }))
      });
    }

    return sellers;
  },

  /**
   * Memperbarui status operasional dan lokasi lapak pedagang
   * @param {number} sellerId
   * @param {Object} data
   */
  async updateSellerStatusAndLocation(sellerId, { status, location, route, lat, lng, routePoints }) {
    const numericId = parseInt(sellerId, 10);
    const routePointsJson = Array.isArray(routePoints)
      ? JSON.stringify(normalizeRoutePoints(routePoints))
      : null;
    const sql = `
      UPDATE users
      SET
        seller_status = COALESCE($1, seller_status),
        seller_location = COALESCE($2, seller_location),
        seller_route = COALESCE($3, seller_route),
        seller_lat = COALESCE($4, seller_lat),
        seller_lng = COALESCE($5, seller_lng),
        seller_route_points = COALESCE($6::jsonb, seller_route_points, '[]'::jsonb),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND role = 'penjual'
      RETURNING *;
    `;
    const params = [
      status || null,
      location || null,
      route || null,
      lat !== undefined && lat !== null && lat !== '' ? parseFloat(lat) : null,
      lng !== undefined && lng !== null && lng !== '' ? parseFloat(lng) : null,
      routePointsJson,
      numericId
    ];
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(sql, params);
      if (!result.rows[0]) {
        await client.query('ROLLBACK');
        return null;
      }

      // Kolom produk tetap disinkronkan agar integrasi lama yang membacanya tetap konsisten.
      await client.query(`
        UPDATE products
        SET
          status = COALESCE($1, status),
          location = COALESCE($2, location),
          route = COALESCE($3, route),
          lat = COALESCE($4, lat),
          lng = COALESCE($5, lng),
          updated_at = CURRENT_TIMESTAMP
        WHERE seller_id = $6;
      `, [
        status || null,
        location || null,
        route || null,
        lat !== undefined && lat !== null && lat !== '' ? parseFloat(lat) : null,
        lng !== undefined && lng !== null && lng !== '' ? parseFloat(lng) : null,
        numericId
      ]);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Memperbarui profil lapak pedagang (Nama Lapak, Deskripsi, Foto, Kontak)
   * @param {number} sellerId
   * @param {Object} data
   */
  async updateSellerProfile(sellerId, { shop_name, shop_description, shop_image, phone }) {
    const numericId = parseInt(sellerId, 10);
    const sql = `
      UPDATE users
      SET
        shop_name = COALESCE($1, shop_name),
        shop_description = COALESCE($2, shop_description),
        shop_image = COALESCE($3, shop_image),
        phone = COALESCE($4, phone),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND role = 'penjual'
      RETURNING *;
    `;
    const params = [shop_name || null, shop_description || null, shop_image || null, phone || null, numericId];
    const result = await db.query(sql, params);
    return result.rows[0];
  }
};

module.exports = userModel;
