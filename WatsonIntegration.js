 'use strict'
// Cargamos la librería request
var request = require('request');
// Constantes relacionadas con la conexión a WatsonCloud
const USER = "apikey";
const PASSWORD = "7dBb_5eahnse1zvJtVVgo0Ozcz3M_A3YpZJwbL-Sqem8";
const VERSION = "2019-02-28";
const WORKSPACE_ID = "695c0ae2-9fe2-4df8-9778-7248f786eb61";

const getAuthorization = function(){
    // Concatenamos las credenciales para formar el hash
    let concat_credentials = USER + ":" + PASSWORD;
    // Devolvemos las credenciales sobre Base64
    return "Basic " + Buffer.from(concat_credentials).toString('base64');
}

// Los headers de peticion en general se mantienen estables, en caso de necesitar modificarlo se deberá copiar los mismos
const HEADERS = {'Content-Type': 'application/json', 'Authorization' : getAuthorization()}

var message = function({userInput, context} = {}){
    // Configuramos el URI para poder realizar las consultas a la API
    const URI = "https://gateway.watsonplatform.net/assistant/api/v1/workspaces/" + WORKSPACE_ID + "/message?version=" + VERSION;
    // Definimos método
    const METHOD = "POST";
    var promise = new Promise((resolve, reject) => {
        // Disponemos el método para obtener la información
        var getData = function(messageToConvert, context) {
            let body = {
                input:{
                    text: messageToConvert
                },
                context: context
            };
            // Devolvemos el string procesado y convertido a string
            return JSON.stringify(body);
        }
        // Ejecutamos la petición de envío de mensajes
        request({
            headers: HEADERS,
            uri: URI,
            method: METHOD,
            body: getData(userInput)
        }, function(err, response, watsonResponse) {
            // Validamos si la petición viene con errores
            if(err) return reject("Error: Se ha producido un error al enviar mensaje: " + err);
            // Parseamos la respuesta
            watsonResponse = JSON.parse(watsonResponse);    
            // Si pasamos la fase de validación en primera instancia logueamos lo obtenido
            var processed_response = {};
            var arrMessages = [];        
            // Levantamos todos los mensajes recibidos de respuesta
            var messages = watsonResponse.output.generic;
            var context = watsonResponse.context;
            // Iteramos sobre todos los mensajes
            messages.forEach(_message => {
                var filterMessage = {}
                if(_message.response_type == "text"){
                    // Filtramos el mensaje recibdo
                    filterMessage.type = "text";
                    filterMessage.text = _message.text;
                    // Agregamos el elemento al array
                    arrMessages.push(filterMessage);
                } else if(_message.response_type = "option"){
                    // generamos un acumulador de opciones
                    var arrOptions = [];
                    // Iteramos sobre todas las opciones que estan contenidas
                    _message.options.forEach(option => {
                        // Filtramos las opciones
                        var filteredOption = {
                            description: option.label,
                            value: option.value.input.text
                        }
                        // agregamos la opcion al listado
                        arrOptions.push(filteredOption);
                    });
                    // Filtramos el mensaje
                    filterMessage.text = _message.title;
                    filterMessage.type = "option";
                    filterMessage.options = arrOptions;                }                
                    // Agregamos el mensaje al array de elementos
                    arrMessages.push(filterMessage);
            });
            // Agregamos los mensajes filtrados y el contexto a la respuesta procesada
            processed_response.messages = arrMessages;
            processed_response.context = context;
            // Resolvemos la promise
            console.log(processed_response);
            resolve(processed_response);
        });
    });
    return promise;    
}

module.exports = {
    message: message
}