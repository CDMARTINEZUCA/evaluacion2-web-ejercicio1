const express = require("express");
const router = express.Router();

const {
  obtenerInventario,
  obtenerCarga,
  agregarCarga,
  actualizarUnidades,
  eliminarCarga
} = require("../controllers/controller.js");

router.get("/inventario", obtenerInventario);
router.get("/carga", obtenerCarga);

router.post('/carga/agregar', agregarCarga)
router.put('/carga/actualizar-unidades/:id',actualizarUnidades)
router.delete('/carga/eliminar/:id', eliminarCarga)

module.exports = router;
