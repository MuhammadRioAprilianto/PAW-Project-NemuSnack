/**
 * Model Data Ulasan & Rating - NemuSnack
 * Mengelola operasi database PostgreSQL untuk rating dan komentar dari Pembeli
 */

const db = require('../config/db');

const reviewModel = {
  /**
   * Menambahkan ulasan dan rating baru untuk produk
   * @param {Object} param0 
   * @returns {Promise<Object>}
   */
  async createReview({ productId, userId, rating, comment }) {
    const sql = `
      INSERT INTO reviews (product_id, user_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const params = [
      parseInt(productId, 10),
      parseInt(userId, 10),
      Math.min(5, Math.max(1, parseInt(rating, 10) || 5)),
      comment.trim()
    ];
    const result = await db.query(sql, params);
    return result.rows[0];
  },

  /**
   * Mengambil seluruh ulasan untuk satu produk tertentu
   * @param {number|string} productId 
   * @returns {Promise<Array>}
   */
  async getByProductId(productId) {
    const sql = `
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.id AS user_id,
        u.name AS user_name,
        u.role AS user_role
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC;
    `;
    const result = await db.query(sql, [parseInt(productId, 10)]);
    return result.rows;
  },

  /**
   * Mengambil ulasan untuk semua produk yang dimiliki oleh seorang penjual
   * Digunakan pada Dashboard Penjual
   * @param {number|string} sellerId 
   * @returns {Promise<Array>}
   */
  async getBySellerId(sellerId) {
    const sql = `
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        p.id AS product_id,
        p.name AS product_name,
        p.image AS product_image,
        u.name AS reviewer_name,
        u.email AS reviewer_email
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      JOIN users u ON r.user_id = u.id
      WHERE p.seller_id = $1
      ORDER BY r.created_at DESC;
    `;
    const result = await db.query(sql, [parseInt(sellerId, 10)]);
    return result.rows;
  },

  /**
   * Mengambil semua ulasan untuk Admin Dashboard
   * @returns {Promise<Array>}
   */
  async getAllReviews() {
    const sql = `
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        p.name AS product_name,
        u.name AS reviewer_name
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
      LIMIT 100;
    `;
    const result = await db.query(sql);
    return result.rows;
  },

  /**
   * Menghapus ulasan berdasarkan ID
   * @param {number|string} id 
   * @returns {Promise<boolean>}
   */
  async deleteReview(id) {
    const result = await db.query('DELETE FROM reviews WHERE id = $1 RETURNING id;', [parseInt(id, 10)]);
    return result.rowCount > 0;
  }
};

module.exports = reviewModel;
