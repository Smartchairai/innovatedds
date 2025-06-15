import React, { useEffect, useState } from 'react';
import { fetchProducts } from './airtableService';

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts().then(data => {
      console.log("Fetched products:", data);
      setProducts(data);
    });
  }, []);

  return (
    <div className="App">
      <h1>🦷 Dental Product Directory</h1>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul>
          {products.map(product => {
            const name = product["Product Name"] || "Unnamed Product";
            const category = product["Category"] || "Uncategorized";

            // Skip rendering if both name and category are missing
            if (!name && !category) return null;

            return (
              <li key={product.id}>
                <strong>{name}</strong> — {category}
                {product["Show Full Info"] && (
                  <div>
                    {product["Description"] && <p>{product["Description"]}</p>}
                    {product["Website"] && (
                      <a
                        href={product["Website"]}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Website
                      </a>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default App;
