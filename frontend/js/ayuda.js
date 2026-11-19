// AYUDA CONTEXTUAL DEL SISTEMA DE TURNOS MÉDICOS
// Se ejecuta en el navegador y solo agrega una ventana informativa.
// No envía información al servidor ni cambia reservas o usuarios.
(function () {
    'use strict';

    // Los textos se definen por página para que cada sección explique su función.
    const guias = {
    "html/inicio_sesion.html": {
        "titulo": "Cómo iniciar sesión",
        "introduccion": "Ingresá con la cuenta que creaste para acceder a las funciones correspondientes a tu rol.",
        "pasos": [
            "Escribí tu nombre de usuario.",
            "Ingresá tu contraseña.",
            "Presioná «Iniciar sesión».",
            "Si todavía no tenés cuenta, elegí «Registrarse como nuevo usuario»."
        ]
    },
    "html/registro.html": {
        "titulo": "Cómo registrar tus datos",
        "introduccion": "Primero completás la información personal y luego creás la cuenta.",
        "pasos": [
            "Completá DNI, nombre, apellido, teléfono y los demás datos solicitados.",
            "Revisá que los datos sean correctos.",
            "Presioná «Continuar» para pasar a la creación de cuenta."
        ]
    },
    "html/cuenta.html": {
        "titulo": "Cómo crear una cuenta",
        "introduccion": "Esta pantalla finaliza el registro de tu cuenta.",
        "pasos": [
            "Elegí Paciente o Profesional.",
            "Creá el usuario y la contraseña.",
            "Si sos profesional, completá tu matrícula y especialidad.",
            "Confirmá el registro y volvé al inicio de sesión."
        ]
    },
    "html/menu_paciente.html": {
        "titulo": "Menú del paciente",
        "introduccion": "Este menú permite moverte entre las secciones del turnero.",
        "pasos": [
            "Usá Inicio para volver al panel principal.",
            "Entrá a la sección de turnos para solicitar o revisar tus reservas.",
            "Podés cerrar tu sesión desde el botón inferior."
        ]
    },
    "html/menu_profesional.html": {
        "titulo": "Menú del profesional",
        "introduccion": "Elegí qué actividad necesitás realizar.",
        "pasos": [
            "Inicio muestra el panel del profesional.",
            "Turnos de pacientes permite consultar y gestionar la atención.",
            "Horarios permite habilitar turnos para los pacientes."
        ]
    },
    "paciente/principal3.html": {
        "titulo": "Inicio del paciente",
        "introduccion": "Desde el panel principal podés entrar a las herramientas de tu cuenta.",
        "pasos": [
            "Elegí la sección de turnos para consultar disponibilidad.",
            "Revisá tus reservas y atenciones previas desde sus opciones."
        ]
    },
    "paciente/sacar_turno.html": {
        "titulo": "Cómo elegir profesional",
        "introduccion": "Esta pantalla es el primer paso para pedir un turno.",
        "pasos": [
            "Elegí la especialidad médica.",
            "Seleccioná el profesional de esa especialidad.",
            "Continuá para ver los días y horarios habilitados."
        ]
    },
    "paciente/turnos.html": {
        "titulo": "Cómo reservar un turno",
        "introduccion": "No hace falta elegir la fecha manualmente: se muestran los próximos días habilitados por el profesional.",
        "pasos": [
            "Revisá las fechas disponibles para ese profesional.",
            "Elegí un horario libre.",
            "Leé el resumen y confirmá la reserva.",
            "Los horarios ocupados no están disponibles para reservar."
        ]
    },
    "paciente/mis_turnos.html": {
        "titulo": "Cómo ver tus turnos",
        "introduccion": "Aquí podés consultar tus reservas y sus estados.",
        "pasos": [
            "Consultá los turnos próximos y sus fechas.",
            "Si el sistema lo permite, cancelá una reserva que no puedas utilizar.",
            "Revisá las consultas pasadas en la sección correspondiente."
        ]
    },
    "paciente/mis_atenciones.html": {
        "titulo": "Historial de atenciones",
        "introduccion": "Aquí podés consultar atenciones médicas que ya fueron registradas en tu cuenta.",
        "pasos": [
            "Ingresá con tu usuario de paciente.",
            "Consultá las atenciones que figuran en el historial.",
            "Si no aparece ninguna, todavía puede no haber registros disponibles."
        ]
    },
    "paciente/mis_datos.html": {
        "titulo": "Mis datos",
        "introduccion": "Esta sección muestra la información relacionada con tu cuenta.",
        "pasos": [
            "Consultá tus datos personales.",
            "Si detectás un error, informalo al personal responsable del sistema."
        ]
    },
    "profesional/principal2.html": {
        "titulo": "Inicio del profesional",
        "introduccion": "Desde aquí accedés a las funciones de atención y administración de horarios.",
        "pasos": [
            "Abrí «Horarios» para preparar los turnos que ofrecerás.",
            "Abrí «Turnos de pacientes» para gestionar las consultas."
        ]
    },
    "profesional/horarios.html": {
        "titulo": "Cómo generar horarios",
        "introduccion": "El profesional decide los días y la cantidad de pacientes que quiere atender.",
        "pasos": [
            "Seleccioná el día de la semana.",
            "Indicá la hora de inicio y de fin de la jornada.",
            "Ingresá la cantidad de turnos.",
            "Revisá la duración aproximada y guardá los horarios.",
            "El cálculo usa un mínimo de cinco minutos por turno."
        ]
    },
    "profesional/asistencia.html": {
        "titulo": "Cómo atender pacientes",
        "introduccion": "En esta pantalla administrás los turnos reservados y sus estados.",
        "pasos": [
            "Consultá los turnos de tus pacientes.",
            "Marcá el estado correspondiente durante la atención.",
            "Registrá motivo, diagnóstico, observaciones e indicaciones cuando corresponda.",
            "Guardá la atención para que aparezca en el historial."
        ]
    }
};

    // La ruta relativa se informa desde data-ayuda-pagina en cada HTML.
    const pagina = document.currentScript?.dataset.ayudaPagina;
    const guia = guias[pagina];
    if (!guia) return;

    const alCargar = () => {
        // Crear botón flotante accesible para teclado y lectores de pantalla.
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'ayuda-boton';
        boton.textContent = '?';
        boton.title = 'Ayuda: cómo usar esta pantalla';
        boton.setAttribute('aria-label', 'Abrir ayuda de esta pantalla');
        boton.setAttribute('aria-haspopup', 'dialog');

        // Fondo que cubre la pantalla mientras la ayuda está abierta.
        const fondo = document.createElement('div');
        fondo.className = 'ayuda-fondo';
        fondo.hidden = true;

        // Ventana de ayuda, con texto seguro insertado mediante textContent.
        const panel = document.createElement('section');
        panel.className = 'ayuda-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.setAttribute('aria-label', guia.titulo);

        const cerrar = document.createElement('button');
        cerrar.type = 'button';
        cerrar.className = 'ayuda-cerrar';
        cerrar.textContent = '×';
        cerrar.setAttribute('aria-label', 'Cerrar ayuda');

        const titulo = document.createElement('h2');
        titulo.textContent = '❔ ' + guia.titulo;

        const intro = document.createElement('p');
        intro.textContent = guia.introduccion;

        const pasos = document.createElement('ol');
        for (const paso of guia.pasos) {
            const item = document.createElement('li');
            item.textContent = paso;
            pasos.appendChild(item);
        }

        panel.append(cerrar, titulo, intro, pasos);
        fondo.appendChild(panel);
        document.body.append(boton, fondo);

        // Abrir y cerrar sin modificar el contenido del formulario o la página.
        let focoAnterior = null;
        function ocultar() {
            fondo.hidden = true;
            document.removeEventListener('keydown', atajos);
            (focoAnterior || boton).focus();
        }
        function atajos(evento) {
            if (evento.key === 'Escape') ocultar();
            // Mantiene el teclado en la ventana mientras está abierta.
            if (evento.key === 'Tab') {
                evento.preventDefault();
                cerrar.focus();
            }
        }
        boton.addEventListener('click', () => {
            focoAnterior = document.activeElement;
            fondo.hidden = false;
            cerrar.focus();
            document.addEventListener('keydown', atajos);
        });
        cerrar.addEventListener('click', ocultar);
        fondo.addEventListener('click', (evento) => {
            if (evento.target === fondo) ocultar();
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', alCargar);
    } else {
        alCargar();
    }
})();
