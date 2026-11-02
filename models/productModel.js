/**
 * Model Data Jajanan & Lapak PKL - NemuSnack
 * Berdasarkan PRD NemuSnack (Muhammad Rio Aprilianto - 20240140204)
 * Mengelola data katalog jajanan kaki lima, lokasi lapak, status pergerakan, dan rating.
 */

const products = [
  {
    id: 1,
    name: "Pisang Cokelat Lumer Pak Yono",
    seller: "Lapak Gerobak Pak Yono",
    category: "Manis",
    price: 12000,
    rating: 4.9,
    reviewsCount: 48,
    status: "Mangkal",
    location: "Jl. Kaliurang km 5 (Depan Apotek)",
    route: "Mangkal tetap mulai pukul 16.00 - 22.00 WIB",
    whatsapp: "6281234567890",
    description: "Pisang cokelat lumer legendaris berbalut kulit lumpia renyah dengan lelehan cokelat melimpah dan taburan keju gurih khas Pak Yono.",
    image: "/assets/images/snack-piscok.jpg"
  },
  {
    id: 2,
    name: "Telur Gulung Crispy Mas Danang",
    seller: "Telur Gulung Mas Danang",
    category: "Gurih",
    price: 10000,
    rating: 4.8,
    reviewsCount: 62,
    status: "Sedang Berjalan",
    location: "Sekitar Pogung Raya -> Flamboyan",
    route: "Rute sore: Gerbang Asrama -> Pogung Baru -> Pogung Raya",
    whatsapp: "6281234567891",
    description: "Telur gulung gurih berbalut bihun renyah dan sosis dengan taburan bumbu balado pedas manis serta saus cabai racikan mantap.",
    image: "/assets/images/snack-telur-gulung.jpg"
  },
  {
    id: 3,
    name: "Tahu Gejrot Pedas Nampol Bu Siti",
    seller: "Tahu Gejrot Cirebon Bu Siti",
    category: "Pedas",
    price: 10000,
    rating: 4.9,
    reviewsCount: 75,
    status: "Mangkal",
    location: "Depan Gerbang Barat Kampus",
    route: "Buka setiap sore mulai 15.30 WIB sampai habis",
    whatsapp: "6281234567892",
    description: "Tahu pong kopong renyah disiram kuah gula merah asam segar dengan ulekan cabai rawit hijau segar yang pedas nendang.",
    image: "/assets/images/snack-tahu-gejrot.jpg"
  },
  {
    id: 4,
    name: "Cireng Isi Ayam Suwir Pedas Mang Asep",
    seller: "Cireng Crispy Mang Asep",
    category: "Pedas",
    price: 15000,
    rating: 4.7,
    reviewsCount: 39,
    status: "Mangkal",
    location: "Pertigaan Mirota Kampus",
    route: "Standby dekat halte bus kampus",
    whatsapp: "6281234567893",
    description: "Cireng renyah di luar kenyal di dalam dengan isian daging ayam suwir melimpah berbumbu rica-rica pedas harum daun jeruk.",
    image: "/assets/images/snack-cireng.jpg"
  },
  {
    id: 5,
    name: "Jasuke Manis Keju Mozzarella Mbak Rina",
    seller: "Jasuke Lovers Mbak Rina",
    category: "Manis",
    price: 12000,
    rating: 4.8,
    reviewsCount: 53,
    status: "Mangkal",
    location: "Pojok Lapangan Lembah",
    route: "Mangkal setiap hari 16.00 - 21.30 WIB",
    whatsapp: "6281234567894",
    description: "Jagung manis pipil kukus hangat berpadu mentega wangi, susu kental manis legit, dan parutan keju mozzarella lumer melimpah.",
    image: "/assets/images/snack-jasuke.jpg"
  },
  {
    id: 6,
    name: "Martabak Mini Aneka Topping Bang Jali",
    seller: "Martabak Mini Bang Jali",
    category: "Manis",
    price: 15000,
    rating: 4.9,
    reviewsCount: 88,
    status: "Sedang Berjalan",
    location: "Rute Lingkar Luar Kampus Terpadu",
    route: "Rute keliling: Kos Bougenville -> Lembah -> Pogung Baru",
    whatsapp: "6281234567895",
    description: "Martabak manis mini bersarang lembut dengan aneka pilihan topping meses cokelat, keju parut, kacang sangrai, dan susu kental manis.",
    image: "/assets/images/snack-martabak.jpg"
  }
];

const productModel = {
  /**
   * Mengambil seluruh data jajanan PKL
   * @returns {Array} Daftar jajanan
   */
  getAllProducts() {
    return products;
  },

  /**
   * Mengambil jajanan berdasarkan ID
   * @param {number|string} id - ID produk
   * @returns {Object|null} Objek produk atau null jika tidak ditemukan
   */
  getProductById(id) {
    const numericId = parseInt(id, 10);
    return products.find((item) => item.id === numericId) || null;
  },

  /**
   * Mencari jajanan berdasarkan keyword (Nama, kategori, deskripsi, atau penjual)
   * Sesuai fitur AI Rekomendasi (F-01) & Filter Kategori (F-05)
   * @param {string} query - Kata kunci pencarian
   * @returns {Array} Daftar jajanan yang cocok
   */
  searchProducts(query) {
    if (!query) return products;
    const lower = query.toLowerCase();
    return products.filter((p) => 
      p.name.toLowerCase().includes(lower) ||
      p.category.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower) ||
      p.seller.toLowerCase().includes(lower) ||
      p.location.toLowerCase().includes(lower)
    );
  }
};

module.exports = productModel;
