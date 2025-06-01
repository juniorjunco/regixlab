const mongoose = require('mongoose');

const InsumoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  registroInvima: String,
  lugarAlmacenamiento: String,
  cantidad: { type: Number, required: true },
  fechaRegistro: Date,
  fechaApertura: Date,
  fechaFinalizacion: Date,
  fechaVencimiento: Date,
  lote: String,
  fabricante: String,
  imagenUrl: String, 
}, { timestamps: true });

module.exports = mongoose.model('Insumo', InsumoSchema);
