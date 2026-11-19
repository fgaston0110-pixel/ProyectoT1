# Guía para estudiar el código y usar la ayuda (?)

## Archivos comentados

- `backend/app.js`: servidor Express, rutas HTTP, consultas Sequelize, operaciones y respuestas JSON.
- `backend/config.js`: variables de entorno y conexión a PostgreSQL.
- `backend/modelos/index.js`: importación de modelos y asociaciones entre tablas.

Los comentarios explican bloques y líneas clave sin alterar la lógica del programa. Se mantuvieron la configuración, nombres de rutas y consultas originales. En código real es más útil comentar *por qué* funciona cada bloque que repetir literalmente cada símbolo en todas las líneas.

## Circuito de una reserva

1. El paciente selecciona profesional y horario en el **frontend**.
2. JavaScript llama a la API mediante `fetch()`.
3. Express recibe la petición, por ejemplo `POST /turnos`, en **backend/app.js**.
4. Sequelize consulta o guarda en PostgreSQL mediante los modelos.
5. Express devuelve JSON y el frontend muestra el resultado.

## Servidores

- Frontend: Live Server (habitualmente puerto 5500).
- Backend: Express (puerto 3001).
- Base de datos: PostgreSQL (habitualmente puerto 5432).

## Ayuda visual

Aparece un botón azul **?** abajo a la derecha en 14 pantallas principales (login, registro, cuenta, menús, páginas de paciente y profesional). Al tocarlo se abre una guía específica; puede cerrarse con la **X**, clic afuera o tecla **Esc**. La ayuda no altera la base de datos.

## Instrucciones para probar

1. Mantener `backend/.env` propio, privado, con la conexión y JWT_SECRET.
2. En backend ejecutar `npm install` si hace falta y `node app.js`.
3. Abrir `frontend/html/inicio_sesion.html` con Live Server.
4. Probar el botón `?` en login, registro, reservas y horarios.
5. Confirmar funcionamiento normal de login, generación de turnos y asistencia.

## Atención

Esta entrega **parte de la versión ordenada sin las nuevas validaciones de registro**, tal como la solicitaste previamente. No agrega ni quita validaciones, rutas o modelos. Sigue siendo una versión para demostración y pruebas: antes de utilizar datos médicos reales deben revisarse permisos de acceso, contraseñas y protección de endpoints.
