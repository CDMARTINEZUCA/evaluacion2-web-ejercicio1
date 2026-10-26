const { json } = require("express");
let temperatura = generarTemperatura();

function generarTemperatura() {
  return Math.floor(Math.random() * 100) + 1;
}

const ajustarTemperatura = (req, res) => {
  try {
    const tempIngresada = Number(req.body.temperatura);

    if (isNaN(tempIngresada))
      return res.status(400).json({
        mensaje: "Formato de temperatura invalido",
      });

    if (tempIngresada > 0 && tempIngresada <= 100) {
      if (tempIngresada > temperatura)
        res.status(200).json({
          mensaje: "La temperatura del reactor es más baja",
          estabilizado: false
        });
      else if (tempIngresada < temperatura)
        res.status(200).json({
          mensaje: "La temperatura del reactor es más alta",
          estabilizado: false
        });
      else
        res.status(200).json({
          mensaje: "La temperatura del reactor esta estabilizada",
          estabilizado: true
        });
    } else
      res.status(400).json({
        error: tempIngresada + " no es un numero valido",
      });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al evaluar la temperatura" });
  }
};

const reiniciarSistema = (req, res) => {
  try {
    temperatura = generarTemperatura();
    res.status(200).json({
      mensaje: "Se ha establecido una nueva temperatura del reactor",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error reestableciendo la temperatura",
    });
  }
};

module.exports = {
  ajustarTemperatura,
  reiniciarSistema,
};
