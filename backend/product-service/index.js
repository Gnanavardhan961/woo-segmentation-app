const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const cron = require('node-cron');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to SQLite database
const db = new sqlite3.Database('./products.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create products table if not exists
db.run(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  title TEXT,
  price REAL,
  stock_status TEXT,
  stock_quantity INTEGER,
  category TEXT,
  tags TEXT,
  on_sale BOOLEAN,
  created_at TEXT
)`);

// Function to ingest products from WooCommerce
async function ingestProducts() {
  console.log('🕒 Fetching WooCommerce products...');
  try {
    const response = await axios.get(
      'https://wp-multisite.convertcart.com/wp-json/wc/v3/products',
      {
        params: {
          consumer_key: 'ck_af82ae325fbee1c13f31eb26148f4dea473b0f77',
          consumer_secret: 'cs_2d8cc467c5b91a80f5ed18dd3c282ee8299c9445',
          per_page: 50,
        },
      }
    );

    const products = response.data;

    db.serialize(() => {
      const insertStmt = db.prepare(
        `INSERT OR REPLACE INTO products 
         (id, title, price, stock_status, stock_quantity, category, tags, on_sale, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );

      products.forEach((p) => {
        insertStmt.run(
          p.id,
          p.name,
          p.price,
          p.stock_status,
          p.stock_quantity,
          p.categories?.[0]?.name || null,
          JSON.stringify(p.tags?.map((t) => t.name) || []),
          p.on_sale,
          p.date_created
        );
      });

      insertStmt.finalize();
    });

    console.log(` ${products.length} products ingested successfully`);
  } catch (error) {
    console.error(' WooCommerce ingestion failed:', error.message);
  }
}

// Root endpoint
app.get('/', (req, res) => {
  res.send('Product Service Running');
});

// GET /products – Return all stored products
app.get('/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) {
      console.error('Error fetching products:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

//  Schedule cron job (every 6 hours)
cron.schedule('0 */6 * * *', async () => {
  console.log(' Running scheduled WooCommerce ingestion...');
  await ingestProducts();
});

console.log(' Cron scheduler initialized: runs every 6 hours');

// Export app and db for testing
module.exports = { app, db };

// Start server only if not in test environment
if (require.main === module) {
  app.listen(4000, () => {
    console.log('Product Service running on port 4000');
    ingestProducts();
  });
}
