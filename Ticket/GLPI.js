/* 
    Módulo de interacción con GLPI
    ------------------------------
    Este módulo está dispuesto para poder servir de interfaz entre el usuario y
    el sistema de ticketado interno de Megatech.

    Autor: Maximiliano Leiva
    Fecha: 08/05/2019

*/

// Disponemos de constantes de aplicación
    // Prefijo de error
    const GLPI_ERROR_LOG_PREFIX = "Error: GLPi - ";
    // Clave y usuario de MEGO
    const MEGO_AUTHORIZATION = "bWVnbzpNZWdvMjAxOS4=";
    // Id cargado en base de datos de GLPi, modificar en caso de producirse un cambio en base de datos
    const MEGO_GLPI_ID = 37;
    // Id de perfil de empleado
    const EMPLOYEE_PROFILE = 9;
    // Mensaje preestablecido de cierre de tickets en GLPi
    const MEGO_CLOSE_TICKET_MESSAGE = "Resolución automática de problema realizada por Mego - Chatbot.";
    // Mensaje preestablecido de cierre de tickets en followup
    const USER_CLOSE_TICKET_MESSAGE = "Se da conforme a la solución planteada por el chatbot.";
    // Al utilizar el header y querer modificarlo, realizar un clonado
    const GLPI_BASIC_HEADER = {"Content-Type" : "application/json"};
    // URL para solicitar inicio de Sessión
    const URL_INITSESSION = "http://glpi.mega.com.ar/apirest.php/initSession";
    // URL para Crear u Obtener ticket
    const URL_TICKET = "http://glpi.mega.com.ar/apirest.php/Ticket";
    // URL para finalizar session
    const URL_KILLSESSION = "http://glpi.mega.com.ar/apirest.php/killSession";
    // URL para obtener tickets de grupo
    const URL_GROUPTICKET = "http://glpi.mega.com.ar/apirest.php/Group_Ticket";
    // URL para ticket de usuarios
    const URL_TICKETUSER = "http://glpi.mega.com.ar/apirest.php/Ticket_User";
    // URL para administrar soluciones de tickets
    const URL_ITILSOLUTION = "http://glpi.mega.com.ar/apirest.php/ITILSolution"
    // URL para administrar seguimiento de tickets
    const URL_ITILFOLLOWUP = "http://glpi.mega.com.ar/apirest.php/ITILFollowup"
    // URL para cambiar el perfil activo
    const URL_CHANGEACTIVEPROFILE = "http://glpi.mega.com.ar/apirest.php/changeActiveProfile";


// Cargamos la librería request
var request = require('request');
// Cargamos el sistema de logs
var log = require('../Log');

// Función que controla los errores de petición
function handle_request_errors(request_result, prefix, token_session) {
    // Configuramos el mensaje
    let message = prefix;
    // dependiendo del tipo de error que sea, lo manejamos para mostrarlo
    switch(request_result.statusCode){
        case 400:
            message += "La solicitud hacia la API está incorrectamente armada o fue rechazada: " + request_result.body;
            break;
        case 401:
            message += "Error de autenticación con la API de GLPI o Token de Session revocado. "
            // Si el token de sesion fue comunicado, lo concatenamos
            if(token_session) {
                // Concatenamos el token
                message += "Token de session rechazada: " + token_session +".";
            }
            break;
        case 404:
            message += "URL de GLPI incorrecta"
            break;
        case 500:
            message += "Error interno de servidor GLPI"
            break;
        default:
            message += "Error no especificado. Codigo de Navegación: " + request_result + ". Body: " + request_result.body; 
            break;
    }
    // Registramos el log
    log.Register(message);
}

// Funcion que procesa la fecha actual y devuelve una fecha formateada
function get_current_date_formatted_for_api(){
    // Obtenemos la fecha actual
    let current_date = new Date();
    // Particionamos la fecha en sus correspondientes
    let day = String(current_date.getDate()).padStart(2, '0');
    let month = String(current_date.getMonth() + 1).padStart(2, '0');
    let year = String(current_date.getFullYear()).padStart(4, '0');

    let hour = String(current_date.getHours()).padStart(2, '0');
    let minute = String(current_date.getMinutes()).padStart(2, '0');
    let second = String(current_date.getSeconds()).padStart(2, '0');

    // Devolvemos el valor de la fecha
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}

// Función que controla el estado de código de la petición
function is_request_ok({statusCode}={}){
    if(statusCode == 200 || statusCode == 201){
        return true;
    } else {
        return false;
    }
}

// Cabeceras de ingreso sobre el sitio
function get_login_glpi_headers({base_64_auth} = {}){
    // Copiamos el header base
    let headers = GLPI_BASIC_HEADER;
    // Agregamos la contraseña
    headers.Authorization = "Basic " + base_64_auth;
    // Regresamos el valor procesado
    return headers;
}

