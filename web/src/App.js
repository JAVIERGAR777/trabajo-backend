import React, { useState, useEffect, useContext } from 'react';
import { CarritoContext } from './CarritoContext';
import AgregarGolosina from './AgregarGolosina';
import { CarritoProvider } from './CarritoContext';


function App() {
  const [golosinas, setGolosinas] = useState([]);
  const { carrito, agregarAlCarrito, eliminarDelCarrito, vaciarCarrito } = useContext(CarritoContext);

  useEffect(() => {
    fetch('http://localhost:3001/golosinas')
      .then(res => res.json())
      .then(data => setGolosinas(data))
      .catch(err => console.error("Error:", err));
  }, []);

const handleRealizarPedido = async () => {
  try {
    const total = carrito.reduce((sum, item) => sum + item.precio, 0);
    
    console.log("Enviando al backend:", {
      productos: carrito,
      total: total
    });

    // 3. Enviar al backend
    const response = await fetch('http://localhost:3001/pedidos', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        productos: carrito,
        total: total,
        usuario: "Cliente" 
      })
    });


    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error en el servidor");
    }

    const data = await response.json();
    

    alert(`✅ Pedido #${data.id} guardado! Total: $${total}`);
    

    vaciarCarrito();

  } catch (error) {
    console.error("Detalles del error:", {
      message: error.message,
      stack: error.stack
    });
    alert(`❌ Error: ${error.message}`);
  }
};

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Tienda de Golosinas 🍭</h1>
      
      {/* Sección de Productos */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 2 }}>
          <AgregarGolosina setGolosinas={setGolosinas} />
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {golosinas.map(golosina => (
              <li key={golosina.id} style={{ 
                margin: '10px 0', 
                padding: '10px', 
                border: '1px solid #ddd',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{golosina.nombre}</strong> - ${golosina.precio} (Stock: {golosina.stock})
                </div>
                <div>
                  <button 
                    onClick={() => agregarAlCarrito(golosina)}
                    style={{ marginRight: '10px', background: '#4CAF50', color: 'white' }}
                  >
                    🛒 Agregar
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('¿Eliminar esta golosina?')) {
                        fetch(`http://localhost:3001/golosinas/${golosina.id}`, { method: 'DELETE' })
                          .then(res => res.json())
                          .then(() => setGolosinas(golosinas.filter(g => g.id !== golosina.id)))
                          .catch(err => console.error("Error:", err));
                      }
                    }}
                    style={{ background: '#f44336', color: 'white' }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Sección del Carrito */}
        <div style={{ flex: 1, border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
          <h2>🛒 Carrito ({carrito.length})</h2>
          {carrito.length === 0 ? (
            <p>Tu carrito está vacío</p>
          ) : (
            <>
              <ul style={{ padding: 0 }}>
                {carrito.map((item, index) => (
                  <li key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span>{item.nombre} (${item.precio})</span>
                    <button 
                      onClick={() => eliminarDelCarrito(item.id)}
                      style={{ background: 'none', border: 'none', color: 'red' }}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <p><strong>Total: ${carrito.reduce((sum, item) => sum + item.precio, 0)}</strong></p>
              <button 
                onClick={handleRealizarPedido}
                style={{ 
                  background: '#2196F3', 
                  color: 'white', 
                  padding: '10px', 
                  width: '100%',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                Finalizar Compra
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <CarritoProvider>
      <App />
    </CarritoProvider>
  );
}