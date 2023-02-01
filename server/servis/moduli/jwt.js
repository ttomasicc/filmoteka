const {tajniKljucJWT} = require('../../konstante.js');
const jwt = require(`jsonwebtoken`);

exports.provjeri = function (token) {
    try {
        jwt.verify(token, tajniKljucJWT);
        return true;
    } catch (err) {
        return false;
    }
}

exports.dajTijelo = function (token) {
    const dijelovi = token.split('.');
    return JSON.parse(dekodirajBase64(dijelovi[1]));
}

function dekodirajBase64(data) {
    let buff = new Buffer(data, 'base64');
    return buff.toString('ascii');
}