// Valida si la autorización es correcto
function validate_auth({base64_auth} = {}) {
    // Convertimos la autorización a base 64
    var auth_string = Buffer.from(base64_auth, 'base64');
    // Averiguamos si la petición viene con dos puntos
    if(auth_string.includes(':')) {
        return true;
    } else {
        return false;
    }
}

function get_token_headers({s_token} = {}){
    // Copiamos el header base
    let headers = GLPI_BASIC_HEADER;
    // Agregamos el token
    headers["Session-Token"] = s_token;
    // Devolvemos el valor procesado
    return headers;
}

function get_body_request_new_ticket({tkt_title, tkt_description, tkt_category} = {}){
    // Preparamos el body de envío para la generación de ticket
    let body = {
        input: {
            name: tkt_title,
            content: tkt_description,
            itilcategories_id: tkt_category
        }
    }
    // Devolvemos el objeto procesado en formato string
    return JSON.stringify(body);
}

function get_body_request_change_active_profile() {
    // Preparamos el body para enviar
    let body = {
        profiles_id: EMPLOYEE_PROFILE
    }
    // Devolvemos el body pasado a string
    return JSON.stringify(body);
}

// Body en formato string pasado desde JSON
function get_body_request_mego_modify_ticket({tkt_id} ={}){
    // Preparamos el cuerpo de la consulta
    let body = {
        input: {
            tickets_id: tkt_id,
            users_id: MEGO_GLPI_ID,
            type: 2,
            use_notification: 1,
            alternative_email: ""
        }
    }
    // Devolvemos el objeto body en string
    return JSON.stringify(body);
}

// Función dispuesta para que se pueda dar una solución a un ticket
function get_body_request_mego_set_solution({tkt_id} ={}){
    // Disponemos el body del elementos
    let body = {
        input: {
            itemtype: "Ticket",
            items_id: tkt_id,
            content: MEGO_CLOSE_TICKET_MESSAGE,
            users_id: MEGO_GLPI_ID
        }
    }
    // Devolvemos el body pasado a string
    return JSON.stringify(body);
}

// Funcion que prepara el cuerpo de petición para aprobar una solución
function get_body_request_mego_approve_solution({sol_id, user_id}){
    
    // Disponemos del body para poder prepara la respuesta
    let body = {
        input: {
            id: sol_id,
            date_approval: get_current_date_formatted_for_api(),
            users_id_approval: user_id,
            status: 3
        }
    }
    // Devolvemos el objeto procesado
    return JSON.stringify(body);
}

function get_body_request_user_approve_comment({tkt_id, user_id}={}){
    // Levantamos el body
    let body = {
        input: {
            items_id: tkt_id,
            itemtype: "Ticket",
            users_id: user_id,
            content: USER_CLOSE_TICKET_MESSAGE
        }
    }
    // Devolvemos el body en string
    return JSON.stringify(body);
}

function get_body_request_close_ticket({tkt_id} = {}){
    // Preparamos el body para devolver procesado
    let body = {
        input: {
            id: tkt_id,
            status: 6
        }
    }
    // Procesamos el body lo convertimos a string
    return JSON.stringify(body);
}

function ConnectGLPIUserAndGetSessionToken({base_64_authorization} = {}) {
    let ACTION_LOG = "CreateSessionToken - ";
    let ERROR_LOG = GLPI_ERROR_LOG_PREFIX + ACTION_LOG;
    // Preparamos una promesa que será regresada en el proceso
    var promise = new Promise((resolve, reject) => { 
        // Validamos que la clave haya sido enviada
        if(base_64_authorization == undefined) return reject("Error: La autorización no fué enviada.");
        // Validamos la autorización recibida
        if(validate_auth({base64_auth:base_64_authorization}) == false) return reject(log.Register(ERROR_LOG + "La autorización no cuenta con el formato adecuado"));
        // Preparamos la petición obteniendo cabeceras
        let headers = get_login_glpi_headers({ base_64_auth: base_64_authorization });
        // Realizamos el request
        request({
            uri: URL_INITSESSION,
            headers: headers,
            method: "GET"            
        }, (error, response, body_response) => {
            // Validamos si la petición llega con algún tipo de error
            if(error) return reject(log.Register(ERROR_LOG + error));
            // Validamos si la solicitud llega con estado 200
            if(response.statusCode == 200 || response.statusCode == 201) {              
                // Parseamos el cuerpo del body  
                body_response = JSON.parse(body_response);
                // Recolectamos el token
                let token = body_response.session_token;
                // Resolvemos la solicitud
                resolve(token);
            } else {
                return reject(handle_request_errors(response, ERROR_LOG));
            }
        });
    });
    // Devolvemos la promesa
    return promise;
}

