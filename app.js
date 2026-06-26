const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const storage = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};

const state = {
  activeView: 'inicio',
  checklist: storage.get('musistage_checklist', {}),
  quizAnswers: storage.get('musistage_quiz', {}),
  certifications: storage.get('musistage_certifications', []),
  simSlots: storage.get('musistage_sim_slots', Array(7).fill(null)),
};

const views = {
  inicio: {
    title: 'MusiStage',
    render: renderInicio
  },
  antes: {
    title: 'Antes de usar',
    render: renderAntes
  },
  luces: {
    title: 'Luces DMX',
    render: renderLuces
  },
  consola: {
    title: 'Consola de luces',
    render: renderConsola
  },
  humo: {
    title: 'Máquina de humo',
    render: renderHumo
  },
  montajes: {
    title: 'Montajes rápidos',
    render: renderMontajes
  },
  simulador: {
    title: 'Simulador DMX',
    render: renderSimulador
  },
  quiz: {
    title: 'Quiz docente',
    render: renderQuiz
  },
  protocolos: {
    title: 'Protocolos',
    render: renderProtocolos
  }
};

const content = $('#content');
const pageTitle = $('#pageTitle');
const statusPill = $('#statusPill');

const checklistItems = {
  previo: [
    'Confirmé que el espacio está despejado y sin cables atravesando zonas de movimiento.',
    'Verifiqué que las luces estén firmes, estables y lejos de materiales inflamables.',
    'Revisé que la consola esté conectada, encendida y sin botón Blackout activo.',
    'Confirmé que las luces estén en modo DMX si se controlarán desde consola.',
    'Validé que la máquina de humo tenga líquido adecuado y autorización de uso.',
    'Revisé ventilación y posibles sensibilidades respiratorias del grupo.',
    'Tengo claro qué montaje voy a usar y no voy a improvisar como si esto fuera un reality de supervivencia técnica.'
  ],
  cierre: [
    'Apagué o dejé en cero los faders antes de apagar equipos.',
    'Desactivé escenas, secuencias, estrobo y humo.',
    'Apagué la máquina de humo y la dejé enfriar antes de moverla.',
    'Apagué consola y luces en el orden indicado por coordinación.',
    'Organicé cables sin doblarlos agresivamente ni hacer nudos dignos de marinero poseído.',
    'Guardé control remoto, extensiones y accesorios en su lugar.',
    'Reporté cualquier falla, sonido extraño, olor raro, golpe o comportamiento anormal.'
  ]
};

const quickModules = [
  { icon: '💡', title: 'Luces DMX', text: 'Aprende direcciones, modos, conexión en cadena y pruebas básicas.' , view: 'luces'},
  { icon: '🎛️', title: 'Consola', text: 'Identifica faders, blackout, escenas, master, speed y lo que no deberías tocar.' , view: 'consola'},
  { icon: '🌫️', title: 'Humo', text: 'Uso seguro, calentamiento, ráfagas cortas, ventilación y restricciones.' , view: 'humo'},
  { icon: '🧪', title: 'Quiz', text: 'Valida que el docente entendió lo básico antes de usar equipos.' , view: 'quiz'}
];

