// Cargamos la librería request
var request = require('request');

// Definimos constanets
const predefined_welcome_message = [
    "Bienvenido, mi nombre es Mego, ¿En qué te ayudo $u?",
    "Hola, soy Mego y estoy para ayudarte. ¿Que estás necesitando $u?",
    "Hola $u, soy Mego ¿Te puedo ayudar en algo?"
];

const predefined_ticket_message = [
    "Se informa que el usuario está reportando lo siguiente:\n",
    "El usuario reporta el siguiente problema:\n",
    "Se reporta que el usuario está teniendo el siguiente inconveniente:\n",
]

const GET_TICKET_CONTEXT_DATA = "require_ticket";
const GET_TICKET_PLACEHOLDER = "TICKET_NUMBER";

const CONTEXT_CONVERSATION_ID = "conversation_id";
const CONTEXT_SYSTEM = "system";

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

// Función que manejaría la interacción con la ticketera, obteniendo un ticket en el proceso
// Se debe formatear la información obtenida en el chat. La información debería venir del chat. Habria que almacenar todo lo relevante a la conversación con el bot.
// Este número de ticket se enviara a Watson para que procese un mensaje tomando la variable de contexto que le enviaremos
// Una de los posibles formateos debería ser : detectar en los intents si se inicio por microinformatica, infraestructura, o administrativo
// Este mensaje se enviará al cliente como respuesta. El mensaje debe enviarlo la funcion mensaje

module.exports = function({param_workspace, param_version, param_headers, param_username, param_firstname, param_fullname} = {}){
    // Validamos si la información viene cargada correctamente
    if(param_workspace == undefined || param_version == undefined) throw 'No es posible generar instancia de mensaje sin Workspace y Version';
    // Almacenamos los elementos en sus correspondientes ubicaciones
    this._workspace = param_workspace;
    this._version = param_version;
    this._headers = param_headers;
    this._username = param_username;
    this._firstname = param_firstname;
    this._fullname = param_fullname;
    // Método que controla los mensajes
    this.message = function({userInput, context} = {}) {        
        // Configuramos el URI para poder realizar las consultas a la API
        const URI = "https://gateway-syd.watsonplatform.net/assistant/api/v1/workspaces/" + this._workspace + "/message?version=" + this._version;
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
                }, async (err, response, watsonResponse) => {
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
                    // Verificamos si Watson nos solicita tickets
                    var require_ticket = context.hasOwnProperty(GET_TICKET_CONTEXT_DATA);
                    // Validamos si en la petición enviada llego un mensaje donde solicita ticket
                    if(require_ticket) {
                        // Cargamos la libreria que gestiona la carga de tickets
                        var MSC = require("../../Ticket/MSC");
                        // Levantamos una variable que almacene el contenido del mensaje que será enviado al cliente
                        var cliente_details = predefined_ticket_message[Math.floor(Math.random() * predefined_ticket_message.length)];
                        // Cargamos los datos básicos del usuario
                        var username_data = "-Nombre de usuario : " + this._username + "\n";
                        var fullname_data = "-Nombre completo del usuario : " + this._fullname + "\n";
                        // Anexamos estos datos al compuesto del ticket
                        cliente_details += username_data + fullname_data;
                        // Iteramos sobre los elementos del contexto
                        for(var property in context){
                            // Validamos si la propiedad son las bases
                            if(property == CONTEXT_CONVERSATION_ID || property == CONTEXT_SYSTEM || property == "require_ticket") {
                                continue;
                            }
                            // Preparamos la descripción del tipo de dato a agregar al ticket
                            var label = property.replace(/_/g, " ");
                            // Guardamos el dato que viene en la etiqueta
                            var information = context[property];
                            // Almacenamos la información dentro del ticket
                            cliente_details += "-" + label + " : " + information + "\n";                             
                        }
                        // Dejamos un acumulador de numero de tickets
                        var ticket_number;
                        // Generamos un nuevo ticket y aguardamos el resultado
                        await MSC.Get({message_details: cliente_details}).then((ticketNumber) => { ticket_number = ticketNumber });
                    }
                    // Iteramos sobre todos los mensajes
                    messages.forEach(_message => {
                        try{
                            // Filtramos el mensaje
                            var filtered_message = filter_message_by_type({message:_message});
                            // Filtramos el ticket number si es un requisito de ticket
                            if(require_ticket) {
                                // Validamos si el mensaje incluye el reservador de espacio para tickets
                                if(filtered_message.text.includes(GET_TICKET_PLACEHOLDER)){                                    
                                    // Reemplazamos el reservador de espacio por el numero brindado
                                    filtered_message.text = filtered_message.text.replace(GET_TICKET_PLACEHOLDER, ticket_number);
                                }
                            }
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
                if(this._firstname != undefined) {
                    msg = msg.replace("$u", this._firstname);
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