// Cambiamos el perfil activo a empleado
function ChangeActiveProfileToEmployee({session_token} = {}){
    // Disponemos el prefijo para los logs
    let ACTION_LOG = "ChangeActiveProfile - ";
    let ERROR_LOG = GLPI_ERROR_LOG_PREFIX + ACTION_LOG;
    // Preparamos la promesa a devolver
    let promise = new Promise((resolve, reject) => {
        // Validamos si existe el token
        if(session_token == undefined) return reject(log.Register(ERROR_LOG + "El token no fue comunicado"));
        // Disponemos el header
        let headers = get_token_headers({s_token: session_token});
        // Preparamos el body
        let body = get_body_request_change_active_profile();
        // Ejecutamos el request
        request({
            url: URL_CHANGEACTIVEPROFILE,
            headers: headers,
            method: "POST",
            body: body
        }, (error, response, body_response) => {
            // Validamos si existen errores
            if(error) return reject(log.Register(ERROR_LOG + error));
            // Controlamos los estado de respuesta
            if(is_request_ok({statusCode: response.statusCode})){
                // Resolvemos el cambio
                resolve(true);
            } else {
                // Rechazamos la petición
                return reject(handle_request_errors(response, ERROR_LOG, session_token));
            }
        })

    });
    // Devolvemos la promesa procesada
    return promise;
}

function CreateTicketOnUserName({session_token, ticket_title, ticket_description, ticket_category } = {}){
    // Disponemos un prefijo para logs
    let ACTION_LOG = "CreateTicketToUser - ";
    let ERROR_LOG = GLPI_ERROR_LOG_PREFIX + ACTION_LOG;
    var promise = new Promise((resolve, reject) => {
        // Validamos si la petición viene con el token
        if(session_token == undefined) return reject(log.Register(ERROR_LOG + "El token no está comunicado"));
        // Validamos si todos los datos llegan con la información requerida
        if(ticket_title == undefined) return reject(log.Register(ERROR_LOG + "El titulo del ticket no está informado"));
        // Validamos descripcion
        if(ticket_description == undefined) return reject(log.Register(ERROR_LOG + "Esta faltando la descripcion del ticket"));
        // Validamos categoria
        if(ticket_category == undefined) return reject(log.Register(ERROR_LOG + "Esta faltando la categoria del ticket"));
        // Recolectamos el header
        let headers = get_token_headers({s_token: session_token});
        // Preparamos el body de la petición
        let body = get_body_request_new_ticket({tkt_title: ticket_title, tkt_description: ticket_description, tkt_category: ticket_category});
        // Ejecutamos la petición
        request({
            uri: URL_TICKET,
            headers: headers,
            method: "POST",
            body: body
        }, (error, response, body_response) => {
            // Validamos si tenemos algún error en la petición
            if(error) {                
                return reject(log.Register(ERROR_LOG + error));
            }
            // Validamos si la petición llega como 200
            if(response.statusCode == 200 || response.statusCode == 201) {
                // Parseamos en JSON la respuesta
                body_response = JSON.parse(body_response);
                // En primera instancia logueamos
                resolve(body_response.id);
            } else {                
                // Manejamos el error de petición utilizndo la función preparado
                return reject(handle_request_errors(response, ERROR_LOG));
            }
        });

    });
    // Validamos si esta cargado el token de session
    return promise;    
}

// Del ticket generado obtenemos el id de usuario
function GetGLPIUserID({session_token, ticket_id} = {}) {
    // Generamos los elemetnos de logs
    let API_LOG = "GetGLPIUserIDTicket - ";
    let ERROR_LOG = GLPI_ERROR_LOG_PREFIX + API_LOG;
    // Generamos una nueva promise a devolver
    let promise = new Promise((resolve, reject) => {
        // Validamos si viene con el token
        if(session_token == undefined) return reject(log.Register(ERROR_LOG + "Falta token de sesion"));
        // Validamos si la información de ticket id viene cargada
        if(ticket_id == undefined) return reject(log.Register(ERROR_LOG + "Falta ID de ticket"));
        // Preparamos el header de conexión
        let headers = get_token_headers({s_token: session_token});
        // Realizamos el request usando los parametros indicados
        request({
            uri: URL_TICKET + "/" + ticket_id,
            method: 'GET',
            headers: headers
        }, (error, response, body_response) => {
            // Validamos si existe algún error
            if(error) return reject(log.Register(ERROR_LOG + "Error al procesar la solicitud: " + error));
            // Validamos si el codigo de estado es correcto
            if(is_request_ok({statusCode: response.statusCode})){
                // Parseamos el elemento recibido
                body_response = JSON.parse(body_response);
                // Damos por completada exitosamente la petición usando resolve
                resolve(body_response.users_id_recipient);
            } else {
                // Manejamos la respuesta negativa
                return reject(handle_request_errors(response, ERROR_LOG));
            }
        })
    });
    // Devolvemos la promesa
    return promise;
}

