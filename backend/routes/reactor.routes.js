const express = require('express');
const router = express.Router();


const{
    ajustarTemperatura,
    reiniciarSistema
} = require('../controllers/reactor.controller.js');

router.post('/adjust', ajustarTemperatura);
router.post('/reboot', reiniciarSistema);

module.exports = router;