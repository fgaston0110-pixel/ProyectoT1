# Sistema de Turnos Médicos 

## 1. ¿Qué problema buscamos resolver?

El sistema permite organizar la atención entre **pacientes y profesionales** desde una aplicación web. En lugar de consultar manualmente los turnos, el paciente puede ver los días y horarios habilitados por cada profesional y reservar uno de los disponibles.

**Funciones principales:**
- **Paciente:** registrarse, iniciar sesión, consultar profesionales y especialidades, reservar o cancelar turnos, ver sus turnos y consultar sus atenciones anteriores.
- **Profesional:** registrarse con su especialidad, configurar días y horarios, indicar cuántos turnos quiere ofrecer, gestionar el estado de los pacientes y registrar la atención médica.
- **Ayuda en pantalla:** botones con `?` que explican cómo utilizar las secciones del frontend.

## 2. Tecnologías utilizadas

| **HTML** | Estructura de las páginas y formularios. |
| **CSS** | Colores, distribución y apariencia. |
| **JavaScript** | Interacción, validaciones básicas y llamadas al backend con `fetch()`. |
| **Node.js** | Ejecución del código JavaScript del servidor. |
| **Express** | Creación del servidor HTTP y sus rutas. |
| **PostgreSQL** | Base de datos relacional llamada `hospital`. |
| **Sequelize** | ORM para definir modelos, relaciones y consultas a PostgreSQL. |
| **Git y GitHub** | Control de versiones y trabajo en equipo. |
| **VS Code y Live Server** | Edición del código y servidor de desarrollo del frontend. |

## 3. Estructura de carpetas

```text
ProyectoT1/
├── .gitignore                 # Excluye .env y node_modules de Git
├── README.md                  # Documentación principal del repositorio
│
├── backend/                   # Lógica del servidor y base de datos
│   ├── app.js                 # Servidor Express; rutas GET, POST, PATCH, DELETE
│   ├── config.js              # Conexión Sequelize ↔ PostgreSQL
│   ├── modelos/               # Definición de tablas y relaciones
│   │   ├── index.js           # Importa modelos y establece asociaciones
│   │   ├── Persona.js         # Datos personales
│   │   ├── Usuario.js         # Cuenta y credenciales
│   │   ├── Rol.js             # Tipos de usuario
│   │   ├── Paciente.js        # Identificación de pacientes
│   │   ├── Profesional.js     # Matrícula y especialidad
│   │   ├── Especialidad.js    # Especialidades médicas
│   │   ├── Horario            # Agenda / franjas de atención
│   │   ├── Turno.js           # Reservas y sus estados
│   │   ├── Atencion.js        # Datos de cada consulta médica
│   │   └── Sala.js            # Salas o consultorios
│   ├── .env                   # Variables de entorno 
│   ├── .env.example           # Ejemplo de configuración
│   ├── package.json          # Dependencias y comandos npm
│   └── package-lock.json     # Versiones concretas de dependencias
│
└── frontend/                  # Páginas que utiliza el usuario
    ├── html/                  # Inicio de sesión, registro, cuenta y menús
    │   ├── inicio_sesion.html # Acceso a la aplicación
    │   ├── registro.html      # Datos personales
    │   ├── cuenta.html        # Usuario, contraseña y tipo de cuenta
    │   ├── panel_paciente.html
    │   ├── panel_profesional.html
    │   ├── menu_paciente.html
    │   └── menu_profesional.html
    ├── paciente/              # Reserva, mis turnos, mis datos y atenciones
    │   ├── sacar_turno.html   # Selección del profesional
    │   ├── turnos.html        # Fechas y horarios disponibles
    │   ├── mis_turnos.html    # Turnos del paciente
    │   └── mis_atenciones.html# Historial de atenciones
    ├── profesional/           # Horarios y seguimiento de pacientes
    │   ├── horarios.html      # Generar turnos a partir de la jornada
    │   └── asistencia.html    # Estados y registro de atención
    ├── admin/                 # Pantallas administrativas conservadas
    ├── css/                   # Estilos
    ├── js/                    # JavaScript compartido
    └── img/                   # Imágenes del proyecto
```

## 4. Arquitectura: frontend, backend y base de datos

```text
                 PACIENTE / PROFESIONAL
                           │
                           ▼
              FRONTEND — Live Server
               HTML + CSS + JavaScript
                    Puerto 5500*
                           │
                      fetch() HTTP
                           │
                           ▼
                BACKEND — Express
                   Node.js / app.js
                     Puerto 3001
                           │
                   Sequelize (ORM)
                           │
                           ▼
                POSTGRESQL — hospital
                     Puerto 5432*
```

`*` Los puertos 5500 y 5432 son los habituales en nuestro entorno local; pueden variar según la configuración. **Son dos servidores web de desarrollo independientes** (Live Server para frontend y Express para backend), además del servidor de base de datos PostgreSQL.

**Explicación breve:** el navegador no consulta PostgreSQL directamente. Envía una petición a Express mediante `fetch()`; Express procesa la solicitud y utiliza Sequelize para leer o guardar información. Luego devuelve una respuesta, habitualmente en **JSON**.

