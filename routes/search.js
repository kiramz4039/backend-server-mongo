// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Hospital = require('../models/hospital');
var User = require('../models/user');
var Doctor = require('../models/doctor');
// Inicializar variables
var app = express();



// ===================================================================
// Busqueda general
// ===================================================================

app.get('/global/:search', (req, res, next) => {
    var search = req.params.search;
    var regex = new RegExp(search, 'i');

    // Permite enviar un arreglo de promesas
    Promise.all(
            [searchHospital(search, regex),
                searchDoctor(search, regex),
                searchUser(search, regex)
            ])
        .then(response => {
            res.status(200).json({
                ok: true,
                hospitals: response[0],
                doctors: response[1],
                users: response[2]
            });
        });

});

// ===================================================================
// Busqueda por colección
// ===================================================================
app.get('/collection/:table/:search', (req, res) => {
    var search = req.params.search;
    var table = req.params.table;
    var regex = new RegExp(search, 'i');
    var promise;

    switch (table) {
        case 'user':
            promise = searchUser(search, regex);
            break;
        case 'doctor':
            promise = searchDoctor(search, regex);
            break;
        case 'hospital':
            promise = searchHospital(search, regex);
            break;
        default:
            res.status(400).json({
                ok: false,
                msg: 'El nombre de la collección es incorrecto'
            });
            break;
    }

    promise.then(data => {
        res.status(200).json({
            ok: true,
            [table]: data
        });
    });



});




// ===================================================================
// Promesa para buscar los hospitales
// ===================================================================

function searchHospital(search, regex) {
    return new Promise((resolve, reject) => {

        Hospital.find({ name: regex })
            .populate('user', 'name email')
            .exec((err, hospitalsFound) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitalsFound);
                }
            });
    });
}



// ===================================================================
// Promesa para buscar los doctores
// ===================================================================

function searchDoctor(search, regex) {
    return new Promise((resolve, reject) => {

        Doctor.find({ name: regex })
            .populate('user', 'name email')
            .populate('hospital')
            .exec((err, doctorFound) => {
                if (err) {
                    reject('Error al cargar los doctores', err);
                } else {
                    resolve(doctorFound);
                }
            });
    });
}


// ===================================================================
// Promesa para buscar por usuario
// ===================================================================

function searchUser(search, regex) {
    return new Promise((resolve, reject) => {

        User.find({}, 'name email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, userFound) => {
                if (err) {
                    reject('Error al cargar los usuarios', err);
                } else {
                    resolve(userFound);
                }
            });
    });
}

module.exports = app;