const montajeData = {
  clase: {
    label: 'Clase normal',
    badge: 'Uso básico',
    objetivo: 'Iluminación clara, segura y sin efectos distractores.',
    pasos: [
      ['Encender luces principales', 'Usar luz blanca o colores suaves. Prioridad: que los estudiantes vean y se muevan seguros. Qué aburrido, pero funcional.'],
      ['Evitar efectos fuertes', 'No usar estrobo, cambios bruscos ni humo en clase regular.'],
      ['Revisar cables', 'Nada de cables atravesados en zona de danza, teatro o circulación.'],
      ['Cerrar bien', 'Bajar faders, apagar equipos y dejar el espacio igual o mejor de como se recibió.']
    ]
  },
  ensayo: {
    label: 'Ensayo escénico',
    badge: 'Preparación',
    objetivo: 'Probar ambiente escénico sin modificar programación avanzada.',
    pasos: [
      ['Definir escena', 'Elegir una escena básica: cálida, fría, contraste o presentación.'],
      ['Probar entradas', 'Ensayar encendido, cambios y apagones con tiempo suficiente.'],
      ['Marcar límites', 'Si un cambio no está claro, no se toca. Reportar a coordinación.'],
      ['Registrar observaciones', 'Anotar qué escena funcionó, qué falló y qué se necesita para evento.']
    ]
  },
  muestra: {
    label: 'Muestra pequeña',
    badge: 'Evento interno',
    objetivo: 'Crear ambiente escénico sencillo y controlado.',
    pasos: [
      ['Checklist previo', 'Completar revisión de corriente, luces, consola, humo y seguridad.'],
      ['Activar escena base', 'Usar escena Musicala preconfigurada o color estático seguro.'],
      ['Operar cambios simples', 'Master, blackout controlado y cambios suaves. Nada de improvisar secuencias raras.'],
      ['Cierre documentado', 'Tomar nota de fallas y dejar reporte si algo no respondió.']
    ]
  },
  evento: {
    label: 'Evento Musicala',
    badge: 'Coordinación requerida',
    objetivo: 'Montaje autorizado, seguro y coherente con la puesta en escena.',
    pasos: [
      ['Confirmar responsable', 'Debe haber una persona encargada de luces y humo. No “entre todos miramos”, esa frase ya ha causado suficientes desgracias.'],
      ['Validar escenas', 'Usar solo escenas aprobadas para el evento.'],
      ['Humo con autorización', 'Ráfagas cortas, ventilación y nunca directo a niños, público, instrumentos o sensores.'],
      ['Plan B', 'Tener escena fija clara por si la consola, el cable o la voluntad del universo fallan.']
    ]
  },
  emergencia: {
    label: 'Modo emergencia',
    badge: 'Auxilio técnico',
    objetivo: 'Resolver lo básico antes de declarar oficialmente que “se dañó todo”.',
    pasos: [
      ['¿Hay corriente?', 'Revisar toma, multitoma, interruptor, cable de poder y que el equipo esté encendido. Sí, suena obvio. Por eso toca revisarlo.'],
      ['¿Blackout activo?', 'Si todo está oscuro pero conectado, revisar botón Blackout y master arriba.'],
      ['¿Modo correcto?', 'Verificar que la luz esté en DMX y no en automático, sonido o programa interno.'],
      ['¿Cable DMX correcto?', 'Consola DMX OUT a luz DMX IN; luego OUT de esa luz al IN de la siguiente.'],
      ['¿Dirección correcta?', 'A001/D001 suele ser dirección inicial 001. Si cada luz ocupa varios canales, no todas deberían compartir dirección salvo que quieras que hagan lo mismo.'],
      ['Plan seguro', 'Si no se arregla en 5 minutos, usar luz fija/manual o apagar efectos. La clase sigue, el ego técnico llora después.']
    ]
  }
};

const quizQuestions = [
  {
    q: '¿Qué hace normalmente el botón Blackout?',
    options: ['Guarda una escena nueva', 'Apaga la salida de luz de la consola', 'Cambia la dirección DMX', 'Calienta la máquina de humo'],
    answer: 1,
    explain: 'Blackout deja la salida de luz en negro aunque todo esté conectado. El clásico “se dañó todo”, versión botón.'
  },
  {
    q: 'Para controlar una luz desde consola, ¿en qué modo debe estar normalmente?',
    options: ['Modo sonido', 'Modo demo', 'Modo DMX', 'Modo fiesta total'],
    answer: 2,
    explain: 'La luz debe estar en modo DMX y con una dirección asignada para recibir órdenes desde la consola.'
  },
  {
    q: 'La conexión correcta básica es:',
    options: ['Luz OUT → Consola OUT', 'Consola DMX OUT → Luz DMX IN', 'Corriente → DMX IN', 'Humo → Blackout'],
    answer: 1,
    explain: 'La señal sale de la consola por DMX OUT y entra a la luz por DMX IN.'
  },
  {
    q: '¿Cuándo NO se debe usar la máquina de humo?',
    options: ['Cuando hay poca ventilación o sensibilidad respiratoria', 'Cuando la escena es artística', 'Cuando ya calentó', 'Cuando hay coordinación presente'],
    answer: 0,
    explain: 'La seguridad va primero: ventilación, autorización y condiciones del grupo antes de usar humo.'
  },
  {
    q: '¿Qué significa A001 o D001 en muchas luces?',
    options: ['Programa de música', 'Dirección DMX inicial 001', 'Nivel de brillo', 'Código de error universal'],
    answer: 1,
    explain: 'En muchas luces A001/D001 indica dirección DMX 001, aunque siempre hay que confirmar el modo del equipo.'
  },
  {
    q: '¿Qué debe hacerse al cerrar?',
    options: ['Dejar todo como quedó y salir corriendo', 'Bajar faders, apagar efectos, organizar cables y reportar fallas', 'Cambiar direcciones para la próxima clase', 'Llenar el salón de humo para que se vea pro'],
    answer: 1,
    explain: 'El cierre evita daños, pérdidas y futuros “nadie sabe qué pasó”. Maravilla de la civilización.'
  }
];

