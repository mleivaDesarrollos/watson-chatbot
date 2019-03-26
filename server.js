'use strict';

// Cargamos la libreria express
var express = require('express');
// Instanciamos express en una variable
var app = express();
// El Path
var path = require('path');

// Cargamos libreria para parsear formularios por post
var bodyParser = require('body-parser');
// Cargamos la libreria para poder subir archivos
var multer = require('multer');
// instanciamos la libreria
var upload = multer();
var AssistantV1 = require('watson-developer-cloud/assistant/v1');

/*  LIBRERIAS AUTHENTICATION  */
var ad = require('activedirectory');
var session = require('express-session');
var cookie = require('cookie-parser');

// CONFIGURACION AD
var configAD = {
  url: 'ldap://192.168.1.1:389',
  baseDN: 'dc=mega,dc=com,dc=ar',
  username: 'admintec@mega.com.ar',
  password: 'C4rr13r!'
};
var adMega = new ad(configAD);

// Hacemos que express considere las librerias middleware bodyparser y multer para su funcionamiento
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());
// ... sumamos cookie y session para manejar el auth
app.use(cookie());
app.use(session({ secret: 'codigo secreto', resave: false, saveUninitialized: false }));

// Lógica de auth
app.post('/authenticate', (req, res) => {
  var userData = req.body;
  console.log(userData);
  adMega.authenticate(userData.user + '@mega.com.ar', userData.pass, function (err, auth) {
    if (auth) {
      req.session.username = userData.user;
      req.session.isLogged = true;
      console.log(req.session);
      res.send('logueo correcto');
    }
    else res.send('logueo invalido');
  });
});

// app.use(function (req, res, next) {
//   console.log(req.session);
//   if (req.session.isLogged)
//     next();
//   else {
//     res.sendFile(path.join(__dirname + '/public/login/login.html'));
//   }
// });

app.use('/', express.static('./public'));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/**
 * Instantiate the Watson Assistant Service
 */
var assistant = new AssistantV1({
  username: 'apikey',
  password: 'KK4yC9kafKiF9Qbg4dFOTNU5gN0iXIBMHvHZ2om8lj1R',
  version: '2018-02-16'
});

/**
 * Calls the assistant message api.
 * returns a promise
 */
var message = function (text, context) {
  var payload = {
    workspace_id: '1dd2c8ac-ab45-4e0c-bc01-0e231c01a703',
    input: {
      text: text
    },
    context: context
  };
  return new Promise((resolve, reject) =>
    assistant.message(payload, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    })
  );
};

// Controlamos por get las peticiones de envio // Metodo GET, prueba para un mensaje
app.get('/send', (req, res) => {
  // Validamos si el req viene con mensaje
  if (req.query.message != "") {
    //console.log(req.query.message);
    // Separamos el mensaje en una variable
    let msjToSend = req.query.message;
    // Utilizando esta variable usamos el método dispuesto para comunicarnos con el asistente
    message(msjToSend, undefined).then((response) => {
      // Una vez recibida la respuesta, se envía el contenido del mensaje al solicitante
      // console.log(response.output.text[0]);3
      console.log(response);
      res.send(response.output.text[0]);
    });
  }
});

app.post('/send', (req, res) => {
  // Separamos el componente JSON enviado
  let msgToSend = req.body;
  console.log("Mensaje que envia el cliente: ");
  console.log(msgToSend);
  // Validamos si el mensaje viene con contexto
  if (msgToSend.context != undefined)
    // Realizamos un JSON parse del contexto
    msgToSend.context = JSON.parse(msgToSend.context);
  // Validamos si existe un id de conversacion
  message(msgToSend.msg, msgToSend.context).then(watsonResponse => {
    console.log(watsonResponse);
    console.log(watsonResponse.context.system._node_output_map);
    // Formateamos la respuesta a formato JSON y pasamos el contexto
    var responseToClient = {
      msg: watsonResponse.output.text[0],
      context: watsonResponse.context
    }
    // Enviamos la respuesta en devolución
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(JSON.stringify(responseToClient));
  });
})

// app.get('/', (req, res) => {
//     console.log(req.query);
//     // Validamos que exista el query
//     if(JSON.stringify(req.query) != "{}" ) {
//         // Seccionamos el mensaje
//         var _message = req.query.message;
//         // Enviamos el mensaje al servicio de watson utilizando los métodos dispuestos
//         message(_message, undefined).then( response => {
//             // Una vez completada la promesa se informa por peticion
//             res.send(response.output.text[0]);
//         }).catch(err => res.send(err));
//     } else {
//         res.send('Envie un mensaje utilizando localhost/?message=');
//     }
// });

// Lanzamos la escucha sobre el puerto indicado
app.listen(2030);
