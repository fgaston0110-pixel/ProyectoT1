// ================================================================
// SERVIDOR BACKEND: SISTEMA DE TURNOS MÉDICOS
// ================================================================
// Express expone rutas HTTP que consumen las páginas del frontend con fetch().
// Sequelize comunica el backend con PostgreSQL (base de datos «hospital»).
// El frontend (Live Server, habitualmente 5500) y el backend (3001) son
// servidores de desarrollo distintos que se comunican por HTTP.
//
// GLOSARIO PARA LA EXPOSICIÓN:
// req = datos enviados por el navegador; res = respuesta del servidor.
// req.body = datos JSON; req.params = partes variables de la URL.
// await = espera la operación asíncrona, como una consulta a PostgreSQL.
// findAll = SELECT; create = INSERT; update = UPDATE; destroy = DELETE.
// try/catch = maneja errores; res.json() = devuelve una respuesta en JSON.
// ================================================================

// Importa Express, la biblioteca que crea el servidor HTTP y sus rutas.
const express = require("express");
// Permite las peticiones entre el origen del frontend (5500) y el backend (3001).
const cors = require("cors");
// Op proporciona operadores para filtros avanzados de Sequelize.
const { Op } = require("sequelize");
// JWT permite emitir y verificar tokens para identificar al usuario.
const jwt = require("jsonwebtoken");
// Carga las variables de configuración definidas en backend/.env.
require("dotenv").config();
// Impide arrancar sin una clave suficientemente larga para firmar tokens.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("Falta JWT_SECRET (mínimo 32 caracteres) en .env");
}



// Importa los modelos centralizados en modelos/index.js.
const {
    sequelize,
    Rol,
    Persona,
    Usuario,
    Especialidad,
    Profesional,
    Horario,
    Sala,
    Paciente,
    Atencion,
    Turno,
} = require("./modelos");

// Crea la aplicación que escucha solicitudes de los navegadores.
const app = express();
// Constante heredada de algunas comprobaciones; la generación dinámica usa pasos de 5 minutos.
const DURACION_TURNO_MINUTOS = 30;

// Autoriza que un frontend servido en otro puerto consuma la API.
app.use(cors());
// Interpreta el cuerpo JSON de POST/PATCH y lo coloca en req.body.
app.use(express.json());


// ==================== ROLES ====================

// ---------------------------------------------------------------
// POST /rol
// Crea un rol y lo guarda en PostgreSQL (CREATE).
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.post("/rol", async (req, res) => {
    try {
        // Inserta un registro mediante Sequelize.
        const rol = await Rol.create(req.body);
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(201).json(rol);
    } catch (error) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });
    }
});

// ---------------------------------------------------------------
// GET /roles
// Consulta todos los roles (READ).
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.get("/roles", async (req, res) => {
    try {
        // Consulta una lista de registros en PostgreSQL.
        const roles = await Rol.findAll();
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.json(roles);
    } catch (error) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });
    }
});


// ==================== PERSONAS ====================

// ---------------------------------------------------------------
// POST /personas
// Recibe los datos personales y crea una persona.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.post("/personas", async (req, res) => {
    try {
        // Inserta un registro mediante Sequelize.
        const persona = await Persona.create(req.body);
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(201).json(persona);
    } catch (error) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });
    }
});

// ---------------------------------------------------------------
// GET /personas
// Consulta las personas guardadas.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.get("/personas", async (req, res) => {
    try {
        // Consulta una lista de registros en PostgreSQL.
        const personas = await Persona.findAll();
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.json(personas);
    } catch (error) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });
    }
});


// ==================== USUARIOS ====================

// ---------------------------------------------------------------
// POST /usuarios
// Crea la cuenta de usuario; si es paciente, crea además su ficha de Paciente.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.post("/usuarios", async (req, res) => {
    try {

        // Creamos el usuario
        // Inserta un registro mediante Sequelize.
        const usuario = await Usuario.create(req.body);

        // Si el rol es Paciente (id_rol = 2),
        // creamos automáticamente el paciente
        if (usuario.id_rol === 2) {

            await Paciente.create({
                id_persona: usuario.id_persona,
                historial: "Sin antecedentes relevantes",
                obra_social: "Sin obra social",
                condicion: "Estable",
                numero_turno: null
            });

        }

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(201).json(usuario);

    } catch (error) {

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });

    }
});

// ---------------------------------------------------------------
// GET /usuarios
// Obtiene cuentas con su Persona y Rol asociados.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.get("/usuarios", async (req, res) => {
    try {
        // Consulta una lista de registros en PostgreSQL.
        const usuarios = await Usuario.findAll({
            include: [Persona, Rol]
        });

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.json(usuarios);
    } catch (error) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });
    }
});

