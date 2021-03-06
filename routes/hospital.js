// Requires
var express = require('express');
var Hospital = require('../models/hospital');
var mdAuth = require('../middlewares/auth');
// Inicar
var app = express();


// ===================================================================
// Obtener todos los hospitales
// ===================================================================


app.get('/', (req, res, next) => {

    var from = req.query.from || 0;
    try { from = Number(from); } catch (exception) {
        return res.status(400).json({
            ok: false,
            msg: 'El parámetro enviado para la paginación debe ser numérico',
            errors: exception
        });
    }

    Hospital.find({})
        .skip(from)
        .limit(5)
        .populate('user', 'name email')
        .exec((err, hospitals) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error cargando los hospitales',
                    errors: err
                });
            }
            Hospital.count({}, (err, count) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        msg: 'Error al contar los hospitales',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    hospitals: hospitals,
                    userSession: req.user,
                    total: count
                });
            });
        });


});



// ===================================================================
// Crear un nuevo hospital
// ===================================================================

// x-www-form-urlencoded postman post

app.post('/', mdAuth.tokenVerification, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        name: body.name,
        img: body.img,
        user: req.user._id
    });

    hospital.save((err, hospitalSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                msg: 'Error creando el hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalSaved,
            userSession: req.user
        });
    });


});





// ===================================================================
// Actualizar hospital
// ===================================================================
//id por url

app.put('/:id', mdAuth.tokenVerification, (req, res) => {
    var id = req.params.id;
    var body = req.body;


    Hospital.findById(id, (err, hospitalFound) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al buscar el hospital',
                errors: err
            });
        }
        if (!hospitalFound) {
            return res.status(404).json({
                ok: false,
                msg: 'El hospital con el id: ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }


        hospitalFound.name = body.name;
        hospitalFound.user = req.user._id;
        // hospitalFound.img = body.img;

        hospitalFound.save((err, hospitalSaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Error actualizando el usuario',
                    errors: err
                });
            }


            res.status(200).json({
                ok: true,
                hospital: hospitalSaved,
                userSession: req.user
            });
        });

    });


});


// ===================================================================
// Borrar hospital por id
// ===================================================================

app.delete('/:id', mdAuth.tokenVerification, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalRemoved) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al borrar el hospital',
                errors: err
            });
        }
        if (!hospitalRemoved) {
            return res.status(404).json({
                ok: false,
                msg: 'El hospital  con el id: ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalRemoved,
            userSession: req.user
        });
    });

});

module.exports = app;