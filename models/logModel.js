/**
 * Model Data Log Aktivitas - NemuSnack
 * Mengelola riwayat akses dan aksi pengguna untuk pemantauan Admin
 */

const db = require('../config/db');

const parseJsonSafely = (val) => {
  if (!val) return null;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (_) {
    return val;
  }
};

const logModel = {
  /**
   * Mengambil log aktivitas terbaru dengan payload & response terurai
   * @param {number} limit 
   * @returns {Promise<Array>}
   */
  async getRecentLogs(limit = 100) {
    const sql = `
      SELECT *
      FROM activity_logs
      ORDER BY id DESC
      LIMIT $1;
    `;
    const result = await db.query(sql, [limit]);
    return result.rows.map(row => ({
      ...row,
      request_payload: parseJsonSafely(row.request_payload),
      response_data: parseJsonSafely(row.response_data)
    }));
  },

  /**
   * Mengambil satu log aktivitas paling akhir
   * @returns {Promise<Object|null>}
   */
  async getLatestLog() {
    const sql = `
      SELECT *
      FROM activity_logs
      ORDER BY id DESC
      LIMIT 1;
    `;
    const result = await db.query(sql);
    if (!result.rows || result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      ...row,
      request_payload: parseJsonSafely(row.request_payload),
      response_data: parseJsonSafely(row.response_data)
    };
  },

  /**
   * Mengambil statistik ringkas aktivitas
   * @returns {Promise<Object>}
   */
  async getMethodBreakdown() {
    const sql = `
      SELECT method, COUNT(*)::int AS count
      FROM activity_logs
      GROUP BY method
      ORDER BY count DESC;
    `;
    const result = await db.query(sql);
    return result.rows;
  }
};

module.exports = logModel;