// ---------------------------------------------------------------
// GET /profesional/persona/:id_persona
// Localiza al profesional utilizando el identificador de Persona enviado en la URL.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.get("/profesional/persona/:id_persona",async (req, res) => {

        try {

            const profesional =
                await Profesional.findOne({
                    where: {
                        id_persona:
                        req.params.id_persona
                    }
                });

            if (!profesional) {

                // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
                return res.status(404).json({
                    mensaje:
                    "Profesional no encontrado"
                });

            }

            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            res.json(profesional);

        }
        catch (error) {

            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            res.status(500).json({
                mensaje: error.message
            });

        }

    }
);

// ---------------------------------------------------------------
// POST /especialidades
// Guarda una nueva especialidad médica.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.post("/especialidades", async (req, res) => {
    try {
        // Inserta un registro mediante Sequelize.
        const especialidad = await Especialidad.create(req.body);
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(201).json(especialidad);
    } catch (error) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });
    }
});

// ---------------------------------------------------------------
// GET /especialidades
// Lista las especialidades que aparecen en el formulario.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.get("/especialidades", async (req, res) => {
    try {
        // Consulta una lista de registros en PostgreSQL.
        const especialidades = await Especialidad.findAll();

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.json(especialidades);

    } catch (error) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });
    }
});

// ---------------------------------------------------------------
// POST /profesional
// Crea el registro profesional vinculado a una persona.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.post("/profesional", async (req, res) => {
    try {
        // Inserta un registro mediante Sequelize.
        const profesional = await Profesional.create(req.body);

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(201).json(profesional);

    } catch (error) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });
    }
});

// ---------------------------------------------------------------
// GET /profesional
// Lista profesionales, especialidades y datos personales.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.get("/profesional", async (req, res) => {
    try {
        // Consulta una lista de registros en PostgreSQL.
        const profesionales = await Profesional.findAll({
            include: [Especialidad, Persona]
        });

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.json(profesionales);

    } catch (error) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });
    }
});

// ---------------------------------------------------------------
// POST /horario
// Crea un horario validando los días y los posibles cruces.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.post("/horario", async (req, res) => {
    try {
        // Lee y prepara un dato enviado por el cliente para validarlo o consultarlo.
        const idProfesional = Number(req.body.id_profesional);
        const { dia, hora_inicio, hora_fin } = req.body;
        const diasValidos = [
            "Lunes",
            "Martes",
            "Miércoles",
            "Jueves",
            "Viernes",
            "Sábado",
            "Domingo"
        ];
        const formatoHoraValido = (hora) =>
            typeof hora === "string" &&
            /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(hora);

        if (
            !Number.isInteger(idProfesional) ||
            idProfesional <= 0 ||
            !diasValidos.includes(dia) ||
            !formatoHoraValido(hora_inicio) ||
            !formatoHoraValido(hora_fin)
        ) {
            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(400).json({
                mensaje: "Profesional, día y rango horario válidos son obligatorios"
            });
        }

        const minutosDesdeMedianoche = (hora) => {
            const [horas, minutos] = hora.split(":").map(Number);
            return horas * 60 + minutos;
        };
        const inicioNuevo = minutosDesdeMedianoche(hora_inicio);
        const finNuevo = minutosDesdeMedianoche(hora_fin);

        if (inicioNuevo >= finNuevo) {
            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(400).json({
                mensaje: "La hora de fin debe ser posterior a la hora de inicio"
            });
        }

        // Busca por la clave primaria.
        const profesional = await Profesional.findByPk(idProfesional);

        if (!profesional) {
            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(404).json({
                mensaje: "El profesional no existe"
            });
        }

        // Consulta una lista de registros en PostgreSQL.
        const horariosDelDia = await Horario.findAll({
            where: {
                id_profesional: idProfesional,
                dia,
                disponible: true
            }
        });
        const haySuperposicion = horariosDelDia.some((horario) => {
            const inicioExistente = minutosDesdeMedianoche(horario.hora_inicio);
            const finExistente = minutosDesdeMedianoche(horario.hora_fin);

            return inicioNuevo < finExistente && finNuevo > inicioExistente;
        });

        if (haySuperposicion) {
            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(409).json({
                mensaje: "Ese horario se superpone con otro horario del mismo día"
            });
        }

        // Inserta un registro mediante Sequelize.
        const horario = await Horario.create({
            id_profesional: idProfesional,
            dia,
            hora_inicio,
            hora_fin,
            disponible: true
        });

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(201).json(horario);

    } catch (error) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });
    }
});

