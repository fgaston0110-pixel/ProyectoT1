// CONFIGURACIÓN DE LA BASE DE DATOS
// Este archivo se importa desde modelos/index.js para compartir una sola conexión.

// Lee las variables guardadas en backend/.env (no se deben subir contraseñas a GitHub).
require('dotenv').config();

// Sequelize es el ORM que traduce operaciones de JavaScript a consultas SQL.
const { Sequelize } = require('sequelize');

// Obtiene usuario, contraseña y host definidos en el archivo .env.
const { DB_USER, DB_PASSWORD, DB_HOST } = process.env;

// Construye la instancia que permite comunicarse con la base «hospital».
// Se conserva la forma de conexión original para no alterar el proyecto.
const sequelize = new Sequelize(
    `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/hospital`,
    {
        // Evita imprimir cada consulta SQL en la consola de Node.js.
        logging: false,

        // Usa el controlador habitual de PostgreSQL instalado con Sequelize.
        native: false,

        // Dirección de la instancia local de PostgreSQL.
        host: 'localhost',

        // Especifica que el motor de base de datos es PostgreSQL.
        dialect: 'postgres'
    }
);

// Otros archivos usan require('./config') para obtener esta misma instancia.
module.exports = sequelize; 
