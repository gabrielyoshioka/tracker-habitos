const express = require('express');
const router = express.Router();
const habitoController = require('../controllers/habitoController');
const verificaAutenticacao = require('../middlewares/auth');

router.post('/habitos', verificaAutenticacao, habitoController.salvarHabito);

router.post('/habitos/checkin', verificaAutenticacao, express.json(), habitoController.toggleCheckin);

module.exports = router;