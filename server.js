const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'golosinas_db'
});

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Golosinas - Solo Lectura',
      version: '1.0.0',
      description: 'Documentación PÚBLICA de endpoints GET. Para modificar datos, contactar al administrador.'
    },
    servers: [{ url: 'http://localhost:3001' }],
    paths: {
      '/golosinas': {
        get: {
          summary: 'Obtiene todas las golosinas',
          responses: {
            200: { description: 'Lista de golosinas' }
          }
        }
      },
      '/golosinas/{id}': {
        get: {
          summary: 'Obtiene una golosina por ID',
          parameters: [{
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' }
          }],
          responses: {
            200: { description: 'Golosina encontrada' },
            404: { description: 'No encontrada' }
          }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);
const filteredSpec = {
  ...swaggerSpec,
  paths: {
    '/golosinas': { get: swaggerSpec.paths['/golosinas'].get },
    '/golosinas/{id}': { get: swaggerSpec.paths['/golosinas/{id}'].get }
  }
};
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(filteredSpec));


app.get('/golosinas', (req, res) => {
  db.query('SELECT * FROM golosinas', (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al obtener golosinas' });
    res.json(result);
  });
});

app.get('/golosinas/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM golosinas WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error en la consulta' });
    if (result.length === 0) return res.status(404).json({ error: 'Golosina no encontrada' });
    res.json(result[0]);
  });
});

app.post('/golosinas', (req, res) => {
  const { nombre, precio, stock } = req.body;
  if (!nombre || precio < 0 || stock < 0) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  db.query(
    'INSERT INTO golosinas (nombre, precio, stock) VALUES (?, ?, ?)',
    [nombre, precio, stock],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al crear golosina' });
      res.status(201).json({ message: 'Golosina creada', id: result.insertId });
    }
  );
});

app.put('/golosinas/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock } = req.body;
  db.query(
    'UPDATE golosinas SET nombre = ?, precio = ?, stock = ? WHERE id = ?',
    [nombre, precio, stock, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al actualizar' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Golosina no encontrada' });
      res.json({ message: 'Actualización exitosa' });
    }
  );
});

app.delete('/golosinas/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM golosinas WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Golosina no encontrada' });
    res.json({ message: 'Golosina eliminada' });
  });
});

// 🛒 RUTA MEJORADA
app.post('/pedidos', (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  try {
    const { productos, total, usuario } = req.body;

    if (!Array.isArray(productos)) {
      return res.status(400).json({ error: "Productos debe ser un array" });
    }

    const productoInvalido = productos.find(p => !p.id || !p.nombre || typeof p.precio !== 'number');
    if (productoInvalido) {
      return res.status(400).json({ 
        error: "Producto inválido",
        producto: productoInvalido
      });
    }

    db.query(
      'INSERT INTO pedidos (productos, total, usuario) VALUES (?, ?, ?)',
      [JSON.stringify(productos), total, usuario || 'Anónimo'],
      (err, result) => {
        if (err) {
          console.error("Error MySQL:", err);
          return res.status(500).json({ 
            error: "Error en base de datos",
            detalle: err.message
          });
        }
        res.json({
          id: result.insertId,
          total: total,
          message: "Pedido guardado"
        });
      }
    );

  } catch (error) {
    console.error("Error inesperado:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(3001, () => {
  console.log('🛒 Servidor listo en http://localhost:3001');
  console.log('📚 Docs Públicas (GETs): http://localhost:3001/api-docs');
  console.log('🔥 Endpoints Privados (POST/PUT/DELETE): Activos pero no documentados');
  console.log('🚀 Ruta de Carrito: POST /pedidos');
});