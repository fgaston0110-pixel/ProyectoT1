# 🏥 Sistema de Turnos Médicos

## Guía breve para la exposición (4 integrantes)

**Objetivo:** explicar las partes más importantes del proyecto y demostrar su funcionamiento, sin leer todo el código.  
**Duración sugerida:** 10–12 minutos.  
**Contexto:** sistema web pensado para facilitar la organización de turnos médicos en Aguaray.

---

## 👤 Integrante 1 — Presentación del proyecto

**Qué decir:**

> Buenos días. Nuestro proyecto es un **Sistema de Turnos Médicos**, una aplicación web pensada para facilitar la gestión de consultas en una localidad como Aguaray. Buscamos que los pacientes puedan ver la disponibilidad sin acercarse personalmente solo para preguntar por turnos.
>
> Tenemos dos roles principales: **paciente** y **profesional**. El paciente puede registrarse, iniciar sesión, reservar y cancelar turnos, y consultar sus atenciones anteriores. El profesional puede definir días y horarios, gestionar los turnos y registrar las consultas médicas.
>
> Utilizamos **HTML, CSS y JavaScript** en el frontend; **Node.js y Express** en el backend; y **PostgreSQL** para guardar los datos. También usamos **Sequelize** y **Git/GitHub**.

**Mostrar:** página de inicio de sesión y menú principal.

---

## 👤 Integrante 2 — Frontend y recorrido del paciente

**Qué decir:**

> El **frontend** es la parte visual que utiliza el usuario desde el navegador. HTML estructura las páginas, CSS les da estilo y JavaScript permite la interacción.
>
> Para registrarse, una persona completa sus datos y luego crea una cuenta. Después de iniciar sesión como paciente, puede elegir la **especialidad** y el **profesional**. El sistema muestra automáticamente las **fechas y horas disponibles** que configuró ese profesional; el paciente no necesita escribir una fecha manualmente.
>
> Para comunicarse con el backend utilizamos `fetch()`, que envía solicitudes HTTP y recibe respuestas en formato JSON.

**Mostrar:** selección de especialidad, profesional, fecha disponible y reserva de un turno.

---

## 👤 Integrante 3 — Backend, servidores y rutas

**Qué decir:**

> El **backend** recibe y procesa las solicitudes. Lo desarrollamos con **Node.js y Express**. En `backend/app.js` se configura el servidor y se definen las rutas.
>
> Usamos **dos servidores de desarrollo**: **Live Server** para el frontend (habitualmente puerto `5500`) y **Express** para el backend (puerto `3001`). Son independientes y se comunican por HTTP. El backend, a su vez, accede a PostgreSQL mediante Sequelize.
>
> Las **rutas** son las direcciones que reciben operaciones del sistema. Por ejemplo, `POST /personas` registra datos personales, `POST /usuarios` crea una cuenta, `POST /login` inicia sesión, `GET /profesional` consulta profesionales y `POST /turnos` registra una reserva.
>
> Esto se relaciona con **CRUD**: crear (**Create**), consultar (**Read**), actualizar (**Update**) y eliminar (**Delete**) información.

**Mostrar:** `backend/app.js`, `backend/config.js` y, si hay datos ficticios, una ruta GET de ejemplo.

**Esquema de comunicación:**

```text
Navegador
   ↓
Frontend (Live Server, puerto 5500)
   ↓ fetch() / HTTP
Backend (Node.js + Express, puerto 3001)
   ↓ Sequelize (ORM)
PostgreSQL (base de datos hospital)
```

---

## 👤 Integrante 4 — Base de datos, ORM y demostración

**Qué decir:**

> Utilizamos **PostgreSQL**, una base de datos relacional llamada `hospital`. Tenemos tablas como **Persona, Usuario, Rol, Paciente, Profesional, Especialidad, Horario, Turno, Atención** y **Sala**.
>
> **Persona** almacena datos personales; **Usuario**, la cuenta; **Rol**, los permisos; **Profesional** y **Paciente**, los datos de cada tipo de usuario; **Horario**, la disponibilidad; **Turno**, las reservas; y **Atención**, la información de las consultas.
>
> Las tablas se relacionan mediante **claves primarias (PK)**, que identifican registros de forma única, y **claves foráneas (FK)**, que conectan tablas.
>
> **Sequelize** es el **ORM** que usamos. ORM significa *Mapeo Objeto-Relacional*: permite trabajar con tablas de PostgreSQL mediante modelos y métodos de JavaScript; por ejemplo, `Persona.findAll()` consulta las personas registradas.
>
> El proyecto se desarrolló con un enfoque **incremental e iterativo**: agregamos funcionalidades por etapas, las probamos y después las mejoramos.

**Mostrar:** tablas y relaciones en pgAdmin; luego hacer una demostración breve.

### Demostración sugerida

1. Iniciar sesión como **profesional** y mostrar cómo configura su jornada y cantidad de turnos.
2. Iniciar sesión como **paciente**, elegir un profesional y reservar una fecha y hora disponible.
3. Volver al **profesional**, mostrar el turno y registrar una atención de prueba.
4. Mostrar que la atención queda registrada en el historial correspondiente.

**Cierre:**

> Nuestro sistema busca facilitar la organización de turnos médicos, reducir consultas presenciales innecesarias y ofrecer una herramienta sencilla tanto para pacientes como para profesionales. Muchas gracias.

---

## ❓ Preguntas técnicas que pueden hacerle a cualquiera

| Pregunta | Respuesta breve |
|---|---|
| ¿Qué es Node.js? | Un entorno que ejecuta JavaScript fuera del navegador. |
| ¿Qué es Express? | Un framework de Node.js para crear rutas y servidores HTTP. |
| ¿Dónde está la conexión a PostgreSQL? | En `backend/config.js`. |
| ¿Qué hace `app.js`? | Configura el servidor y procesa las rutas del backend. |
| ¿Qué hace `modelos/index.js`? | Carga los modelos y define sus relaciones. |
| ¿Qué es Sequelize? | El ORM utilizado para trabajar con PostgreSQL desde JavaScript. |
| ¿Qué significa ORM? | Mapeo Objeto-Relacional. |
| ¿Qué es `fetch()`? | Una función de JavaScript para realizar solicitudes HTTP. |
| ¿Qué es JSON? | Un formato para intercambiar datos entre frontend y backend. |
| ¿Qué son PK y FK? | Clave primaria y clave foránea. |
| ¿Por qué hay dos servidores? | Para separar la interfaz de la lógica y los datos. |
| ¿Qué es CRUD? | Crear, consultar, actualizar y eliminar. |
| ¿Para qué sirve GitHub? | Para compartir código y gestionar versiones mediante Git. |
| ¿Qué enfoque usaron? | Desarrollo incremental e iterativo. |

---

## ✅ Antes de la exposición

- Iniciar **PostgreSQL**, el **backend** (`node app.js` en `backend/`) y el **frontend** (Live Server).
- Tener preparados **un paciente y un profesional ficticios**, con horarios y turnos de prueba.
- Comprobar que los cuatro integrantes sepan dónde están `app.js`, `config.js` y `modelos/index.js`.
- Usar **datos ficticios**, especialmente al mostrar atenciones e historiales médicos.
- Hablar con palabras propias y mostrar cada parte mientras se explica.

> **Nota:** los puertos indicados son los utilizados habitualmente en el entorno de desarrollo; pueden variar según la configuración de cada computadora.
