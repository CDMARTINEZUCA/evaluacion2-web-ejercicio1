const { json } = require("express");
const inventario = require("../data/data.js");

let estadoNave = {
  creditos: 500.0,
  itemsCargados: [],
  total: 0.0,
};

const TIEMPO_LIMITE_SEGUNDOS = 60;
let tiempoInicioMision = null;

const calcularTotal = () => {
  let costoTotal = 0;

  estadoNave.itemsCargados.forEach((element) => {
    const itemInventario = inventario.find((item) => item.id == element.id);

    if (itemInventario) {
      costoTotal += itemInventario.precio * element.stock;
    }
  });

  estadoNave.total = costoTotal;
  return costoTotal;
};

const verificarTiempoExpirado = () => {
  if (!tiempoInicioMision) return false; // Si no ha iniciado, no limitamos
  const segundosTranscurridos = (Date.now() - tiempoInicioMision) / 1000;
  return segundosTranscurridos > TIEMPO_LIMITE_SEGUNDOS;
};

const iniciarMision = (req, res) => {
  // Registra la hora exacta en la que el usuario inicia la misión
  tiempoInicioMision = Date.now();

  return res.status(200).json({
    mensaje: "Reloj de la misión iniciado",
    tiempoLimite: TIEMPO_LIMITE_SEGUNDOS,
  });
};

const obtenerInventario = (req, res) => {
  try {
    res.status(200).json(inventario);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener el inventario",
    });
  }
};

const obtenerCarga = (req, res) => {
  try {
    calcularTotal();
    res.status(200).json(estadoNave);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener los datos de la carga",
    });
  }
};

const agregarCarga = (req, res) => {
  try {

    if (verificarTiempoExpirado()) {
      return res.status(403).json({ mensaje: "La ventana de lanzamiento se ha cerrado. La sesión expiró." });
    }
    const equipoId = Number(req.body.equipoId);
    const cantidad = Number(req.body.cantidad);

    if (
      !Number.isInteger(equipoId) ||
      !Number.isInteger(cantidad) ||
      cantidad <= 0
    ) {
      return res.status(400).json({
        mensaje: "El equipo y la cantidad deben ser válidos",
      });
    }

    const indiceBase = inventario.findIndex((item) => item.id === equipoId);
    if (indiceBase === -1) {
      return res.status(404).json({
        mensaje: "El ítem no está en la carga de la base (inventario)",
      });
    }

    const itemBase = inventario[indiceBase];
    if (itemBase.stock < cantidad) {
      return res.status(400).json({
        mensaje: "Stock en base insuficiente",
      });
    }

    const costo = itemBase.precio * cantidad;
    if (estadoNave.creditos < costo) {
      return res.status(400).json({
        mensaje: "Créditos insuficientes para esta cantidad",
      });
    }

    const indiceNave = estadoNave.itemsCargados.findIndex(
      (item) => item.id === equipoId,
    );

    if (indiceNave === -1) {
      estadoNave.itemsCargados.push({
        id: itemBase.id,
        nombre: itemBase.nombre,
        precio: itemBase.precio,
        categoria: itemBase.categoria,
        stock: cantidad,
      });
    } else {
      const itemNave = estadoNave.itemsCargados[indiceNave];
      itemNave.stock = (itemNave.stock || 0) + cantidad;
    }

    itemBase.stock -= cantidad;
    estadoNave.creditos -= costo;
    calcularTotal();

    return res.status(201).json({
      mensaje: "Suministro agregado correctamente a la carga",
      carga: estadoNave,
      inventario: inventario,
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al agregar el suministro a la carga",
    });
  }
};

