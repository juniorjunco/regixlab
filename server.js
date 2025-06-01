const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/auth');
const insumosRoutes = require('./routes/insumos');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error(err));

app.use('/api/auth', authRoutes);
app.use('/api/insumos', insumosRoutes);

// ✅ Exporta la app para que Vercel la use
module.exports = app;
