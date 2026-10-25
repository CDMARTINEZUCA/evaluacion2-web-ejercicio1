const express = require('express');
const app = express();
const puerto = 3067;

app.get('/', (req, res) => {
    res.send('Six seven');
});

app.listen(puerto, () => {
    console.log(`Servidor escuchando en http://localhost:${puerto}`);
});