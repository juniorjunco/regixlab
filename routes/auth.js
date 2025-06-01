const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

// Registro
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ msg: 'El usuario ya existe' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed });
    await user.save();

    res.status(201).json({ msg: 'Usuario creado correctamente' });
  } catch (err) {
    console.error('Error al registrar usuario:', err); // 👈 Agrega esta línea
    res.status(500).json({ msg: 'Error del servidor' });
  }
});


// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Credenciales inválidas' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'Credenciales inválidas' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// Cambiar contraseña con token JWT
router.post('/cambiar-contrasena', authMiddleware, async (req, res) => {
  const { contrasenaActual, nuevaContrasena, confirmacionContrasena } = req.body;

  if (!contrasenaActual || !nuevaContrasena || !confirmacionContrasena) {
    return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
  }

  if (nuevaContrasena !== confirmacionContrasena) {
    return res.status(400).json({ msg: 'Las contraseñas no coinciden' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    const match = await bcrypt.compare(contrasenaActual, user.password);
    if (!match) return res.status(401).json({ msg: 'Contraseña actual incorrecta' });

    const hashed = await bcrypt.hash(nuevaContrasena, 10);
    user.password = hashed;
    await user.save();

    res.json({ msg: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// Obtener usuario autenticado
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Excluir contraseña
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});



module.exports = router;
