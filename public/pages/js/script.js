(function() {

    function setupHover() {
        //Hover
        $('.sidebar').find('.list-group').stop().animate({ marginLeft: '-67px' }, 200);
        $('.sidebar').mouseover(function() {
            $(this).find('.list-group').stop().animate({ marginLeft: '0px' }, 200);
        }).mouseout(function() {
            $(this).find('.list-group').stop().animate({ marginLeft: '-67px' }, 200);
        });
    }
    setupHover();

    var src;
    var containerFluid = document.querySelector(".container-fluid");
    var iframe = document.createElement("iframe");

    iframe.setAttribute("width", "100%");
    iframe.setAttribute("height", "100%");
    iframe.setAttribute("src", src);
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowfullscreen", "1");
    iframe.setAttribute("style", "background-color:white;");
    iframe.sandbox = "allow-same-origin allow-scripts";

    containerFluid.appendChild(iframe);

    var arrayLinks = document.querySelectorAll('.list-group-item a');

    arrayLinks.forEach(element => {
        element.addEventListener('click', e => {
            e.preventDefault();
            cambiarURL(element.dataset.url);
        });
    });

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    function cambiarURL(id) {
        switch (id) {
            case '1':
                iframe.src = "http://rrhhnews.mega.com.ar";
                break;
            case '2':
                iframe.src = "https://portal.megatech.la:2443/";
                break;
            case '3':
                iframe.src = "https://portal.megatech.la:4065/tmc";
                break;
            case '4':
                iframe.src = "https://portal.megatech.la:4065/tree/documentos.aspx";
                break;
            case '5':
                iframe.src = "http://work4u.mega.com.ar";
                break;
                // case '6':
                //     iframe.src = "http://glpi.mega.com.ar/";
                //     break;
            default:
                iframe.src = "http://vacaciones.mega.com.ar/login"
                break;
        }
    }

    var idUrl = getParameterByName('page');
    console.log(idUrl);
    cambiarURL(idUrl);

}());