var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;


// ===================================================================
// Verificar token - debe ir antes de las demás rutas --middleware
// ===================================================================
exports.tokenVerification = function(req, res, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                msg: 'Token incorrecto',
                errors: err
            });
        }

        // next();
        res.status(200).json({
            ok: true,
            decoded: decoded
        });
    });

}