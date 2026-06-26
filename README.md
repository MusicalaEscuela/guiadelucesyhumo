# MusiStage - Guía Técnica Musicala

Aplicativo web interno para que docentes aprendan a usar luces DMX, consola de luces y máquina de humo de forma segura.

## Incluye

- Página de inicio con progreso local.
- Módulo de checklist previo y cierre.
- Tutorial de luces DMX.
- Tutorial de consola de luces.
- Tutorial de máquina de humo.
- Montajes rápidos: clase, ensayo, muestra, evento y emergencia.
- Simulador de cadena DMX.
- Quiz docente con aprobación básica.
- Constancia local de capacitación.
- Reporte local de fallas técnicas.
- Protocolos imprimibles.
- PWA instalable y compatible con GitHub Pages.

## Cómo usar

1. Descomprime el ZIP.
2. Abre `index.html` en el navegador.
3. Para publicarlo, sube la carpeta completa a GitHub Pages, Firebase Hosting, Netlify o cualquier hosting estático.

## Personalización sugerida

Cambiar o agregar:

- Fotos reales de la consola, luces y máquina de humo en la carpeta `assets/`.
- Textos de protocolos en `app.js`, sección `protocolos`.
- Preguntas del quiz en `app.js`, sección `quizQuestions`.
- Montajes rápidos en `app.js`, sección `montajeData`.
- Colores de marca en `styles.css`, variables `:root`.

## Próxima versión pro con Firebase

Para control real por docente se recomienda agregar:

- Firebase Authentication.
- Firestore para guardar progreso, quiz y reportes.
- Panel admin con usuarios habilitados.
- Subida de fotos/videos en reportes.
- Notificaciones a coordinación cuando haya falla alta.

## Nota

Esta app es una guía operativa básica. La programación avanzada, mantenimiento eléctrico o reparación de equipos debe hacerla una persona responsable del área técnica.
