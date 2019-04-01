(function() {
  // Constante que almacena el contexto
  const CONTEXT_INPUT_TYPE = "hidden";
  const CONTEXT_INPUT_NAME = "inpContext";
  // Direccion hacia donde se apunta el servicio de bot
  const CHATBOT_URL = '/send';
  const CHATBOT_HTTPMETHOD = 'post';
  const SALUDO = 'Hola Mego!';


  var flag = 0;
  var flagInicioConversacion = 0;
  var chatMego = document.createElement('div');
  chatMego.className = "chat-mego";
  document.body.appendChild(chatMego);
  // X son los estilos primarios
  // Y son los estilos por defecto
  var x = ".btn{text-transform:initial}#center-text{display:flex;flex:1;flex-direction:column;justify-content:center;align-items:center;height:100%}#chat-circle{position:fixed;bottom:50px;right:50px;background:#c95d1b;width:80px;height:80px;border-radius:50%;color:#fff;padding:28px;cursor:pointer;-webkit-box-shadow:-9px 13px 64px -6px rgba(0,0,0,.4);-moz-box-shadow:-9px 13px 64px -6px rgba(0,0,0,.4);box-shadow:-9px 13px 64px -6px rgba(0,0,0,.4)}#chat-circle .mego-img{position:fixed;bottom:21px;right:13px;width:55px;height:40px}.btn#my-btn{background:#c95d1b;border-radius:45px;color:#c95d1b;padding:13px 40px 12px}#chat-overlay{background:rgba(255,255,255,.1);position:absolute;top:0;left:0;width:100%;height:100%;border-radius:50%;display:none}.chat-box{display:none;background:#efefef;position:fixed;right:30px;bottom:50px;width:350px;max-width:85vw;max-height:100vh;border-top-left-radius:30px;border-top-right-radius:5px;-webkit-box-shadow:-9px 13px 64px -6px rgba(0,0,0,.4);-moz-box-shadow:-9px 13px 64px -6px rgba(0,0,0,.4);box-shadow:-9px 13px 64px -6px rgba(0,0,0,.4)}.chat-box-toggle{float:right;margin-right:15px;cursor:pointer}.chat-box-header{background:#c95d1b;height:60px;border-top-left-radius:28px;border-top-right-radius:4px;color:#fff;text-align:center;font-size:20px;padding-top:15px}.chat-box-header .mego-img-box{width:75px;float:none;margin-left:-11%;margin-top:21%;position:absolute;z-index:1}.chat-box-body{position:relative;height:370px;height:auto;background-color:#c95d1b;overflow:hidden}.chat-box-body:after{content:'';background-image:url('data:image/svg+xml;    base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAgOCkiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PGNpcmNsZSBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS4yNSIgY3g9IjE3NiIgY3k9IjEyIiByPSI0Ii8+PHBhdGggZD0iTTIwLjUuNWwyMyAxMW0tMjkgODRsLTMuNzkgMTAuMzc3TTI3LjAzNyAxMzEuNGw1Ljg5OCAyLjIwMy0zLjQ2IDUuOTQ3IDYuMDcyIDIuMzkyLTMuOTMzIDUuNzU4bTEyOC43MzMgMzUuMzdsLjY5My05LjMxNiAxMC4yOTIuMDUyLjQxNi05LjIyMiA5LjI3NC4zMzJNLjUgNDguNXM2LjEzMSA2LjQxMyA2Ljg0NyAxNC44MDVjLjcxNSA4LjM5My0yLjUyIDE0LjgwNi0yLjUyIDE0LjgwNk0xMjQuNTU1IDkwcy03LjQ0NCAwLTEzLjY3IDYuMTkyYy02LjIyNyA2LjE5Mi00LjgzOCAxMi4wMTItNC44MzggMTIuMDEybTIuMjQgNjguNjI2cy00LjAyNi05LjAyNS0xOC4xNDUtOS4wMjUtMTguMTQ1IDUuNy0xOC4xNDUgNS43IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS4yNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTg1LjcxNiAzNi4xNDZsNS4yNDMtOS41MjFoMTEuMDkzbDUuNDE2IDkuNTIxLTUuNDEgOS4xODVIOTAuOTUzbC01LjIzNy05LjE4NXptNjMuOTA5IDE1LjQ3OWgxMC43NXYxMC43NWgtMTAuNzV6IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS4yNSIvPjxjaXJjbGUgZmlsbD0iIzAwMCIgY3g9IjcxLjUiIGN5PSI3LjUiIHI9IjEuNSIvPjxjaXJjbGUgZmlsbD0iIzAwMCIgY3g9IjE3MC41IiBjeT0iOTUuNSIgcj0iMS41Ii8+PGNpcmNsZSBmaWxsPSIjMDAwIiBjeD0iODEuNSIgY3k9IjEzNC41IiByPSIxLjUiLz48Y2lyY2xlIGZpbGw9IiMwMDAiIGN4PSIxMy41IiBjeT0iMjMuNSIgcj0iMS41Ii8+PHBhdGggZmlsbD0iIzAwMCIgZD0iTTkzIDcxaDN2M2gtM3ptMzMgODRoM3YzaC0zem0tODUgMThoM3YzaC0zeiIvPjxwYXRoIGQ9Ik0zOS4zODQgNTEuMTIybDUuNzU4LTQuNDU0IDYuNDUzIDQuMjA1LTIuMjk0IDcuMzYzaC03Ljc5bC0yLjEyNy03LjExNHpNMTMwLjE5NSA0LjAzbDEzLjgzIDUuMDYyLTEwLjA5IDcuMDQ4LTMuNzQtMTIuMTF6bS04MyA5NWwxNC44MyA1LjQyOS0xMC44MiA3LjU1Ny00LjAxLTEyLjk4N3pNNS4yMTMgMTYxLjQ5NWwxMS4zMjggMjAuODk3TDIuMjY1IDE4MGwyLjk0OC0xOC41MDV6IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS4yNSIvPjxwYXRoIGQ9Ik0xNDkuMDUgMTI3LjQ2OHMtLjUxIDIuMTgzLjk5NSAzLjM2NmMxLjU2IDEuMjI2IDguNjQyLTEuODk1IDMuOTY3LTcuNzg1LTIuMzY3LTIuNDc3LTYuNS0zLjIyNi05LjMzIDAtNS4yMDggNS45MzYgMCAxNy41MSAxMS42MSAxMy43MyAxMi40NTgtNi4yNTcgNS42MzMtMjEuNjU2LTUuMDczLTIyLjY1NC02LjYwMi0uNjA2LTE0LjA0MyAxLjc1Ni0xNi4xNTcgMTAuMjY4LTEuNzE4IDYuOTIgMS41ODQgMTcuMzg3IDEyLjQ1IDIwLjQ3NiAxMC44NjYgMy4wOSAxOS4zMzEtNC4zMSAxOS4zMzEtNC4zMSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuMjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvZz48L3N2Zz4=');opacity:.1;top:0;left:0;bottom:0;right:0;height:100%;position:absolute;z-index:-1}#chat-input{background:#f4f7f9;width:100%;position:relative;height:47px;border:none;resize:none;outline:0;border:1px solid #ccc;color:#888;border-top:none;border-bottom-right-radius:5px;border-bottom-left-radius:5px;overflow:hidden;padding:10px 50px 10px 15px}.chat-input>form{margin-bottom:0}#chat-input::-webkit-input-placeholder{color:#ccc}#chat-input::-moz-placeholder{color:#ccc}#chat-input:-ms-input-placeholder{color:#ccc}#chat-input:-moz-placeholder{color:#ccc}.chat-submit{position:absolute;bottom:3px;right:10px;background:0 0;box-shadow:none;border:none;border-radius:50%;color:#c95d1b;width:35px;height:35px}.chat-logs{background:linear-gradient(to right bottom,#c95d1c 50%,#cc6729 50%);padding:15px;height:370px;overflow-y:scroll;overflow:hidden}.badge-custom{margin-left:41px;font-size:13px;margin-top:33px}@media only screen and (max-width:500px){.chat-logs{height:40vh}}.chat-msg.bot>.msg-avatar img{width:45px;height:45px;border-radius:50%;float:left;width:15%}.chat-msg.usuario>.msg-avatar img{width:45px;height:45px;border-radius:50%;float:right;width:15%}.cm-msg-text{font-weight:200;padding:27px 14px;color:#fff;max-width:88%;font-size:24px;float:none;margin-left:19px;margin-top:74px;position:relative;text-align:center}.chat-msg{clear:both}.chat-msg.usuario>.cm-msg-text{float:right;margin-right:10px;background:#c95d1b;color:#fff}.cm-msg-button>ul>li{list-style:none;float:left;width:50%}.cm-msg-button{clear:both;margin-bottom:70px}.spinner{display:none;margin:-22px auto 17px;width:60px;align-content:center;align-items:center}.spinner.active{display:flex;align-content:center;align-items:center}.spinner>div{width:18px;height:18px;background-color:#c95d1b;border-radius:100%;display:none;-webkit-animation:sk-bouncedelay 1.4s infinite ease-in-out both;animation:sk-bouncedelay 1.4s infinite ease-in-out both}.spinner.active>div{display:inline-block;align-content:center;align-items:center}.spinner .bounce1{display:none;margin-right:3px;-webkit-animation-delay:-.32s;animation-delay:-.32s}.spinner.active .bounce1{margin-right:3px;display:inline-block;align-content:center;align-items:center}.spinner .bounce2{margin-right:3px;display:none;-webkit-animation-delay:-.16s;animation-delay:-.16s}.spinner.active .bounce2{display:inline-block;align-content:center;align-items:center}@-webkit-keyframes sk-bouncedelay{0%,100%,80%{-webkit-transform:scale(0)}40%{-webkit-transform:scale(1)}}@keyframes sk-bouncedelay{0%,100%,80%{-webkit-transform:scale(0);transform:scale(0)}40%{-webkit-transform:scale(1);transform:scale(1)}}";
  var y = "#center-text{display:flex;flex:1;flex-direction:column;justify-content:center;align-items:center;height:100%}#chat-circle{position:fixed;bottom:50px;right:50px;background:#c95d1b;width:80px;height:80px;border-radius:50%;color:#fff;padding:28px;cursor:pointer;-webkit-box-shadow:-9px 13px 64px -6px rgba(0,0,0,0.4);-moz-box-shadow:-9px 13px 64px -6px rgba(0,0,0,0.4);box-shadow:-9px 13px 64px -6px rgba(0,0,0,0.4)}#chat-circle .mego-img{position:fixed;bottom:21px;right:13px;width:55px;height:40px}.btn#my-btn{background:#c95d1b;border-radius:45px;color:#c95d1b;padding:13px 40px 12px}#chat-overlay{background:rgba(255,255,255,0.1);position:absolute;top:0;left:0;width:100%;height:100%;border-radius:50%;display:none}.chat-box{display:none;background:#efefef;position:fixed;right:30px;bottom:50px;width:350px;max-width:85vw;max-height:100vh;border-top-left-radius:30px;border-top-right-radius:5px;-webkit-box-shadow:-9px 13px 64px -6px rgba(0,0,0,0.4);-moz-box-shadow:-9px 13px 64px -6px rgba(0,0,0,0.4);box-shadow:-9px 13px 64px -6px rgba(0,0,0,0.4)}.chat-box-toggle{float:right;margin-right:15px;cursor:pointer}.chat-box-header{background:#c95d1b;height:60px;border-top-left-radius:28px;border-top-right-radius:4px;color:#fff;text-align:center;font-size:20px;padding-top:15px}.chat-box-header .mego-img-box{width:45px;height:32px;float:left;margin-left:15px}.chat-box-body{position:relative;height:370px;height:auto;border:1px solid #ccc;overflow:hidden}.chat-box-body:after{content:'';background-image:url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAgOCkiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PGNpcmNsZSBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS4yNSIgY3g9IjE3NiIgY3k9IjEyIiByPSI0Ii8+PHBhdGggZD0iTTIwLjUuNWwyMyAxMW0tMjkgODRsLTMuNzkgMTAuMzc3TTI3LjAzNyAxMzEuNGw1Ljg5OCAyLjIwMy0zLjQ2IDUuOTQ3IDYuMDcyIDIuMzkyLTMuOTMzIDUuNzU4bTEyOC43MzMgMzUuMzdsLjY5My05LjMxNiAxMC4yOTIuMDUyLjQxNi05LjIyMiA5LjI3NC4zMzJNLjUgNDguNXM2LjEzMSA2LjQxMyA2Ljg0NyAxNC44MDVjLjcxNSA4LjM5My0yLjUyIDE0LjgwNi0yLjUyIDE0LjgwNk0xMjQuNTU1IDkwcy03LjQ0NCAwLTEzLjY3IDYuMTkyYy02LjIyNyA2LjE5Mi00LjgzOCAxMi4wMTItNC44MzggMTIuMDEybTIuMjQgNjguNjI2cy00LjAyNi05LjAyNS0xOC4xNDUtOS4wMjUtMTguMTQ1IDUuNy0xOC4xNDUgNS43IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS4yNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTg1LjcxNiAzNi4xNDZsNS4yNDMtOS41MjFoMTEuMDkzbDUuNDE2IDkuNTIxLTUuNDEgOS4xODVIOTAuOTUzbC01LjIzNy05LjE4NXptNjMuOTA5IDE1LjQ3OWgxMC43NXYxMC43NWgtMTAuNzV6IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS4yNSIvPjxjaXJjbGUgZmlsbD0iIzAwMCIgY3g9IjcxLjUiIGN5PSI3LjUiIHI9IjEuNSIvPjxjaXJjbGUgZmlsbD0iIzAwMCIgY3g9IjE3MC41IiBjeT0iOTUuNSIgcj0iMS41Ii8+PGNpcmNsZSBmaWxsPSIjMDAwIiBjeD0iODEuNSIgY3k9IjEzNC41IiByPSIxLjUiLz48Y2lyY2xlIGZpbGw9IiMwMDAiIGN4PSIxMy41IiBjeT0iMjMuNSIgcj0iMS41Ii8+PHBhdGggZmlsbD0iIzAwMCIgZD0iTTkzIDcxaDN2M2gtM3ptMzMgODRoM3YzaC0zem0tODUgMThoM3YzaC0zeiIvPjxwYXRoIGQ9Ik0zOS4zODQgNTEuMTIybDUuNzU4LTQuNDU0IDYuNDUzIDQuMjA1LTIuMjk0IDcuMzYzaC03Ljc5bC0yLjEyNy03LjExNHpNMTMwLjE5NSA0LjAzbDEzLjgzIDUuMDYyLTEwLjA5IDcuMDQ4LTMuNzQtMTIuMTF6bS04MyA5NWwxNC44MyA1LjQyOS0xMC44MiA3LjU1Ny00LjAxLTEyLjk4N3pNNS4yMTMgMTYxLjQ5NWwxMS4zMjggMjAuODk3TDIuMjY1IDE4MGwyLjk0OC0xOC41MDV6IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS4yNSIvPjxwYXRoIGQ9Ik0xNDkuMDUgMTI3LjQ2OHMtLjUxIDIuMTgzLjk5NSAzLjM2NmMxLjU2IDEuMjI2IDguNjQyLTEuODk1IDMuOTY3LTcuNzg1LTIuMzY3LTIuNDc3LTYuNS0zLjIyNi05LjMzIDAtNS4yMDggNS45MzYgMCAxNy41MSAxMS42MSAxMy43MyAxMi40NTgtNi4yNTcgNS42MzMtMjEuNjU2LTUuMDczLTIyLjY1NC02LjYwMi0uNjA2LTE0LjA0MyAxLjc1Ni0xNi4xNTcgMTAuMjY4LTEuNzE4IDYuOTIgMS41ODQgMTcuMzg3IDEyLjQ1IDIwLjQ3NiAxMC44NjYgMy4wOSAxOS4zMzEtNC4zMSAxOS4zMzEtNC4zMSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEuMjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvZz48L3N2Zz4=);opacity:.1;top:0;left:0;bottom:0;right:0;height:100%;position:absolute;z-index:-1}#chat-input{background:#f4f7f9;width:100%;position:relative;height:47px;border:none;resize:none;outline:none;border:1px solid #ccc;color:#888;border-top:none;border-bottom-right-radius:5px;border-bottom-left-radius:5px;overflow:hidden;padding:10px 50px 10px 15px}.chat-input>form{margin-bottom:0}#chat-input::-webkit-input-placeholder{color:#ccc}#chat-input::-moz-placeholder{color:#ccc}#chat-input:-ms-input-placeholder{color:#ccc}#chat-input:-moz-placeholder{color:#ccc}.chat-submit{position:absolute;bottom:3px;right:10px;background:transparent;box-shadow:none;border:none;border-radius:50%;color:#c95d1b;width:35px;height:35px}.chat-logs{padding:15px;height:370px;overflow-y:scroll}.badge-custom{margin-left:41px;font-size:13px;margin-top:33px}@media only screen and (max-width: 500px){.chat-logs{height:40vh}}.chat-msg.bot>.msg-avatar img{width:45px;height:45px;border-radius:50%;float:left;width:15%}.chat-msg.usuario>.msg-avatar img{width:45px;height:45px;border-radius:50%;float:right;width:15%}.cm-msg-text{background:#fff;padding:10px 15px;color:#666;max-width:75%;float:left;margin-left:10px;position:relative;margin-bottom:20px;border-radius:30px}.chat-msg{clear:both}.chat-msg.usuario>.cm-msg-text{float:right;margin-right:10px;background:#c95d1b;color:#fff}.cm-msg-button>ul>li{list-style:none;float:left;width:50%}.cm-msg-button{clear:both;margin-bottom:70px}.spinner{display:none;margin:-22px auto 17px;width:60px;align-content:center;align-items:center}.spinner.active{display:flex;align-content:center;align-items:center}.spinner>div{width:18px;height:18px;background-color:#c95d1b;border-radius:100%;display:none;-webkit-animation:sk-bouncedelay 1.4s infinite ease-in-out both;animation:sk-bouncedelay 1.4s infinite ease-in-out both}.spinner.active>div{display:inline-block;align-content:center;align-items:center}.spinner .bounce1{display:none;margin-right:3px;-webkit-animation-delay:-.32s;animation-delay:-.32s}.spinner.active .bounce1{margin-right:3px;display:inline-block;align-content:center;align-items:center}.spinner .bounce2{margin-right:3px;display:none;-webkit-animation-delay:-.16s;animation-delay:-.16s}.spinner.active .bounce2{display:inline-block;align-content:center;align-items:center}@-webkit-keyframes sk-bouncedelay{0%,80%,100%{-webkit-transform:scale(0)}40%{-webkit-transform:scale(1.0)}}@keyframes sk-bouncedelay{0%,80%,100%{-webkit-transform:scale(0);transform:scale(0)}40%{-webkit-transform:scale(1.0);transform:scale(1.0)}}";


  var xStyle = document.createElement("style");
  xStyle.innerHTML = x;
  document.body.appendChild(xStyle);
  
  var generate_chat = function() {

      var str = "";
      str += "           <div id=\"chat-circle\" class=\"btn btn-raised text-center\">"
      str += "           <div id=\"chat-overlay\"></div>"
      str += "           <img class=\"mego-img\" src=\"img/1.png\"/>"
      str += "          <\/div>"
      str += "          <div class=\"chat-box\">"
      str += "          <div class=\"chat-box-header\">"
      str += "              <div class=\"icon\"></div>"
      str += "               <img class=\"mego-img-box\" src=\"img/1.png\"/>"
      str += "               <span class=\"chat-box-toggle\"><i class=\"material-icons\">close</i><\/span>"
      str += "          <\/div>"
      str += "           <div class=\"chat-box-body\">"
      str += "               <div class=\"chat-box-overlay\">"
      str += "              <\/div>"
      str += "              <div class=\"chat-logs\">"
      str += "              <\/div>"
      str += "              <!-- mensajes -->"
      str += "              <div id=\"loader\" class=\"spinner\">"
      str += "                <div class=\"bounce1\"><\/div>"
      str += "                <div class=\"bounce2\"><\/div>"
      str += "                <div class=\"bounce3\"><\/div>"
      str += "              <\/div>"
      str += "           <\/div>"
      str += "           <div class=\"chat-input\">"
      str += "               <form id=\"formInput\" style=\"display:none;\">"
      str += "                 <input type=\"text\" autocomplete=\"off\" id=\"chat-input\" placeholder=\"Envia tu mensaje...\"/>"
      str += "                 <button type=\"submit\" class=\"chat-submit\" id=\"chat-submit\"><i class=\"material-icons\">send<\/i><\/button>"
      str += "              <\/form>"
      str += "           <\/div>"
      str += "           <div class=\"chat-input\">"
      str += "               <form id=\"formButton\" style=\"display:none;\">"
      str += "                 <button type=\"button\" class=\"btn btn-secondary btn-lg btn-block hvr-underline-from-center\">Hola Mego!</button>"
      str += "              <\/form>"
      str += "           <\/div>"
      str += "         <\/div>"

      $(".chat-mego").append(str);
  }

  generate_chat();

  var formInput = document.querySelector("#formInput");
  var formButton = document.querySelector("#formButton");
  var chatLog = document.querySelector('.chat-log');
  formButton.style.display = 'block';

  function changeStyle() {
      // Ocultamos el boton
      formButton.style.display = 'none';
      // Mostramos el input
      formInput.style.display = 'block';
      //Vaciamos estilos primarios
      x = "";
      xStyle.innerHTML = x;
      document.body.appendChild(xStyle);
      // Aplicamos estilos secundarios
      var yStyles = document.createElement("style");
      yStyles.innerHTML = y;
      document.body.appendChild(yStyles);
  }



  const CONTEXT_DATA = 'input[name="' + CONTEXT_INPUT_NAME + '"]';
  var indice = 0;
  var contadorN = 0;
  var loader = document.querySelector('#loader');

  var setCookie = function(cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      var expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  var getCookie = function(cname) {
      var name = cname + "=";
      var decodedCookie = decodeURIComponent(document.cookie);
      var ca = decodedCookie.split(';');
      for (var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') {
              c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
              return c.substring(name.length, c.length);
          }
      }
      return "";
  }

  var imagenes = ['img/1.png', 'img/2.png'];
  var chatInput = document.querySelector(".chat-input");
  var imgMego = document.querySelector(".mego-img-box");

  var intervalPestaneo = function() {
      return setInterval(function() {
          console.log("pestaneando");
          var index = Math.floor((Math.random() * imagenes.length));
          var megoCirculo = document.body.getElementsByClassName("mego-img")[0];
          var megoCaja = document.body.getElementsByClassName("mego-img-box")[0];
          megoCirculo.src = imagenes[index];
          megoCaja.src = imagenes[index];
      }, 2000);
  }

  chatInput.addEventListener('focusin', (event) => {
      imagenes[0] = "img/3.png";
      imagenes[1] = "img/3.png";
  });

  chatInput.addEventListener('focusout', (event) => {
      imagenes[0] = "img/1.png";
      imagenes[1] = "img/2.png";
  });
  
  onload = function() {
      intervalPestaneo();
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
      console.log(method + " " + url);
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

  // Función que controlaría el manejo de respuesta de parte del servidor
  var RenderResponse = function(responseFromServer) {
      // Obtenemos la etiqueta contenido donde realizaremos el renderizado
      var spnResponse = document.querySelector('#spnResponse');
      // Hacemos parse al objeto obtenido 
      var JsonResp = JSON.parse(responseFromServer);
      // Renderizamos la respuesta en la etiqueta correspondiente
      spnResponse.innerHTML += '<br> Servicio: ' + JsonResp.msg;
      // Guardamos el contexto en el documento
      var inpContext = document.querySelector(CONTEXT_DATA);
      // Si no existe el hidden de la etiqueta se genera
      if (inpContext == undefined) {
          // Generamos un elemento
          inpContext = document.createElement('input')
          // Definimos los parametros del elemento
          inpContext.type = CONTEXT_INPUT_TYPE;
          inpContext.name = CONTEXT_INPUT_NAME;
          // Anexamos el elemento al body
          document.body.appendChild(inpContext);
      }
      // Guardamos el valor del contexto convirtiendolo en string
      inpContext.value = JSON.stringify(JsonResp.context);
  }
  // Versión modificada con agregados de Mauro Barroso
  var RenderResponseMessage = function(responseFromServer) {
      // Obtenemos el objeto JSON y lo parseamos
      var JsonResp = JSON.parse(responseFromServer);
      // Renderizamos la respuesta del bot
      generate_message(JsonResp.msg, 'bot');
      // Guardamos el contexto en el documento
      var inpContext = document.querySelector(CONTEXT_DATA);
      // Si no existe el hidden de la etiqueta se genera
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
      loader.classList.remove("active");
  }

  var sendMessageEvent = function(e) {
      // Detenemos las acciones por defecto del botón
      e.preventDefault();
      // Obtenemos el valor del input
      let iptMessage = document.querySelector('input[name="inpMessage"]');
      // Separamos el valor del mensaje a enviar
      let messageToSend = iptMessage.value;
      // Validamos si existe el contexto
      let inpContext = document.querySelector(CONTEXT_DATA);
      // Disponemos una variable temporal para almacenar el contenido del valor
      iptMessage = document.querySelector('input[name="inpMessage"]');
      let contextValue;
      // Validamos si la etiqueta existe
      if (inpContext != undefined) contextValue = inpContext.value;
      // Preparamos los datos para enviar
      var info = {
          msg: messageToSend,
          context: contextValue
      }
      // Separamos la etiqueta response
      let spnResponse = document.querySelector('#spnResponse');
      // Agregamos el mensaje del usuario a los mensajes
      spnResponse.innerHTML += '<br> Usuario: ' + iptMessage.value;
      // Vaciamos el contenido del input
      iptMessage.value = '';
      // Configuramos el focus sobre el input
      iptMessage.focus();
      // Preparamos la solicitud ajax para hacer el envío de información
      AjaxCall({
          url: CHATBOT_URL,
          method: CHATBOT_HTTPMETHOD,
          callback: RenderResponse,
          data: info,
          json: true
      });
  };

  var startConversation = function() {
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

      var _msg = $("#chat-input").val();
      if (_msg.trim() == '') {
          return false;
      }
      // Validamos si existe el contexto
      let inpContext = document.querySelector(CONTEXT_DATA);
      // Disponemos una variable temporal para almacenar el contenido del valor
      let contextValue;
      // Validamos si la etiqueta existe
      if (inpContext != undefined) contextValue = inpContext.value;
      // Preparamos los datos para enviar
      var info = {
          msg: _msg,
          context: contextValue
      }
      setTimeout(() => {
          // Preparamos la solicitud ajax para hacer el envío de información
          AjaxCall({
              url: CHATBOT_URL,
              method: CHATBOT_HTTPMETHOD,
              callback: RenderResponseMessage,
              data: info,
              json: true
          });
      }, 1400);
      // Generamos mensaje del usuario
      generate_message(_msg, 'usuario');
      loader.classList.add("active");
  }

  var generate_message = function(msg, type) {
      //Aumentamos el indice que representa la cantidad de mensajes que aparecen en pantalla
      indice++;
      var str = "";
      var notificacion = "";
      str += "<div id='cm-msg-" + indice + "' class=\"chat-msg " + type + "\">";
      str += "<span class=\"msg-avatar\">";

      if (type != 'usuario') {
          //Incrementamos las notificaciones que no sean de usuarios
          contadorN++;
          //str += "            <img src=\"img/watson.jpg\">";
          notificacion = "<span id='notification' class=\"badge badge-dark badge-custom\">" + contadorN + "<\/span>";
          $("#chat-circle").append(notificacion);
          $("#notification").hide().fadeIn(1000);
          $("#chat-submit").prop('disabled', false);
      }
      str += "<\/span>";
      str += "<div class=\"cm-msg-text\">";
      str += msg;
      str += "<\/div>";
      str += "<\/div>";
      $(".chat-logs").append(str);
      
      $("#cm-msg-" + indice).hide().fadeIn(300);
      if (type == 'usuario') {
          // Limpiamos el input
          $("#chat-input").val('');
          if (flagInicioConversacion == 1) {
              $("#chat-submit").prop('disabled', false);
          } else {
              // Deshabilitamos el envio de mensaje hasta que se reciba respuesta del bot
              $("#chat-submit").prop('disabled', true);
          }
      }
      // Scroll 
      $(".chat-logs").stop().animate({
          scrollTop: $(".chat-logs")[0].scrollHeight
      }, 1000);
  }

  $("#chat-circle").click(function() {
      //Reiniciamos el contador de notificaciones
      contadorN = 0;
      $("#chat-circle").toggle('scale');
      $(".chat-box").toggle('scale');
      $(".mego-img").toggle('scale');
      //Eliminamos la notificación
      $(".badge").remove();
  })

  $(".chat-box-toggle").click(function() {
      $("#chat-circle").toggle('scale');
      $(".chat-box").toggle('scale');
      $(".mego-img").toggle('scale');
      //Eliminamos la notificación
      $(".badge").remove();
  })

  $("#chat-submit").click(click_submit);


  formButton.addEventListener('click', (event) => {
      // Cambiamos los estilos
      $(".chat-box").slideDown(function(){
        changeStyle();
      });
      // Cambiamos el valor del flag, para que la conversacion continue
      flagInicioConversacion = 1;
      // Generamos el saludo del usuario en el chat
      generate_message(SALUDO, "usuario");
      flagInicioConversacion = 0;
  });
  startConversation();
  
}());