// Genera bloques individuales de 30 minutos dentro de una jornada.
// No borra horarios anteriores ni turnos reservados.
// ---------------------------------------------------------------
// POST /horarios/generar
// Divide una jornada en la cantidad solicitada de turnos; intervalo mínimo: 5 minutos.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.post("/horarios/generar", async (req, res) => {
    // Lee y prepara un dato enviado por el cliente para validarlo o consultarlo.
    const idProfesional = Number(req.body.id_profesional);
    const { dia, hora_inicio, hora_fin } = req.body;
    // Lee y prepara un dato enviado por el cliente para validarlo o consultarlo.
    const cantidad = Number(req.body.cantidad_turnos);
    const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const formatoHora = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    const aMinutos = (hora) => {
        const [h, m] = hora.split(":").map(Number);
        return h * 60 + m;
    };
    const aHora = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    const PASO = 5;

    if (!Number.isInteger(idProfesional) || idProfesional <= 0 ||
        !dias.includes(dia) ||
        typeof hora_inicio !== "string" || !formatoHora.test(hora_inicio) ||
        typeof hora_fin !== "string" || !formatoHora.test(hora_fin) ||
        !Number.isInteger(cantidad) || cantidad < 1 || cantidad > 288) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        return res.status(400).json({ mensaje: "Ingresá un profesional, día, horario y cantidad válidos." });
    }
    const inicio = aMinutos(hora_inicio);
    const fin = aMinutos(hora_fin);
    const minutosJornada = fin - inicio;
    if (minutosJornada < PASO || inicio % PASO !== 0 || fin % PASO !== 0) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        return res.status(400).json({ mensaje: "La jornada debe ser posterior al inicio y usar múltiplos de 5 minutos." });
    }
    const totalBloques = minutosJornada / PASO;
    if (cantidad > totalBloques) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        return res.status(400).json({
            mensaje: `En esa jornada entran como máximo ${totalBloques} turnos de ${PASO} minutos.`
        });
    }

    // Duración estimada por consulta: se redondea hacia abajo a múltiplos de 5.
    // Los minutos restantes se reparten como pausas entre los turnos.
    const bloquesPorConsulta = Math.floor(totalBloques / cantidad);
    const duracionMinutos = bloquesPorConsulta * PASO;
    const bloquesLibres = totalBloques - bloquesPorConsulta * cantidad;
    const nuevos = Array.from({ length: cantidad }, (_, i) => {
        const pausaAcumulada = cantidad === 1 ? 0 :
            Math.round(i * bloquesLibres / (cantidad - 1));
        const desde = inicio + (i * bloquesPorConsulta + pausaAcumulada) * PASO;
        return {
            id_profesional: idProfesional,
            dia,
            hora_inicio: aHora(desde),
            hora_fin: aHora(desde + duracionMinutos),
            disponible: true
        };
    });

    try {
        // Transacción: agrupa operaciones para que se guarden todas o ninguna.
        const creados = await sequelize.transaction(async (transaction) => {
            await sequelize.query(
                "SELECT pg_advisory_xact_lock(CAST(:idProfesional AS BIGINT))",
                { replacements: { idProfesional }, transaction }
            );
            // Busca por la clave primaria.
            const profesional = await Profesional.findByPk(idProfesional, { transaction });
            if (!profesional) {
                const error = new Error("El profesional no existe.");
                error.status = 404;
                throw error;
            }
            // Consulta una lista de registros en PostgreSQL.
            const existentes = await Horario.findAll({
                where: { id_profesional: idProfesional, dia, disponible: true },
                transaction
            });
            const hayCruce = nuevos.some(nuevo => existentes.some(existente =>
                aMinutos(nuevo.hora_inicio) < aMinutos(existente.hora_fin) &&
                aMinutos(nuevo.hora_fin) > aMinutos(existente.hora_inicio)
            ));
            if (hayCruce) {
                const error = new Error("Ya hay horarios activos que se superponen ese día. No se guardó ninguno.");
                error.status = 409;
                throw error;
            }
            return Horario.bulkCreate(nuevos, { transaction });
        });
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(201).json({
            mensaje: `${creados.length} turnos generados de aproximadamente ${duracionMinutos} minutos cada uno.`,
            duracion_minutos: duracionMinutos,
            horarios: creados
        });
    } catch (error) {
        console.error("Error al generar horarios:", error);
        res.status(error.status || 500).json({
            mensaje: error.status ? error.message : "No se pudieron generar los horarios."
        });
    }
});


// ---------------------------------------------------------------
// GET /horario
// Consulta los horarios existentes.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.get("/horario", async (req, res) => {
    try {
        // Consulta una lista de registros en PostgreSQL.
        const horarios = await Horario.findAll({
            include: [Profesional]
        });

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.json(horarios);

    } catch (error) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });
    }
});

// ---------------------------------------------------------------
// GET /horario/profesional/:id_profesional
// Devuelve la agenda de un profesional.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.get("/horario/profesional/:id_profesional", async (req, res) => {
    try {
        const idProfesional = Number(req.params.id_profesional);

        if (!Number.isInteger(idProfesional) || idProfesional <= 0) {
            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(400).json({
                mensaje: "El identificador del profesional no es válido"
            });
        }

        // Consulta una lista de registros en PostgreSQL.
        const horarios = await Horario.findAll({
            where: {
                id_profesional: idProfesional,
                disponible: true
            },
            order: [
                ["dia", "ASC"],
                ["hora_inicio", "ASC"]
            ]
        });

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.json(horarios);
    } catch (error) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });
    }
});

