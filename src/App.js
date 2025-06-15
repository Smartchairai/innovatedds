import React, { useEffect, useState } from 'react';
import { fetchProducts } from './airtableService';
import './App.css'; // Make sure you have this CSS file

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts().then(data => setProducts(data));
  }, []);

  return (
    <div className="App">
      <h1>🦷 Dental Product Directory</h1>
      <div className="product-list">
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          products.map((product, index) => (
            <div className="product-card" key={index}>
              <h2>{product['Product Name'] || 'Unnamed Product'}</h2>
              <p><strong>Category:</strong> {product['Category'] || 'Uncategorized'}</p>
              {product['Description'] && <p>{product['Description']}</p>}
              {product['Website'] && (
                <a
                  href={product['Website']}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Website
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
