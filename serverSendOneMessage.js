'use strict';

// Cargamos la libreria express
var express = require('express');
// Instanciamos express en una variable
var app = express();

var AssistantV1 = require('watson-developer-cloud/assistant/v1');

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
var message = function(text, context) {
  var payload = {
    workspace_id: '6197d6d3-8dc6-42a3-9e06-7956b7c5b41f',
    input: {
      text: text
    },
    context: context
  };
  return new Promise((resolve, reject) =>
    assistant.message(payload, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    })
  );
};

app.get('/', (req, res) => {
    console.log(req.query);
    // Validamos que exista el query
    if(JSON.stringify(req.query) != "{}" ) {
        // Seccionamos el mensaje
        var _message = req.query.message;
        // Enviamos el mensaje al servicio de watson utilizando los métodos dispuestos
        message(_message, undefined).then( response => {
            // Una vez completada la promesa se informa por peticion
            res.send(response.output.text[0]);
        }).catch(err => res.send(err));
    } else {
        res.send('Envie un mensaje utilizando localhost/?message=');
    }
});

// Lanzamos la escucha sobre el puerto indicado
app.listen(2030);