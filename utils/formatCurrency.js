/**
 * Utility untuk memformat angka menjadi format mata uang Rupiah (IDR)
 * Menggunakan Intl.NumberFormat standar internasional
 * 
 * @param {number} amount - Nilai nominal dalam angka
 * @returns {string} String berformat Rupiah, contoh: "Rp 15.000"
 */
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'Rp 0';
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

module.exports = formatCurrency;
