const express = require("express");
const { config } = require("dotenv");
const rutas = require("./routes/routes.js");
config();
const app = express();
const port = process.env.PORT || 3005;
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use("/api", rutas);

app.get("/", (req, res) => {
  res.send("Six eight");
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
