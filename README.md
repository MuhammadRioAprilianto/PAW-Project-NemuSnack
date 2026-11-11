<img width="1918" height="988" alt="Screenshot From 2026-11-02 21-45-37" src="https://github.com/user-attachments/assets/928fc2a8-e483-4fd6-bbc3-bc2e641c542b" />
<img width="1918" height="988" alt="Screenshot From 2026-11-02 21-47-08" src="https://github.com/user-attachments/assets/372096a5-1299-4abb-a2fd-b573356a4065" />
<img width="1918" height="988" alt="Screenshot From 2026-11-02 21-47-37" src="https://github.com/user-attachments/assets/2f47315d-7200-4307-98bb-64b95857768b" />
<img width="1918" height="988" alt="Screenshot From 2026-11-02 21-48-48" src="https://github.com/user-attachments/assets/e692d51b-579b-4b2f-ab78-9379fdb339f1" />
<img width="1918" height="988" alt="Screenshot From 2026-11-02 21-48-33" src="https://github.com/user-attachments/assets/17ad989c-950c-4868-8d94-40132c30f1e0" />
<img width="1918" height="988" alt="Screenshot From 2026-11-02 21-49-04" src="https://github.com/user-attachments/assets/07a738e6-23ac-4385-bf3d-d11df4859e1e" />
<img width="1918" height="988" alt="Screenshot From 2026-11-02 21-50-22" src="https://github.com/user-attachments/assets/cbe9dc50-c87a-4ed4-9fc0-3142fa518a81" />
<img width="1918" height="988" alt="Screenshot From 2026-11-02 21-50-13" src="https://github.com/user-attachments/assets/30f154fd-7dbf-4040-80e3-5ef86c3dfcbc" />
<img width="1918" height="988" alt="Screenshot From 2026-11-02 21-49-42" src="https://github.com/user-attachments/assets/30f17702-7017-4799-81d9-0fc1d5b0f76e" />
<img width="1918" height="988" alt="Screenshot From 2026-11-02 21-49-26" src="https://github.com/user-attachments/assets/57dd193f-3f65-45a4-b5a5-4712da06571b" />
<img width="1918" height="988" alt="Screenshot From 2026-11-02 21-50-37" src="https://github.com/user-attachments/assets/4ff593c2-70a0-419a-95c5-333dbd431a61" />

# 🍢 NemuSnack - Platform Pemetaan & Direktori Jajanan Kaki Lima (PKL)
> Proyek Pengembangan Aplikasi Web (PAW) - Arsitektur MVC, REST API CRUD, PostgreSQL, dan Middleware Logger.

---

## 📌 Ringkasan Proyek
**NemuSnack** adalah platform web direktori kuliner dan pemetaan posisi pedagang kaki lima secara real-time. Aplikasi ini telah ditingkatkan dengan integrasi database **PostgreSQL**, operasi penuh **REST API CRUD** (Create, Read, Update, Delete), pemisahan hak akses **3 Role (Admin, Penjual/Pedagang, User/Pembeli)**, autentikasi session berbasis hash bcrypt, serta sistem **middleware-logger** yang mencatat setiap request HTTP ke terminal dan log database.

---

## 🛠️ Teknologi & Arsitektur
- **Backend:** Node.js & Express.js
- **Database:** PostgreSQL (Driver `pg` dengan Connection Pool terpisah)
- **View Engine:** EJS + `express-ejs-layouts`
- **Styling:** Tailwind CSS (via CDN) + Google Fonts Plus Jakarta Sans
- **Peta Interaktif:** Leaflet.js & OpenStreetMap
- **Keamanan:** Bcrypt.js (Password Hashing), Express-Session, Dotenv (`.env` terlindungi dari repositori publik)
- **Pola Desain:** Model-View-Controller (MVC)

---

