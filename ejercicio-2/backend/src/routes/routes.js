const express = require("express");
const router = express.Router();

const {
  obtenerInventario,
  obtenerCarga,
} = require("../controllers/controller.js");

router.get("/inventario", obtenerInventario);
router.get("/carga", obtenerCarga);

module.exports = router;
