/**
 * Model Data Produk Kebab Corner
 * Mengelola data produk menggunakan array JavaScript statis
 */

const products = [
  {
    id: 1,
    name: "Kebab Original",
    description: "Kebab klasik dengan isian daging sapi panggang berbumbu khas, selada renyah, tomat segar, dan saus racikan spesial.",
    price: 15000,
    category: "Original",
    image: "/assets/images/kebab-original.jpg"
  },
  {
    id: 2,
    name: "Kebab Jumbo",
    description: "Kebab porsi besar dengan tortilla lembut, isian daging sapi melimpah dua kali lipat, dan sayuran segar berpadu saus lezat.",
    price: 22000,
    category: "Premium",
    image: "/assets/images/kebab-jumbo.jpg"
  },
  {
    id: 3,
    name: "Kebab Cheese",
    description: "Kebab istimewa dengan lelehan keju mozzarella premium dan saus keju gurih yang berpadu sempurna dengan gurihnya daging.",
    price: 19000,
    category: "Spesial",
    image: "/assets/images/kebab-cheese.jpg"
  },
  {
    id: 4,
    name: "Kebab Black Pepper",
    description: "Kebab daging sapi lembut dengan lumuran saus lada hitam khas yang memberikan sensasi hangat, pedas, dan aroma rempah harum.",
    price: 18000,
    category: "Spesial",
    image: "/assets/images/kebab-black-pepper.jpg"
  },
  {
    id: 5,
    name: "Kebab Spicy",
    description: "Kebab dengan sensasi pedas nendang dari racikan saus cabai pilihan, cabai rawit cincang, dan rempah pedas yang menggugah selera.",
    price: 17000,
    category: "Pedas",
    image: "/assets/images/kebab-spicy.jpg"
  },
  {
    id: 6,
    name: "Kebab Double Meat",
    description: "Kebab favorit para pecinta daging dengan kombinasi ekstra daging sapi panggang empuk dan renyah, tanpa kompromi kenikmatan.",
    price: 25000,
    category: "Premium",
    image: "/assets/images/kebab-double-meat.jpg"
  }
];

const productModel = {
  /**
   * Mengambil seluruh data produk
   * @returns {Array} Daftar produk
   */
  getAllProducts() {
    return products;
  },

  /**
   * Mengambil produk berdasarkan ID
   * @param {number|string} id - ID produk
   * @returns {Object|null} Objek produk atau null jika tidak ditemukan
   */
  getProductById(id) {
    const numericId = parseInt(id, 10);
    return products.find((item) => item.id === numericId) || null;
  }
};

module.exports = productModel;