function KillSession({session_token} = {}){
   // Preparamos los datos de log en caso de error
   let ACTION_LOG = "KillSession - ";
   let ERROR_LOG = GLPI_ERROR_LOG_PREFIX + ACTION_LOG;
   // Preparamos la promesa
   let promise = new Promise((resolve, reject) => {
       // Validamos si el token llegó correctamente
       if(session_token == undefined) return reject(log.Register(ERROR_LOG + "No se ha comunicado el token de session"));
       // Preparamos el header de conexión
       let headers = get_token_headers({s_token: session_token});
       // Ejecutamos la request
       request({
           uri: URL_KILLSESSION,
           headers: headers
       }, (error, response, body_response) => {
           // Validamos si llega algún error en la respuesta
           if(error) return reject(log.Register(ERROR_LOG + error));
           // Controlamos los estados de codigo
           if(is_request_ok({statusCode: response.statusCode})){
               // Resolvemos la petición
               resolve(body_response);
           } else {
               return reject(handle_request_errors(response, ERROR_LOG, session_token));
           }
       })
   });
   // Devolvemos la promesa procesada
   return promise; 
}

function GetGroupTicket({session_token, ticket_id} = {}) {
    // Definimos variables de log relacionada a la función
    let ACTION_LOG = "GetGroupTicket - ";
    let ERROR_LOG = GLPI_ERROR_LOG_PREFIX + ACTION_LOG;
    // Preparamos la promesa a procesar
    let promise = new Promise((resolve, reject) => {
        // Validamos que el token de session venga cargado
        if(session_token == undefined) return reject(log.Register(ERROR_LOG + "No se comunicó el token de inicio de sesion."));
        // Validamos que el ticket venga con id cargado
        if(ticket_id == undefined) return reject(log.Register(ERROR_LOG + "No se comunicó número de ticket para realizar la consulta."));
        // Preparamos los headers de consulta
        let headers = get_token_headers({s_token: session_token});
        // Preparamos la URL de consulta con parametros queryString
        let url = URL_GROUPTICKET + "?searchText[tickets_id]=" + ticket_id +"&searchText[type]=2&expand_dropdowns=true";        
        // Ejecutamos la consulta
        request({
            url: url,
            headers: headers,
            method: "GET"
        }, (error, response, body_response) => {
            // Validamos si existen errores
            if(error) return reject(log.Register(ERROR_LOG + error));
            // Validamos si la petición llego con el estado correcto
            if(is_request_ok({statusCode: response.statusCode})){
                // Parseamos el objeto como JSON
                body_response = JSON.parse(body_response);
                // Almacenamos una varible para los grupos
                let groups = [];
                // Iteramos sobre todos los resultados
                body_response.forEach(group => groups.push(group.groups_id));                
                // Resolvemos la petición con el objeto
                resolve(groups);
            } else { 
                // Devolvemos el error de mensaje procesado
                return reject(handle_request_errors(response, ERROR_LOG));
            }
        })
    });
    // Devolvemos la promesa procesada
    return promise;
}

function SetMegoOnTicket({session_token, ticket_id} = {}){
    // Preparamos las variables para los logs
    let ACTION_LOG = "SetMegoOnTicket - ";
    let ERROR_LOG = GLPI_ERROR_LOG_PREFIX + ACTION_LOG;
    // Generamos una nueva promesa para devolver en proceso
    let promise = new Promise((resolve, reject) => {
        // Validamos si el token de session fue cargado
        if(session_token == undefined) return reject(log.Register(ERROR_LOG + "El token de inicio de sesión no fue comunicado"));
        // Validamos el número de ticket
        if(ticket_id == undefined) return reject(log.Register(ERROR_LOG + "El número de ticket no fué comunicado"));
        // Preparamos la cabecera de conexión
        let headers = get_token_headers({s_token: session_token});
        // Preparamos el cuerpo de la solicitud
        let body = get_body_request_mego_modify_ticket({tkt_id: ticket_id});
        // Ejecutamos la solicitud a la web api
        request({
            url: URL_TICKETUSER,
            headers: headers,
            method: "POST",
            body: body
        }, (error, response, body_response) => {
            // Validamos si la petición llega con errores
            if(error) return reject(log.Register(ERROR_LOG + error));
            // Validamos el estado de respuesta
            if(is_request_ok({statusCode: response.statusCode})){
                // Damos por cerrado la promesa usando el resolve
                resolve(true);
            } else { // En caso de no ser el esperado
                return reject(handle_request_errors(response, ERROR_LOG));
            }
        });
        
    });
    // Devolvemos la promesa generada
    return promise;
}

