const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const verificaAutenticacao = require('../middlewares/auth');

// Aplica a trava de segurança antes de chamar o controlador
router.get('/', verificaAutenticacao, dashboardController.renderizarDashboard);

module.exports = router;