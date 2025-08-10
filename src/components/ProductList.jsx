// src/components/ProductList.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";


export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState("");
  const [uom, setUom] = useState("");
  const [plantName, setPlantName] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });
    if (error) console.error("Error fetching products:", error.message);
    else setProducts(data);
  };

  const handleAddOrUpdate = async () => {
    if (!productName || !uom || !plantName) return alert("Please fill in all fields");

    if (editId) {
      const { error } = await supabase
        .from("products")
        .update({ product_name: productName, unit_of_measure: uom, plant_name: plantName })
        .eq("id", editId);
      if (error) return alert("Error updating product");
    } else {
      const { error } = await supabase
        .from("products")
        .insert([{ product_name: productName, unit_of_measure: uom, plant_name: plantName }]);
      if (error) return alert("Error adding product");
    }

    setProductName("");
    setUom("");
    setPlantName("");
    setEditId(null);
    fetchProducts();
  };

  const handleEdit = async (product) => {
    setProductName(product.product_name);
    setUom(product.unit_of_measure);
    setPlantName(product.plant_name);
    setEditId(product.id);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this product?");
    if (!confirm) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return alert("Error deleting product");
    fetchProducts();
  };

  return (
    <div style={{ display: "flex" }}>
      
      <div style={{ flex: 1, padding: "2rem" }}>
        <h2>📦 Product Management</h2>

        <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
          <input
            type="text"
            placeholder="UOM"
            value={uom}
            onChange={(e) => setUom(e.target.value)}
          />
          <input
            type="text"
            placeholder="Plant Name"
            value={plantName}
            onChange={(e) => setPlantName(e.target.value)}
          />
          <button onClick={handleAddOrUpdate}>
            {editId ? "Update Product" : "Add Product"}
          </button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>Product Name</th>
              <th style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>UOM</th>
              <th style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>Plant Name</th>
              <th style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td style={{ padding: "8px" }}>{p.product_name}</td>
                <td style={{ padding: "8px" }}>{p.unit_of_measure}</td>
                <td style={{ padding: "8px" }}>{p.plant_name}</td>
                <td style={{ padding: "8px" }}>
                  <button onClick={() => handleEdit(p)}>✏️ Edit</button>{" "}
                  <button onClick={() => handleDelete(p.id)}>🗑️ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
