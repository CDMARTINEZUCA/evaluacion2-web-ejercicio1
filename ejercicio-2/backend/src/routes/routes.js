const express = require("express");
const router = express.Router();

const {
  iniciarMision,
  obtenerInventario,
  obtenerCarga,
  agregarCarga,
  actualizarUnidades,
  eliminarCarga,
  confirmarCarga,
} = require("../controllers/controller.js");

router.post("/iniciar-mision", iniciarMision);
router.get("/inventario", obtenerInventario);
router.get("/carga", obtenerCarga);

router.post("/carga/agregar", agregarCarga);
router.put("/carga/actualizar-unidades/:id", actualizarUnidades);
router.delete("/carga/eliminar/:id", eliminarCarga);
router.delete("/carga/confirmar", confirmarCarga);

module.exports = router;