## 5. Archivos clave del backend

### `backend/app.js` — Servidor y rutas

- Crea y configura la aplicación Express.
- Recibe solicitudes HTTP del frontend.
- Define rutas para registrar personas, consultar profesionales, generar horarios y administrar turnos.
- Utiliza los modelos de Sequelize y envía respuestas al navegador.
- Inicia el backend en el **puerto 3001**.

### `backend/config.js` — Conexión a PostgreSQL

- Carga las variables de entorno con `dotenv`.
- Crea la conexión con **Sequelize** a la base de datos `hospital`.
- Usa `DB_USER`, `DB_PASSWORD` y `DB_HOST` definidos en `.env`.
- Exporta la conexión para que la utilicen los modelos.

### `backend/modelos/index.js` — Modelos y relaciones

- Importa `Persona`, `Usuario`, `Paciente`, `Profesional`, `Turno`, etc.
- Configura las asociaciones declaradas en cada modelo.
- Exporta los modelos y la instancia de Sequelize para utilizarlos desde `app.js`.

**Ejemplos de relaciones:** `Usuario` pertenece a `Persona` y a `Rol`; `Turno` pertenece a `Paciente` y `Horario`; `Atencion` se relaciona con `Paciente`, `Profesional` y `Turno`.

## 6. Base de datos: qué guarda cada modelo

| Modelo | Contenido principal |
|---|---|
| `Persona` | Nombre, apellido, DNI, teléfono, correo y otros datos personales. |
| `Usuario` | Nombre de usuario, contraseña, persona asociada y rol. |
| `Rol` | Identifica el tipo de usuario (administrador, paciente o profesional). |
| `Paciente` | Relaciona una persona con el perfil de paciente. |
| `Profesional` | Matrícula, persona y especialidad médica. |
| `Especialidad` | Por ejemplo, Cardiología o Pediatría. |
| `Horario` | Día de atención, hora inicial y final del profesional. |
| `Turno` | Paciente, horario, fecha del turno y estado. |
| `Atencion` | Motivo de consulta, observación, diagnóstico e indicaciones. |


### ¿Qué es Sequelize y qué significa ORM?

**ORM** significa *Mapeo Objeto-Relacional*: relaciona objetos del programa con tablas de una base de datos. **Sequelize** es el ORM que usamos con JavaScript y PostgreSQL.

```javascript
// Lee las personas registradas mediante Sequelize:
const personas = await Persona.findAll();
```
Esto cumple una función comparable a consultar la tabla de personas mediante SQL. Sequelize **no reemplaza a PostgreSQL**: es la herramienta mediante la cual el backend se comunica con esa base.

## 7. Rutas HTTP y CRUD

**CRUD** son las operaciones básicas: **C**rear, **R**ecuperar/leer, **U**pdate/actualizar y **D**elete/eliminar.

| Método y ruta | Uso en el proyecto |
|---|---|
| `POST /personas` | Registrar los datos personales. |
| `GET /personas` | Consultar personas registradas. |
| `POST /usuarios` | Crear la cuenta del usuario. |
| `POST /login` | Iniciar sesión. |
| `GET /especialidades` | Consultar especialidades. |
| `GET /profesional` | Consultar profesionales. |
| `POST /horarios/generar` | Generar horarios según la jornada y cantidad deseada. |
| `GET /horario/profesional/:id_profesional` | Consultar horarios de un profesional. |
| `POST /turnos` | Reservar un turno. |
| `GET /turnos/paciente/:id_paciente` | Consultar turnos del paciente. |
| `PATCH /turnos/:id/estado` | Actualizar el estado del turno. |
| `DELETE /turnos/:id` | Eliminar/cancelar un turno, según la lógica del backend. |
| `POST /atenciones` | Registrar una atención médica. |
| `GET /mis-atenciones` | Consultar el historial propio usando autenticación. |

El servidor local se consulta habitualmente desde `http://localhost:3001`. La barra de direcciones permite probar rutas **GET**; para **POST, PATCH y DELETE** se utiliza la propia interfaz o una herramienta como Postman. Las rutas con datos personales o clínicos deben protegerse antes de un uso real.

## 8. Recorrido del paciente y del profesional

### Registro y acceso

1. La persona completa sus datos en `registro.html`.
2. Crea su cuenta en `cuenta.html` y selecciona su rol.
3. Inicia sesión desde `inicio_sesion.html`.
4. El backend comprueba las credenciales y el sistema abre el panel correspondiente.

### Reserva de turnos

1. El paciente elige especialidad y profesional.
2. El sistema muestra automáticamente los próximos días y horarios habilitados por el profesional.
3. El paciente selecciona un horario libre y confirma la reserva.
4. El turno queda registrado en PostgreSQL y aparece en **Mis turnos**.

### Gestión del profesional

1. Configura el día y la franja horaria de atención.
2. Indica cuántos turnos quiere ofrecer.
3. El sistema calcula una duración aproximada y distribuye horarios en intervalos de cinco minutos, con un mínimo técnico de cinco minutos por turno.
4. Gestiona los pacientes y registra la atención médica, con observaciones y diagnóstico cuando corresponda.

