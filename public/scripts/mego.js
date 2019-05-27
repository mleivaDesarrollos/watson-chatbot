(function() {
    // Constante que almacena el contexto
    const CONTEXT_INPUT_TYPE = "hidden";
    const CONTEXT_INPUT_NAME = "inpContext";
    // Direccion hacia donde se apunta el servicio de bot
    const CHATBOT_URL = '/send';
    const CHATBOT_HTTPMETHOD = 'post';
    const SALUDO = 'Hola Mego!';
    const CONTEXT_DATA = 'input[name="' + CONTEXT_INPUT_NAME + '"]';
    // Constantes relacionados con los intervalos de espera
    const AWAITING_RESPONSE_MESSAGES = ["¿Seguís ahí?", "Te espero "];
    const FINISHING_CHAT_INACTIVITY_MESSAGES = ["Avisame cualquier cosa, yo siempre estoy aqui para cualquier consulta que tengas.", "Cuando tengas tiempo seguimos hablando!"];
    // Todos los tiempos se encuentran en valor milisegundos
    const INTERVAL_AWAIT_RESPONSE = 60000; //60000
    const INTERVAL_FINISH_ACTIVITY = 120000; //120000 
    const INTERVAL_POST_FINISH_DELAY = 120000; //120000
    // Variables que se utilizaran como recursos publicos
    var chat_msg_usuario;
    var chat_msg_bot;
    var chat_msg_option;

    var await_response_timeout_id, finish_message_timeout_id, reset_chatlog_timeout_id;
    var pending_delivering_messages = [];
    var indice = 0;

    var is_conversation_starting = false;

    // Guardamos las URL de los recursos publicos del chat

    var HTMLMego = "/mego/index.html";
    var CSSFirstUrl = "/mego/css/firstStyle.css";
    var CSSSecondUrl = "/mego/css/secondStyle.css";

    // Creamos estilos
    var startingStyle = document.createElement("style");
    var secondStyle = document.createElement("style");

    // Funcion encargada de disparar los eventos principales del chat
    var events = function() {
        // Iniciar conversacion
        startConversation();
        // Pestañeo
        reactions("intervalPestaneoFocus", " ");
        // Abrir chat
        $("#chat-circle").click(open_chatbox);
        // Cerrar chat
        $(".chat-box-toggle").click(close_chatbox);
        // Enviar mensaje
        $("#chat-submit").click(click_submit);
        // Cambiamos estilos del chat
        $("#formButton").click(changeStyle);
    }

    // Generamos el chat
    var generate_chat = function(responseHTML) {

        var div_chat_mego = document.createElement("div");
        div_chat_mego.innerHTML = responseHTML;

        var chat_body = div_chat_mego.querySelector(".chat-mego");
        var input = div_chat_mego.querySelector("#formInput");

        chat_msg_usuario = div_chat_mego.querySelector(".chat-msg.usuario");
        chat_msg_bot = div_chat_mego.querySelector(".chat-msg.bot");
        chat_msg_option = div_chat_mego.querySelector(".chat-msg.option");

        // Validamos el input prohibiendo pegar y los caracteres (<->)
        input.addEventListener('keydown', (event) => {
            var keyName = event.key;
            input.onpaste = function(event) {
                event.preventDefault();
            }

            if (keyName == "<" || keyName == ">") {
                event.preventDefault();
                return false;
            }
            return true;
        });

        document.body.appendChild(chat_body);

        // Pedimos los estilos primarios
        AjaxCall({
            url: CSSFirstUrl,
            method: 'GET',
            callback: saveFirstStyle
        });

        // Pedimos los estilos secundarios
        AjaxCall({
            url: CSSSecondUrl,
            method: 'GET',
            callback: saveSecondStyle
        });
        // Ejecutamos eventos
        events();
    }

    // Llamado asíncrono a cualquier función requerida

    var AjaxCall = function({
        url,
        method,
        callback,
        data,
        json
    } = {}) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.addEventListener('load', () => {
            if (xhr.status == 200) {
                callback(xhr.response);
            }
        });
        // Si la petición llega por medio de JSON, se hace string
        if (json == true) {
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        } else {
            // Enviamos la información
            xhr.send(data);
        }
    }

    // Pedimos de manera asincrona los estilos
    var saveFirstStyle = function(respuesta) {
        startingStyle.innerHTML = respuesta;
        document.body.appendChild(startingStyle);
    }

    var saveSecondStyle = function(respuesta) {
        secondStyle.innerHTML = respuesta;
    }

    // Funcion para cambiar estilos
    function changeStyle(destinationStyle) {
        if (destinationStyle == "second") {
            // Ocultamos el boton
            formButton.style.display = 'none';
            // Mostramos el input
            formInput.style.display = 'block';
            // Vaciamos estilos primarios
            document.body.removeChild(startingStyle);
            // Aplicamos estilos secundarios
            document.body.appendChild(secondStyle);
        } else if (destinationStyle == "primary") {
            // Ocultamos el boton
            formButton.style.display = 'block';
            // Mostramos el input
            formInput.style.display = 'none';
            //Vaciamos estilos primarios        
            document.body.removeChild(secondStyle);
            // Aplicamos estilos secundarios
            document.body.appendChild(startingStyle);
        } else {
            // Si la funcion viene sin parametros ejecutamos lo siguiente
            var loader = document.querySelector("#loader");
            // Cambiamos los estilos
            changeStyle("second");
            // Generamos el saludo del usuario en el chat
            generate_message(SALUDO, "usuario");
            // Desactivamos loader 
            loader.classList.remove("active");
            // Iniciamos el control de inactividad
            start_inactivity_check();
            // Desactivamos el inicio de conversación
            is_conversation_starting = false;
        }
    }

    // LLamado asincrono a la funcion generate_chat
    AjaxCall({
        url: HTMLMego,
        method: "GET",
        callback: generate_chat
    });

    var send_stacked_messages = function(resetChat) {
        if (pending_delivering_messages.length > 0) {
            var length_message = pending_delivering_messages[0].text.length;
            var await_time_ms = 900;

            if (length_message > 100) {
                await_time_ms = 5000;
            }

            if (indice == 0) {
                await_time_ms = 0;
            }
            //console.log(pending_delivering_messages[0]);
            // Obtenemos el primer mensaje en la cola de mensajes
            var message = pending_delivering_messages[0];
            // Removemos el elemento del arreglo
            pending_delivering_messages.shift();
            setTimeout(function() {
                // definimos el tipo de mensaje a ejecutar
                switch (message.type) {
                    case "text":
                        generate_message(message.text, "bot");
                        break;
                    case "option":
                        generate_message(message, "option");
                        break;
                };
                if (resetChat == true) {
                    setTimeout(function() {
                        reseting_chat_after_inactivity();
                    }, 3000);
                }
            }, await_time_ms);
        }
    }

    // Versión modificada con agregados de Mauro Barroso
    var RenderResponseMessage = function(responseFromServer) {
        // Obtenemos el objeto JSON CSSSecond lo parseamos
        var JsonResp = JSON.parse(responseFromServer);
        var loader = document.querySelector("#loader");
        var isResetingChat = false;
        // Renderizamos la respuesta del bot
        // Iteramos sobre todos los mensajes recibidos
        JsonResp.messages.forEach(message => {
            pending_delivering_messages.push(message);
        });

        // Guardamos el contexto en el documento
        var inpContext = document.querySelector(CONTEXT_DATA);
        // Si no existe el hidden de la etiqueta se genera
        // Luego del primer mensaje, dejamos el if habilitado para corroborar la existencia de finish_chat
        if (JsonResp.context != undefined) {
            if (JsonResp.context.finish_chat) {
                inpContext = undefined;
                loader.style.display = "none";
                isResetingChat = true;
            };
        }
        // Iniciamos la distribución de mensajes acumulados
        send_stacked_messages(isResetingChat);

        if (inpContext == undefined && JsonResp.context != undefined) {
            // Generamos un elemento
            inpContext = document.createElement('input')
                // Definimos los parametros del elemento
            inpContext.type = CONTEXT_INPUT_TYPE;
            inpContext.name = CONTEXT_INPUT_NAME;
            // Anexamos el elemento al body
            document.body.appendChild(inpContext);
        }

        if (inpContext != undefined) inpContext.value = JSON.stringify(JsonResp.context);
        // Si no es el inicio de la conversación,
        if (is_conversation_starting == false) start_inactivity_check();
        //loader.classList.remove("active");
    }

    var startConversation = function() {
        is_conversation_starting = true;
        AjaxCall({
            url: CHATBOT_URL,
            method: CHATBOT_HTTPMETHOD,
            callback: RenderResponseMessage,
            data: {
                msg: ""
            },
            json: true
        });
    }

    var click_submit = function(e) {
        e.preventDefault();
        send_message_api();
    }

    var send_message_api = function(option_value) {
        var _msg;
        if (option_value == undefined) {
            _msg = $("#chat-input").val();
            if (_msg.trim() == '') {
                return false;
            }
        } else {
            _msg = option_value;
        }
        // Validamos si existe el contexto
        let inpContext = document.querySelector(CONTEXT_DATA);
        // Disponemos una variable temporal para almacenar el contenido del valor
        let contextValue;
        // Validamos si la etiqueta existe
        if (inpContext != undefined) {
            contextValue = inpContext.value;
            // Parseamos el contexto
            JSONcontext = JSON.parse(contextValue);
            // Validamos si en el contexto viaja la solicitud de requerimiento de PC
            if (JSONcontext.require_workstation) {
                // Eliminamos la propiedad
                delete JSONcontext.require_workstation;
                // Establecemos propiedad en el contexto que indique que estamos devolviendo una terminal en respuesta
                JSONcontext.sending_workstation = "true";
            }
            if (JSONcontext.require_address) {
                // Configuramos la propiedad de envio de dirección
                JSONcontext.sending_address = "true";

            }
            // Convertimos el contexto modificado a String
            contextValue = JSON.stringify(JSONcontext);
        }
        // Preparamos los datos para enviar
        var info = {
                message: _msg,
                context: contextValue
            }
            // Preparamos la solicitud ajax para hacer el envío de información
        AjaxCall({
            url: CHATBOT_URL,
            method: CHATBOT_HTTPMETHOD,
            callback: RenderResponseMessage,
            data: info,
            json: true
        });
        if (_msg == "OTHER_WS") _msg = "Otro equipo diferente";
        // Generamos mensaje del usuario
        generate_message(_msg, 'usuario');
        //loader.classList.add("active");
    }

    var close_chatbox = function() {
        $("#chat-circle").toggle('scale');
        $(".chat-box").toggle('scale');
        $(".mego-img").toggle('scale');
        //Eliminamos la notificación
        $(".badge").remove();
    }

    var open_chatbox = function() {
        $("#chat-circle").toggle('scale');
        $(".chat-box").toggle('scale');
        $(".mego-img").toggle('scale');
    }

    var reseting_chat_after_inactivity = function() {
        var loader = document.querySelector("#loader");
        // Vaciamos el contenido del chatlog
        var chatlog = document.querySelector(".chat-logs");
        chatlog.innerHTML = "";
        // Eliminamos el contexto
        var inpContext = document.querySelector(CONTEXT_DATA);
        if (inpContext != null) document.body.removeChild(inpContext);
        // Cambiamos el estilo de Mego para interactuar como saludo inicial
        changeStyle("primary");
        // Minimizamos el chat
        close_chatbox();
        // Reseteamos el contador de mensajes
        contadorN = 0;
        // Disponemos al chatbot para que vuelva a iniciar de conversación
        startConversation();
        // Desactivamos el loader
        loader.display = "none";
    };

    var finishing_chat_without_response = function() {
        // Obtenemos el mensaje del listado de mensaje de finalización
        let finish_message = FINISHING_CHAT_INACTIVITY_MESSAGES[Math.floor(Math.random() * FINISHING_CHAT_INACTIVITY_MESSAGES.length)];
        // Generamos un mensaje de tipo bot informando que se finaliza la conversación
        generate_message(finish_message, "bot");
        // Iniciamos el timeout para hacer el reseteo del chat
        reset_chatlog_timeout_id = setTimeout(reseting_chat_after_inactivity, INTERVAL_POST_FINISH_DELAY);
    };
    // Bloque de codigo dispuesto para manejar los timeouts
    var awaiting_response_timeout = function() {
        // Obtenemos alguno de los mensajes de
        let awaiting_message = AWAITING_RESPONSE_MESSAGES[Math.floor(Math.random() * AWAITING_RESPONSE_MESSAGES.length)];
        // Generamos el mensaje del lado del bot
        generate_message(awaiting_message, "bot");
        // iniciamos timeout para definir la finalización del chat
        finish_message_timeout_id = setTimeout(finishing_chat_without_response, INTERVAL_FINISH_ACTIVITY);
    };

    // Funcion que comprueba la inactividad del usuario
    var start_inactivity_check = function() {
        // Activamos el control de inactividad
        await_response_timeout_id = setTimeout(awaiting_response_timeout, INTERVAL_AWAIT_RESPONSE);
    };
    var stop_inactivity_check = function() {
        // Limpiamos todos los timeout activos
        clearTimeout(await_response_timeout_id);
        clearTimeout(finish_message_timeout_id);
        clearTimeout(reset_chatlog_timeout_id);
    };

    // Desactivamos las opciones luego de hacer click en ellas
    var disable_options = function(ul) {
        var li_options = ul.querySelectorAll("li");
        li_options.forEach(li => {
            li.addEventListener("click", function(e) {
                li_options.forEach(li_brothers => {
                        li_brothers.removeEventListener("click", click_option);
                        li_brothers.style.color = "lightgrey";
                        li_brothers.style.cursor = "no-drop";
                    })
                    // Coloreamos la opcion elegida
                li.style.color = "#c95d1b";
            })
        });
    }

    var disable_optionsInput = function(ul) {
        var li_options = ul.querySelectorAll("li");
        var submitButton = document.querySelector("#chat-submit");

        function disableLi(e) {
            li_options.forEach(li_brothers => {
                li_brothers.removeEventListener("click", click_option);
                li_brothers.style.color = "lightgrey";
                li_brothers.style.cursor = "no-drop";

            })
            e.target.removeEventListener("click", disableLi);
        }
        submitButton.addEventListener("click", disableLi);
    }

    var click_option = function(e) {
        send_message_api(e.target.actionToRun);
    }

    var generate_message = function(msg, type) {
        var conversation_starting = indice > 1;
        if (type == "bot") {
            loader.classList.remove("active");
            generate_message_bot(msg);
            $("#chat-submit").prop('disabled', false);
        }

        if (type == "usuario") {
            generate_message_usuario(msg);
            // Limpiamos el input
            $("#chat-input").val('');
            if (is_conversation_starting == false) {
                // Deshabilitamos el envio de mensaje hasta que se reciba respuesta del bot
                $("#chat-submit").prop('disabled', true);
                // Detenemos el chequeo inactividad hasta que mego responda
                stop_inactivity_check();
            } else {
                $("#chat-submit").prop('disabled', false);
            }
            if (conversation_starting) {
                loader.classList.add("active");
            }
        }

        if (type == "option") {
            $("#chat-submit").prop('disabled', false);
            generate_message_option(msg);
            loader.classList.remove("active");
        }

        $(".chat-logs").stop().animate({
            scrollTop: $(".chat-logs")[0].scrollHeight
        }, 1000);

        if (type == 'bot' || type == 'option') {
            send_stacked_messages();
        }

        indice++;
    }

    var linkDetect = function(message) {
        var newMessage;
        const originalString = message;
        const splitString = originalString.split(" ");
        for (var i = 0; i < splitString.length; i++) {
            if (splitString[i].includes("http")) {
                splitString[i] = '<a href="' + splitString[i] + '" target="_blank">Click aquí</a>';
            }
        }
        newMessage = splitString.join(" ");
        return newMessage;
    }

    var reactions = function(action, message) {

        // ---------------- notRecognized --------------------
        const originalString = message;
        var megoCaja = document.body.getElementsByClassName("mego-img-box")[0];

        if (action == "notRecognized") {
            var notRecognized = {
                array: ["no entiendo", "¿como?", "no entendi", "disculpame", "¡Perfecto!"],
                image: ["img/noEntiendo.png"]
            };

            for (let notRecIndex = 0; notRecIndex < notRecognized.array.length; notRecIndex++) {
                if (originalString.toLowerCase().includes(notRecognized.array[notRecIndex])) {
                    megoCaja.src = notRecognized.image;
                }
            }
        }

        // ------------------ Agradecimiento ----------------------

        if (action == "gratitude") {
            var gratitude = {
                array: ["estoy para ayudarte.", "de nada", "lindo"],
                image: ["img/agradecimiento.png"]
            };

            for (let notRecIndex = 0; notRecIndex < gratitude.array.length; notRecIndex++) {
                if (originalString.toLowerCase().includes(gratitude.array[notRecIndex])) {
                    megoCaja.src = gratitude.image;
                }
            }
        }

        // ------------------ Insultos ----------------------

        if (action == "insult") {
            var insult = {
                array: ["respeto", "malas palabras", "contestar insultos"],
                image: ["img/insultos.png"]
            };

            for (let notRecIndex = 0; notRecIndex < insult.array.length; notRecIndex++) {
                if (originalString.toLowerCase().includes(insult.array[notRecIndex])) {
                    megoCaja.src = insult.image;
                }
            }
        }

        // --------------- Pestaneo y focus --------------------
        if (action == "intervalPestaneoFocus") {
            var intervalPestaneoFocus = {
                image: ["img/1.png", "img/2.png"],
                focus: ["img/3.png"]
            };

            setInterval(function() {
                var index = Math.floor((Math.random() * intervalPestaneoFocus.image.length));
                var megoCirculo = document.body.getElementsByClassName("mego-img")[0];
                var megoCaja = document.body.getElementsByClassName("mego-img-box")[0];
                megoCirculo.src = intervalPestaneoFocus.image[index];
                megoCaja.src = intervalPestaneoFocus.image[index];

            }, 2000);

            $(".chat-input").focusin(function() {
                intervalPestaneoFocus.image[0] = intervalPestaneoFocus.focus[0];
                intervalPestaneoFocus.image[1] = intervalPestaneoFocus.focus[0];
            });

            $(".chat-input").focusout(function() {
                intervalPestaneoFocus.image[0] = "img/1.png";
                intervalPestaneoFocus.image[1] = "img/2.png";
            });
        }
    }

    var generate_message_bot = function(message) {
        var currentMessage = chat_msg_bot.cloneNode(true);
        var chat_logs = document.querySelector(".chat-logs");
        var text = currentMessage.querySelector(".cm-msg-text");
        var messageLink = linkDetect(message);
        reactions("gratitude", message);
        reactions("notRecognized", message);
        reactions("insult", message);
        currentMessage.id = "cm-msg-" + indice;
        text.innerHTML = messageLink;
        chat_logs.appendChild(currentMessage);
    }


    var generate_message_usuario = function(message) {
        var currentMessage = chat_msg_usuario.cloneNode(true);
        var chat_logs = document.querySelector(".chat-logs");
        var text = currentMessage.querySelector(".cm-msg-text");
        reactions("gratitude", message);
        currentMessage.id = "cm-msg-" + indice;
        text.innerHTML = message;
        chat_logs.appendChild(currentMessage);
    }

    var generate_message_option = function(message) {
        var chat_logs = document.querySelector(".chat-logs");
        var currentMessage = chat_msg_option.cloneNode(true);
        var question = currentMessage.querySelector("#question");
        var description = currentMessage.querySelector("#description");
        var options = currentMessage.querySelector("#ulTag");
        var chat_msg = currentMessage.querySelector(".cm-msg-text-option");

        question.innerHTML = message.text;
        description.innerHTML = message.description;
        message.options.forEach(option => {
            var msg_li = document.createElement('li');
            msg_li.innerHTML = option.description;
            msg_li.actionToRun = option.value;
            msg_li.style.cursor = "pointer";
            msg_li.style.textDecoration = "underline";
            msg_li.addEventListener("click", click_option);
            options.appendChild(msg_li);
        });

        disable_options(options);
        disable_optionsInput(options);
        currentMessage.id = "cm-msg-" + indice;
        chat_logs.appendChild(currentMessage);
    }
}());