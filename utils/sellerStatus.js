function normalizeSellerStatus(status) {
  const value = String(status || '').trim().toLowerCase();
  if (!value || value.includes('mangkal')) return 'Mangkal';
  if (value.includes('libur')) return 'Libur';
  if (value.includes('tutup')) return 'Tutup';
  if (value.includes('jalan') || value.includes('keliling')) return 'Sedang Berjalan';
  return 'Tutup';
}

module.exports = normalizeSellerStatus;