// Retira un horario de la agenda sin perder el registro histórico.
// Si ya hay turnos vinculados, se impide retirarlo para no afectar reservas.
// ==========================================
// QUITAR HORARIO DEL PROFESIONAL
// ==========================================

// ---------------------------------------------------------------
// DELETE /horario/:id
// Retira un horario con verificaciones para no perjudicar reservas.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.delete("/horario/:id", async (req, res) => {

    const idHorario = Number(req.params.id);
    const idProfesional = Number(req.query.id_profesional);

    if (
        !Number.isInteger(idHorario) ||
        idHorario <= 0 ||
        !Number.isInteger(idProfesional) ||
        idProfesional <= 0
    ) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        return res.status(400).json({
            mensaje: "Horario y profesional válidos son obligatorios."
        });
    }

    try {

        await sequelize.transaction(async (transaction) => {

            // Bloquear modificaciones simultáneas
            await sequelize.query(
                "SELECT pg_advisory_xact_lock(CAST(:idProfesional AS BIGINT))",
                {
                    replacements: { idProfesional },
                    transaction
                }
            );

            // Buscar el horario
            // Busca por la clave primaria.
            const horario = await Horario.findByPk(idHorario, {
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (
                !horario ||
                Number(horario.id_profesional) !== idProfesional ||
                !horario.disponible
            ) {
                const error = new Error(
                    "No se encontró ese horario activo."
                );

                error.status = 404;
                throw error;
            }

            // Buscar reservas que todavía NO están finalizadas
            const reservasPendientes = await Turno.count({

                where: {

                    id_horario: idHorario,

                    estado: {
                        [Op.notIn]: [
                            "atendido",
                            "no_asistio"
                        ]
                    }

                },

                transaction

            });

            // Si existen reservas pendientes, no permitir quitarlo
            if (reservasPendientes > 0) {

                const error = new Error(
                    `Este horario tiene ${reservasPendientes} ` +
                    `turno(s) pendiente(s). ` +
                    "Primero debés resolver esas reservas."
                );

                error.status = 409;
                throw error;
            }

            // Desactivar el horario
            // Sin borrar el historial médico
            await horario.update(
                {
                    disponible: false
                },
                {
                    transaction
                }
            );

        });

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.json({
            mensaje:
                "Horario quitado correctamente. " +
                "Las atenciones anteriores se conservaron."
        });

    } catch (error) {

        console.error("Error al quitar horario:", error);

        res.status(error.status || 500).json({

            mensaje: error.status
                ? error.message
                : "No se pudo quitar el horario."

        });

    }

});

// ---------------------------------------------------------------
// GET /horario/:id
// Busca un horario por su clave primaria.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.get("/horario/:id", async (req, res) => {

    try {

        // Busca por la clave primaria.
        const horario = await Horario.findByPk(req.params.id);

        if (!horario) {

            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(404).json({
                mensaje: "Horario no encontrado"
            });

        }

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.json(horario);

    } catch (error) {

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });

    }

});

// ---------------------------------------------------------------
// POST /salas
// Registra una sala.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.post("/salas", async (req, res) => {
    try {
        // Inserta un registro mediante Sequelize.
        const sala = await Sala.create(req.body);

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(201).json(sala);

    } catch (error) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });
    }
});

// ---------------------------------------------------------------
// GET /salas
// Consulta todas las salas.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.get("/salas", async (req, res) => {
    try {
        // Consulta una lista de registros en PostgreSQL.
        const salas = await Sala.findAll({
            include: [Horario]
        });

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.json(salas);

    } catch (error) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });
    }
});

// ---------------------------------------------------------------
// POST /pacientes
// Registra un paciente.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.post("/pacientes", async (req, res) => {
    try {
        // Inserta un registro mediante Sequelize.
        const paciente = await Paciente.create(req.body);

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(201).json(paciente);

    } catch (error) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });
    }
});

// ---------------------------------------------------------------
// GET /pacientes
// Consulta los pacientes.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.get("/pacientes", async (req, res) => {
    try {
        // Consulta una lista de registros en PostgreSQL.
        const pacientes = await Paciente.findAll({
            include: [Persona]
        });

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.json(pacientes);

    } catch (error) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });
    }
});

// ---------------------------------------------------------------
// GET /pacientes/:id_persona
// Busca un paciente por su id_persona.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.get("/pacientes/:id_persona", async (req, res) => {

    try {

        // Busca un registro que cumpla la condición.
        const paciente = await Paciente.findOne({
            where: {
                id_persona: req.params.id_persona
            },
            include: [Persona]
        });

        if (!paciente) {

            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(404).json({
                mensaje: "Paciente no encontrado"
            });

        }

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.json(paciente);

    } catch (error) {

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });

    }

});

// ==========================================
// REGISTRAR ATENCIÓN MÉDICA
// ==========================================

