-- ====================================================
-- Database Schema & Seed Data - NemuSnack (PostgreSQL)
-- ====================================================

-- 1. Drop existing tables if re-seeding
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Create Table: users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'pembeli' CHECK (role IN ('admin', 'penjual', 'pembeli')),
    phone VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Table: products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Lainnya',
    price INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'Mangkal',
    location VARCHAR(255),
    route TEXT,
    lat NUMERIC(10, 7) DEFAULT -7.7660,
    lng NUMERIC(10, 7) DEFAULT 110.3800,
    whatsapp VARCHAR(30),
    description TEXT,
    image VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Table: reviews
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Table: activity_logs (For Admin Activity / Event Monitoring)
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(150),
    user_role VARCHAR(20),
    method VARCHAR(10) NOT NULL,
    path VARCHAR(255) NOT NULL,
    status_code INTEGER,
    duration INTEGER,
    request_payload TEXT,
    response_data TEXT,
    action VARCHAR(255),
    ip VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================
-- SEED DATA
-- Default password for all users: 'password123'
-- Hash: $2b$10$Inr4yfXUZmXNVNyLuc01ROe1QXE5S1dYoOPnChYsq0gVxh6d4uM7W
-- ====================================================

-- Insert Users
INSERT INTO users (id, name, email, password, role, phone) VALUES
(1, 'Admin NemuSnack', 'admin@nemusnack.id', '$2b$10$Inr4yfXUZmXNVNyLuc01ROe1QXE5S1dYoOPnChYsq0gVxh6d4uM7W', 'admin', '081200000001'),
(2, 'Lapak Gerobak Pak Yono', 'pakyono@nemusnack.id', '$2b$10$Inr4yfXUZmXNVNyLuc01ROe1QXE5S1dYoOPnChYsq0gVxh6d4uM7W', 'penjual', '6281234567890'),
(3, 'Telur Gulung Mas Danang', 'masdanang@nemusnack.id', '$2b$10$Inr4yfXUZmXNVNyLuc01ROe1QXE5S1dYoOPnChYsq0gVxh6d4uM7W', 'penjual', '6281234567891'),
(4, 'Tahu Gejrot Cirebon Bu Siti', 'busiti@nemusnack.id', '$2b$10$Inr4yfXUZmXNVNyLuc01ROe1QXE5S1dYoOPnChYsq0gVxh6d4uM7W', 'penjual', '6281234567892'),
(5, 'Cireng Crispy Mang Asep', 'mangasep@nemusnack.id', '$2b$10$Inr4yfXUZmXNVNyLuc01ROe1QXE5S1dYoOPnChYsq0gVxh6d4uM7W', 'penjual', '6281234567893'),
(6, 'Jasuke Lovers Mbak Rina', 'mbakrina@nemusnack.id', '$2b$10$Inr4yfXUZmXNVNyLuc01ROe1QXE5S1dYoOPnChYsq0gVxh6d4uM7W', 'penjual', '6281234567894'),
(7, 'Martabak Mini Bang Jali', 'bangjali@nemusnack.id', '$2b$10$Inr4yfXUZmXNVNyLuc01ROe1QXE5S1dYoOPnChYsq0gVxh6d4uM7W', 'penjual', '6281234567895'),
(8, 'Budi Santoso', 'budi@gmail.com', '$2b$10$Inr4yfXUZmXNVNyLuc01ROe1QXE5S1dYoOPnChYsq0gVxh6d4uM7W', 'pembeli', '081299999991'),
(9, 'Siti Rahma', 'siti@gmail.com', '$2b$10$Inr4yfXUZmXNVNyLuc01ROe1QXE5S1dYoOPnChYsq0gVxh6d4uM7W', 'pembeli', '081299999992');

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Insert Products
INSERT INTO products (id, seller_id, name, category, price, status, location, route, lat, lng, whatsapp, description, image) VALUES
(1, 2, 'Pisang Cokelat Lumer Pak Yono', 'Manis', 12000, 'Mangkal', 'Jl. Kaliurang km 5 (Depan Apotek)', 'Mangkal tetap mulai pukul 16.00 - 22.00 WIB', -7.7650, 110.3785, '6281234567890', 'Pisang cokelat lumer legendaris berbalut kulit lumpia renyah dengan lelehan cokelat melimpah dan taburan keju gurih khas Pak Yono.', '/assets/images/snack-piscok.jpg'),
(2, 3, 'Telur Gulung Crispy Mas Danang', 'Gurih', 10000, 'Sedang Berjalan', 'Sekitar Pogung Raya -> Flamboyan', 'Rute sore: Gerbang Asrama -> Pogung Baru -> Pogung Raya', -7.7625, 110.3805, '6281234567891', 'Telur gulung gurih berbalut bihun renyah dan sosis dengan taburan bumbu balado pedas manis serta saus cabai racikan mantap.', '/assets/images/snack-telur-gulung.jpg'),
(3, 4, 'Tahu Gejrot Pedas Nampol Bu Siti', 'Pedas', 10000, 'Mangkal', 'Depan Gerbang Barat Kampus', 'Buka setiap sore mulai 15.30 WIB sampai habis', -7.7680, 110.3770, '6281234567892', 'Tahu pong kopong renyah disiram kuah gula merah asam segar dengan ulekan cabai rawit hijau segar yang pedas nendang.', '/assets/images/snack-tahu-gejrot.jpg'),
(4, 5, 'Cireng Isi Ayam Suwir Mang Asep', 'Pedas', 15000, 'Mangkal', 'Pertigaan Mirota Kampus', 'Standby dekat halte bus kampus', -7.7705, 110.3815, '6281234567893', 'Cireng renyah di luar kenyal di dalam dengan isian daging ayam suwir melimpah berbumbu rica-rica pedas harum daun jeruk.', '/assets/images/snack-cireng.jpg'),
(5, 6, 'Jasuke Manis Keju Mozzarella Mbak Rina', 'Manis', 12000, 'Mangkal', 'Pojok Lapangan Lembah', 'Mangkal setiap hari 16.00 - 21.30 WIB', -7.7690, 110.3840, '6281234567894', 'Jagung manis pipil kukus hangat berpadu mentega wangi, susu kental manis legit, dan parutan keju mozzarella lumer melimpah.', '/assets/images/snack-jasuke.jpg'),
(6, 7, 'Martabak Mini Aneka Topping Bang Jali', 'Manis', 15000, 'Sedang Berjalan', 'Rute Lingkar Luar Kampus Terpadu', 'Rute keliling: Kos Bougenville -> Lembah -> Pogung Baru', -7.7610, 110.3820, '6281234567895', 'Martabak manis mini bersarang lembut dengan aneka pilihan topping meses cokelat, keju parut, kacang sangrai, dan susu kental manis.', '/assets/images/snack-martabak.jpg');

SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- Insert Sample Reviews
INSERT INTO reviews (product_id, user_id, rating, comment) VALUES
(1, 8, 5, 'Cokelatnya beneran lumer parah! Kulitnya super renyah dan kejunya melimpah. Wajib coba kalau lewat Jl. Kaliurang!'),
(1, 9, 5, 'Langganan sejak maba! Paling enak dimakan anget-anget pas sore hari.'),
(2, 8, 5, 'Saus baladonya juara, minyaknya bersih dan Mas Danang ramah banget.'),
(2, 9, 4, 'Enak banget bihun telur gulungnya, apalagi bumbu pedas manisnya pas.'),
(3, 8, 5, 'Kuah tahunya segar banget asem manis pedasnya nendang, rawit 10 mantap!'),
(4, 9, 5, 'Isi ayam suwirnya tebal dan pedas daun jeruknya harum banget.'),
(5, 8, 4, 'Keju mozzarellanya beneran molor, porsinya pas untuk camilan sore.'),
(6, 9, 5, 'Topping kejunya melimpah, adonan martabaknya lembut bersarang.');

-- Insert Initial Activity Logs
INSERT INTO activity_logs (user_id, user_email, user_role, method, path, status_code, action, ip) VALUES
(1, 'admin@nemusnack.id', 'admin', 'SYSTEM', '/system/init', 200, 'Sistem Database PostgreSQL diinisialisasi', '127.0.0.1');
