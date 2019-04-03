// Cargamos el modulo del chatbot. En este caso es el IBM Cloud Watson Asssistant
var AssistantIBMWatson = require('watson-developer-cloud/assistant/v1');

// Datos de credenciales de conexión. Actualmente el proveedor de servicio es IBM Cloud
const chatbotAPI_username = 'apikey';
const chatbotAPI_password = 'KK4yC9kafKiF9Qbg4dFOTNU5gN0iXIBMHvHZ2om8lj1R';
const chatbotAPI_version = '2018-02-16';
const chatbotAPI_workspaceid = '0c062f85-3d22-49d4-8e53-6ccc625f7f43';

const predefinedWelcomeMessage = [
    "Bienvenido, mi nombre es Mego, ¿En qué te ayudo, $u?",
    "Hola, soy Mego y estoy para ayudarte. ¿Que estás necesitando $u?",
    "Hola $u, soy Mego ¿Te puedo ayudar en algo?"
];

/**
 * Instantiate the Watson Assistant Service
 */
var assistant = new AssistantIBMWatson({
    username: chatbotAPI_username,
    password: chatbotAPI_password,
    version: chatbotAPI_version
  });


// Exportamos la función de envío de mensajes para que sea utilizado
module.exports = function(firstnameOfUser) {
  // Guardamos el nombre de usuario para ser usado a futuro
    this.firstname = firstnameOfUser;  
    /**
     * Calls the assistant message api.
     * returns a promise
     */
    this._message = function (text, context) {
      var payload = {
        workspace_id: chatbotAPI_workspaceid,
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
    this.SendMessageAndAwaitResponse = async (MessageWithContext) => {      
      // Separamos contenido de mensaje actual y contexto
      let message = MessageWithContext.msg;
      let context;
      // Validamos si el usuario envió alguna información
      if(message){
        // Si viene con contexto se mantiene y se envia al bot, sino el bot generara un nuevo contexto
        if(MessageWithContext.context != undefined) context = JSON.parse(MessageWithContext.context);      
        // Disponemos de un acumulador temporal de mensajes
        var botResponse;
        // Ejecutamos el llamado a la función
        await this._message(message, context).then((chatbot_response) => botResponse = chatbot_response);
        // Separamos el mensaje que queremos devolver. Segun IBM Cloud API, el mensaje tiene que contener el contexto      
        var finalMessage = {
          msg: botResponse.output.text[0],
          context: botResponse.context
        };
        // Como el mensaje viaja al cliente el JSON debe pasarse a texto
        finalMessage = JSON.stringify(finalMessage);
        // Devolvemos el mensaje procesado
        return finalMessage;
      }
      // Si no envia ningun mensaje el usuario, predefinidamente le enviamos un saludo
      else {
        // Generamos un saludo random
        var msg = predefinedWelcomeMessage[Math.floor(Math.random() * predefinedWelcomeMessage.length)];
        // Cambiamos el placeholder de usuario por el nombre comunicado
        msg = msg.replace("$u", this.firstname);
        // Preparamos el objeto JSON para enviar
        var finalMessage = {
          msg: msg
        }
        // Convertimos el JSON a string
        finalMessage = JSON.stringify(finalMessage);
        // Devolvemos el mensaje procesado
        return finalMessage
      }
    }
}