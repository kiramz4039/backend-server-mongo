// Requires
var express = require('express');
var User = require('../models/user');
var bcrypt = require('bcryptjs');
var mdAuth = require('../middlewares/auth');
// Inicar
var app = express();


// ===================================================================
// Obtener todos los usuarios
// ===================================================================


app.get('/', (req, res, next) => {
    User.find({}, 'name email img role').exec((err, users) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error cargando usuarios',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            users: users
        });
    });


});




// ===================================================================
// Crear un nuevo usuario
// ===================================================================

// x-www-form-urlencoded postman post

app.post('/', mdAuth.tokenVerification, (req, res) => {

    var body = req.body;

    var user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    user.save((err, userSave) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                msg: 'Error creando al usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            user: userSave
        });
    });


});





// ===================================================================
// Actualizar usuario
// ===================================================================
//id por url

app.put('/:id', mdAuth.tokenVerification, (req, res) => {
    var id = req.params.id;
    var body = req.body;


    User.findById(id, (err, userFound) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!userFound) {
            return res.status(404).json({
                ok: false,
                msg: 'El usuario con el id: ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }


        userFound.name = body.name;
        userFound.email = body.email;
        userFound.role = body.role;

        userFound.save((err, userSave) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Error actualizando el usuario',
                    errors: err
                });
            }

            userSave.password = ':)';

            res.status(200).json({
                ok: true,
                user: userSave
            });
        });

    });


});


// ===================================================================
// Borrar usuario por id
// ===================================================================

app.delete('/:id', mdAuth.tokenVerification, (req, res) => {
    var id = req.params.id;

    User.findByIdAndRemove(id, (err, userRemove) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al borrar el usuario',
                errors: err
            });
        }
        if (!userRemove) {
            return res.status(404).json({
                ok: false,
                msg: 'El usuario  con el id: ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }
        userRemove.password = ':)';
        res.status(200).json({
            ok: true,
            user: userRemove
        });
    });

});


module.exports = app;