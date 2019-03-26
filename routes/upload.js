// Requires
var express = require('express');
var fileUpload = require('express-fileupload');
var User = require('../models/user');
var Doctor = require('../models/doctor');
var Hospital = require('../models/hospital');
var fs = require('fs');
var app = express();

// default options
app.use(fileUpload());

// Rutas

app.put('/:type/:id', (req, res, next) => {

    var type = req.params.type;
    var id = req.params.id;

    // Tipos de colección
    var validCollections = ['users', 'hospitals', 'doctors'];
    if (validCollections.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            msg: 'Tipo de colección no válido',
            errors: { message: 'Debe selecionar una colección válida, las cuales son ' + validCollections.join(', ') }

        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            msg: 'Debe seleccionar una imagen',
            errors: { message: 'Debe seleccionar una imagen' }

        });
    }

    // Obtener nombre del archivo
    var fileSend = req.files.image;
    var splitName = fileSend.name.split('.');
    var fileExtension = splitName[splitName.length - 1];

    // Solo estas extensiones de archivos son permitidas
    var validExtrensions = ['png', 'jpg', 'gif', 'jpeg'];
    if (validExtrensions.indexOf(fileExtension) < 0) {
        return res.status(400).json({
            ok: false,
            msg: 'Extension no válida',
            errors: { message: 'Las extensiones válidas son ' + validExtrensions.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var fileName = `${ id }-${ new Date().getMilliseconds() }.${ fileExtension }`;

    //Mover al archivo del temporal a un path en especifico
    var path = `./uploads/${ type }/${ fileName}`;

    fileSend.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al mover y almacenar el archivo',
                errors: err
            });
        }

        uploadByType(type, id, fileName, res);

        // res.status(200).json({
        //     ok: true,
        //     msg: 'Archivo almacenado correctamente',
        //     fileExtension: fileExtension
        // });
    });



});

function uploadByType(type, id, fileName, res) {
    switch (type) {
        case 'users':
            User.findById(id, (err, userFound) => {

                if (!userFound) {
                    return res.status(400).json({
                        ok: true,
                        msg: 'El usuario no existe',
                        errors: { message: 'El usuario no existe' }
                    });
                }


                var oldPath = './uploads/users/' + userFound.img;
                // Si existe, elimina la imagen anterior
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
                userFound.img = fileName;
                userFound.save((err, userUpdated) => {

                    userUpdated.password = ':)';
                    return res.status(200).json({
                        ok: true,
                        msg: 'Imagen de usuario actualizada',
                        user: userUpdated
                    });

                });
            });
            break;
        case 'doctors':
            Doctor.findById(id, (err, doctorFound) => {

                if (!doctorFound) {
                    return res.status(400).json({
                        ok: true,
                        msg: 'El doctor no existe',
                        errors: { message: 'El doctor no existe' }
                    });
                }


                var oldPath = './uploads/doctors/' + doctorFound.img;
                // Si existe, elimina la imagen anterior
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
                doctorFound.img = fileName;
                doctorFound.save((err, doctorUpdated) => {

                    return res.status(200).json({
                        ok: true,
                        msg: 'Imagen del doctor actualizada',
                        user: doctorUpdated
                    });

                });
            });
            break;
        case 'hospitals':
            Hospital.findById(id, (err, hospitalFound) => {

                if (!hospitalFound) {
                    return res.status(400).json({
                        ok: true,
                        msg: 'El hospital no existe',
                        errors: { message: 'El hospital no existe' }
                    });
                }

                var oldPath = './uploads/hospitals/' + hospitalFound.img;
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
                hospitalFound.img = fileName;
                hospitalFound.save((err, hospitalUpdated) => {
                    return res.status(200).json({
                        ok: true,
                        msg: 'Imagen del hospital actualizada',
                        hospital: hospitalUpdated
                    });
                });
            });
            break;
        default:
            return res.status(400).json({
                ok: true,
                msg: 'No existe la colección',
                errors: { message: 'No existe la colección' }
            });
            break;
    }

}

module.exports = app;