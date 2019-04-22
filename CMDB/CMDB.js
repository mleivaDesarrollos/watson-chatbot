const DATABASE = "./CMDB/localCMDB.db";
var database = require('../Database');

var getByUser = async({username} = {}) => {
    // Generamos una nueva instancia de base de datos
    var db = new database({databaseLocation:DATABASE})
    // Dejamos un acumulador de elementos que nos permite almacenar el listado de maquinas a procesar
    var workstations = [];
    // Ejecutamos la consulta a la base de datos
    await db.get({qs: "SELECT workstation FROM workstations WHERE username=?", pms: [username]}).then((totalMachines) => {
        totalMachines.forEach( machine => {
            // Agregamos la maquina al listado de máquinas
            workstations.push(machine.workstation);
        });
    })
    return workstations;// Devolvemos el listado de máquinas vinculado al usuario en cuestión
}

module.exports = {
    GetByUser: getByUser
}