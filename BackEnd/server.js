const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const uri = "mongodb+srv://josessito:0DszfmEnrUD4wFwj@clusterjosesito.om0jlgy.mongodb.net/FoodPointDB?retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => console.log('CONECTADO A MONGODB ATLAS!'))
  .catch(err => console.log('ERROR DE CONEXIÓN:', err));

const puestoSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  nombre: String,
  descripcion: String,
  foto: String,
  fecha: { type: Date, default: Date.now }
});

const Puesto = mongoose.model('Puesto', puestoSchema);

// GET todos
app.get('/puestos', async (req, res) => {
  try {
    const todos = await Puesto.find().sort({ fecha: -1 });
    console.log(`GET /puestos → ${todos.length} puestos enviados`);
    res.json(todos);
  } catch (err) {
    console.log("Error GET:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST nuevo
app.post('/puestos', async (req, res) => {
  try {
    console.log("RECIBIENDO NUEVO PUESTO:", req.body.nombre); // ESTE LOG ES LA CLAVE
    const nuevo = new Puesto(req.body);
    await nuevo.save();
    console.log("PUESTO GUARDADO EN ATLAS:", nuevo._id);
    res.status(201).json(nuevo);
  } catch (err) {
    console.log("ERROR AL GUARDAR:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE todos
app.delete('/puestos', async (req, res) => {
  await Puesto.deleteMany({});
  console.log("TODOS LOS PUESTOS BORRADOS");
  res.json({ ok: true });
});

// DELETE uno
app.delete('/puestos/:id', async (req, res) => {
  await Puesto.findByIdAndDelete(req.params.id);
  console.log("Puesto borrado:", req.params.id);
  res.json({ ok: true });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
  console.log("Prueba POST aquí: http://localhost:3000/puestos");
});