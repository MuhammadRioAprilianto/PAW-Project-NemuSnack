/**
 * Middleware Upload Gambar dengan Multer - NemuSnack
 * Menyimpan file gambar produk dan profil lapak ke folder public/uploads
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder public/uploads ada
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi DiskStorage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'snack-' + uniqueSuffix + ext);
  }
});

// File filter hanya untuk format gambar raster yang aman untuk ditampilkan.
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mime = file.mimetype;

  if (allowedTypes.test(ext) && ['image/jpeg', 'image/png', 'image/webp'].includes(mime)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung. Pilih JPG, PNG, atau WEBP.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  },
  fileFilter: fileFilter
});

module.exports = upload;