### Ayuda para el usuario

El frontend incluye un botón **`?`** que abre instrucciones breves sobre la sección actual. Su estilo está en `frontend/css/ayuda.css` y el comportamiento en `frontend/js/ayuda.js`.

## 9. Diagramas fáciles de explicar

### Diagrama de arquitectura

```text
Navegador → Live Server (frontend) → Express (backend)
                                         │
                                     Sequelize
                                         │
                                     PostgreSQL
```

### Relaciones principales (esquema simplificado)

```text
Persona ── Usuario ── Rol
   │
   ├── Paciente ── Turno ── Horario ── Profesional ── Especialidad
   │                  │                    │
   └──────────────────└──── Atención ──────┘
```

Este esquema sirve para explicar la idea general; el DER formal debe reflejar las cardinalidades y claves exactas de los modelos.

### Flujo de reserva

```text
Ingresar → Elegir profesional → Ver fechas y horarios
                                │
                         ¿Horario libre?
                           /         \
                         Sí           No
                         │            │
                      Reservar    Elegir otro
                         │
                    Guardar turno
                         │
                     Confirmación
```

## 10. Cómo se ejecuta el sistema en dos servidores

**Backend** (terminal dentro de `backend/`):

```bash
npm install
node app.js
```

**Frontend:** abrir `frontend/html/inicio_sesion.html` con **Live Server** desde VS Code. No abrir las páginas con `file:///`, porque el almacenamiento del navegador puede comportarse de otra manera.

**Prueba para mostrar la separación:** si se detiene Node.js, la página HTML puede seguir abriendo desde Live Server, pero las consultas a la API dejan de funcionar. Esto muestra que son servicios separados.

**Configuración local (`backend/.env`):**

```env
DB_USER=postgres
DB_PASSWORD=SU_CONTRASEÑA
DB_HOST=localhost
JWT_SECRET=CLAVE_ALEATORIA_DE_32_CARACTERES_O_MAS
```

El archivo `.env` es privado; en GitHub se debe publicar solo `.env.example` con valores de ejemplo. Los compañeros también necesitan una base `hospital`, las tablas creadas por el proyecto y datos iniciales como roles y especialidades.

## 11. Forma de trabajo y control de versiones

El proyecto se desarrolló con un enfoque **incremental e iterativo**: primero implementamos el registro y el acceso; después los turnos, la agenda, las atenciones y otras mejoras; finalmente corregimos errores y ordenamos el código. Git y GitHub permiten registrar cambios y compartirlos entre los cuatro integrantes.

No es necesario afirmar que se siguió Scrum o Kanban formalmente si no se utilizaron sus prácticas.

## 12. Demostración sugerida en clase

1. **Mostrar la estructura:** `backend`, `frontend` y `modelos`.
2. **Explicar los dos servidores:** Live Server y Express; mostrar `app.js` y `config.js`.
3. **Mostrar la base:** abrir pgAdmin, señalar tablas y relaciones; explicar Sequelize/ORM.
4. **Ingresar como profesional:** mostrar horarios ya cargados o generar algunos de prueba.
5. **Ingresar como paciente:** elegir profesional, ver días disponibles y reservar un turno.
6. **Volver al profesional:** mostrar el turno recibido y cómo se registra una atención médica.
7. **Mostrar el botón `?`:** explicar la ayuda incluida para usuarios.

**Consejo:** llevar un paciente, un profesional y turnos de prueba ya creados. Utilizar únicamente datos ficticios para la demostración.

## 13. Preguntas rápidas del profesor

| Pregunta | Respuesta breve |
|---|---|
| ¿Dónde se conecta la base de datos? | En `backend/config.js`, mediante Sequelize. |
| ¿Qué hace `app.js`? | Configura Express, recibe solicitudes y define rutas HTTP. |
| ¿Qué hace `modelos/index.js`? | Importa los modelos y conecta sus asociaciones. |
| ¿Por qué hay dos servidores? | Para separar interfaz y lógica: Live Server para frontend y Express para backend. |
| ¿Cómo se comunican? | Por HTTP usando `fetch()` y respuestas JSON. |
| ¿Qué es ORM? | Mapeo Objeto-Relacional. |
| ¿Qué es Sequelize? | El ORM que utilizamos para trabajar con PostgreSQL. |
| ¿Qué es CRUD? | Crear, leer, actualizar y eliminar registros. |
| ¿Para qué sirve una FK? | Para relacionar registros de distintas tablas. |
| ¿Para qué sirve `.env`? | Para guardar configuración local y secretos fuera del código publicado. |
| ¿Qué hace GitHub? | Permite compartir el código y llevar un historial de cambios. |

---

**Conclusión:** el sistema reúne una interfaz para pacientes y profesionales, un backend de Node.js/Express y una base relacional PostgreSQL conectada mediante Sequelize. Su propósito es hacer más sencilla la organización de los turnos y permitir que cada usuario acceda a las funciones que necesita.

> **Alcance:** es un proyecto académico. Antes de utilizar datos médicos reales deben revisarse la protección de las contraseñas, la autorización de las rutas y la privacidad de los historiales clínicos.
