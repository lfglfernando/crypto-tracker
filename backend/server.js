require('dotenv').config();


const express = require('express');
const cors = require("cors");
const db = require('./db'); //Importa la conexion a MySQL
const authRoutes = require("./authRoutes");//Importar rutas de autenticacion
const portfolioRoutes = require("./portfolioRoutes"); //Importar rutas del portfolio
const transactionsRoutes = require("./transactionsRoutes");

const app = express();
app.use(cors());
app.use(express.json({ strict: false }));

app.use("/auth", authRoutes); //Agregar rutas de autenticacion
app.use("/portfolio", portfolioRoutes);
app.use("/transactions", transactionsRoutes);

const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Servidor funcionando 🚀');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});