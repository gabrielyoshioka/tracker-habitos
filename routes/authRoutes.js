const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/cadastro', authController.renderAuth);
router.post('/cadastro', authController.registrarUsuario);

router.get('/login', authController.renderAuth);
router.post('/login', authController.loginUsuario);

router.get('/logout', authController.logoutUsuario);

module.exports = router;