const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./products.db');

const products = [
  { title: 'Laptop', price: 1500, stock_status: 'instock', stock_quantity: 10, category: 'Electronics', tags: 'tech', on_sale: 1, created_at: new Date().toISOString() },
  { title: 'Headphones', price: 200, stock_status: 'instock', stock_quantity: 50, category: 'Audio', tags: 'music', on_sale: 0, created_at: new Date().toISOString() },
  { title: 'Smartwatch', price: 300, stock_status: 'outofstock', stock_quantity: 0, category: 'Wearables', tags: 'fitness', on_sale: 1, created_at: new Date().toISOString() }
];

products.forEach(p => {
  db.run(
    `INSERT INTO products (title, price, stock_status, stock_quantity, category, tags, on_sale, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [p.title, p.price, p.stock_status, p.stock_quantity, p.category, p.tags, p.on_sale, p.created_at]
  );
});

console.log('Products seeded successfully.');
db.close();
