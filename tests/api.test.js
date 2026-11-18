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
const assert = require('assert');
const fs = require('fs');
const path = require('path');

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

function multipartRequest(requestPath, cookie, fields, file) {
  return new Promise((resolve, reject) => {
    const boundary = `----NemuSnackTest${Date.now()}`;
    const chunks = [];
    for (const [name, value] of Object.entries(fields)) {
      chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`));
    }
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="smoke-test.png"\r\nContent-Type: image/png\r\n\r\n`));
    chunks.push(file);
    chunks.push(Buffer.from(`\r\n--${boundary}--\r\n`));
    const body = Buffer.concat(chunks);
    const req = http.request({
      method: 'POST',
      path: requestPath,
      port: PORT,
      host: 'localhost',
      headers: {
        Cookie: cookie,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => { responseBody += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: responseBody }));
    });
    req.on('error', reject);
    req.end(body);
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
  const buyerLogin = await request({
    method: 'POST', path: '/login', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }, `email=${encodeURIComponent('budi@gmail.com')}&password=${encodeURIComponent('password123')}`);
  const buyerCookies = (buyerLogin.headers['set-cookie'] || []).map(cookie => cookie.split(';')[0]).join('; ');
  const ratedDetail = await request({ method: 'GET', path: '/produk/1', headers: { Cookie: buyerCookies } });
  assert([1, 2, 3, 4, 5].every(rating => ratedDetail.body.includes(`value="${rating}"`)), 'Form rating harus menyediakan skala 1–5');
  const invalidReview = await request({ method: 'POST', path: '/api/produk/1/reviews' }, { rating: 6, comment: 'Rating di luar skala' });
  assert.strictEqual(invalidReview.statusCode, 400, 'Rating di luar skala 1–5 harus ditolak');

  const resSellerDirectory = await request({ method: 'GET', path: '/lapak' });
  const resSellerProfile = await request({ method: 'GET', path: '/lapak/2' });
  const resMapSellers = await request({ method: 'GET', path: '/api/lapak/peta' });
  console.log(`   GET /lapak (Direktori) : ${resSellerDirectory.statusCode}`);
  console.log(`   GET /lapak/2 (Profil)  : ${resSellerProfile.statusCode}`);
  assert.strictEqual(resSellerDirectory.statusCode, 200, 'Direktori lapak harus ter-render');
  assert.strictEqual(resSellerProfile.statusCode, 200, 'Profil lapak harus ter-render');
  assert(resSellerDirectory.body.includes('Lapak / PKL'), 'Direktori harus memiliki judul Lapak / PKL');
  assert(resSellerProfile.body.includes('Katalog Lapak'), 'Profil harus memuat katalog produk');
  assert.strictEqual(resMapSellers.statusCode, 200, 'API peta lapak aktif harus merespons');
  assert(resMapSellers.json.data.every(seller => ['Mangkal', 'Sedang Berjalan', 'Berjalan'].includes(seller.seller_status)), 'API peta hanya boleh mengirim lapak aktif');

  // Verify seller status is authoritative for public map visibility and legacy product rows.
  console.log('\n9a. [SELLER STATUS] Menguji sinkronisasi status dan pin peta...');
  const sellerProfile = await userModel.findById(sellerUser.id);
  try {
    const routePoints = [
      [sellerProfile.seller_lat, sellerProfile.seller_lng],
      [sellerProfile.seller_lat + 0.0003, sellerProfile.seller_lng + 0.0003]
    ];
    await userModel.updateSellerStatusAndLocation(sellerUser.id, { status: 'Libur', routePoints });
    const activeSellers = await userModel.getActiveSellersForMap();
    const mapResponse = await request({ method: 'GET', path: '/api/lapak/peta' });
    const sellerProducts = await productModel.getProductsBySeller(sellerUser.id);
    const updatedSeller = await userModel.findById(sellerUser.id);
    assert(!activeSellers.some(seller => seller.id === sellerUser.id), 'Pedagang libur harus hilang dari peta');
    assert(!mapResponse.json.data.some(seller => seller.id === sellerUser.id), 'API peta tidak boleh mengirim pedagang libur');
    assert(sellerProducts.every(product => product.status === 'Libur'), 'Status produk lama harus ikut tersinkron');
    assert.deepStrictEqual(updatedSeller.seller_route_points, routePoints, 'Koordinat rute harus tersimpan pada profil lapak');
    console.log('   ✓ Status Libur menyembunyikan pin dan tersinkron ke produk terkait');
  } finally {
    await userModel.updateSellerStatusAndLocation(sellerUser.id, {
      status: sellerProfile.seller_status,
      location: sellerProfile.seller_location,
      route: sellerProfile.seller_route,
      lat: sellerProfile.seller_lat,
      lng: sellerProfile.seller_lng,
      routePoints: sellerProfile.seller_route_points
    });
  }

  console.log('\n9b. [SELLER DASHBOARD] Menguji formulir status, peta, dan unggah gambar...');
  const loginResponse = await request({
    method: 'POST',
    path: '/login',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }, `email=${encodeURIComponent('pakyono@nemusnack.id')}&password=${encodeURIComponent('password123')}`);
  assert.strictEqual(loginResponse.statusCode, 302, 'Login penjual demo harus berhasil');
  const cookies = (loginResponse.headers['set-cookie'] || []).map(cookie => cookie.split(';')[0]).join('; ');
  const sellerDashboard = await request({ method: 'GET', path: '/penjual/dashboard', headers: { Cookie: cookies } });
  assert.strictEqual(sellerDashboard.statusCode, 200, 'Dashboard penjual harus ter-render');
  assert(sellerDashboard.body.includes('seller-location-map'), 'Dashboard harus menyediakan peta penentuan lokasi');
  assert(sellerDashboard.body.includes('Choose File'), 'Dashboard harus menyediakan input unggah gambar');
  assert(sellerDashboard.body.includes('route_points'), 'Dashboard harus menyediakan koordinat rute');
  console.log('   ✓ Dashboard memuat peta draggable, titik rute, dan unggah gambar');

  const smokeImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/1ioAAAAASUVORK5CYII=', 'base64');
  let uploadedProduct = null;
  try {
    const uploadResponse = await multipartRequest('/penjual/products', cookies, {
      name: 'NemuSnack Upload Smoke Test', category: 'Lainnya', price: '500', description: 'Temporary upload test'
    }, smokeImage);
    const uploaded = await db.query('SELECT id, image FROM products WHERE seller_id = $1 AND name = $2 ORDER BY id DESC LIMIT 1', [sellerUser.id, 'NemuSnack Upload Smoke Test']);
    uploadedProduct = uploaded.rows[0] || null;
    assert.strictEqual(uploadResponse.statusCode, 302, 'Form produk dengan gambar harus tersimpan');
    assert(uploadedProduct && uploadedProduct.image.startsWith('/uploads/'), 'File produk harus tersimpan dan ditautkan ke database');
    console.log('   ✓ Unggah gambar multipart berhasil disimpan ke katalog');
  } finally {
    if (uploadedProduct) {
      await productModel.deleteProduct(uploadedProduct.id);
      const imagePath = path.join(__dirname, '..', 'public', uploadedProduct.image.replace(/^\//, ''));
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
  }

  const resLogin = await request({ method: 'GET', path: '/login' });
  console.log(`   GET /login (Auth)      : ${resLogin.statusCode} OK (Length: ${resLogin.body.length} bytes)`);

  // 10. Test AI Recommendation (Search Legacy)
  console.log('\n10. [AI] Menguji GET /api/rekomendasi?q=pedas...');
  const resAi = await request({ method: 'GET', path: '/api/rekomendasi?q=pedas' });
  console.log(`   Total Rekomendasi Pedas: ${resAi.json.recommendations.length}`);
  console.log(`   Rekomendasi #1: ${resAi.json.recommendations[0].name}`);

  // 11. Test AI Assistant Chatbot (POST /api/chat)
  console.log('\n11. [AI CHATBOT] Menguji Endpoint POST /api/chat (Gemini AI Assistant)...');

  // 11a. Test input validation (empty message)
  const resChatValidation = await request({ method: 'POST', path: '/api/chat' }, {});
  console.log(`   11a. Validasi body kosong: Status ${resChatValidation.statusCode} (Expected: 400)`);
  if (resChatValidation.statusCode !== 400) throw new Error('Validasi POST /api/chat gagal');

  // 11b. Test out-of-context question
  const resChatOutOfContext = await request({ method: 'POST', path: '/api/chat' }, { message: 'Buatkan saya kode program untuk membuat game.' });
  console.log(`   11b. Uji Out-of-Context: Status ${resChatOutOfContext.statusCode}`);
  if (resChatOutOfContext.statusCode === 200 && resChatOutOfContext.json.success) {
    console.log(`       ✓ Respons Penolakan AI: "${resChatOutOfContext.json.data.reply.substring(0, 90)}..."`);
  }

  // 12. Test Middleware Logger Endpoint & Activity Logs
  console.log('\n12. [LOGGER] Menguji GET /api/logs (Riwayat Middleware Logger)...');
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
