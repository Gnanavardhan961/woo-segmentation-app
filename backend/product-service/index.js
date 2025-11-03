const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());
app.use(cors());


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

// Start server
app.listen(4000, () => {
  console.log('Product Service running on port 4000');
});
