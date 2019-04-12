'use strict'
// Cargamos la librería request
var request = require('request');
// Constantes relacionadas con la conexión a WatsonCloud
const USER = "apikey";
const PASSWORD = "7dBb_5eahnse1zvJtVVgo0Ozcz3M_A3YpZJwbL-Sqem8";
const VERSION = "2019-02-28";
const WORKSPACE_ID = "70e44047-c5cd-461a-aca6-78b843e514e5";

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
    // Disponemos el método para obtener la información
    var getData = function(messageToConvert) {
        let body = {
            input:{
                text: messageToConvert
            }
        }
        // Devolvemos el string procesado y convertido a string
        return JSON.stringify(body);
    }
    // Ejecutamos la petición de envío de mensajes
    request({
        headers: HEADERS,
        uri: URI,
        method: METHOD,
        body: getData(userInput)
    }, function(err, response, body) {
        // Validamos si la petición viene con errores
        if(err) return console.log("Error: Se ha producido un error al enviar mensaje: " + err);
        // Si pasamos la fase de validación en primera instancia logueamos lo obtenido
        console.log(JSON.parse(body));    
    });
}

module.exports = {
    message: message
}