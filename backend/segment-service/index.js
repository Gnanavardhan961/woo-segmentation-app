const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to the same SQLite database as product-service
const db = new sqlite3.Database('../product-service/products.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to SQLite database from Segment Service.');
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Segment Service Running');
});


app.post('/segments/evaluate', (req, res) => {
  const { rules } = req.body;

  if (!rules || typeof rules !== 'string') {
    return res.status(400).json({ error: 'Invalid input: rules must be a string' });
  }

  const lines = rules
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    return res.status(400).json({ error: 'No rules provided' });
  }

  const conditions = lines.map(line => {
    if (line.includes('>')) return line.replace('>', '>');
    if (line.includes('<')) return line.replace('<', '<');
    if (line.includes('=')) return line.replace('=', '=');
    return '';
  });

  const whereClause = conditions.join(' AND ');

  const query = `SELECT * FROM products WHERE ${whereClause}`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error evaluating segment:', err.message);
      return res.status(400).json({ error: 'Invalid query or rule syntax' });
    }
    res.json(rows);
  });
});

// Start server
app.listen(4001, () => {
  console.log('Segment Service running on port 4001');
});
