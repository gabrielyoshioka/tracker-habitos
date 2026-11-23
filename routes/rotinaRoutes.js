const express = require('express');
const router = express.Router();
const rotinaController = require('../controllers/rotinaController');
const verificaAutenticacao = require('../middlewares/auth');

router.get('/rotinas', verificaAutenticacao, rotinaController.listarRotinas);

router.post('/rotinas', verificaAutenticacao, rotinaController.salvarRotina);
router.post('/rotinas/editar/:id', verificaAutenticacao, rotinaController.editarRotina);
router.post('/rotinas/excluir/:id', verificaAutenticacao, rotinaController.excluirRotina);

module.exports = router;