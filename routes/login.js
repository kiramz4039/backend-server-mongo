// Requires
var express = require('express');
var User = require('../models/user');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// Inicar
var app = express();


// ===================================================================
// Login post 
// ===================================================================


app.post('/', (req, res) => {

    var body = req.body;

    User.findOne({ email: body.email }, (err, userFound) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error buscar usuario',
                errors: err
            });
        }
        if (!userFound) {
            return res.status(400).json({
                ok: false,
                msg: 'Credenciales incorrectas',
                errors: 'Credenciales incorrectas'
            });
        }

        if (!bcrypt.compareSync(body.password, userFound.password)) {
            return res.status(400).json({
                ok: false,
                msg: 'Credenciales incorrectas',
                errors: 'Credenciales incorrectas'
            });
        }

        // Crear token
        var token = jwt.sign({ user: userFound }, SEED, { expiresIn: 14400 }); // 4 horas
        userFound.password = ':)';


        res.status(200).json({
            ok: true,
            user: userFound,
            id: userFound.id,
            token: token,
            message: 'Login post correcto'
        });

    });




});

module.exports = app;