import React, { createContext, useState, useEffect } from 'react';

export const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) setCarrito(JSON.parse(carritoGuardado));
  }, []);

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  const agregarAlCarrito = (golosina) => {
    setCarrito([...carrito, golosina]);
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const realizarPedido = async () => {
    try {
      const total = carrito.reduce((sum, item) => sum + item.precio, 0);
      const response = await fetch('http://localhost:3001/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productos: carrito,
          total: total
        })
      });
      const data = await response.json();
      alert(`Pedido #${data.id} creado! Total: $${total}`);
      setCarrito([]);
    } catch (error) {
      console.error("Error al realizar pedido:", error);
    }
  };

  return (
    <CarritoContext.Provider 
      value={{ carrito, agregarAlCarrito, eliminarDelCarrito, realizarPedido }}
    >
      {children}
    </CarritoContext.Provider>
  );
};