function SetMegoSolutionAndGetSolutionID({session_token, ticket_id} = {}){
    // Preparamos las constantes de log
    let ACTION_LOG = "SetMegoSolution - ";
    let ERROR_LOG = GLPI_ERROR_LOG_PREFIX + ACTION_LOG;
    // Generamos un nueva promesa
    let promise = new Promise((resolve, reject) => {
        // Validamos si el token de Session fue cargado
        if(session_token == undefined) return reject(log.Register(ERROR_LOG + "Está faltando el token de session"));
        // Validamos si el ticket fue cargado
        if(ticket_id == undefined) return reject(log.Register(ERROR_LOG + "Es necesario el número de ticket para poder establecer solución"));
        // Preparamos los headers de petición
        let headers = get_token_headers({s_token: session_token});
        // Preparamos el body de la petición
        let body = get_body_request_mego_set_solution({tkt_id: ticket_id});
        // Realizamos la petición a la API
        request({
            url: URL_ITILSOLUTION,
            headers: headers,
            method: "POST",
            body: body
        }, (error, response, body_response) => {
            // Validamos si existe error en la petición
            if(error) return reject(log.Register(ERROR_LOG + error));
            // Controlamos el estado de codigo de la petición
            if(is_request_ok({statusCode: response.statusCode})) {
                // Parseamos el body
                body_response = JSON.parse(body_response);
                // Resolvemos con el body response
                resolve(body_response.id);
            } else {
                // En caso de fallar procedemos en esta instancia
                return reject(handle_request_errors(response, ERROR_LOG));
            }
        })
    });
    // Devolvemos la promesa
    return promise;
}

function ApproveMegoSolution({session_token, solution_id, user_id} = {}){
    // Disponemos de las constantes de LOG
    let ACTION_LOG = "ApproveMegoSolution - ";
    let ERROR_LOG = GLPI_ERROR_LOG_PREFIX + ACTION_LOG;
    // Preparamos la promesa a devolver
    let promise = new Promise((resolve, reject) => {
        // validamos los parametros de entrada
        if(session_token == undefined) return reject(log.Register(ERROR_LOG + "El token de session no fue informado."));
        // Validamos el número de ID de solucion
        if(solution_id == undefined) return reject(log.Register(ERROR_LOG + "Falta el ID de solución a actualizar"));
        // Validamos si el ID de usuario fue cargado
        if(user_id == undefined) return reject(log.Register(ERROR_LOG + "Falta el ID del usuario al cual habría que aprobar la solución"));
        // Preparamos las cabeceras de la petición
        let headers = get_token_headers({s_token: session_token});
        // Obtenemos el body
        let body = get_body_request_mego_approve_solution({sol_id: solution_id, user_id: user_id});        
        // Preparamos la request
        request({
            url: URL_ITILSOLUTION,
            headers: headers,
            method: "PUT",
            body: body
        }, (error, response, body_response) => {
            // Validamos si existen errores
            if(error) return reject(log.Register(ERROR_LOG + error));
            // Validamos los códigos de estado
            if(is_request_ok({statusCode: response.statusCode})){
                resolve(true);                
            } else {
                // Resolvemos el rechazo
                return reject(handle_request_errors(response, ERROR_LOG));
            }
        })

    });
    // Devolvemos la promesa preparada
    return promise;
}

function AddCommentApproveSolution({session_token, ticket_id, user_id} = {}){
    // Disponemos las constantes de logs
    let ACTION_LOG = "AddCommentApproveSolution - ";
    let ERROR_LOG = GLPI_ERROR_LOG_PREFIX + ACTION_LOG;
    // Preparamos la promesa
    let promise = new Promise((resolve, reject) => {
        // Validamos que el token haya sido cargado
        if(session_token == undefined) return reject(log.Register(ERROR_LOG + "Falta el token de sessión"));
        // Validamos que haya cargado el ID del ticket
        if(ticket_id == undefined) return reject(log.Register(ERROR_LOG + "Falta el número de ticket en la petición"));
        // Validamos que el usuario haya sido cargado
        if(user_id == undefined) return reject(log.Register(ERROR_LOG + "Falta el id del usuario"));
        // Generamos header
        let headers = get_token_headers({s_token: session_token});
        // Generamos el body con la información
        let body = get_body_request_user_approve_comment({tkt_id: ticket_id, user_id: user_id});
        // Mandamos la requests
        request({
            url: URL_ITILFOLLOWUP,
            headers: headers,
            method: "POST",
            body: body
        }, (error, response, body_response) => {
            // Validamos si existe error en la petición
            if(error) return reject(log.Register(ERROR_LOG + error));
            // Validamos el estado de respuesta
            if(is_request_ok({statusCode: response.statusCode})){
                // Si se llega a esta instancia la solicitud esta correcta
                resolve(true);
            } else {
                // Manejamos el evento de rechazo
                return reject(log.Register(handle_request_errors(response, ERROR_LOG)));                
            }
        })
    });
    // Devolvemos la promesa
    return promise;
}

