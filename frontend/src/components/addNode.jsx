import { useState } from "react";

export default function AddNode() {
  const [form, setForm] = useState({
    name: "",
    type: "port",
    location: "",
    capacity: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      await fetch("http://localhost:4000/api/nodes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      alert("Node Added ✅");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "10px", border: "1px solid gray" }}>
      <h3>Add Supply Node</h3>

      <input name="name" placeholder="Name" onChange={handleChange} />
      <br />

      <input name="type" placeholder="Type (port/supplier)" onChange={handleChange} />
      <br />

      <input name="location" placeholder="Location" onChange={handleChange} />
      <br />

      <input name="capacity" placeholder="Capacity" onChange={handleChange} />
      <br />

      <button onClick={handleSubmit}>Add Node</button>
    </div>
  );
}