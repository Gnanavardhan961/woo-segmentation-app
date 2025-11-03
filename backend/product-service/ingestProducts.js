const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./products.db');

// WooCommerce API details
const BASE_URL = 'https://wp-multisite.convertcart.com/wp-json/wc/v3/products';
const CONSUMER_KEY = 'ck_af82ae325fbee1c13f31eb26148f4dea473b0f77';
const CONSUMER_SECRET = 'cs_2d8cc467c5b91a80f5ed18dd3c282ee8299c9445';

// Function to ingest products
async function ingestProducts() {
  try {
    const url = `${BASE_URL}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}&per_page=20`;
    const response = await axios.get(url);
    const products = response.data;

    console.log(`Fetched ${products.length} products from WooCommerce.`);

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO products
      (id, title, price, stock_status, stock_quantity, category, tags, on_sale, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of products) {
      const category = p.categories && p.categories.length > 0 ? p.categories[0].name : null;
      const tags = p.tags && p.tags.length > 0 ? p.tags.map(t => t.name).join(', ') : null;

      stmt.run(
        p.id,
        p.name,
        parseFloat(p.price) || 0,
        p.stock_status || 'unknown',
        p.stock_quantity || 0,
        category,
        tags,
        p.on_sale ? 1 : 0,
        p.date_created || null
      );
    }

    stmt.finalize();
    console.log('Products inserted/updated in local database.');
    db.close();
  } catch (error) {
    console.error('Error ingesting products:', error.message);
  }
}

ingestProducts();
