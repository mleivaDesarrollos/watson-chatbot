
function CargarAlgo() {
    var RIKUEST = new XMLHttpRequest();
    var page = RIKUEST.open('GET','http://portal.mega.com.ar:2030/');
    console.log(page);
    RIKUEST.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        
      }
    };

    RIKUEST.send();
  }