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

// Hacemos que express considere las librerias middleware bodyparser y multer para su funcionamiento
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());
// ... sumamos cookie y session para manejar el auth
app.use(cookie());
app.use(session({ secret: 'codigo secreto', resave: false, saveUninitialized: false }));

// Logica de autenticación
app.post('/authenticate', (req, res) => {
  var adMega = new ad(configAD);
  var userData = req.body;
  // console.log(userData); // USR, PSW, STY
  adMega.authenticate(userData.user + '@mega.com.ar', userData.pass, function (err, auth) {
    if (auth) {
      adMega.find('(&(sAMAccountName=' + userData.user + '))', function(err, results) {
        // Separamos el primer nombre del usuario de AD
        var firstName = results.users[0].givenName.split(" ")[0];
        var fullName = results.users[0].displayName;
        req.session.username = userData.user;
        req.session.auth = Buffer.from(userData.user + ":" + userData.pass).toString('base64');
        req.session.firstname = firstName;
        req.session.fullname = fullName;
        req.session.isLogged = true;
        res.cookie('nombreUsuario', req.session.firstname);
        // Si checkbox==false --> vida de la cookie = 1hs
        if (userData.stay == false) {
          req.session.cookie.maxAge = 3600000; // milisegundos
        }

        res.send(true);
      });
    }
    else res.send(false);
  });
});

// GET LOGOUT
app.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.redirect(req.get('referer'));
});


// app.use('/login', express.static('./public/login'));

// app.use(function (req, res, next) {
//   if (req.session.isLogged) {
//     next();
//   }
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

app.post('/send', (req, res) => {
  // Separamos el componente JSON enviado
  let msgToSend = req.body;
  // Obtenemos el nombre del usuario sacado de la session
  let firstName = req.session.firstname;
  let fullName = req.session.fullname;
  let username = req.session.username;
  let auth = req.session.auth;  
  // Separamos menssaje
  var message = msgToSend.message;
  var context;
  if(msgToSend.context != undefined) context = JSON.parse(msgToSend.context);
  var chatbot = require('./Chatbot/WatsonIntegration');
  // TODO : Sacar el harcodeado
  chatbot.message({userInput: message, context: context, firstname: firstName, fullname: fullName,  username: username, auth: auth}).then((messageFromBot) => {
      res.json(messageFromBot);
  });
})
// Lanzamos la escucha sobre el puerto indicado
app.listen(2030);