function CloseTicketByMego({session_token, ticket_id}={}){
    // Preparamos las constantes para registrar los logs
    let ACTION_LOG = "CloseTicketByMego - ";
    let ERROR_LOG = GLPI_ERROR_LOG_PREFIX + ACTION_LOG;
    // Preparamos una promesa para devolver
    let promise = new Promise((resolve, reject) => {
        // Validamos si viene el token cargado
        if(session_token == undefined) return reject(log.Register(ERROR_LOG + "El token de session no viene cargado"));
        // Validamos si el id del ticket vino cargado
        if(ticket_id == undefined) return reject(log.Register(ERROR_LOG + "El ticket no fue informado"));
        // Obtenemos headers
        let headers = get_token_headers({s_token: session_token});
        // Obtenemos el body
        let body = get_body_request_close_ticket({tkt_id: ticket_id});
        // Enviamos el request
        request({
            url: URL_TICKET,
            headers: headers,
            method: "PUT",
            body: body
        }, (error, response, body_response) => {
            // Validamos si llega algun error
            if(error) return reject(log.Register(ERROR_LOG + error));
            // Validamos si el código de estado es correcto
            if(is_request_ok({statusCode: response.statusCode})){
                resolve(body_response);
            } else {
                // Rechazamos la petición informando el mensaje de error
                return reject(log.Register(handle_request_errors(response, ERROR_LOG)));
            }
        });

    });
    // Devolvemos la promesa procesada
    return promise;
}

var instance = function({user_auth, tkt_title, tkt_description, tkt_category} = {}) {
    // Validamos los parametros de entrada
    if(user_auth == undefined) return log.Register(GLPI_ERROR_LOG_PREFIX + "Para generar una instancia de módulo se necesita la autorización en formato usuario:clave en formato base64");
    if(tkt_title == undefined) return log.Register(GLPI_ERROR_LOG_PREFIX + "Para generar una instancia de módulo se necesita el título de ticket");
    if(tkt_description == undefined) return log.Register(GLPI_ERROR_LOG_PREFIX + "Para generar una instancia de módulo se necesita la descripción del ticket");
    if(tkt_category == undefined) return log.Register(GLPI_ERROR_LOG_PREFIX + "Para generar una instancia de módulo se necesita la categoria del ticket");
    // Almacenamos los datos de instancia
    this._user_auth = user_auth;
    this._ticket_title = tkt_title;
    this._ticket_description = tkt_description;
    this._ticket_category = tkt_category;
    // Disponemos del listado de métodos de la instancia

    //Creación de ticket y devolución de ID
    this.CreateTicketWithIDAndGroupInfo = function() {
        // Nos conectamos para obtener el token de GLPI
        return ConnectGLPIUserAndGetSessionToken({base_64_authorization: this._user_auth}).
        then(token_id => {
            // Guardamos el token
            this._token = token_id;
            // Llamamos a la instancia de generación de tickets
            return CreateTicketOnUserName({session_token: this._token, ticket_title: this._ticket_title, ticket_description: this._ticket_description, ticket_category: this._ticket_category});
        }).
        then(ticket_id => {
            // Guardamos el id del ticket
            this._ticket_id = ticket_id;
            // Generamos una solicitud para obtener el número de ID del usuario, que servira para otras solicitudes
            return GetGLPIUserID({session_token: this._token, ticket_id: this._ticket_id});            
        }).
        then(user_id => {
            // Guardamos el ID del usuario
            this._user_id = user_id;
            // Preparamos las modificaciones de MEGO sobre GLPI, para lo cual vamos a iniciar session en GLPI
            return ConnectGLPIUserAndGetSessionToken({base_64_authorization: MEGO_AUTHORIZATION});
        }).
        then(token_mego => {
            // Guardamos el token de mego
            this._mego_token = token_mego;
            // Realizamos una consulta sobre el ticket en cuestión para verificar si tiene grupos asignados.
            return GetGroupTicket({session_token: this._mego_token, ticket_id: this._ticket_id});
        })
        .then(assigned_groups => {
            // Guardamos los grupos en una variable
            this._assigned_groups = assigned_groups;
            // En la siguiente petición vamos a realizar una solicitud para registrar a Mego como modificador de tickets
            return SetMegoOnTicket({session_token: this._mego_token, ticket_id: this._ticket_id});
        })
        .catch(error => console.log(error));        
    }

    this.CreateTicketAndClose = function() {
        // Procesamos la generación de tickets normal
        return this.CreateTicketWithIDAndGroupInfo().
        then(normal_process_completed => {
            // Procedemos a cargar una solución
            return SetMegoSolutionAndGetSolutionID({session_token: this._mego_token, ticket_id: this._ticket_id});
        }).
        then(solution_id => {
            // Almacenamos el ID de solución
            this._solution_id = solution_id;
            // Procedemos a actualizar la solución
            return ApproveMegoSolution({session_token: this._mego_token, solution_id: this._solution_id, user_id: this._user_id});
        }).
        then(solution_approved => {
            // Aqui debemos generar un comentario del usuario sobre el FollowUp de GLPI, para dar credibilidad al cierre de ticket
            return AddCommentApproveSolution({session_token: this._mego_token, ticket_id: this._ticket_id, user_id: this._user_id});
        }).then(comment_succesfull_added => {
            // En ultima parte del proceso debemos dar cierre al ticket, utilizando la función API dispuesta procederemos
            return CloseTicketByMego({session_token: this._mego_token, ticket_id: this._ticket_id});
        })
        .then(ticket_successfull_closed => {
            // Al llegar aqui todas las secuencias del proceso han sido completadas correctamente.
        }).catch(error => console.log(error));
    }

    this._clean_instance = function(){        
        // Validamos si el token de mego viene cargado con información
        if(this._mego_token){
            // Matamos la sessión del token en la API
            KillSession({session_token: this._mego_token}).catch(); // En caso de error el log registrara esta falla );
            // Destruimos la variable de session
            delete this["_mego_token"];
        }    
        // Validamos si hay token de usuario guardado
        if(this._token){
            // Ejecutamos la función para terminar la sesión
            // TODO: Revisar por que motivo la sessión de token del usuario está finalizada sin haber llamado a KillSession antes
            // KillSession({session_token: this._token}).then(success => console.log("Session de mego matada")).catch(error => console.log(error));
            // Destruimos el token almacenado en la variable de instancia
            delete this["_token"];            
        }        
    }    
    return this;
}

