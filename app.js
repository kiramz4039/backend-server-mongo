// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

// Boda Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


// Importar rutas
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var logingRoutes = require('./routes/login');


// Rutas
app.use('/', appRoutes);
app.use('/user', userRoutes);
app.use('/login', logingRoutes);


// Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b', 'online');
});




// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b', 'online');

});