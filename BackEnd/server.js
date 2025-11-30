const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// TU CONNECTION STRING (la que me diste, pero corregida con el nombre de la base)
const uri = "mongodb+srv://josessito:0DszfmEnrUD4wFwj@clusterjosesito.om0jlgy.mongodb.net/FoodPointDB?retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => console.log('CONECTADO A MONGODB ATLAS!'))
  .catch(err => console.log('Error de conexión:', err));

const Puesto = mongoose.model('Puesto', new mongoose.Schema({
  lat: Number,
  lng: Number,
  nombre: String,
  descripcion: String,
  foto: String,
  fecha: { type: Date, default: Date.now }
}));

app.get('/puestos', async (req, res) => {
  const todos = await Puesto.find().sort({ fecha: -1 });
  res.json(todos);
});

app.post('/puestos', async (req, res) => {
  const nuevo = new Puesto(req.body);
  await nuevo.save();
  res.status(201).json(nuevo);
});

app.delete('/puestos', async (req, res) => {
  await Puesto.deleteMany({});
  res.json({ ok: true });
});

app.listen(3000, () => {
  console.log('API FoodPoint + MongoDB corriendo en http://localhost:3000');
});