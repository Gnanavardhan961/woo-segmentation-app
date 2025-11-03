const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to same SQLite DB as product-service
const db = new sqlite3.Database("../product-service/products.db", (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to SQLite database from Segment Service.");
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Segment Service Running");
});

/**
 * Allowed fields and operators for safety
 */
const ALLOWED_FIELDS = {
  price: "REAL",
  stock_status: "TEXT",
  stock_quantity: "INTEGER",
  category: "TEXT",
  on_sale: "INTEGER",
  created_at: "TEXT",
};

const ALLOWED_OPERATORS = new Set(["=", "!=", ">", ">=", "<", "<="]);

/**
 * Parse and validate a single rule line
 */
function parseRule(line) {
  const match = line.match(/^([a-zA-Z_]+)\s*(=|!=|>|>=|<|<=)\s*(.+)$/);
  if (!match) {
    throw new Error(`Invalid rule syntax: "${line}"`);
  }

  const [, field, operator, rawValue] = match;

  if (!ALLOWED_FIELDS[field]) {
    throw new Error(`Field not allowed: "${field}"`);
  }

  if (!ALLOWED_OPERATORS.has(operator)) {
    throw new Error(`Operator not allowed: "${operator}"`);
  }

  // Clean value
  let value = rawValue.trim();
  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    value = value.slice(1, -1);
  }

  // Convert booleans/numbers
  const type = ALLOWED_FIELDS[field];
  if (type === "REAL" || type === "INTEGER") {
    value =
      value === "true"
        ? 1
        : value === "false"
        ? 0
        : Number(value);
    if (isNaN(value)) {
      throw new Error(`Invalid numeric value for field: ${field}`);
    }
  }

  return { field, operator, value };
}

/**
 * POST /segments/evaluate
 * Example input:
 * {
 *   "rules": "price > 100\nstock_status = 'instock'\non_sale = true"
 * }
 */
app.post("/segments/evaluate", (req, res) => {
  const { rules } = req.body;

  if (!rules || typeof rules !== "string") {
    return res.status(400).json({ error: 'Invalid input: "rules" must be a string' });
  }

  const lines = rules
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return res.status(400).json({ error: "No rules provided" });
  }

  let parsedRules;
  try {
    parsedRules = lines.map(parseRule);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const whereClause = parsedRules
    .map((r) => `${r.field} ${r.operator} ?`)
    .join(" AND ");

  const values = parsedRules.map((r) => r.value);

  const query = `SELECT * FROM products WHERE ${whereClause}`;

  db.all(query, values, (err, rows) => {
    if (err) {
      console.error("Error evaluating segment:", err.message);
      return res.status(400).json({ error: "Invalid query or rule syntax" });
    }
    res.json(rows);
  });
});

// Start server
if (require.main === module) {
  app.listen(4001, () => {
    console.log("Segment Service running on port 4001");
  });
}

module.exports = app;