const protocolos = [
  {
    title: 'Protocolo general de uso técnico',
    body: `
      <p><strong>Objetivo:</strong> garantizar que luces, consola y máquina de humo se usen de forma segura, ordenada y coherente con las clases y eventos de Musicala.</p>
      <ol>
        <li>Solo pueden operar equipos quienes hayan revisado esta guía y completado el quiz básico.</li>
        <li>Los equipos no se prestan ni se mueven sin autorización de coordinación.</li>
        <li>Todo uso debe iniciar con checklist previo y terminar con checklist de cierre.</li>
        <li>Está prohibido modificar configuraciones avanzadas sin autorización: patch, record, delete, reset, dirección DMX general o programación interna.</li>
        <li>Cualquier falla debe reportarse el mismo día en el módulo de fallas.</li>
      </ol>`
  },
  {
    title: 'Protocolo de luces DMX',
    body: `
      <ol>
        <li>Verificar estabilidad física de luces y soportes.</li>
        <li>Conectar corriente antes de probar señal.</li>
        <li>Conectar consola DMX OUT a la primera luz DMX IN.</li>
        <li>Continuar la cadena desde DMX OUT de una luz al DMX IN de la siguiente.</li>
        <li>Confirmar modo DMX y dirección en cada equipo.</li>
        <li>Evitar estrobo o cambios agresivos en clases regulares.</li>
      </ol>`
  },
  {
    title: 'Protocolo de consola',
    body: `
      <ol>
        <li>Encender consola y verificar master/faders en nivel bajo antes de subir luz.</li>
        <li>Desactivar Blackout si se requiere salida de luz.</li>
        <li>Usar escenas básicas o configuraciones autorizadas.</li>
        <li>No grabar, borrar ni reprogramar escenas sin autorización.</li>
        <li>Al cerrar, bajar faders y apagar en orden.</li>
      </ol>`
  },
  {
    title: 'Protocolo de máquina de humo',
    body: `
      <ol>
        <li>Uso solo con autorización de coordinación.</li>
        <li>Revisar ventilación, sensibilidad respiratoria y presencia de sensores.</li>
        <li>Usar únicamente líquido adecuado para máquina de humo.</li>
        <li>Esperar calentamiento completo antes de disparar.</li>
        <li>Usar ráfagas cortas. No apuntar directo a estudiantes, público, instrumentos o equipos.</li>
        <li>Apagar y dejar enfriar antes de mover o guardar.</li>
      </ol>`
  }
];