// ---------------------------------------------------------------
// POST /atenciones
// Guarda la consulta médica y la relaciona con su turno.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.post("/atenciones", async (req, res) => {

    try {

        const {
            id_turno,
            motivo_consulta,
            diagnostico,
            observacion,
            indicaciones
        } = req.body;

        const idTurno = Number(id_turno);

        // Validar identificador
        if (!Number.isInteger(idTurno) || idTurno <= 0) {

            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(400).json({
                mensaje: "El turno no es válido"
            });

        }

        // Buscar turno con su horario
        // Busca por la clave primaria.
        const turno = await Turno.findByPk(idTurno, {
            include: [Horario]
        });

        if (!turno || !turno.Horario) {

            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(404).json({
                mensaje: "Turno no encontrado"
            });

        }

        // Solo registrar consultas iniciadas o finalizadas
        if (
            turno.estado !== "en_consulta" &&
            turno.estado !== "atendido"
        ) {

            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(400).json({
                mensaje: "Primero debe iniciarse la consulta"
            });

        }

        // Evitar atenciones duplicadas
        // Busca un registro que cumpla la condición.
        const existente = await Atencion.findOne({
            where: {
                id_turno: idTurno
            }
        });

        if (existente) {

            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(409).json({
                mensaje: "Este turno ya tiene una atención registrada"
            });

        }

        // Validar campos obligatorios
        if (
            typeof motivo_consulta !== "string" ||
            !motivo_consulta.trim() ||
            typeof diagnostico !== "string" ||
            !diagnostico.trim()
        ) {

            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(400).json({
                mensaje: "Completá el motivo de consulta y el diagnóstico"
            });

        }

        // Crear atención médica
        // Inserta un registro mediante Sequelize.
        const atencion = await Atencion.create({

            id_turno: idTurno,

            id_paciente: turno.id_paciente,

            id_profesional: turno.Horario.id_profesional,

            motivo_consulta: motivo_consulta.trim(),

            diagnostico: diagnostico.trim(),

            observacion:
                typeof observacion === "string"
                    ? observacion.trim()
                    : "",

            indicaciones:
                typeof indicaciones === "string"
                    ? indicaciones.trim()
                    : "",

            fecha_atencion: new Date()

        });

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(201).json({

            mensaje: "Atención médica registrada correctamente",

            atencion: atencion

        });

    } catch (error) {

        console.error("Error al registrar atención:", error);

        if (
            error.name === "SequelizeUniqueConstraintError"
        ) {

            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(409).json({
                mensaje: "Este turno ya tiene una atención registrada"
            });

        }

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: "No se pudo registrar la atención médica"
        });

    }

});

// ==========================================
// HISTORIAL DE ATENCIONES DE UN PACIENTE
// ==========================================

// ---------------------------------------------------------------
// GET /atenciones/paciente/:id_paciente
// Consulta el historial de un paciente con las condiciones establecidas en la ruta.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.get("/atenciones/paciente/:id_paciente", async (req, res) => {

    try {

        const idPaciente = Number(req.params.id_paciente);
        const idProfesional = Number(req.query.id_profesional);

        // Validar identificadores
        if (
            !Number.isInteger(idPaciente) ||
            idPaciente <= 0 ||
            !Number.isInteger(idProfesional) ||
            idProfesional <= 0
        ) {

            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(400).json({
                mensaje: "Identificadores no válidos"
            });

        }

        // Buscar atenciones del paciente con este profesional
        // Consulta una lista de registros en PostgreSQL.
        const atenciones = await Atencion.findAll({

            where: {
                id_paciente: idPaciente,
                id_profesional: idProfesional
            },

            order: [
                ["fecha_atencion", "DESC"]
            ]

        });

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.json(atenciones);

    } catch (error) {

        console.error("Error al consultar historial:", error);

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: "No se pudo consultar el historial médico"
        });

    }

});




// ---------------------------------------------------------------
// GET /atenciones
// Consulta todas las atenciones.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.get("/atenciones", async (req, res) => {
    try {
        // Consulta una lista de registros en PostgreSQL.
        const atenciones = await Atencion.findAll({
            include: [Paciente, Profesional]
        });

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.json(atenciones);

    } catch (error) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });
    }
});

