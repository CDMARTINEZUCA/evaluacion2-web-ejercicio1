const express = require('express');
const { config } = require('dotenv');

config();

const app = express();
const port = process.env.PORT||3005;

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`)
});

