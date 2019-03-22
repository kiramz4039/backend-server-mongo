// Requires
var express = require('express');
var mongoose = require('mongoose');
var Doctor = require('../models/doctor');
var mdAuth = require('../middlewares/auth');

// Inicar
var app = express();

// ===================================================================
// Obtener todos los doctores
// ===================================================================
app.get('/', (req, res, next) => {
    Doctor.find({}).exec((err, doctors) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al cargar los médicos',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            doctors: doctors,
            userSession: req.user
        });
    });
});

// ===================================================================
// Crear un nuevo doctor
// ===================================================================

// x-www-form-urlencoded postman post

app.post('/', mdAuth.tokenVerification, (req, res) => {
    var body = req.body;

    var doctor = new Doctor({
        name: body.name,
        img: body.img,
        user: body.user,
        hospital: body.hospital
    });

    doctor.save((err, doctorSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                msg: 'Error al crear al médico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            doctor: doctorSaved,
            userSession: req.user
        });

    });

});

// ===================================================================
// Actualizar doctor
// ===================================================================
//id por url

app.put('/:id', mdAuth.tokenVerification, (req, res) => {
    var id = req.params.id;
    var body = req.body;


    Doctor.findOne((err, doctorFound) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al buscar al médico',
                errors: err
            });
        }
        if (!doctorFound) {
            return res.status(404).json({
                ok: false,
                msg: 'El doctor con el id: ' + id + ' no existe',
                errors: { message: 'No existe un doctor con ese ID' }
            });
        }

        doctorFound.name = body.name;
        doctorFound.user = body.user;
        doctorFound.hospital = body.hospital;

        doctorFound.save((err, doctorSaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Error al actualizar los datos del médico',
                    errors: err
                });
            }

            res.status(201).json({
                ok: true,
                doctor: doctorSaved,
                userSession: req.user
            });

        });



    });

});

// ===================================================================
// Borrar doctor por id
// ===================================================================

app.delete('/:id', mdAuth.tokenVerification, (req, res) => {
    var id = req.params.id;

    Doctor.findByIdAndRemove(id, (err, doctorRemoved) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al borrar el doctor',
                errors: err
            });
        }
        if (!doctorRemoved) {
            return res.status(404).json({
                ok: false,
                msg: 'El doctor  con el id: ' + id + ' no existe',
                errors: { message: 'No existe un doctor con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            doctor: doctorRemoved,
            userSession: req.user
        });
    });

});



module.exports = app;