import React, { useState } from "react";

function App() {
  const [view, setView] = useState("segment");
  const [rules, setRules] = useState("");
  const [results, setResults] = useState([]);
  const [products, setProducts] = useState([]);

  // Fetch all products from backend
  const handleFetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:4001/products");
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Evaluate segment
  const handleEvaluate = async () => {
    try {
      const response = await fetch("http://localhost:4001/segments/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules }),
      });
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error("Error evaluating segment:", err);
    }
  };

  return (
    <div style={{ margin: "40px" }}>
      <h1> Woo Segmentation UI</h1>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setView("products")}
          style={{
            marginRight: "10px",
            background: view === "products" ? "#007bff" : "#ddd",
            color: view === "products" ? "white" : "black",
          }}
        >
          View Products
        </button>
        <button
          onClick={() => setView("segment")}
          style={{
            background: view === "segment" ? "#007bff" : "#ddd",
            color: view === "segment" ? "white" : "black",
          }}
        >
          Segment Editor
        </button>
      </div>

      {/* PRODUCTS VIEW */}
      {view === "products" && (
        <div>
          <h3>All Products</h3>
          <button onClick={handleFetchProducts}>Load Products</button>
          <div style={{ display: "flex", flexWrap: "wrap", marginTop: "20px" }}>
            {products.map((p) => (
              <div
                key={p.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                  margin: "10px",
                  width: "200px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                <h4>{p.title}</h4>
                <p> Price: {p.price}</p>
                <p> Status: {p.stock_status}</p>
                <p> Category: {p.category}</p>
                <p> On Sale: {p.on_sale ? "Yes" : "No"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEGMENT VIEW */}
      {view === "segment" && (
        <div>
          <h3>Enter Segment Rules:</h3>
          <textarea
            rows="5"
            cols="50"
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            placeholder={`Example:\nprice > 1000\nstock_status = 'instock'\non_sale = 1`}
          ></textarea>
          <br />
          <button onClick={handleEvaluate} style={{ marginTop: "10px" }}>
            Evaluate Segment
          </button>

          <h3 style={{ marginTop: "30px" }}>Results:</h3>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
