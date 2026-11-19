# Limpieza del frontend (19/11/2026)

Se trabajó sobre `ProyectoT_nombres_actualizados.zip`.

## Archivos HTML eliminados

- `frontend/paciente/sacatturno.html`
- `frontend/admin/sueldo.html`
- `frontend/admin/abm.html`
- `frontend/admin/faltas.html`
- `frontend/admin/materias.html`
- `frontend/admin/asistencia.html`
- `frontend/admin/horarios.html`
- `frontend/profesional/materias.html`

En `frontend/profesional/principal2.html` se eliminó la tarjeta **Materias** y se ajustó el texto de bienvenida.

Se conservaron las páginas que sí participan de los flujos de pacientes y profesionales, `frontend/html/admin.html` y `frontend/admin/principal1.html`, además de todos los archivos del backend.

## Observación pendiente

`frontend/html/admin.html` apunta a `indiceadm.html`, que no estaba en el proyecto original. No se eliminó ni se modificó el módulo administrativo, porque el inicio de sesión permite un usuario Administrador. Si van a demostrar ese rol, será necesario completar su menú.

## Verificación

Se revisaron las referencias de rutas HTML locales y la sintaxis de scripts JavaScript. Las páginas que necesitan PostgreSQL deben probarse con el backend activo.
