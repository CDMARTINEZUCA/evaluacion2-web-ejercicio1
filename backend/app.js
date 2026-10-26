const express = require("express");
const reactorRoutes = require("./routes/reactor.routes.js");
const app = express();
const puerto = 3067;
const cors = require("cors");

app.use(express.json());
app.use("/api/reactor", reactorRoutes);

app.get("/", (req, res) => {
  res.send("Six seven");
});

app.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}`);
});
