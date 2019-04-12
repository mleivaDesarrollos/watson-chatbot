
// Levantamos la libreria express
var express = require("express");
var watsonIntegration = require("./WatsonIntegration");
// Ejecutamos la libreria
var app = express();
// Definimos el puerto de conexión
const PORT = 8010;

app.use(express.urlencoded({extended:true}));
app.use(express.json());

// Acceso principal al sitio
app.get("/", (req, res) => {
    watsonIntegration.message({userInput: "necesito toner para impresora lexmark 711 color negro", context: null});
    res.send("Mensaje enviado");
});

// Escuchamos sobre el puerto cargado en la constante
app.listen(PORT);