## 📁 Struktur Folder Project
```
project/
├── config/
│   ├── appConfig.js            # Konfigurasi aplikasi & port
│   └── db.js                   # Konfigurasi koneksi PostgreSQL Pool terpisah
├── models/
│   ├── productModel.js         # Operasi CRUD produk & jajanan ke PostgreSQL
│   ├── userModel.js            # Operasi data user, autentikasi, & statistik
│   ├── reviewModel.js          # Operasi rating & ulasan dari pembeli
│   └── logModel.js             # Operasi pengambilan riwayat log aktivitas
├── middlewares/
│   ├── loggerMiddleware.js     # Middleware logger HTTP (Method, Path, Status, Timestamp)
│   └── authMiddleware.js       # Middleware autentikasi & otorisasi 3 role
├── controllers/
│   ├── productController.js    # Controller REST API CRUD (/api/produk, /api/status)
│   ├── authController.js       # Controller login, register, dan logout
│   ├── adminController.js      # Controller dashboard monitoring & kelola user admin
│   ├── sellerController.js     # Controller dashboard pedagang & kelola lapak
│   └── pageController.js       # Controller rendering halaman frontend EJS
├── routes/
│   ├── apiRoutes.js            # Endpoint REST API JSON
│   ├── authRoutes.js           # Route halaman login, register, logout
│   ├── adminRoutes.js          # Route khusus Admin (/admin/*)
│   ├── sellerRoutes.js         # Route khusus Penjual (/penjual/*)
│   └── pageRoutes.js           # Route publik (/ , /menu, /produk/:id)
├── views/
│   ├── layouts/
│   │   └── main.ejs            # Template layout utama
│   ├── pages/
│   │   ├── home.ejs            # Halaman utama (Hero, Peta Live, Tanya AI)
│   │   ├── menu.ejs            # Katalog menu & Live API Route Inspector
│   │   ├── product-detail.ejs  # Detail jajanan, rating, dan ulasan pembeli
│   │   ├── product-edit.ejs    # Formulir edit produk penjual
│   │   ├── login.ejs           # Halaman login (dengan tombol isi cepat demo 3 role)
│   │   ├── register.ejs        # Halaman pendaftaran (Penjual vs Pembeli)
│   │   ├── dashboard-admin.ejs # Dashboard monitoring & kelola user Admin
│   │   └── dashboard-penjual.ejs # Dashboard operasional lapak Penjual
│   ├── partials/
│   │   ├── navbar.ejs          # Navigasi responsif dengan status login
│   │   └── footer.ejs          # Footer modern
│   └── errors/
│       └── 404.ejs             # Halaman 404 Not Found
├── utils/
│   └── formatCurrency.js       # Pemformat mata uang Rupiah (IDR)
├── tests/
│   └── api.test.js             # Automated Test Suite (10 pengujian menyeluruh)
├── public/                     # Aset gambar jajanan & favicon
├── .env                        # Variabel lingkungan database (DIABAIKAN GIT)
├── .env.example                # Template konfigurasi publik
├── seed.sql                    # Skema tabel PostgreSQL & data awal
├── app.js                      # Entry point Express.js
└── package.json                # Dependensi & script project
```

---

## 📡 Dokumentasi Endpoint REST API (CRUD)

| Method | Endpoint | Deskripsi | Status Code |
|---|---|---|---|
| **GET** | `/api/status` | Mengecek status ketersediaan backend API & koneksi DB | `200 OK` |
| **GET** | `/api/produk` | Mengambil seluruh katalog produk jajanan dari database | `200 OK` |
| **GET** | `/api/produk/:id` | Mengambil data detail satu produk berdasarkan ID | `200 OK` / `404 Not Found` |
| **POST** | `/api/produk` | Menambahkan produk baru ke dalam database | `201 Created` / `400 Bad Request` |
| **PUT** | `/api/produk/:id` | Memperbarui data produk berdasarkan ID di database | `200 OK` / `404 Not Found` |
| **DELETE** | `/api/produk/:id` | Menghapus data produk berdasarkan ID di database | `200 OK` / `404 Not Found` |
| **GET** | `/api/rekomendasi?q=...` | Asisten pencarian & rekomendasi jajanan (Tanya AI) | `200 OK` |
| **POST** | `/api/produk/:id/reviews` | Mengirimkan ulasan & rating bintang untuk produk | `201 Created` / `400 Bad Request` |
| **GET** | `/api/logs?limit=...` | Mengambil riwayat request yang dicatat middleware logger | `200 OK` |

---

## ⚡ Interactive Middleware Logger & CRUD Console (Side Drawer)
Aplikasi dilengkapi dengan panel konsol **Middleware Logger interaktif** di bagian samping layar (*Off-Canvas Collapsible Drawer*) yang dapat dibuka/sembunyikan kapan saja (*expand/collapse*):
1. **Dock Button di Samping Layar:** Tombol mengambang di sisi kanan (`⚡ LOGGER API [GET•POST•PUT•DEL]`) untuk membuka panel tanpa mengotori tampilan halaman utama.
2. **Tab Operasi Lengkap (CRUD):**
   - **`GET`**: Menguji pengambilan seluruh produk (`/api/produk`) atau pencarian by ID (`/api/produk/:id`) lengkap dengan pengujian respons `404 Not Found`.
   - **`POST`**: Menambah jajanan baru ke PostgreSQL dengan fitur *auto-fill* data contoh jajanan dan validasi *201 Created*.
   - **`PUT`**: Memperbarui harga, status mangkal/keliling, atau nama produk berdasarkan ID terpilih (*200 OK*).
   - **`DELETE`**: Menghapus produk dari database PostgreSQL secara langsung (*200 OK*).
   - **`LOGS`**: Menampilkan riwayat log aktivitas terbaru yang dicatat otomatis oleh `loggerMiddleware` ke tabel `activity_logs`.
3. **Live Inspector Display:**
   - Menampilkan badge Method HTTP (warna standar: Cyan/GET, Hijau/POST, Kuning/PUT, Merah/DELETE).
   - Status Code HTTP, URL Endpoint, durasi waktu pemrosesan (*ms*), dan *timestamp*.
   - Simulasi baris log terminal persis sesuai output `loggerMiddleware`.
   - Pratinjau Request Payload (JSON) & Response Body (JSON) dengan tombol *Salin JSON*.