module.exports = function({user_auth, tkt_title, tkt_description, tkt_category} = {}) {
    // Validamos los parametros de entrada
    if(user_auth == undefined) return log.Register(GLPI_ERROR_LOG_PREFIX + "Para generar una instancia de módulo se necesita la autorización en formato usuario:clave en formato base64");
    if(tkt_title == undefined) return log.Register(GLPI_ERROR_LOG_PREFIX + "Para generar una instancia de módulo se necesita el título de ticket");
    if(tkt_description == undefined) return log.Register(GLPI_ERROR_LOG_PREFIX + "Para generar una instancia de módulo se necesita la descripción del ticket");
    if(tkt_category == undefined) return log.Register(GLPI_ERROR_LOG_PREFIX + "Para generar una instancia de módulo se necesita la categoria del ticket");
    // Almacenamos los datos de instancia
    this._user_auth = user_auth;
    this._ticket_title = tkt_title;
    this._ticket_description = tkt_description;
    this._ticket_category = tkt_category;
    // Disponemos del listado de métodos de la instancia

    //Creación de ticket y devolución de ID
    this._createTicketWithIDAndGroupInfo = function() {
        // Nos conectamos para obtener el token de GLPI
        return ConnectGLPIUserAndGetSessionToken({base_64_authorization: this._user_auth}).
        then(token_id => {
            // Guardamos el token
            this._token = token_id;
            // Llamamos a la instancia de generación de tickets
            return ChangeActiveProfileToEmployee({session_token: this._token});
            
        }).
        then(change_to_employee_success => {
            // Una vez cambiado a empleado ej
            return CreateTicketOnUserName({session_token: this._token, ticket_title: this._ticket_title, ticket_description: this._ticket_description, ticket_category: this._ticket_category});
        }).
        then(ticket_id => {
            this._ticket_id = ticket_id;
            // Generamos una solicitud para obtener el número de ID del usuario, que servira para otras solicitudes
            return GetGLPIUserID({session_token: this._token, ticket_id: this._ticket_id});            
        }).
        then(user_id => {
            // Guardamos el ID del usuario
            this._user_id = user_id;
            // Preparamos las modificaciones de MEGO sobre GLPI, para lo cual vamos a iniciar session en GLPI
            return ConnectGLPIUserAndGetSessionToken({base_64_authorization: MEGO_AUTHORIZATION});
        }).
        then(token_mego => {
            // Guardamos el token de mego
            this._mego_token = token_mego;
            // Realizamos una consulta sobre el ticket en cuestión para verificar si tiene grupos asignados.
            return GetGroupTicket({session_token: this._mego_token, ticket_id: this._ticket_id});
        })
        .then(assigned_groups => {
            // Guardamos los grupos en una variable
            this._assigned_groups = assigned_groups;
            // En la siguiente petición vamos a realizar una solicitud para registrar a Mego como modificador de tickets
            return SetMegoOnTicket({session_token: this._mego_token, ticket_id: this._ticket_id});
        })
        .catch(error => console.log(error));        
    }

    this._createTicketAndClose = function() {
        // Procesamos la generación de tickets normal
        return this._createTicketWithIDAndGroupInfo().
        then(normal_process_completed => {
            // Procedemos a cargar una solución
            return SetMegoSolutionAndGetSolutionID({session_token: this._mego_token, ticket_id: this._ticket_id});
        }).
        then(solution_id => {
            // Almacenamos el ID de solución
            this._solution_id = solution_id;
            // Procedemos a actualizar la solución
            return ApproveMegoSolution({session_token: this._mego_token, solution_id: this._solution_id, user_id: this._user_id});
        }).
        then(solution_approved => {
            // Aqui debemos generar un comentario del usuario sobre el FollowUp de GLPI, para dar credibilidad al cierre de ticket
            return AddCommentApproveSolution({session_token: this._mego_token, ticket_id: this._ticket_id, user_id: this._user_id});
        }).then(comment_succesfull_added => {
            // En ultima parte del proceso debemos dar cierre al ticket, utilizando la función API dispuesta procederemos
            return CloseTicketByMego({session_token: this._mego_token, ticket_id: this._ticket_id});
        })
        .then(ticket_successfull_closed => {
            // Al llegar aqui todas las secuencias del proceso han sido completadas correctamente.
        }).catch(error => console.log(error));
    }

    this._clean_instance = function(){        
        // Validamos si el token de mego viene cargado con información
        if(this._mego_token){
            // Matamos la sessión del token en la API
            KillSession({session_token: this._mego_token}).catch(); // En caso de error el log registrara esta falla );
            // Destruimos la variable de session
            delete this["_mego_token"];
        }    
        // Validamos si hay token de usuario guardado
        if(this._token){
            // Ejecutamos la función para terminar la sesión
            // TODO: Revisar por que motivo la sessión de token del usuario está finalizada sin haber llamado a KillSession antes
            // KillSession({session_token: this._token}).then(success => console.log("Session de mego matada")).catch(error => console.log(error));
            // Destruimos el token almacenado en la variable de instancia
            delete this["_token"];            
        }        
    }

    // Método público dispuesto para obtener un ticket nuevo y los grupos asignados
    this.CreateTicketAndRetrieveIDAndGroups = async() =>{
        // Preparamos las variables a devolver en el proceso
        let ticket_info = {};
        // Procesamos por los métodos del módulo la solicitud de API
        await this._createTicketWithIDAndGroupInfo().then(success => {
            // En petición exitosa guardamos las variables
            ticket_info.id = this._ticket_id;
            ticket_info.groups = this._assigned_groups;
        }).catch(error => {
            return log.Register(GLPI_ERROR_LOG_PREFIX + "Error al procesar el ticket nuevo. Verificar log de sistema para obtener más información.");
        });
        // Limpiamos instancia
        this._clean_instance();
        // Se devuelve la información del ticket solicitada
        return ticket_info;
    }

    this.CreateTicketAndClose = async() => {
        // Preparamos las variables de ticket a informar
        let ticket_info = {};
        // Ejecutamos la solicitud utilizando los métodos de la API
        await this._createTicketAndClose().then(success => {
            // Almacenamos el ID resultante del proceso
            ticket_info.id = this._ticket_id;
        }).catch(error => {            
            return log.Register(GLPI_ERROR_LOG_PREFIX + "Error al procesar el ticket nuevo. Verificar log de sistema para obtener más información.");
        });
        // Limpiamos instancia
        this._clean_instance();
        // Devolvemos el valor del ticket
        return ticket_info;
    }
    return this;
}