// ---------------------------------------------------------------
// POST /turnos
// Reserva un turno en un horario habilitado.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.post("/turnos", async (req, res) => {
    try {
        // Lee y prepara un dato enviado por el cliente para validarlo o consultarlo.
        const idPaciente = Number(req.body.id_paciente);
        // Lee y prepara un dato enviado por el cliente para validarlo o consultarlo.
        const idHorario = Number(req.body.id_horario);
        const fecha = new Date(req.body.fecha_turno);
        if (!Number.isInteger(idPaciente) || idPaciente <= 0 ||
            !Number.isInteger(idHorario) || idHorario <= 0 ||
            !req.body.fecha_turno || Number.isNaN(fecha.getTime())) {
            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(400).json({ mensaje: "Paciente, horario y fecha válidos son obligatorios." });
        }
        if (fecha <= new Date() || fecha.getSeconds() !== 0 || fecha.getMilliseconds() !== 0) {
            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(400).json({ mensaje: "Seleccioná un turno futuro válido." });
        }
        const [horario, paciente] = await Promise.all([
            Horario.findByPk(idHorario), Paciente.findByPk(idPaciente)
        ]);
        if (!horario || !horario.disponible) {
            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(404).json({ mensaje: "El horario no existe o fue desactivado." });
        }
        if (!paciente) {
            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(404).json({ mensaje: "El paciente no existe." });
        }
        const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        if (dias[fecha.getDay()] !== horario.dia) {
            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(400).json({ mensaje: `El horario corresponde al día ${horario.dia}.` });
        }
        const aMinutos = (hora) => {
            const [h, m] = hora.split(":").map(Number);
            return h * 60 + m;
        };
        const inicioBloque = aMinutos(horario.hora_inicio);
        const finBloque = aMinutos(horario.hora_fin);
        const minutosFecha = fecha.getHours() * 60 + fecha.getMinutes();
        // Impide que el paciente invente una hora dentro del bloque.
        if (minutosFecha !== inicioBloque || finBloque <= inicioBloque) {
            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(400).json({ mensaje: "Elegí uno de los horarios definidos por el profesional." });
        }
        const finNuevo = new Date(fecha.getTime() + (finBloque - inicioBloque) * 60000);
        const comienzoDia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
        const finDia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 1);

        // Transacción: agrupa operaciones para que se guarden todas o ninguna.
        const turno = await sequelize.transaction(async transaction => {
            await sequelize.query(
                "SELECT pg_advisory_xact_lock(CAST(:idProfesional AS BIGINT))",
                { replacements: { idProfesional: horario.id_profesional }, transaction }
            );
            // Revisar de nuevo si fue desactivado mientras se esperaba el bloqueo.
            // Busca por la clave primaria.
            const horarioActual = await Horario.findByPk(idHorario, { transaction });
            if (!horarioActual || !horarioActual.disponible) {
                const err = new Error("Este horario ya no está disponible.");
                err.status = 409;
                throw err;
            }
            // Consulta una lista de registros en PostgreSQL.
            const reservas = await Turno.findAll({
                where: { fecha_turno: { [Op.gte]: comienzoDia, [Op.lt]: finDia } },
                include: [{
                    model: Horario,
                    required: true,
                    where: { id_profesional: horario.id_profesional }
                }],
                transaction
            });
            const conflicto = reservas.some(reserva => {
                const inicioExistente = new Date(reserva.fecha_turno).getTime();
                const minutosExistente = aMinutos(reserva.Horario.hora_fin) -
                    aMinutos(reserva.Horario.hora_inicio);
                const finExistente = inicioExistente + minutosExistente * 60000;
                return fecha.getTime() < finExistente && finNuevo.getTime() > inicioExistente;
            });
            if (conflicto) {
                const err = new Error("Ese turno ya está reservado. Elegí otro horario.");
                err.status = 409;
                throw err;
            }
            return Turno.create({
                id_paciente: idPaciente,
                id_horario: idHorario,
                fecha_turno: fecha
            }, { transaction });
        });
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(201).json(turno);
    } catch (error) {
        console.error("Error al reservar turno:", error);
        res.status(error.status || 500).json({
            mensaje: error.status ? error.message : "No se pudo registrar el turno."
        });
    }
});


// ---------------------------------------------------------------
// GET /turnos/paciente/:id_paciente
// Obtiene los turnos de un paciente.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.get("/turnos/paciente/:id_paciente", async (req, res) => {
    try {
        const idPaciente = Number(req.params.id_paciente);

        if (!Number.isInteger(idPaciente) || idPaciente <= 0) {
            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(400).json({
                mensaje: "El identificador del paciente no es válido"
            });
        }

        // Consulta una lista de registros en PostgreSQL.
        const turnos = await Turno.findAll({
            where: {
                id_paciente: idPaciente
            },
            include: [Horario],
            order: [["fecha_turno", "ASC"]]
        });

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.json(turnos);
    } catch (error) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });
    }
});

// ---------------------------------------------------------------
// GET /turnos/profesional/:id_profesional
// Obtiene los turnos del profesional.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.get("/turnos/profesional/:id_profesional", async (req, res) => {
    try {
        const idProfesional = Number(req.params.id_profesional);

        if (!Number.isInteger(idProfesional) || idProfesional <= 0) {
            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(400).json({
                mensaje: "El identificador del profesional no es válido"
            });
        }

        // Consulta una lista de registros en PostgreSQL.
        const turnos = await Turno.findAll({
            include: [
                {
                    model: Horario,
                    where: {
                        id_profesional: idProfesional
                    }
                },
                {
                    model: Paciente,
                    include: [Persona]
                }
            ],
            order: [["fecha_turno", "ASC"]]
        });

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.json(turnos);
    } catch (error) {
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });
    }
});

// ==================== CONTROL DE ASISTENCIA ====================

