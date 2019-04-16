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

    var from = req.query.from || 0;
    try { from = Number(from); } catch (exception) {
        return res.status(400).json({
            ok: false,
            msg: 'El parámetro enviado para la paginación debe ser numérico',
            errors: exception
        });
    }


    User.find({}, 'name email img role google')
        .skip(from)
        .limit(5)
        .exec((err, users) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error cargando usuarios',
                    errors: err
                });
            }
            User.count({}, (err, count) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        msg: 'Error al contar los usuarios',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    users: users,
                    userSession: req.user,
                    total: count
                });
            });
        });


});




// ===================================================================
// Crear un nuevo usuario
// ===================================================================

// x-www-form-urlencoded postman post

app.post('/', (req, res) => {

    var body = req.body;

    var user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    user.save((err, userSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                msg: 'Error creando al usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            user: userSaved,
            userSession: req.user
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
        userFound.role = body.role;
        if (!userFound) {
            userFound.email = body.email;
        }

        userFound.save((err, userSaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Error actualizando el usuario',
                    errors: err
                });
            }

            userSaved.password = ':)';

            res.status(200).json({
                ok: true,
                user: userSaved,
                userSession: req.user
            });
        });

    });


});


// ===================================================================
// Borrar usuario por id
// ===================================================================

app.delete('/:id', mdAuth.tokenVerification, (req, res) => {
    var id = req.params.id;

    User.findByIdAndRemove(id, (err, userRemoved) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al borrar el usuario',
                errors: err
            });
        }
        if (!userRemoved) {
            return res.status(404).json({
                ok: false,
                msg: 'El usuario  con el id: ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }
        userRemoved.password = ':)';
        res.status(200).json({
            ok: true,
            user: userRemoved,
            userSession: req.user
        });
    });

});


module.exports = app;