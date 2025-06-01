const express = require('express');
const router = express.Router();
const Insumo = require('../models/Insumo');
const multer = require('multer');
const path = require('path');


// Configuración de multer para guardar imágenes en /uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // carpeta donde se guardarán las imágenes
  },
  filename: function (req, file, cb) {
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// POST /api/insumos con imagen
router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    
    const imagenUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const nuevoInsumo = new Insumo({
      ...req.body,
      imagenUrl
    });

    await nuevoInsumo.save();

    res.status(201).json({
      message: 'Insumo guardado exitosamente',
      insumo: nuevoInsumo
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al guardar el insumo', error: err.message });
  }
});



// ✅ Obtener todos los insumos
router.get('/', async (req, res) => {
  try {
    const insumos = await Insumo.find();
    res.json(insumos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener insumos' });
  }
});



// ✅ Eliminar insumo por nombre
router.delete('/nombre/:nombre', async (req, res) => {
  try {
    const resultado = await Insumo.deleteOne({ nombre: req.params.nombre });
    if (resultado.deletedCount === 0) {
      return res.status(404).json({ error: 'Insumo no encontrado' });
    }
    res.json({ mensaje: 'Insumo eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el insumo' });
  }
});

// PUT /api/insumos/nombre/:nombre
router.put('/nombre/:nombre', async (req, res) => {
  try {
    const nombre = req.params.nombre;
    const datosActualizados = req.body;

    const insumoActualizado = await Insumo.findOneAndUpdate(
      { nombre: nombre },
      datosActualizados,
      { new: true } // para que devuelva el documento actualizado
    );

    if (!insumoActualizado) {
      return res.status(404).json({ error: 'Insumo no encontrado para actualizar' });
    }

    res.json({
      message: 'Insumo actualizado exitosamente',
      insumo: insumoActualizado,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el insumo' });
  }
});


module.exports = router;
