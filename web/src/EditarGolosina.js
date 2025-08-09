import React, { useState, useEffect } from 'react';

function EditarGolosina({ id, onUpdate }) {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');

  useEffect(() => {
    fetch(`http://localhost:3001/golosinas/${id}`)
      .then(res => res.json())
      .then(data => {
        setNombre(data.nombre);
        setPrecio(data.precio);
        setStock(data.stock);
      });
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`http://localhost:3001/golosinas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, precio, stock }),
    })
      .then(res => res.json())
      .then(() => onUpdate());
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} required />
      <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
      <button type="submit">Guardar</button>
    </form>
  );
}