const { json } = require("express");
const inventario = require("../data/data.js");

let estadoNave = {
  creditos: 500.0,
  itemsCargados: [],
  total: 0.0,
};

const calcularTotal = () => {
  let costoTotal = 0;

  estadoNave.itemsCargados.forEach((element) => {
    const itemInventario = inventario.find((item) => item.id == element.id);

    if (itemInventario) {
      costoTotal += itemInventario.precio * element.cantidad;
    }
  });

  estadoNave.total = costoTotal;
  return costoTotal;
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

module.exports = {
  obtenerInventario,
  obtenerCarga,
};
