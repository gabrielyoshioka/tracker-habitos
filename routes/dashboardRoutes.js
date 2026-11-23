const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const verificaAutenticacao = require('../middlewares/auth');

router.get('/', verificaAutenticacao, dashboardController.renderizarDashboard);

module.exports = router;