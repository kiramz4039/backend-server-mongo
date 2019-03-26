// Requires
var express = require('express');
var User = require('../models/user');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// Google
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = require('../config/config').CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

// Inicar
var app = express();



// ===================================================================
// Login google
// ===================================================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {

    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                msg: 'Token no válido'
            });
        });


    User.findOne({ email: googleUser.email }, (err, userDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al buscar usuario',
                errors: err
            });
        }
        if (userDB) {
            if (userDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    msg: 'La cuenta no ha sido registrada con google signin utilice otro método de autentificación',
                    errors: err
                });
            } else {
                res.status(200).json({
                    ok: true,
                    user: userDB,
                    id: userDB.id,
                    token: token,
                    message: 'La autentificación con google es correcta'
                });

            }
        } else {
            // Si el usuario no existe hay que crearlo
            var userNew = new User();
            userNew.name = googleUser.name;
            userNew.email = googleUser.email;
            userNew.img = googleUser.img;
            userNew.google = googleUser.google;
            userNew.password = ":)";

            userNew.save((err, userSaved) => {
                // Crear token
                var token = jwt.sign({ user: userSaved }, SEED, { expiresIn: 14400 }); // 4 horas
                userSaved.password = ':)';


                res.status(200).json({
                    ok: true,
                    user: userSaved,
                    id: userSaved.id,
                    token: token
                });
            });
        }
    });


});




// ===================================================================
// Login normal
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