// Generamos un ticket
// GLPI.CreateTicketWithIDAndGroupInfo().then(success => {
//     console.log(GLPI._ticket_id, GLPI._assigned_groups);
// });

// GLPI.CreateTicketAndClose().then(success => {
//     console.log(GLPI._ticket_id, GLPI._groups);
// }).finally(function(){
//     GLPI._clean_instance();
// })

//module.exports =
// UNIT TESTINGS

// Conexion y obtener Token de conexión
// ConnectGLPIUserAndGetSessionToken({ base_64_authorization: MEGO_AUTHORIZATION}).
//    then(token => { console.log(token); } ).catch(err => console.log(err));

// KillSession({session_token: "nrgcqpvqc9l5b4b8dvban54ol0"}).then(respuesta => { console.log(respuesta) });

// CreateTicketOnUserName({ 
//     session_token: "kho0nbgh63rjfv24ukf439sm90", 
//     ticket_title: "No funciona Word", 
//     ticket_category: 8, 
//     ticket_description: "Tengo errores al operar con word"}).
//     then(newticket => console.log(newticket)).
//     catch(error => console.log(error));

// GetGLPIUserID({
//     session_token: "dcbnmbkngckjuig29b5u84ebb1",
//     ticket_id: 16
// }).then(userId => console.log(userId)).catch(error => console.log(error));

// GetGroupTicket({session_token: "1gilaro9v3hvjssjstlk20r8f0", ticket_id: 16}).then(response => console.log(response));

// SetMegoOnTicket({session_token: "1gilaro9v3hvjssjstlk20r8f0", ticket_id: 16}).then(response => console.log(response));

// SetMegoSolution({session_token: "1gilaro9v3hvjssjstlk20r8f0", ticket_id:16}).then(response => console.log(response));

// Exportamos los métodos que utilizarán las otras librerías al operar

// ApproveMegoSolution({session_token: "1gilaro9v3hvjssjstlk20r8f0", solution_id: 14, user_id: 36}).then(respuesta => console.log(respuesta));

// AddCommentApproveSolution({session_token: "1gilaro9v3hvjssjstlk20r8f0", ticket_id: 25, user_id: 36 }).then(result => console.log(result)).catch(error => console.log(error));

// CloseTicketByMego({session_token: "1gilaro9v3hvjssjstlk20r8f0", ticket_id: 16}).then(response => console.log(response));