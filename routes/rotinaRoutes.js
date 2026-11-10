const express = require('express');
const router = express.Router();
const rotinaController = require('../controllers/rotinaController');
const verificaAutenticacao = require('../middlewares/auth');

router.post('/rotinas', verificaAutenticacao, rotinaController.salvarRotina);

module.exports = router;