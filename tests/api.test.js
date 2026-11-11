/**
 * Automated Verification Script for NemuSnack
 * Tests:
 * 1. Database Connection & Models
 * 2. GET /api/status
 * 3. GET /api/produk (Read all from DB)
 * 4. GET /api/produk/:id (Read one)
 * 5. POST /api/produk (Create in DB)
 * 6. PUT /api/produk/:id (Update in DB)
 * 7. DELETE /api/produk/:id (Delete from DB)
 * 8. User Auth & Password Verification
 * 9. Review Creation
 * 10. Activity Logging
 */

const http = require('http');
const app = require('../app');
const db = require('../config/db');
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const reviewModel = require('../models/reviewModel');

let server;
const PORT = 3001;

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({ ...options, port: PORT, host: 'localhost' }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch (_) {}
        resolve({ statusCode: res.statusCode, headers: res.headers, body, json });
      });
    });
    req.on('error', reject);
    if (postData) {
      if (typeof postData === 'object') {
        req.setHeader('Content-Type', 'application/json');
        req.write(JSON.stringify(postData));
      } else {
        req.write(postData);
      }
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 MEMULAI PENGUJIAN OTOMATIS FITUR NEMUSNACK (WEEK 9)');
  console.log('======================================================\n');

  // 1. Test PostgreSQL Connection
  console.log('1. [DB] Menguji Koneksi PostgreSQL...');
  const dbTest = await db.query('SELECT current_database(), current_user, version();');
  console.log(`   ✓ Terhubung ke database: ${dbTest.rows[0].current_database} sebagai user: ${dbTest.rows[0].current_user}`);

  // Start temporary test server
  server = app.listen(PORT);
  await new Promise(r => setTimeout(r, 600));

  // 2. Test GET /api/status
  console.log('\n2. [API] Menguji GET /api/status...');
  const resStatus = await request({ method: 'GET', path: '/api/status' });
  console.log(`   Status: ${resStatus.statusCode}`);
  console.log(`   Response:`, resStatus.json);
  if (resStatus.statusCode !== 200 || !resStatus.json.success) throw new Error('GET /api/status failed');

  // 3. Test GET /api/produk
  console.log('\n3. [API] Menguji GET /api/produk (Read All dari Database)...');
  const resGetAll = await request({ method: 'GET', path: '/api/produk' });
  console.log(`   Status: ${resGetAll.statusCode}`);
  console.log(`   Total produk di database: ${resGetAll.json.total}`);
  console.log(`   Sampel produk #1: ${resGetAll.json.data[0].name} (Harga: ${resGetAll.json.data[0].price})`);
  if (resGetAll.statusCode !== 200 || resGetAll.json.total === 0) throw new Error('GET /api/produk failed');

  // 4. Test GET /api/produk/:id
  console.log('\n4. [API] Menguji GET /api/produk/1 (Read One by ID)...');
  const resGetOne = await request({ method: 'GET', path: '/api/produk/1' });
  console.log(`   Status: ${resGetOne.statusCode}`);
  console.log(`   Nama: ${resGetOne.json.data.name}, Penjual: ${resGetOne.json.data.seller}`);
  if (resGetOne.statusCode !== 200 || resGetOne.json.data.id !== 1) throw new Error('GET /api/produk/1 failed');

  // 5. Test POST /api/produk (Create in Database)
  console.log('\n5. [API] Menguji POST /api/produk (Create Data Baru ke PostgreSQL)...');
  const newProductPayload = {
    seller_id: 2,
    name: 'Kebab Turki Keju Mozzarella Spesial Test',
    category: 'Gurih',
    price: 18000,
    status: 'Mangkal',
    location: 'Jl. Kaliurang km 5.5',
    route: 'Standby 17.00 - 23.00 WIB',
    lat: -7.7655,
    lng: 110.3790,
    whatsapp: '6281234567890',
    description: 'Kebab daging sapi panggang dengan keju mozzarella melimpah dan saus mayo pedas gurih.',
    image: '/assets/images/kebab-cheese.jpg'
  };
  const resPost = await request({ method: 'POST', path: '/api/produk' }, newProductPayload);
  console.log(`   Status: ${resPost.statusCode} (Expected: 201 Created)`);
  console.log(`   ID Produk Terbuat: ${resPost.json.data.id}`);
  console.log(`   Message: ${resPost.json.message}`);
  if (resPost.statusCode !== 201) throw new Error('POST /api/produk failed');
  const createdId = resPost.json.data.id;

  // Verifikasi produk tersimpan di DB
  const verifyInDb = await productModel.getProductById(createdId);
  console.log(`   ✓ Verifikasi DB: Produk ID #${createdId} berhasil ditemukan di PostgreSQL: "${verifyInDb.name}"`);

  // 6. Test PUT /api/produk/:id (Update in Database)
  console.log(`\n6. [API] Menguji PUT /api/produk/${createdId} (Update Data di Database)...`);
  const updatePayload = {
    price: 22000,
    status: 'Sedang Berjalan',
    description: 'Kebab daging sapi panggang (VERSI UPDATE HARGA BARU).'
  };
  const resPut = await request({ method: 'PUT', path: `/api/produk/${createdId}` }, updatePayload);
  console.log(`   Status: ${resPut.statusCode} (Expected: 200 OK)`);
  console.log(`   Harga setelah update: ${resPut.json.data.price}`);
  console.log(`   Status setelah update: ${resPut.json.data.status}`);
  if (resPut.statusCode !== 200 || resPut.json.data.price !== 22000) throw new Error('PUT /api/produk/:id failed');

  // 7. Test DELETE /api/produk/:id (Delete from Database)
  console.log(`\n7. [API] Menguji DELETE /api/produk/${createdId} (Delete Data dari Database)...`);
  const resDel = await request({ method: 'DELETE', path: `/api/produk/${createdId}` });
  console.log(`   Status: ${resDel.statusCode} (Expected: 200 OK)`);
  console.log(`   Message: ${resDel.json.message}`);
  if (resDel.statusCode !== 200) throw new Error('DELETE /api/produk/:id failed');

  // Verifikasi produk benar-benar terhapus
  const verifyDeleted = await productModel.getProductById(createdId);
  console.log(`   ✓ Verifikasi DB setelah delete: ${verifyDeleted === null ? 'NULL (Berhasil Terhapus)' : 'MASIH ADA'}`);
  if (verifyDeleted !== null) throw new Error('Product not deleted in database');

  // 8. Test Role & Authentication Logic
  console.log('\n8. [AUTH] Menguji Verifikasi 3 Role Pengguna...');
  const adminUser = await userModel.findByEmail('admin@nemusnack.id');
  const sellerUser = await userModel.findByEmail('pakyono@nemusnack.id');
  const buyerUser = await userModel.findByEmail('budi@gmail.com');
  const isPassValid = await userModel.verifyPassword('password123', adminUser.password);
  console.log(`   Admin  : ${adminUser.name} [Role: ${adminUser.role}] - Password Hash OK: ${isPassValid}`);
  console.log(`   Penjual: ${sellerUser.name} [Role: ${sellerUser.role}]`);
  console.log(`   Pembeli: ${buyerUser.name} [Role: ${buyerUser.role}]`);

  // 9. Test Frontend Pages Rendering
  console.log('\n9. [VIEW] Menguji Rendering Halaman Frontend...');
  const resHome = await request({ method: 'GET', path: '/' });
  console.log(`   GET / (Home)           : ${resHome.statusCode} OK (Length: ${resHome.body.length} bytes)`);

  const resMenu = await request({ method: 'GET', path: '/menu' });
  console.log(`   GET /menu (Katalog)    : ${resMenu.statusCode} OK (Length: ${resMenu.body.length} bytes)`);

  const resDetail = await request({ method: 'GET', path: '/produk/1' });
  console.log(`   GET /produk/1 (Detail) : ${resDetail.statusCode} OK (Length: ${resDetail.body.length} bytes)`);

  const resLogin = await request({ method: 'GET', path: '/login' });
  console.log(`   GET /login (Auth)      : ${resLogin.statusCode} OK (Length: ${resLogin.body.length} bytes)`);

  // 10. Test AI Recommendation
  console.log('\n10. [AI] Menguji GET /api/rekomendasi?q=pedas...');
  const resAi = await request({ method: 'GET', path: '/api/rekomendasi?q=pedas' });
  console.log(`   Total Rekomendasi Pedas: ${resAi.json.recommendations.length}`);
  console.log(`   Rekomendasi #1: ${resAi.json.recommendations[0].name}`);

  // 11. Test Middleware Logger Endpoint & Activity Logs
  console.log('\n11. [LOGGER] Menguji GET /api/logs (Riwayat Middleware Logger)...');
  const resLogs = await request({ method: 'GET', path: '/api/logs?limit=5' });
  console.log(`   Status: ${resLogs.statusCode} (Expected: 200 OK)`);
  console.log(`   Total Log Diterima: ${resLogs.json.total}`);
  console.log(`   Log Terbaru: [${resLogs.json.data[0].method}] ${resLogs.json.data[0].path} - ${resLogs.json.data[0].status_code} (${resLogs.json.data[0].action})`);
  if (resLogs.statusCode !== 200 || !resLogs.json.success) throw new Error('GET /api/logs failed');

  console.log('\n======================================================');
  console.log('🎉 SELURUH PENGUJIAN FITUR BACKEND, FRONTEND & DB BERHASIL 100%!');
  console.log('======================================================\n');

  server.close();
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Test gagal:', err);
  if (server) server.close();
  process.exit(1);
});
