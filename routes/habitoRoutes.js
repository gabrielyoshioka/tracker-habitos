const express = require('express');
const router = express.Router();
const habitoController = require('../controllers/habitoController');
const verificaAutenticacao = require('../middlewares/auth');

router.get('/habitos', verificaAutenticacao, habitoController.listarHabitos);

router.post('/habitos', verificaAutenticacao, habitoController.salvarHabito);
router.post('/habitos/checkin', verificaAutenticacao, habitoController.toggleCheckin);
router.post('/habitos/editar/:id', verificaAutenticacao, habitoController.editarHabito);
router.post('/habitos/excluir/:id', verificaAutenticacao, habitoController.inativarHabito);

module.exports = router;