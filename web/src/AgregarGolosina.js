import React, { useState } from 'react';

function AgregarGolosina({ setGolosinas }) { 
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
fetch('http://localhost:3001/golosinas', { 
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nombre, precio, stock }),
})
      .then(res => res.json())
      .then(data => {
        alert(`¡${data.message} ID: ${data.id}`);
        setGolosinas(prev => [...prev, { id: data.id, nombre, precio, stock }]); 
      })
      .catch(error => console.error("Error adding:", error));
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: '20px' }}>
      <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      <input type="number" placeholder="Precio" value={precio} onChange={(e) => setPrecio(e.target.value)} required />
      <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} required />
      <button type="submit">Agregar</button>
    </form>
  );
}

export default AgregarGolosina;