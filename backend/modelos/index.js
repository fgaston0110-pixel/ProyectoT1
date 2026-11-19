// PUNTO CENTRAL DE LOS MODELOS DE SEQUELIZE
// Desde app.js se importa este archivo para acceder a todas las tablas.

// Sequelize es la clase del ORM; DataTypes define tipos como STRING, INTEGER y DATE.
const { Sequelize, DataTypes } = require('sequelize');

// Recupera la conexión a la base «hospital» creada en backend/config.js.
const sequelize = require('../config');

// Este objeto agrupará los modelos y la conexión para exportarlos juntos.
const db = {};

// Cada archivo de modelo recibe la conexión y los tipos de datos.
// Sequelize convierte estos modelos en operaciones sobre tablas relacionales.

db.Persona = require('./Persona')(sequelize, DataTypes); // Datos personales.
db.Rol = require('./Rol')(sequelize, DataTypes); // Tipos de usuario.
db.Usuario = require('./Usuario')(sequelize, DataTypes); // Credenciales y rol.
db.Paciente = require('./Paciente')(sequelize, DataTypes); // Información del paciente.
db.Profesional = require('./Profesional')(sequelize, DataTypes); // Datos profesionales.
db.Especialidad = require('./Especialidad')(sequelize, DataTypes); // Especialidades médicas.
db.Horario = require('./Horario')(sequelize, DataTypes); // Agenda del profesional.
db.Sala = require('./Sala')(sequelize, DataTypes); // Consultorios o salas.
db.Turno = require('./Turno')(sequelize, DataTypes); // Reservas de turnos.
db.Atencion = require('./Atencion')(sequelize, DataTypes); // Consultas médicas registradas.

// Recorre los modelos para definir sus relaciones (belongsTo, hasMany, etc.).
Object.keys(db).forEach((nombreModelo) => {
    // Algunos modelos declaran una función associate para crear relaciones.
    if (db[nombreModelo].associate) {
        // Envía todos los modelos para enlazar claves foráneas y asociaciones.
        db[nombreModelo].associate(db);
    }
});

// Permite ejecutar consultas, transacciones y sequelize.sync desde app.js.
db.sequelize = sequelize;

// Expone la clase Sequelize si algún archivo la necesita.
db.Sequelize = Sequelize;

// Hace que require('./modelos') devuelva todo el objeto db.
module.exports = db;
