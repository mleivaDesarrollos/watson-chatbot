/*
var configAD = {
    url: 'ldap://192.168.1.1:389',
    baseDN: 'dc=mega,dc=com,dc=ar',
    username: 'admintec@mega.com.ar',
    password: 'C4rr13r!'
};
*/

var ldaphost = "ldap://192.168.1.1:389";
var username = "testbelgrano";
var oldpassword = "Test2019";
var newpassword = "Prueba2019";

var ldap = require('ldapjs');
var client = ldap.createClient({
    url: ldaphost,
    bindDN: "admintec@mega.com.ar",
    bindCredentials: "C4rr13r!"
});

function encodePassword(password) {
    // var newPassword = '';
    // password = "\"" + password + "\"";
    // for(var i = 0; i < password.length; i++){
    //     newPassword += String.fromCharCode( password.charCodeAt(i) & 0xFF,(password.charCodeAt(i) >>> 8) & 0xFF);
    // }
    // return newPassword;    
    return Buffer.from('"' + password + '"', 'utf16le');
}



// client.search('dc=mega,dc=com,dc=ar',{
//     filter: '(sAMAccountName=admintec)',
//     attributes: 'dn',
//     scope: 'sub'
// }, function(err, res) {
//     res.on('searchEntry', function(entry) {
//         var userDN = entry.object.dn;
//         console.log(userDN);
//         client.bind(userDN, "C4rr13r!", function(err){
//             client.modify(userDN, [
//                 new ldap.Change({
//                     operation: 'delete',
//                     modification: {
//                         unicodePwd: encodePassword(oldpassword)
//                     }
//                 }),
//                 new ldap.Change({
//                     operation: 'add',
//                     modification: {
//                         unicodePwd: encodePassword(newpassword)
//                     }
//                 })
//             ], function(err) {
//                 if(err) {
//                     console.log(err.code);
//                     console.log(err.name);
//                     console.log(err.message);
//                     client.unbind();
//                 } else {
//                     console.log("password changed");
//                 }
//             })
//         })
//     })
// })

client.search('dc=mega,dc=com,dc=ar',{
    filter: '(sAMAccountName=admintec)',
    attributes: 'dn',
    scope: 'sub'
}, function(err, res) {
    res.on('searchEntry', function(entry) {
        var userDN = entry.object.dn;
        console.log(userDN);
        client.bind(userDN, "C4rr13r!", function(err){
            if(err) console.log(err)
            client.modify("CN=Pruebas Belgrano,CN=Users,DC=mega,DC=com,DC=ar", [
                new ldap.Change({
                    operation: 'replace',
                    modification: {
                        unicodePwd: encodePassword(newpassword)
                    }
                })
            ], function(err) {
                if(err) {
                    console.log(err.code);
                    console.log(err.name);
                    console.log(err.message);
                    client.unbind();
                } else {
                    console.log("password changed");
                }
            })
        })
    })
})


