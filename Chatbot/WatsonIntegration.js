 'use strict';
// Constantes relacionadas con la conexión a WatsonCloud
const USER = "apikey";
const PASSWORD = "7dBb_5eahnse1zvJtVVgo0Ozcz3M_A3YpZJwbL-Sqem8";
const VERSION = "2019-02-28";
const WORKSPACE_ID = "a78d1383-9ca9-49d8-a3cb-cc576947cc0b";
// Cargamos los modulos de watson
var msgModule =  require('./Watson/Message');

const getAuthorization = function(){
    // Concatenamos las credenciales para formar el hash
    let concat_credentials = USER + ":" + PASSWORD;
    // Devolvemos las credenciales sobre Base64
    return "Basic " + Buffer.from(concat_credentials).toString('base64');
}
// Los headers de peticion en general se mantienen estables, en caso de necesitar modificarlo se deberá copiar los mismos
const HEADERS = {'Content-Type': 'application/json', 'Authorization' : getAuthorization()}

module.exports = {
    message: function({userInput, context, username, firstname, fullname}={}){
        // Generamos una nueva instancia del modulo
        var msg = new msgModule({param_workspace:WORKSPACE_ID, param_version:VERSION, param_headers: HEADERS, param_username: username, param_firstname: firstname, param_fullname: fullname});
        // Llamamos al mensaje
        return msg.message({userInput:userInput, context:context});
    }
}