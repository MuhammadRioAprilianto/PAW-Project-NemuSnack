/**
 * Migration: Add seller columns to users table and sync existing seller data
 */
require('dotenv').config();
const db = require('../config/db');

async function migrate() {
  console.log('Running migration: add seller columns to users table...');
  
  // 1. Alter users table
  await db.query(`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS shop_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS shop_description TEXT,
    ADD COLUMN IF NOT EXISTS shop_image VARCHAR(255) DEFAULT '/assets/images/hero-nemusnack.jpg',
    ADD COLUMN IF NOT EXISTS seller_status VARCHAR(50) DEFAULT 'Mangkal',
    ADD COLUMN IF NOT EXISTS seller_location VARCHAR(255) DEFAULT 'Area Sekitar Kampus',
    ADD COLUMN IF NOT EXISTS seller_route TEXT DEFAULT 'Standby sore hari',
    ADD COLUMN IF NOT EXISTS seller_route_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS seller_lat NUMERIC(10, 7) DEFAULT -7.7660,
    ADD COLUMN IF NOT EXISTS seller_lng NUMERIC(10, 7) DEFAULT 110.3800;
  `);

  console.log('✓ Columns added to users table');

  // 2. Populate seller data for existing sellers based on users.name and existing products
  const updateSellers = [
    {
      id: 2,
      shop_name: 'Lapak Gerobak Pak Yono',
      shop_description: 'Spesialis pisang cokelat lumer legendaris berbalut kulit lumpia renyah dengan lelehan cokelat melimpah dan taburan keju gurih.',
      shop_image: '/assets/images/snack-piscok.jpg',
      seller_status: 'Mangkal',
      seller_location: 'Jl. Kaliurang km 5 (Depan Apotek)',
      seller_route: 'Mangkal tetap mulai pukul 16.00 - 22.00 WIB',
      seller_lat: -7.7650,
      seller_lng: 110.3785
    },
    {
      id: 3,
      shop_name: 'Telur Gulung Mas Danang',
      shop_description: 'Jajanan telur gulung gurih berbalut bihun renyah dan sosis dengan bumbu balado pedas manis dan saus cabai racikan mantap.',
      shop_image: '/assets/images/snack-telur-gulung.jpg',
      seller_status: 'Sedang Berjalan',
      seller_location: 'Sekitar Pogung Raya -> Flamboyan',
      seller_route: 'Rute sore: Gerbang Asrama -> Pogung Baru -> Pogung Raya',
      seller_lat: -7.7625,
      seller_lng: 110.3805
    },
    {
      id: 4,
      shop_name: 'Tahu Gejrot Cirebon Bu Siti',
      shop_description: 'Tahu pong kopong renyah disiram kuah gula merah asam segar dengan ulekan cabai rawit hijau segar yang pedas nendang.',
      shop_image: '/assets/images/snack-tahu-gejrot.jpg',
      seller_status: 'Mangkal',
      seller_location: 'Depan Gerbang Barat Kampus',
      seller_route: 'Buka setiap sore mulai 15.30 WIB sampai habis',
      seller_lat: -7.7680,
      seller_lng: 110.3770
    },
    {
      id: 5,
      shop_name: 'Cireng Crispy Mang Asep',
      shop_description: 'Cireng renyah di luar kenyal di dalam dengan isian daging ayam suwir melimpah berbumbu rica-rica pedas harum daun jeruk.',
      shop_image: '/assets/images/snack-cireng.jpg',
      seller_status: 'Mangkal',
      seller_location: 'Pertigaan Mirota Kampus',
      seller_route: 'Standby dekat halte bus kampus',
      seller_lat: -7.7705,
      seller_lng: 110.3815
    },
    {
      id: 6,
      shop_name: 'Jasuke Lovers Mbak Rina',
      shop_description: 'Jagung manis pipil kukus hangat berpadu mentega wangi, susu kental manis legit, dan parutan keju mozzarella lumer melimpah.',
      shop_image: '/assets/images/snack-jasuke.jpg',
      seller_status: 'Mangkal',
      seller_location: 'Pojok Lapangan Lembah',
      seller_route: 'Mangkal setiap hari 16.00 - 21.30 WIB',
      seller_lat: -7.7690,
      seller_lng: 110.3840
    },
    {
      id: 7,
      shop_name: 'Martabak Mini Bang Jali',
      shop_description: 'Martabak manis mini bersarang lembut dengan aneka pilihan topping meses cokelat, keju parut, kacang sangrai, dan susu kental manis.',
      shop_image: '/assets/images/snack-martabak.jpg',
      seller_status: 'Sedang Berjalan',
      seller_location: 'Rute Lingkar Luar Kampus Terpadu',
      seller_route: 'Rute keliling: Kos Bougenville -> Lembah -> Pogung Baru',
      seller_lat: -7.7610,
      seller_lng: 110.3820
    }
  ];

  for (const s of updateSellers) {
    await db.query(`
      UPDATE users 
      SET 
        shop_name = COALESCE(NULLIF(shop_name, ''), $1),
        shop_description = COALESCE(NULLIF(shop_description, ''), $2),
        shop_image = CASE WHEN shop_image IS NULL OR shop_image = '/assets/images/hero-nemusnack.jpg' THEN $3 ELSE shop_image END,
        seller_status = CASE WHEN seller_status IS NULL OR seller_status = 'Mangkal' THEN COALESCE((SELECT p.status FROM products p WHERE p.seller_id = users.id ORDER BY p.id LIMIT 1), $4) ELSE seller_status END,
        seller_location = CASE WHEN seller_location IS NULL OR seller_location = 'Area Sekitar Kampus' THEN COALESCE((SELECT p.location FROM products p WHERE p.seller_id = users.id AND NULLIF(p.location, '') IS NOT NULL ORDER BY p.id LIMIT 1), $5) ELSE seller_location END,
        seller_route = CASE WHEN seller_route IS NULL OR seller_route IN ('Standby sore hari', 'Standby sore') THEN COALESCE((SELECT p.route FROM products p WHERE p.seller_id = users.id AND NULLIF(p.route, '') IS NOT NULL ORDER BY p.id LIMIT 1), $6) ELSE seller_route END,
        seller_lat = CASE WHEN seller_lat IS NULL OR seller_lat = -7.7660 THEN COALESCE((SELECT p.lat FROM products p WHERE p.seller_id = users.id ORDER BY p.id LIMIT 1), $7) ELSE seller_lat END,
        seller_lng = CASE WHEN seller_lng IS NULL OR seller_lng = 110.3800 THEN COALESCE((SELECT p.lng FROM products p WHERE p.seller_id = users.id ORDER BY p.id LIMIT 1), $8) ELSE seller_lng END
      WHERE id = $9;
    `, [s.shop_name, s.shop_description, s.shop_image, s.seller_status, s.seller_location, s.seller_route, s.seller_lat, s.seller_lng, s.id]);
  }

  // Set any other sellers with default shop_name = name
  await db.query(`
    UPDATE users 
    SET shop_name = name 
    WHERE role = 'penjual' AND (shop_name IS NULL OR shop_name = '');
  `);

  // Backfill any newly added seller profile fields from legacy product data, then sync the old columns.
  await db.query(`
    UPDATE users u SET
      seller_status = CASE WHEN u.seller_status IS NULL OR u.seller_status = 'Mangkal' THEN COALESCE((SELECT p.status FROM products p WHERE p.seller_id = u.id ORDER BY p.id LIMIT 1), u.seller_status) ELSE u.seller_status END,
      seller_location = CASE WHEN u.seller_location IS NULL OR u.seller_location = 'Area Sekitar Kampus' THEN COALESCE((SELECT p.location FROM products p WHERE p.seller_id = u.id AND NULLIF(p.location, '') IS NOT NULL ORDER BY p.id LIMIT 1), u.seller_location) ELSE u.seller_location END,
      seller_route = CASE WHEN u.seller_route IS NULL OR u.seller_route IN ('Standby sore hari', 'Standby sore') THEN COALESCE((SELECT p.route FROM products p WHERE p.seller_id = u.id AND NULLIF(p.route, '') IS NOT NULL ORDER BY p.id LIMIT 1), u.seller_route) ELSE u.seller_route END,
      seller_lat = CASE WHEN u.seller_lat IS NULL OR u.seller_lat = -7.7660 THEN COALESCE((SELECT p.lat FROM products p WHERE p.seller_id = u.id ORDER BY p.id LIMIT 1), u.seller_lat) ELSE u.seller_lat END,
      seller_lng = CASE WHEN u.seller_lng IS NULL OR u.seller_lng = 110.3800 THEN COALESCE((SELECT p.lng FROM products p WHERE p.seller_id = u.id ORDER BY p.id LIMIT 1), u.seller_lng) ELSE u.seller_lng END
    WHERE u.role = 'penjual';
  `);
  await db.query(`
    UPDATE products p SET
      status = u.seller_status,
      location = u.seller_location,
      route = u.seller_route,
      lat = u.seller_lat,
      lng = u.seller_lng
    FROM users u
    WHERE p.seller_id = u.id AND u.role = 'penjual';
  `);

  console.log('✓ Existing sellers and products synced');
  await db.pool.end();
  console.log('Migration completed successfully!');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