// ---------------------------------------------------------------
// PATCH /turnos/:id/estado
// Actualiza el estado de asistencia o evolución del turno (UPDATE).
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.patch("/turnos/:id/estado", async (req, res) => {

    try {

        const idTurno = Number(req.params.id);
        // Lee y prepara un dato enviado por el cliente para validarlo o consultarlo.
        const idProfesional = Number(req.body.id_profesional);
        // Lee y prepara un dato enviado por el cliente para validarlo o consultarlo.
        const nuevoEstado = req.body.estado;

        // Verificar identificadores
        if (
            !Number.isInteger(idTurno) ||
            idTurno <= 0 ||
            !Number.isInteger(idProfesional) ||
            idProfesional <= 0
        ) {
            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(400).json({
                mensaje: "Identificadores no válidos"
            });
        }

        // Estados permitidos
        const estadosPermitidos = [
            "reservado",
            "en_espera",
            "en_consulta",
            "atendido",
            "no_asistio"
        ];

        if (!estadosPermitidos.includes(nuevoEstado)) {
            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(400).json({
                mensaje: "Estado no válido"
            });
        }

        // Buscar el turno con su horario
        // Busca por la clave primaria.
        const turno = await Turno.findByPk(idTurno, {
            include: [Horario]
        });

        if (!turno) {
            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(404).json({
                mensaje: "Turno no encontrado"
            });
        }

        // Comprobar que el horario corresponde al profesional
        if (
            !turno.Horario ||
            Number(turno.Horario.id_profesional) !== idProfesional
        ) {
            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(403).json({
                mensaje: "El turno no pertenece a ese profesional"
            });
        }

        // Validar los cambios de estado
        const transiciones = {
            reservado: ["en_espera", "no_asistio"],
            en_espera: ["en_consulta", "no_asistio"],
            en_consulta: ["atendido"],
            atendido: [],
            no_asistio: []
        };

        if (!transiciones[turno.estado].includes(nuevoEstado)) {
            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(400).json({
                mensaje: "No se puede realizar ese cambio de estado"
            });
        }

        // Guardar hora real de inicio
        if (nuevoEstado === "en_consulta") {
            turno.inicio_atencion = new Date();
        }

        // Guardar hora real de finalización
        if (nuevoEstado === "atendido") {
            turno.fin_atencion = new Date();
        }

        // Actualizar estado
        turno.estado = nuevoEstado;

        await turno.save();

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.json({
            mensaje: "Estado actualizado correctamente",
            turno: turno
        });

    } catch (error) {

        console.error("Error al actualizar estado:", error);

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: "No se pudo actualizar el estado"
        });

    }

});


// ---------------------------------------------------------------
// GET /turnos
// Consulta todos los turnos.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.get("/turnos", async (req, res) => {
    try {

        // Consulta una lista de registros en PostgreSQL.
        const turnos = await Turno.findAll({
            include: [Paciente, Horario]
        });

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.json(turnos);

    } catch (error) {

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });

    }
});

// ---------------------------------------------------------------
// DELETE /turnos/:id
// Realiza la cancelación o eliminación según la lógica de la ruta.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.delete("/turnos/:id", async (req, res) => {

    try {
        const idPaciente = Number(req.query.id_paciente);

        if (!Number.isInteger(idPaciente) || idPaciente <= 0) {
            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(400).json({
                mensaje: "Se necesita un identificador de paciente válido"
            });
        }

        // Busca por la clave primaria.
        const turno = await Turno.findByPk(req.params.id);

        if (!turno) {

            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(404).json({
                mensaje: "Turno no encontrado"
            });
        }

        if (turno.id_paciente !== idPaciente) {
            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(403).json({
                mensaje: "No puedes cancelar un turno de otro paciente"
            });
        }

        await turno.destroy();

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.json({
            mensaje: "Turno cancelado correctamente"
        });

    } catch (error) {

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: error.message
        });

    }

});

// ==================== LOGIN CON JWT ====================

// ---------------------------------------------------------------
// POST /login
// Verifica credenciales y devuelve información de sesión y JWT.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.post("/login", async (req, res) => {
    try {

        const { nombre, contraseña } = req.body;

        // Buscar usuario en PostgreSQL
        // Busca un registro que cumpla la condición.
        const usuario = await Usuario.findOne({
            where: {
                nombre: nombre,
                contraseña: contraseña
            },
            include: [Persona, Rol]
        });

        if (!usuario) {
            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(401).json({
                mensaje: "Usuario o contraseña incorrectos"
            });
        }

        // Buscar si el usuario es paciente
        // Busca un registro que cumpla la condición.
        const paciente = await Paciente.findOne({
            where: {
                id_persona: usuario.id_persona
            }
        });

        // Generar token de autenticación
        // Firma un token JWT para identificar al usuario en futuras solicitudes.
        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                id_persona: usuario.id_persona
            },
            process.env.JWT_SECRET,
            {
                algorithm: "HS256",
                expiresIn: "2h"
            }
        );

        // Enviar respuesta al frontend
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.json({
            mensaje: "Login correcto",

            usuario: usuario.nombre,

            rol: usuario.Rol.tipo_rol,

            persona: usuario.Persona,

            id_paciente: paciente
                ? paciente.id_paciente
                : null,

            token: token
        });

    } catch (error) {

        console.error("Error al iniciar sesión:", error);

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: "Error al iniciar sesión"
        });

    }
});

