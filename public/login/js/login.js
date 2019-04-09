document.addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("btnSend").click();
    }
});

// Llamado asíncrono a cualquier función requerida
var AjaxCall = function ({ url, method, callback, data } = {}) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.addEventListener('load', () => {
        if (xhr.status == 200) {
            if (xhr.response == "true" || xhr.response == true) {
                window.location = '/';
            } else {                
                arrayInputs = document.querySelectorAll('input');
                for (let i = 0; i < arrayInputs.length; i++) {
                    arrayInputs[i].value = "";
                }
                document.querySelector('#error-form').classList.remove('error-hidden');
                document.querySelector('#error-form').classList.add('pulsate');
            }
        }
    });
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
}
var btnSend = document.querySelector('#btnSend');
btnSend.addEventListener('click', e => {
    e.preventDefault();
    var iptUsername = document.querySelector('input[name="iptUsername"]');
    var username = iptUsername.value;

    var iptPassword = document.querySelector('input[name="iptPassword"]');
    var password = iptPassword.value;

    var iptStayLogged = document.querySelector('input[name="iptStayLogged"');
    var stayLogged = iptStayLogged.checked;

    var userData = {
        user: username,
        pass: password,
        stay: stayLogged,
    }
    AjaxCall({ url: "/authenticate", method: 'post', callback: undefined, data: userData });

})