const jwt = require('../moduli/jwt.js');

exports.autentificiraj = function (zahtjev, odgovor, dalje) {
    if (zahtjev.headers.authorization != null) {
        dalje();
    } else {
        return odgovor.status(401).json({greska: 'Neuatoriziran pristup.'});
    }
}

exports.autorizirajAdmin = function (zahtjev, odgovor, dalje) {
    if (autoriziraj(zahtjev, 1)) {
        dalje();
    } else {
        return odgovor.status(403).json({greska: 'Zabranjen pristup.'});
    }
}

exports.autorizirajKorisnik = function (zahtjev, odgovor, dalje) {
    if (autoriziraj(zahtjev, 2) || autoriziraj(zahtjev, 1)) {
        dalje();
    } else {
        return odgovor.status(403).json({greska: 'Zabranjen pristup.'});
    }
}

function autoriziraj(zahtjev, uloga) {
    const token = zahtjev.headers.authorization.split(' ')[1];
    return (jwt.provjeri(token) && autorizirajUlogu(token, uloga));
}

function autorizirajUlogu(token, uloga) {
    return uloga === jwt.dajTijelo(token).id_uloga;
}