function render() {
  const view = views[state.activeView] || views.inicio;
  pageTitle.textContent = view.title;
  $$('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.view === state.activeView));
  content.innerHTML = view.render();
  bindDynamicEvents();
  updateStatus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStatus() {
  const completed = completionPercent();
  statusPill.textContent = completed >= 80 ? 'Docente casi listo' : 'Modo docente';
}

function completionPercent() {
  const totalChecks = Object.values(checklistItems).flat().length;
  const doneChecks = Object.keys(state.checklist).filter(k => state.checklist[k]).length;
  const quizScore = getQuizScore().score;
  const quizPercent = quizQuestions.length ? quizScore / quizQuestions.length : 0;
  const checkPercent = totalChecks ? doneChecks / totalChecks : 0;
  return Math.round(((checkPercent * 0.45) + (quizPercent * 0.55)) * 100);
}

function renderInicio() {
  const pct = completionPercent();
  return `
    <div class="hero">
      <div class="hero-panel">
        <span class="eyebrow">Backstage sin drama</span>
        <h2>Luces, consola y humo sin convertir Musicala en reactor nuclear.</h2>
        <p>
          Esta app guía a docentes en el uso básico de luces DMX, consola y máquina de humo: pasos, seguridad,
          montajes rápidos, simulador, quiz y reportes de fallas. Todo muy humano, lo cual explica por qué hay que repetir lo de no tocar botones raros.
        </p>
        <div class="hero-actions">
          <button class="btn" data-go="antes">Empezar capacitación</button>
          <button class="btn secondary" data-go="montajes">Ver montaje rápido</button>
          <button class="btn ghost" onclick="window.print()">Imprimir guía</button>
        </div>
      </div>
      <div class="quick-status card">
        <h3>Progreso local</h3>
        <div class="progress-ring" style="--progress:${pct * 3.6}deg"><span>${pct}%</span></div>
        <p>Este avance queda guardado en este dispositivo. Para historial por docente toca conectarlo luego a Firebase, porque el navegador no es adivino, aunque algunos usuarios lo intenten.</p>
      </div>
    </div>

    <div class="section-title">
      <div>
        <h2>Módulos principales</h2>
        <p>Entrenamiento rápido para operar sin pánico técnico.</p>
      </div>
    </div>
    <div class="grid four">
      ${quickModules.map(m => `
        <article class="card">
          <div class="card-icon">${m.icon}</div>
          <h3>${m.title}</h3>
          <p>${m.text}</p>
          <button class="btn secondary" data-go="${m.view}">Abrir</button>
        </article>
      `).join('')}
    </div>

    <div class="section-title">
      <div>
        <h2>Regla de oro</h2>
        <p>Si no sabes qué hace, no lo toques. La especie ha sobrevivido gracias a frases así.</p>
      </div>
    </div>
    <div class="callout warning">
      <strong>Importante:</strong> Esta guía cubre uso básico y seguro. No reemplaza revisión técnica, mantenimiento ni programación avanzada de escenas.
    </div>
  `;
}

function renderAntes() {
  return `
    <div class="section-title">
      <div>
        <h2>Checklist previo</h2>
        <p>Antes de prender luces o humo, revisa esto. Sí, incluso si “solo es un momentico”.</p>
      </div>
      <button class="btn ghost" data-reset-checklist="previo">Reiniciar</button>
    </div>
    ${renderChecklist('previo')}

    <div class="section-title">
      <div>
        <h2>Checklist de cierre</h2>
        <p>El momento donde evitamos que el siguiente docente herede caos envuelto en cable.</p>
      </div>
      <button class="btn ghost" data-reset-checklist="cierre">Reiniciar</button>
    </div>
    ${renderChecklist('cierre')}

    <div class="grid three section-spacer">
      ${[
        ['⚡', 'Corriente primero', 'Si un equipo no prende, revisa toma, multitoma, switch, cable y botón de encendido.'],
        ['🎛️', 'Master y Blackout', 'Si todo está conectado pero oscuro, revisa master arriba y Blackout desactivado.'],
        ['🧯', 'Seguridad antes que show', 'Nada de humo excesivo, cables atravesados o estrobo en clases normales.']
      ].map(([icon, title, text]) => `<article class="card"><div class="card-icon">${icon}</div><h3>${title}</h3><p>${text}</p></article>`).join('')}
    </div>
  `;
}

function renderChecklist(type) {
  return `
    <div class="card">
      <div class="checklist">
        ${checklistItems[type].map((item, index) => {
          const id = `${type}_${index}`;
          return `
            <label class="check-item">
              <input type="checkbox" data-check="${id}" ${state.checklist[id] ? 'checked' : ''} />
              <span>${item}</span>
            </label>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderLuces() {
  return `
    <div class="grid two">
      <article class="card equipment-card">
        <div class="equipment-visual">💡</div>
        <div>
          <h3>¿Qué es DMX?</h3>
          <p>DMX es el sistema que permite que una consola controle luces mediante direcciones y canales. La consola envía órdenes y cada luz responde según su dirección.</p>
        </div>
      </article>
      <article class="card equipment-card">
        <div class="equipment-visual">🔢</div>
        <div>
          <h3>A001 / D001</h3>
          <p>En muchas luces significa dirección DMX inicial 001. Aun así, hay que confirmar que la luz esté en modo DMX, no en automático ni sonido.</p>
        </div>
      </article>
    </div>

    <div class="callout good">
      <strong>Fórmula básica:</strong> Consola DMX OUT → Luz 1 DMX IN → Luz 1 DMX OUT → Luz 2 DMX IN → y así sucesivamente.
    </div>

    <div class="section-title">
      <div>
        <h2>Pasos para conectar luces</h2>
        <p>La cadena DMX, porque hasta las luces tienen jerarquía.</p>
      </div>
    </div>
    <div class="step-list">
      ${[
        ['Conecta corriente', 'Cada luz necesita corriente. DMX no alimenta la luz, solo manda señal. Triste, pero real.'],
        ['Conecta señal DMX', 'El cable sale de la consola por DMX OUT y entra a la primera luz por DMX IN.'],
        ['Encadena luces', 'De DMX OUT de la primera luz pasas a DMX IN de la segunda. Repite según montaje.'],
        ['Activa modo DMX', 'Busca en el menú de cada luz el modo DMX. Evita Auto, Sound, Demo o programas internos si quieres control desde consola.'],
        ['Asigna dirección', 'Si quieres que varias luces hagan lo mismo, pueden compartir dirección. Si quieres control separado, cada una debe tener dirección diferente según sus canales.'],
        ['Prueba desde consola', 'Sube master/fader suavemente. Si no responde, revisa corriente, modo, cable, dirección y Blackout.']
      ].map(([h,p]) => `<div class="step"><h4>${h}</h4><p>${p}</p></div>`).join('')}
    </div>

    <div class="section-title"><div><h2>Errores comunes</h2><p>La lista oficial de “yo juraba que estaba bien”.</p></div></div>
    <div class="grid three">
      ${[
        ['OUT con OUT', 'La señal debe salir de la consola y entrar a la luz. OUT con OUT no conversa con nadie.'],
        ['Modo sonido activo', 'La luz responde al ruido, no a la consola. Ideal si quieres caos con beat.'],
        ['Dirección incorrecta', 'La consola manda a una dirección y la luz espera otra. Drama administrativo, pero con fotones.'],
        ['Blackout encendido', 'Todo parece muerto, pero solo está bloqueado desde consola.'],
        ['Master abajo', 'Los faders individuales pueden estar arriba, pero si el master está abajo no sale nada.'],
        ['Cable defectuoso', 'Si todo parece correcto, cambia cable. Los cables también tienen crisis existenciales.']
      ].map(([h,p]) => `<article class="card"><h3>${h}</h3><p>${p}</p></article>`).join('')}
    </div>
  `;
}

function renderConsola() {
  const parts = [
    ['Master', 'Control general de salida. Si está abajo, casi nada saldrá aunque los otros faders estén arriba.'],
    ['Blackout', 'Apaga temporalmente la salida de luz. Revisarlo primero si todo está oscuro.'],
    ['Faders', 'Deslizadores para controlar canales: intensidad, color, movimiento, estrobo o efectos según la luz.'],
    ['Fixture / Scanner', 'Selecciona qué luz o grupo de luces controla la consola.'],
    ['Scene', 'Escenas guardadas. Usar solo las aprobadas por coordinación.'],
    ['Chase', 'Secuencias automáticas de escenas. Útiles, pero peligrosas en manos de dedos curiosos.'],
    ['Speed', 'Velocidad de secuencias o efectos.'],
    ['Fade Time', 'Tiempo de transición entre una escena y otra.'],
    ['Program / Record / Delete', 'Zona delicada: no tocar sin autorización. Aquí se rompen cosas que luego nadie acepta haber roto.']
  ];
  return `
    <div class="callout danger"><strong>No tocar sin autorización:</strong> Program, Record, Delete, Patch, Reset, configuración avanzada o direcciones DMX generales.</div>
    <div class="section-title"><div><h2>Partes de la consola</h2><p>Un mapa para no jugar a “oprimí algo y ahora nada funciona”.</p></div></div>
    <div class="grid three">
      ${parts.map(([h,p]) => `<article class="card"><h3>${h}</h3><p>${p}</p></article>`).join('')}
    </div>

    <div class="section-title"><div><h2>Encendido básico</h2><p>La secuencia sana para iniciar.</p></div></div>
    <div class="step-list">
      ${[
        ['Todo abajo', 'Antes de encender, deja master y faders abajo para evitar flashazos.'],
        ['Encender consola', 'Conecta y enciende la consola. Espera a que cargue si aplica.'],
        ['Encender luces', 'Conecta y enciende luces. Verifica modo DMX.'],
        ['Desactivar Blackout', 'Si necesitas salida de luz, Blackout debe estar desactivado.'],
        ['Subir master', 'Sube master suavemente y luego prueba canales o escena.'],
        ['Usar escena autorizada', 'Para clases o eventos, usar escena básica o predefinida. No programar en vivo sin saber. Qué concepto tan revolucionario.']
      ].map(([h,p]) => `<div class="step"><h4>${h}</h4><p>${p}</p></div>`).join('')}
    </div>
  `;
}

function renderHumo() {
  return `
    <div class="grid two">
      <article class="card equipment-card">
        <div class="equipment-visual">🌫️</div>
        <div>
          <h3>Uso responsable</h3>
          <p>La máquina de humo sirve para ambiente escénico, no para convertir la sede en película de misterio de bajo presupuesto.</p>
        </div>
      </article>
      <article class="card equipment-card">
        <div class="equipment-visual">✅</div>
        <div>
          <h3>Autorización</h3>
          <p>Debe usarse con permiso de coordinación, ventilación adecuada y revisión de condiciones del grupo.</p>
        </div>
      </article>
    </div>

    <div class="section-title"><div><h2>Antes de usar</h2><p>Revisa seguridad, equipo y espacio.</p></div></div>
    <div class="grid three">
      ${[
        ['Líquido adecuado', 'Usar solo líquido para máquina de humo. No mezclas caseras, por favor, ya bastante sufre la química.'],
        ['Superficie estable', 'La máquina debe estar firme, lejos de bordes, telas, papel, cables húmedos o paso de estudiantes.'],
        ['Ventilación', 'El espacio debe permitir circulación de aire. Evitar exceso de humo.'],
        ['Sensibilidades', 'No usar si hay estudiantes con condiciones respiratorias, alergias o incomodidad evidente.'],
        ['Calentamiento', 'Esperar que la máquina esté lista. Si no calienta, no forzar.'],
        ['Dirección segura', 'No apuntar directamente a caras, instrumentos, público, sensores o equipos electrónicos.']
      ].map(([h,p]) => `<article class="card"><h3>${h}</h3><p>${p}</p></article>`).join('')}
    </div>

    <div class="section-title"><div><h2>Uso correcto</h2><p>Ráfagas cortas, efecto controlado, cero drama respiratorio.</p></div></div>
    <div class="step-list">
      ${[
        ['Conectar', 'Ubicar la máquina, conectar corriente y control si aplica.'],
        ['Calentar', 'Esperar indicador de listo. Puede tardar algunos minutos.'],
        ['Prueba corta', 'Hacer una ráfaga breve antes del uso real.'],
        ['Aplicar con moderación', 'Usar ráfagas cortas y dejar disipar. Más humo no siempre es más artístico; a veces solo es más tos.'],
        ['Apagar y enfriar', 'Al terminar, apagar y dejar enfriar antes de moverla o guardarla.']
      ].map(([h,p]) => `<div class="step"><h4>${h}</h4><p>${p}</p></div>`).join('')}
    </div>
  `;
}

function renderMontajes() {
  const keys = Object.keys(montajeData);
  const active = sessionStorage.getItem('musistage_montaje') || 'clase';
  const data = montajeData[active];
  return `
    <div class="tabs">
      ${keys.map(key => `<button class="tab-btn ${key === active ? 'active' : ''}" data-montaje="${key}">${montajeData[key].label}</button>`).join('')}
    </div>
    <article class="card">
      <span class="badge ${active === 'emergencia' ? 'danger' : active === 'evento' ? 'warn' : 'good'}">${data.badge}</span>
      <h2>${data.label}</h2>
      <p><strong>Objetivo:</strong> ${data.objetivo}</p>
      <div class="step-list">
        ${data.pasos.map(([h,p]) => `<div class="step"><h4>${h}</h4><p>${p}</p></div>`).join('')}
      </div>
    </article>

    <div class="section-title"><div><h2>Diagnóstico rápido</h2><p>Cuando algo no responde, revisa en este orden.</p></div></div>
    <div class="accordion">
      ${[
        ['No prende nada', 'Revisa corriente, toma, multitoma, switch, cable de poder y que el equipo no esté desconectado. Sí, esto pasa demasiado.'],
        ['La consola prende pero las luces no responden', 'Revisa DMX OUT de consola a DMX IN de luz, modo DMX, dirección y cable.'],
        ['Todo está oscuro', 'Revisa Blackout, master general, faders y escena activa.'],
        ['Una luz hace cosas sola', 'Probablemente está en modo automático, sonido o demo. Cambiar a DMX.'],
        ['La máquina de humo no dispara', 'Puede no haber calentado, faltar líquido, estar desconectado el control o estar bloqueada por temperatura.']
      ].map(([h,p], i) => `<div class="accordion-item"><button class="accordion-head">${h}<span>+</span></button><div class="accordion-body">${p}</div></div>`).join('')}
    </div>
  `;
}

function renderSimulador() {
  const items = [
    'Consola DMX OUT',
    'Luz 1 DMX IN',
    'Luz 1 DMX OUT',
    'Luz 2 DMX IN',
    'Luz 2 DMX OUT',
    'Luz 3 DMX IN',
    'Corriente conectada en cada equipo'
  ];
  const expected = items;
  const correct = state.simSlots.every((slot, i) => slot === expected[i]);
  const used = new Set(state.simSlots.filter(Boolean));
  return `
    <div class="callout ${correct ? 'good' : 'warning'}">
      <strong>${correct ? 'Conexión correcta:' : 'Objetivo:'}</strong>
      ${correct ? 'la cadena básica DMX está bien armada.' : 'arrastra los elementos al orden correcto para una cadena DMX básica.'}
    </div>
    <div class="sim-area">
      <div class="drag-bank">
        <h3>Elementos</h3>
        <p>Arrastra cada elemento al orden correcto.</p>
        ${items.filter(item => !used.has(item)).map(item => `<div class="sim-item" draggable="true" data-sim-item="${item}"><span>${item}</span><span>↔</span></div>`).join('') || '<p>Todos los elementos están ubicados. Revisa el resultado.</p>'}
        <button class="btn ghost" data-reset-sim>Reiniciar simulador</button>
      </div>
      <div class="drop-zone">
        <h3>Cadena correcta</h3>
        <div class="sequence">
          ${state.simSlots.map((slot, i) => `<div class="drop-slot ${slot ? 'filled' : ''}" data-slot="${i}">${slot || `Paso ${i + 1}`}</div>`).join('')}
        </div>
      </div>
    </div>
    <div class="section-title"><div><h2>Retroalimentación</h2><p>${getSimFeedback(expected)}</p></div></div>
  `;
}

function getSimFeedback(expected) {
  const firstWrong = state.simSlots.findIndex((slot, i) => slot && slot !== expected[i]);
  if (state.simSlots.every(Boolean) && firstWrong === -1) return 'Perfecto. Consola sale, luz entra, luces encadenan y corriente está considerada. La civilización respira tranquila.';
  if (firstWrong >= 0) return `El paso ${firstWrong + 1} parece incorrecto. Recuerda: señal DMX OUT entra por DMX IN del siguiente equipo.`;
  return 'Completa la cadena. No olvides que la corriente no viaja por DMX: cada equipo debe alimentarse por separado.';
}

function renderQuiz() {
  const score = getQuizScore();
  const completed = Object.keys(state.quizAnswers).length === quizQuestions.length;
  return `
    <div class="card">
      <h2>Quiz básico de habilitación</h2>
      <p>Resultado actual: <strong>${score.score}/${quizQuestions.length}</strong> respuestas correctas. ${completed && score.score >= 5 ? 'Aprobado para uso básico local.' : 'Falta completar o reforzar.'}</p>
      ${completed && score.score >= 5 ? '<div class="callout good"><strong>Estado:</strong> capacitación básica aprobada en este dispositivo.</div>' : '<div class="callout warning"><strong>Meta:</strong> mínimo 5 de 6 respuestas correctas.</div>'}
      <button class="btn ghost" data-reset-quiz>Reiniciar quiz</button>
    </div>

    <div class="grid two" style="margin-top:18px">
      ${quizQuestions.map((q, qi) => {
        const selected = state.quizAnswers[qi];
        const answered = selected !== undefined;
        return `<article class="card">
          <h3>${qi + 1}. ${q.q}</h3>
          ${q.options.map((opt, oi) => {
            const cls = answered && oi === q.answer ? 'correct' : answered && oi === selected && oi !== q.answer ? 'wrong' : selected === oi ? 'selected' : '';
            return `<button class="quiz-option ${cls}" data-quiz-q="${qi}" data-quiz-a="${oi}" ${answered ? 'disabled' : ''}>${opt}</button>`;
          }).join('')}
          ${answered ? `<p><strong>Explicación:</strong> ${q.explain}</p>` : ''}
        </article>`;
      }).join('')}
    </div>

    <div class="section-title"><div><h2>Certificación local</h2><p>Genera un registro simple para copiar o imprimir.</p></div></div>
    <div class="form-card">
      <div class="form-grid">
        <div class="field"><label>Nombre docente</label><input id="certName" placeholder="Ej: Catalina Medina" /></div>
        <div class="field"><label>Rol / componente</label><input id="certRole" placeholder="Ej: Docente de danza" /></div>
        <div class="field full"><button class="btn" data-generate-cert ${completed && score.score >= 5 ? '' : 'disabled'}>Generar constancia local</button></div>
      </div>
      <div id="certOutput"></div>
    </div>
  `;
}

function getQuizScore() {
  let score = 0;
  quizQuestions.forEach((q, i) => {
    if (state.quizAnswers[i] === q.answer) score++;
  });
  return { score };
}

function renderProtocolos() {
  return `
    <div class="callout warning"><strong>Uso institucional:</strong> estos textos son base editable. Ajusten nombres, responsables, horarios, equipos reales y condiciones específicas de Musicala.</div>
    <div class="accordion">
      ${protocolos.map((p, i) => `<div class="accordion-item ${i === 0 ? 'open' : ''}"><button class="accordion-head">${p.title}<span>+</span></button><div class="accordion-body printable">${p.body}</div></div>`).join('')}
    </div>
    <div class="section-title"><div><h2>Documento imprimible</h2><p>Resumen para pegar cerca de la consola o guardar en protocolos.</p></div></div>
    <article class="card printable">
      <h3>Resumen operativo de uso técnico</h3>
      <ol>
        <li>Completar checklist previo.</li>
        <li>Definir montaje: clase, ensayo, muestra, evento o emergencia.</li>
        <li>Confirmar corriente y estabilidad física de equipos.</li>
        <li>Verificar modo DMX, direcciones y cableado.</li>
        <li>Operar únicamente escenas o controles autorizados.</li>
        <li>Usar humo solo con autorización, ventilación y ráfagas cortas.</li>
        <li>Completar checklist de cierre.</li>
        <li>Reportar fallas el mismo día.</li>
      </ol>
      <button class="btn" onclick="window.print()">Imprimir / guardar PDF</button>
    </article>
  `;
}

function bindDynamicEvents() {
  $$('[data-go]').forEach(btn => btn.addEventListener('click', () => navigate(btn.dataset.go)));

  $$('[data-check]').forEach(input => input.addEventListener('change', e => {
    state.checklist[e.target.dataset.check] = e.target.checked;
    storage.set('musistage_checklist', state.checklist);
    updateStatus();
    if (state.activeView === 'inicio') render();
  }));

  $$('[data-reset-checklist]').forEach(btn => btn.addEventListener('click', () => {
    const type = btn.dataset.resetChecklist;
    checklistItems[type].forEach((_, i) => delete state.checklist[`${type}_${i}`]);
    storage.set('musistage_checklist', state.checklist);
    showToast('Checklist reiniciado. Otra vez desde cero, la forma favorita de la burocracia.');
    render();
  }));

  $$('[data-montaje]').forEach(btn => btn.addEventListener('click', () => {
    sessionStorage.setItem('musistage_montaje', btn.dataset.montaje);
    render();
  }));

  $$('.accordion-head').forEach(head => head.addEventListener('click', () => {
    head.parentElement.classList.toggle('open');
  }));

  $$('[data-quiz-q]').forEach(btn => btn.addEventListener('click', () => {
    const q = Number(btn.dataset.quizQ);
    const a = Number(btn.dataset.quizA);
    state.quizAnswers[q] = a;
    storage.set('musistage_quiz', state.quizAnswers);
    render();
  }));

  const resetQuiz = $('[data-reset-quiz]');
  if (resetQuiz) resetQuiz.addEventListener('click', () => {
    state.quizAnswers = {};
    storage.set('musistage_quiz', state.quizAnswers);
    showToast('Quiz reiniciado. El conocimiento se fue de paseo, toca recuperarlo.');
    render();
  });

  const certBtn = $('[data-generate-cert]');
  if (certBtn) certBtn.addEventListener('click', generateCertification);

  bindSimulatorEvents();
}

function navigate(view) {
  state.activeView = view;
  $('#sidebar').classList.remove('open');
  render();
}

function bindSimulatorEvents() {
  let dragged = null;
  $$('[data-sim-item]').forEach(item => {
    item.addEventListener('dragstart', () => {
      dragged = item.dataset.simItem;
      item.classList.add('dragging');
    });
    item.addEventListener('dragend', () => {
      dragged = null;
      item.classList.remove('dragging');
    });
  });
  $$('[data-slot]').forEach(slot => {
    slot.addEventListener('dragover', e => e.preventDefault());
    slot.addEventListener('drop', e => {
      e.preventDefault();
      const index = Number(slot.dataset.slot);
      if (!dragged) return;
      if (state.simSlots[index]) return showToast('Ese paso ya está ocupado. Reinicia o usa otro espacio libre.');
      state.simSlots[index] = dragged;
      storage.set('musistage_sim_slots', state.simSlots);
      render();
    });
    slot.addEventListener('click', () => {
      const index = Number(slot.dataset.slot);
      if (!state.simSlots[index]) return;
      state.simSlots[index] = null;
      storage.set('musistage_sim_slots', state.simSlots);
      render();
    });
  });
  const resetSim = $('[data-reset-sim]');
  if (resetSim) resetSim.addEventListener('click', () => {
    state.simSlots = Array(7).fill(null);
    storage.set('musistage_sim_slots', state.simSlots);
    render();
  });
}

function generateCertification() {
  const score = getQuizScore().score;
  if (score < 5 || Object.keys(state.quizAnswers).length < quizQuestions.length) {
    showToast('Primero completa y aprueba el quiz. Cruel, pero lógico.');
    return;
  }
  const nombre = $('#certName').value.trim();
  const rol = $('#certRole').value.trim();
  if (!nombre) return showToast('Escribe el nombre del docente. El certificado no adivina, qué decepción.');
  const cert = {
    fecha: new Date().toLocaleString('es-CO'),
    nombre,
    rol: rol || 'Docente Musicala',
    puntaje: `${score}/${quizQuestions.length}`
  };
  state.certifications.unshift(cert);
  storage.set('musistage_certifications', state.certifications);
  $('#certOutput').innerHTML = `
    <div class="callout good" style="margin-top:18px">
      <strong>Constancia local generada:</strong><br>
      ${cert.nombre}, ${cert.rol}, completó la capacitación básica de MusiStage con puntaje ${cert.puntaje} el ${cert.fecha}.
    </div>
  `;
  showToast('Constancia generada y guardada localmente.');
}

function showToast(message) {
  const old = $('.toast');
  if (old) old.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3600);
}

$$('.nav-btn').forEach(btn => btn.addEventListener('click', () => navigate(btn.dataset.view)));
$('#menuToggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => null);
  });
}

render();