// | INICIAR SERVIDOR ====================

// ==========================================
// VERIFICAR AUTENTICACIÓN DEL PACIENTE
// ==========================================

// MIDDLEWARE: valida el token JWT antes de mostrar datos del paciente.
// Si falla, responde con un error; si es válido, llama a next().
async function verificarPaciente(req, res, next) {

    try {

        // Obtener token enviado desde el frontend
        const autorizacion = req.headers.authorization || "";

        const [tipo, token] = autorizacion.split(" ");

        if (tipo !== "Bearer" || !token) {

            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(401).json({
                mensaje: "Debés iniciar sesión para consultar tus atenciones."
            });

        }

        // Comprobar que el token sea válido
        let datosToken;

        try {

            datosToken = jwt.verify(
                token,
                process.env.JWT_SECRET,
                {
                    algorithms: ["HS256"]
                }
            );

        } catch (error) {

            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(401).json({
                mensaje: "Tu sesión venció o no es válida. Iniciá sesión nuevamente."
            });

        }

        // Buscar el usuario en PostgreSQL
        // Busca por la clave primaria.
        const usuario = await Usuario.findByPk(
            datosToken.id_usuario,
            {
                include: [Rol]
            }
        );

        if (!usuario) {

            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(404).json({
                mensaje: "Usuario no encontrado."
            });

        }

        // Verificar que el token corresponda a ese usuario
        if (
            Number(usuario.id_persona) !==
            Number(datosToken.id_persona)
        ) {

            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(403).json({
                mensaje: "No tenés autorización para acceder."
            });

        }

        // Comprobar el rol
        const nombreRol = String(
            usuario.Rol?.tipo_rol || ""
        ).trim().toLowerCase();

        if (
            nombreRol !== "paciente" &&
            nombreRol !== "alumno"
        ) {

            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(403).json({
                mensaje: "Esta sección es exclusiva para pacientes."
            });

        }

        // Buscar al paciente vinculado con el usuario
        // Busca un registro que cumpla la condición.
        const paciente = await Paciente.findOne({
            where: {
                id_persona: usuario.id_persona
            }
        });

        if (!paciente) {

            // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
            return res.status(404).json({
                mensaje: "No se encontró el paciente asociado a esta cuenta."
            });

        }

        // Guardar paciente autenticado en la petición
        req.pacienteAutenticado = paciente;

        next();

    } catch (error) {

        console.error("Error de autenticación:", error);

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: "No se pudo comprobar la autenticación."
        });

    }

}


// ==========================================
// MIS ATENCIONES DEL PACIENTE
// ==========================================

// ---------------------------------------------------------------
// GET /mis-atenciones
// Devuelve el historial del paciente autenticado mediante su token JWT.
// El navegador puede llamar este endpoint con fetch(); Express recibe req y res.
// ---------------------------------------------------------------
app.get("/mis-atenciones", verificarPaciente, async (req, res) => {

    try {

        // Obtenemos el ID desde la autenticación,
        // NO desde localStorage ni de la URL.

        const idPaciente = req.pacienteAutenticado.id_paciente;

        // Buscar todas las atenciones del paciente
        // Consulta una lista de registros en PostgreSQL.
        const atenciones = await Atencion.findAll({

            where: {
                id_paciente: idPaciente
            },

            attributes: [
                "id_atencion",
                "fecha_atencion",
                "motivo_consulta",
                "diagnostico",
                "observacion",
                "indicaciones"
            ],

            include: [
                {
                    model: Profesional,

                    attributes: [
                        "id_profesional"
                    ],

                    include: [
                        {
                            model: Persona,

                            attributes: [
                                "nombre",
                                "apellido"
                            ]
                        },

                        {
                            model: Especialidad,

                            attributes: [
                                "nombre"
                            ]
                        }
                    ]
                }
            ],

            order: [
                ["fecha_atencion", "DESC"]
            ]

        });

        // Enviar historial al paciente
        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.json(atenciones);

    } catch (error) {

        console.error("Error al consultar mis atenciones:", error);

        // Devuelve al frontend una respuesta JSON con el resultado de esta operación.
        res.status(500).json({
            mensaje: "No se pudieron consultar las atenciones médicas."
        });

    }

});

// Sincroniza las tablas definidas por los modelos ANTES de iniciar Express.
// ATENCIÓN: alter:true puede cambiar la estructura de la BD; se usa aquí en desarrollo.
sequelize.sync({ alter: true })
    .then(() => {

        console.log("Base sincronizada");

        // Abre el servidor HTTP en el puerto 3001 cuando la BD está lista.
        app.listen(3001, () => {
            console.log("Servidor en puerto 3001");
        });

    })
    .catch(error => {
        console.log(error);
    });