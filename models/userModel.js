/**
 * Model Data Pengguna (Users) - NemuSnack
 * Mengelola operasi database PostgreSQL untuk akun Admin, Penjual, dan Pembeli
 */

const db = require('../config/db');
const bcrypt = require('bcryptjs');

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
      'SELECT id, name, email, role, phone, created_at, updated_at FROM users WHERE id = $1',
      [numericId]
    );
    return result.rows[0] || null;
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
  }
};

module.exports = userModel;
