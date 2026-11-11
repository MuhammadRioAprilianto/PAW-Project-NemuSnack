/**
 * Model Data Produk & Jajanan PKL - NemuSnack
 * Mengelola operasi database PostgreSQL untuk produk jajanan kaki lima
 */

const db = require('../config/db');

const productModel = {
  /**
   * Mengambil seluruh data jajanan PKL beserta rating dan data pedagang
   * @returns {Promise<Array>}
   */
  async getAllProducts() {
    const sql = `
      SELECT 
        p.*,
        u.name AS seller,
        COALESCE(ROUND(AVG(r.rating), 1), 5.0) AS rating,
        COUNT(r.id)::int AS "reviewsCount"
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN reviews r ON p.id = r.product_id
      GROUP BY p.id, u.name
      ORDER BY p.id ASC;
    `;
    const result = await db.query(sql);
    return result.rows.map(row => ({
      ...row,
      price: Number(row.price),
      rating: parseFloat(row.rating) || 5.0,
      lat: row.lat ? parseFloat(row.lat) : -7.7660,
      lng: row.lng ? parseFloat(row.lng) : 110.3800
    }));
  },

  /**
   * Mengambil data jajanan berdasarkan ID lengkap dengan ulasan
   * @param {number|string} id 
   * @returns {Promise<Object|null>}
   */
  async getProductById(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return null;

    const sql = `
      SELECT 
        p.*,
        u.name AS seller,
        u.email AS seller_email,
        u.phone AS seller_phone,
        COALESCE(ROUND(AVG(r.rating), 1), 5.0) AS rating,
        COUNT(r.id)::int AS "reviewsCount"
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.id = $1
      GROUP BY p.id, u.name, u.email, u.phone;
    `;
    const result = await db.query(sql, [numericId]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      price: Number(row.price),
      rating: parseFloat(row.rating) || 5.0,
      lat: row.lat ? parseFloat(row.lat) : -7.7660,
      lng: row.lng ? parseFloat(row.lng) : 110.3800
    };
  },

  /**
   * Menambahkan data produk baru ke database (Operasi Create)
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async createProduct(data) {
    const {
      seller_id,
      name,
      category = 'Lainnya',
      price = 0,
      status = 'Mangkal',
      location = '',
      route = '',
      lat = -7.7660,
      lng = 110.3800,
      whatsapp = '',
      description = '',
      image = '/assets/images/kebab-placeholder.svg'
    } = data;

    const sql = `
      INSERT INTO products (
        seller_id, name, category, price, status, location, route, lat, lng, whatsapp, description, image
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
    const params = [
      seller_id,
      name,
      category,
      parseInt(price, 10) || 0,
      status,
      location,
      route,
      parseFloat(lat) || -7.7660,
      parseFloat(lng) || 110.3800,
      whatsapp,
      description,
      image
    ];

    const result = await db.query(sql, params);
    return result.rows[0];
  },

  /**
   * Memperbarui data produk berdasarkan ID (Operasi Update)
   * @param {number|string} id 
   * @param {Object} data 
   * @returns {Promise<Object|null>}
   */
  async updateProduct(id, data) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return null;

    // Ambil data produk lama terlebih dahulu
    const existing = await this.getProductById(numericId);
    if (!existing) return null;

    const updated = {
      name: data.name !== undefined ? data.name : existing.name,
      category: data.category !== undefined ? data.category : existing.category,
      price: data.price !== undefined ? (parseInt(data.price, 10) || 0) : existing.price,
      status: data.status !== undefined ? data.status : existing.status,
      location: data.location !== undefined ? data.location : existing.location,
      route: data.route !== undefined ? data.route : existing.route,
      lat: data.lat !== undefined ? (parseFloat(data.lat) || -7.7660) : existing.lat,
      lng: data.lng !== undefined ? (parseFloat(data.lng) || 110.3800) : existing.lng,
      whatsapp: data.whatsapp !== undefined ? data.whatsapp : existing.whatsapp,
      description: data.description !== undefined ? data.description : existing.description,
      image: data.image !== undefined ? data.image : existing.image
    };

    const sql = `
      UPDATE products
      SET 
        name = $1,
        category = $2,
        price = $3,
        status = $4,
        location = $5,
        route = $6,
        lat = $7,
        lng = $8,
        whatsapp = $9,
        description = $10,
        image = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *;
    `;
    const params = [
      updated.name,
      updated.category,
      updated.price,
      updated.status,
      updated.location,
      updated.route,
      updated.lat,
      updated.lng,
      updated.whatsapp,
      updated.description,
      updated.image,
      numericId
    ];

    const result = await db.query(sql, params);
    return result.rows[0];
  },

  /**
   * Menghapus produk berdasarkan ID (Operasi Delete)
   * @param {number|string} id 
   * @returns {Promise<boolean>}
   */
  async deleteProduct(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return false;

    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id;', [numericId]);
    return result.rowCount > 0;
  },

  /**
   * Mengambil produk berdasarkan seller_id (Untuk Dashboard Penjual)
   * @param {number} sellerId 
   * @returns {Promise<Array>}
   */
  async getProductsBySeller(sellerId) {
    const sql = `
      SELECT 
        p.*,
        COALESCE(ROUND(AVG(r.rating), 1), 5.0) AS rating,
        COUNT(r.id)::int AS "reviewsCount"
      FROM products p
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.seller_id = $1
      GROUP BY p.id
      ORDER BY p.id DESC;
    `;
    const result = await db.query(sql, [sellerId]);
    return result.rows.map(row => ({
      ...row,
      price: Number(row.price),
      rating: parseFloat(row.rating) || 5.0,
      lat: row.lat ? parseFloat(row.lat) : -7.7660,
      lng: row.lng ? parseFloat(row.lng) : 110.3800
    }));
  },

  /**
   * Memperbarui status operasional dan lokasi dagang untuk semua produk penjual
   * @param {number} sellerId 
   * @param {Object} param1 
   */
  async updateSellerLocationAndStatus(sellerId, { status, location, route, lat, lng }) {
    const sql = `
      UPDATE products
      SET 
        status = COALESCE($1, status),
        location = COALESCE($2, location),
        route = COALESCE($3, route),
        lat = COALESCE($4, lat),
        lng = COALESCE($5, lng),
        updated_at = CURRENT_TIMESTAMP
      WHERE seller_id = $6
      RETURNING *;
    `;
    const result = await db.query(sql, [status, location, route, lat, lng, sellerId]);
    return result.rows;
  },

  /**
   * Pencarian produk berdasarkan query string (nama, kategori, deskripsi, lokasi, nama penjual)
   * Digunakan oleh fitur pencarian katalog dan asisten rekomendasi AI
   * @param {string} query 
   * @returns {Promise<Array>}
   */
  async searchProducts(query) {
    if (!query) {
      return this.getAllProducts();
    }
    const lower = `%${query.toLowerCase()}%`;
    const sql = `
      SELECT 
        p.*,
        u.name AS seller,
        COALESCE(ROUND(AVG(r.rating), 1), 5.0) AS rating,
        COUNT(r.id)::int AS "reviewsCount"
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE 
        LOWER(p.name) LIKE $1 OR
        LOWER(p.category) LIKE $1 OR
        LOWER(p.description) LIKE $1 OR
        LOWER(p.location) LIKE $1 OR
        LOWER(u.name) LIKE $1
      GROUP BY p.id, u.name
      ORDER BY p.id ASC;
    `;
    const result = await db.query(sql, [lower]);
    return result.rows.map(row => ({
      ...row,
      price: Number(row.price),
      rating: parseFloat(row.rating) || 5.0,
      lat: row.lat ? parseFloat(row.lat) : -7.7660,
      lng: row.lng ? parseFloat(row.lng) : 110.3800
    }));
  }
};

module.exports = productModel;