---

## 👥 Fitur 3 Role Pengguna

### 1. 🛡️ Admin
- **Dashboard Monitoring:** Memantau 6 ringkasan statistik (Total Pengguna, Total Pedagang, Total Pembeli, Total Produk, Total Ulasan, Total Request HTTP).
- **Manajemen User:** Melihat daftar seluruh user, mengubah role pengguna (Admin/Penjual/Pembeli), dan menghapus user bermasalah.
- **Event & Activity Log Monitoring:** Memantau seluruh rekaman request HTTP yang masuk (timestamp, method, endpoint, status code, email, role, dan IP client).
- **Moderasi Katalog:** Meninjau dan menghapus produk jika melanggar ketentuan.

### 2. 🏪 Penjual / Pedagang
- **Autentikasi Akun:** Registrasi akun khusus Penjual dan Login.
- **Pengaturan Lapak:** Mengubah status bekerja (*Mangkal*, *Sedang Berjalan*, *Libur/Tutup*), menentukan patokan lokasi mangkal, rute keliling, dan koordinat GPS.
- **Manajemen Menu (CRUD):**
  - **Create:** Menambah menu jajanan baru melalui dashboard.
  - **Read:** Melihat daftar menu yang dijual beserta rating dan jumlah ulasan.
  - **Update:** Mengedit harga, nama, kategori, deskripsi, dan foto menu.
  - **Delete:** Menghapus menu jajanan dari database.
- **Ulasan & Rating:** Melihat umpan balik dan komentar yang diberikan oleh pembeli pada produknya.

### 3. 🛒 User / Pembeli
- **Jelajahi Menu & Lapak:** Melihat katalog jajanan kaki lima lengkap dengan kategori, status mangkal/keliling, dan harga asli.
- **Peta Interaktif:** Memantau titik-titik gerobak PKL yang aktif di sekitar kampus secara real-time.
- **Detail Produk:** Melihat informasi komprehensif, titik lapak di peta, dan tombol direct order ke WhatsApp pedagang.
- **Beri Rating & Ulasan:** Memberikan penilaian bintang (1-5) dan komentar testimoni.
- **Tanya AI:** Asisten pencarian pintar berbasis preferensi rasa (manis, pedas, murah, gurih).

---

## 📋 Akun Uji Coba Bawaan (Seed Data)
Semua akun demo di bawah ini menggunakan kata sandi: **`password123`**
- **Admin:** `admin@nemusnack.id`
- **Penjual:** `pakyono@nemusnack.id`
- **Pembeli:** `budi@gmail.com`
*(Tersedia tombol **⚡ Akun Demo Pengujian Cepat** di halaman `/login` untuk kemudahan pengujian).*

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Clone & Masuk ke Direktori
```bash
cd middleware-logger
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Konfigurasi Database PostgreSQL
Salin `.env.example` menjadi `.env`, lalu sesuaikan kredensial PostgreSQL Anda:
```bash
cp .env.example .env
```
Contoh isi `.env`:
```env
PORT=3000
NODE_ENV=development
APP_NAME=NemuSnack
SESSION_SECRET=nemusnack_super_secret_session_key_2026

DB_HOST=localhost
DB_PORT=5432
DB_USER=rizoo
DB_PASSWORD=rizoo123
DB_NAME=nemusnack_db
```

### 4. Eksekusi Skema & Data Awal (Seed Database)
Jalankan file SQL untuk membuat tabel dan data awal:
```bash
psql -d nemusnack_db -U rizoo -f seed.sql
# Atau gunakan npm script:
npm run seed
```

### 5. Jalankan Pengujian Otomatis (Testing)
Pastikan seluruh endpoint CRUD dan integrasi database berfungsi:
```bash
npm test
```

### 6. Menjalankan Server
```bash
npm start
# Atau mode development dengan reload otomatis:
npm run dev
```

Buka peramban di: **`http://localhost:3000`**

---

## 🪵 Middleware Logger Output
Setiap request yang masuk akan langsung dicatat pada terminal backend dengan format:
```
[TIMESTAMP] METHOD PATH - STATUS (RESPONSE_TIME ms)
```
Contoh log pada konsol backend:
```
[2026-11-09T17:17:43.521Z] GET /api/status - 200 (10ms)
[2026-11-09T17:17:43.562Z] GET /api/produk - 200 (36ms)
[2026-11-09T17:17:56.575Z] POST /api/produk - 201 (6ms)
[2026-11-09T17:18:04.151Z] GET /api/produk/9 - 200 (7ms)
[2026-11-09T17:18:10.350Z] PUT /api/produk/9 - 200 (14ms)
[2026-11-09T17:18:16.445Z] DELETE /api/produk/9 - 200 (9ms)
[2026-11-09T17:18:23.290Z] GET /api/produk/9 - 404 (5ms)
```
Sistem juga secara otomatis menyimpan log ini ke tabel `activity_logs` di PostgreSQL untuk ditinjau oleh Admin di `/admin/dashboard`: 2456b45 (PAW-Week8: implement product CRUD endpoints)