const actualizarUnidades = (req, res) => {
  try {

    if (verificarTiempoExpirado()) {
      return res.status(403).json({ mensaje: "La ventana de lanzamiento se ha cerrado. La sesión expiró." });
    }

    const { cantidad, transaccionElegida } = req.body;
    const indiceNave = estadoNave.itemsCargados.findIndex(
      (i) => i.id == Number(req.params.id),
    );
    if (indiceNave === -1) {
      return res
        .status(404)
        .json({ mensaje: "El ítem no está en la carga de la nave" });
    }
    const indiceBase = inventario.findIndex(
      (i) => i.id == Number(req.params.id),
    );
    if (indiceBase === -1) {
      return res.status(404).json({
        mensaje: "El ítem no está en la carga de la base (inventario)",
      });
    }
    const cant = Number(cantidad);
    const itemNave = estadoNave.itemsCargados[indiceNave];
    const itemBase = inventario[indiceBase];
    const costoMovimiento = cant * itemBase.precio;
    if (itemNave.stock === undefined || itemNave.stock === null) {
      itemNave.stock = 0;
    }

    if (transaccionElegida == "Agregar") {
      if (itemBase.stock < cant) {
        return res.status(400).json({ mensaje: "Stock en base insuficiente" });
      }
      if (estadoNave.creditos < costoMovimiento) {
        return res
          .status(400)
          .json({ mensaje: "Créditos insuficientes para esta cantidad" });
      }
      itemBase.stock -= cant;
      itemNave.stock += cant;
      estadoNave.creditos -= costoMovimiento;
    } else if (transaccionElegida == "Eliminar") {
      if (itemNave.stock < cant) {
        return res.status(400).json({
          mensaje: "No puedes quitar más unidades de las que tienes cargadas",
        });
      }
      itemBase.stock += cant;
      itemNave.stock -= cant;
      estadoNave.creditos += costoMovimiento;
    } else {
      return res
        .status(400)
        .json({ mensaje: "Transacción no válida o no especificada" });
    }

    calcularTotal();

    return res.status(200).json({
      mensaje: "Carga actualizada correctamente",
      transaccion: transaccionElegida,
      Cantidad: cant,
      itemModificado: itemNave,
      creditosRestantes: estadoNave.creditos,
      totalCostoNave: estadoNave.total,
      inventarioBaseStockRestante: itemBase.stock,
    });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al actualizar la carga" });
  }
};

const eliminarCarga = (req, res) => {
  try {

    if (verificarTiempoExpirado()) {
      return res.status(403).json({ mensaje: "La ventana de lanzamiento se ha cerrado. La sesión expiró." });
    }

    const indiceNave = estadoNave.itemsCargados.findIndex(
      (i) => i.id == Number(req.params.id),
    );
    const indiceBase = inventario.findIndex(
      (i) => i.id == Number(req.params.id),
    );

    const [cargaeliminada] = estadoNave.itemsCargados.splice(indiceNave, 1);
    if (indiceBase !== -1) {
      inventario[indiceBase].stock += cargaeliminada.stock;
    } else {
      inventario.push(cargaeliminada);
    }

    estadoNave.creditos += cargaeliminada.stock * cargaeliminada.precio;
    calcularTotal();

    return res.status(200).json({
      message: "Carga eliminada correctamente de la nave y devuelta a base",
      /*Nave: cargaeliminada,
      Base: inventario,*/
      creditosRestantes: estadoNave.creditos,
      totalCostoNave: estadoNave.total,
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar carga" });
  }
};

const confirmarCarga = (req, res) => {
  try {
    const { boton } = req.body;
    if (typeof boton !== "boolean") {
      return res.status(400).json({
        mensaje: "El valor del botón debe ser true o false",
      });
    }

    if (boton === false) {
      const cargasEliminadas = [...estadoNave.itemsCargados];

      cargasEliminadas.forEach((cargaEliminada) => {
        const indiceBase = inventario.findIndex(
          (item) => item.id === cargaEliminada.id,
        );

        if (indiceBase !== -1) {
          inventario[indiceBase].stock += cargaEliminada.stock;
        } else {
          inventario.push(cargaEliminada);
        }

        estadoNave.creditos += cargaEliminada.stock * cargaEliminada.precio;
      });

      estadoNave.itemsCargados = [];
      calcularTotal();

      tiempoInicioMision = null;

      return res.status(200).json({
        mensaje: "El tiempo terminó. La carga fue devuelta al inventario",
        carga: estadoNave,
        inventario: inventario,
      });
    }

    if (boton === true) {
      if (estadoNave.itemsCargados.length === 0) {
        return res.status(400).json({
          mensaje: "Ingrese al menos un suministro antes de confirmar la carga"
        });
      }
      return res.status(200).json({
        mensaje: "Misión confirmada, buena suerte en tu viaje"
      });
    }
  } catch (error) {
    res.status(500).json({ mensaje: "Error al confirmar carga" });
  }
};

module.exports = {
  iniciarMision,
  obtenerInventario,
  obtenerCarga,
  agregarCarga,
  actualizarUnidades,
  eliminarCarga,
  confirmarCarga,
};
