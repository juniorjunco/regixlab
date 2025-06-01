const express = require('express');
const router = express.Router();
const Insumo = require('../models/Insumo');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const streamifier = require('streamifier');


// Configura Cloudinary con tus datos (usa variables de entorno)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// multer setup para guardar el archivo en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    let imagenUrl = null;

    if (req.file) {
      // Subir la imagen desde buffer a Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'insumos' },
        async (error, result) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al subir imagen a Cloudinary' });
          }

          imagenUrl = result.secure_url;

          // Guardar insumo en DB con URL de imagen
          const nuevoInsumo = new Insumo({
            ...req.body,
            imagenUrl
          });

          await nuevoInsumo.save();

          return res.status(201).json({
            message: 'Insumo guardado exitosamente',
            insumo: nuevoInsumo
          });
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } else {
      // Si no hay imagen, solo guardar insumo sin imagenUrl
      const nuevoInsumo = new Insumo({
        ...req.body,
        imagenUrl: null
      });

      await nuevoInsumo.save();

      res.status(201).json({
        message: 'Insumo guardado exitosamente',
        insumo: nuevoInsumo
      });
    }
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
