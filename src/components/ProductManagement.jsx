// src/components/ProductManagement.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import { format } from "date-fns";

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedProduct, setEditedProduct] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [newProduct, setNewProduct] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) console.error("Error fetching products:", error);
    else setProducts(data);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditedProduct(product);
  };

  const handleDelete = async (id) => {
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  const handleSave = async () => {
    await supabase.from("products").update(editedProduct).eq("id", editingId);
    setEditingId(null);
    setEditedProduct({});
    fetchProducts();
  };

  const handleAddNew = () => {
    setNewProduct({ product_name: "", unit_of_measure: "", plant_name: "" });
  };

  const handleSaveNew = async () => {
    if (newProduct.product_name && newProduct.unit_of_measure && newProduct.plant_name) {
      await supabase.from("products").insert([newProduct]);
      setNewProduct(null);
      fetchProducts();
    } else {
      alert("Please fill in all fields.");
    }
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(products);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "Product_Management.xlsx");
  };

  const printTable = () => {
    const printWindow = window.open("", "_blank");
    const htmlContent = `
      <html>
        <head>
          <title>Product List Print</title>
          <style>
            body { font-family: Segoe UI; padding: 20px; font-size: 0.8rem; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
          </style>
        </head>
        <body>
          <h2>Product Management</h2>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Unit of Measure</th>
                <th>Plant Name</th>
              </tr>
            </thead>
            <tbody>
              ${products
                .map(
                  (r) => `
                <tr>
                  <td>${r.product_name}</td>
                  <td>${r.unit_of_measure}</td>
                  <td>${r.plant_name}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div style={{ display: "flex", fontFamily: "Segoe UI", fontSize: "0.8rem" }}>
      
      <div style={{ flex: 1, padding: "2rem" }}>
        <h2>📦 Product Management</h2>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <button onClick={handleAddNew}>➕ Add New Product</button>
          <CSVLink data={products} filename="products.csv">
            <button>⬇️ Export CSV</button>
          </CSVLink>
          <button onClick={handleExportExcel}>📊 Export Excel</button>
          <button onClick={printTable}>🖨️ Print</button>
        </div>

        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead style={{ backgroundColor: "#f0f0f0" }}>
            <tr>
              <th style={cellStyle}>Product Name</th>
              <th style={cellStyle}>Unit of Measure</th>
              <th style={cellStyle}>Plant Name</th>
              <th style={cellStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {newProduct && (
              <tr>
                <td style={cellStyle}>
                  <input
                    value={newProduct.product_name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, product_name: e.target.value })
                    }
                  />
                </td>
                <td style={cellStyle}>
                  <input
                    value={newProduct.unit_of_measure}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, unit_of_measure: e.target.value })
                    }
                  />
                </td>
                <td style={cellStyle}>
                  <input
                    value={newProduct.plant_name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, plant_name: e.target.value })
                    }
                  />
                </td>
                <td style={cellStyle}>
                  <button onClick={handleSaveNew}>💾</button>
                  <button onClick={() => setNewProduct(null)}>❌</button>
                </td>
              </tr>
            )}

            {paginatedProducts.map((product) => (
              <tr key={product.id}>
                <td style={cellStyle}>
                  {editingId === product.id ? (
                    <input
                      value={editedProduct.product_name || ""}
                      onChange={(e) =>
                        setEditedProduct({ ...editedProduct, product_name: e.target.value })
                      }
                    />
                  ) : (
                    product.product_name
                  )}
                </td>
                <td style={cellStyle}>
                  {editingId === product.id ? (
                    <input
                      value={editedProduct.unit_of_measure || ""}
                      onChange={(e) =>
                        setEditedProduct({ ...editedProduct, unit_of_measure: e.target.value })
                      }
                    />
                  ) : (
                    product.unit_of_measure
                  )}
                </td>
                <td style={cellStyle}>
                  {editingId === product.id ? (
                    <input
                      value={editedProduct.plant_name || ""}
                      onChange={(e) =>
                        setEditedProduct({ ...editedProduct, plant_name: e.target.value })
                      }
                    />
                  ) : (
                    product.plant_name
                  )}
                </td>
                <td style={cellStyle}>
                  {editingId === product.id ? (
                    <>
                      <button onClick={handleSave}>💾</button>
                      <button onClick={() => setEditingId(null)}>❌</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(product)}>✏️</button>
                      <button onClick={() => handleDelete(product.id)}>🗑️</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: "1rem" }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                padding: "6px 10px",
                marginRight: "4px",
                backgroundColor: currentPage === i + 1 ? "#1976d2" : "#e0e0e0",
                color: currentPage === i + 1 ? "white" : "black",
                border: "none",
                borderRadius: "4px"
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const cellStyle = {
  padding: "8px",
  fontSize: "0.75rem",
  fontFamily: "Segoe UI",
  border: "1px solid #ccc"
};
