// Cargamos la librería request
var request = require('request');

// Definimos constanets
const predefined_welcome_message = [
    "Bienvenido, mi nombre es Mego, ¿En qué te ayudo $u?",
    "Hola, soy Mego y estoy para ayudarte. ¿Que estás necesitando $u?",
    "Hola $u, soy Mego ¿Te puedo ayudar en algo?"
];

var filter_message_by_type = function({message} = {}){
    // Preparamos el mensaje de respuesta
    var return_message = {}
    // Validamos por tipo de mensaje
    switch(message.response_type){
        case "text":            
            // Filtramos el mensaje recibdo
            return_message.type = "text";
            return_message.text = message.text;
            break;
        case "option":
            // generamos un acumulador de opciones
            var arrOptions = [];
            // Iteramos sobre todas las opciones que estan contenidas
            message.options.forEach(option => {
                // Filtramos las opciones
                var filteredOption = {
                    description: option.label,
                    value: option.value.input.text
                }
                // agregamos la opcion al listado
                arrOptions.push(filteredOption);
            });
            // Filtramos el mensaje
            return_message.text = message.title;
            // Validamos si el mensaje contiene description            
            if(message.description != undefined) return_message.description = message.description; 
            return_message.type = "option";
            return_message.options = arrOptions; 
            break;    
        default:
            throw "WatsonMessage: Tipo de mensaje de respuesta no reconocido o no soportado";
    }
    // Devolvemos el mensaje
    return return_message;
}

module.exports = function({param_workspace, param_version, param_headers, param_username} = {}){
    // Validamos si la información viene cargada correctamente
    if(param_workspace == undefined || param_version == undefined) throw 'No es posible generar instancia de mensaje sin Workspace y Version';
    // Almacenamos los elementos en sus correspondientes ubicaciones
    this._workspace = param_workspace;
    this._version = param_version;
    this._headers = param_headers;
    this._username = param_username;
    // Método que controla los mensajes
    this.message = function({userInput, context} = {}){        
        // Configuramos el URI para poder realizar las consultas a la API
        const URI = "https://gateway.watsonplatform.net/assistant/api/v1/workspaces/" + this._workspace + "/message?version=" + this._version;
        // Definimos método        
        const METHOD = "POST";        
        var promise = new Promise((resolve, reject) => {
            // Disponemos el método para obtener la información
            var getData = function(messageToConvert, context) {
                var body = {
                    input:{
                        text: messageToConvert
                    },
                    context: context
                };
                // Devolvemos el string procesado y convertido a string
                return JSON.stringify(body);
            }
            // Validamos si el mensaje viene vacio
            if(userInput != '' && userInput != undefined){       
                // Ejecutamos la petición de envío de mensajes
                request({
                    headers: this._headers,
                    uri: URI,
                    method: METHOD,
                    body: getData(userInput, context)
                }, function(err, response, watsonResponse) {
                    // Validamos si la petición viene con errores
                    if(err){                        
                        return reject("Error: Se ha producido un error al enviar mensaje: " + err);                                    
                    }   
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
                        try{
                            // Filtramos el mensaje
                            var filtered_message = filter_message_by_type({message:_message});
                            // Agregamos el mensaje filtrado
                            arrMessages.push(filtered_message);
                        } catch (error){
                            // Si hay errores en la consulta se muestra en consola
                            console.error(error);
                        }
                    });
                    // Agregamos los mensajes filtrados y el contexto a la respuesta procesada
                    processed_response.messages = arrMessages;                    
                    processed_response.context = context;
                    // Resolvemos la promise                
                    resolve(processed_response);
                });
            } else { // Si no hay mensaje enviado por el usuario, se considera como solicitud de inicio de interaccion, 
                     // para lo cual en vez de solicitar a watson un saludo y consumir un API innecesario enviamos una respuesta predefinida
                // Generamos un saludo random                
                var msg = predefined_welcome_message[Math.floor(Math.random() * predefined_welcome_message.length)];
                // Cambiamos el placeholder de usuario por el nombre comunicado
                // Validamos si el usuario vino cargado con la solicitud     
                if(this._username != undefined) {
                    msg = msg.replace("$u", this._username);
                } else { // Si no vino cargado reemplazamos el comodin
                    msg = msg.replace(" $u", "");
                }                
                // Preparamos el objeto JSON para enviar
                var finalMessage = {
                    messages: [ {type: "text", text: msg } ]
                }
                // Resolvemos con contenido del mensaje
                resolve(finalMessage);
            }
        });
        return promise;    
    }



}