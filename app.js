import { VOCALES, CONSONANTES, PALABRAS, FELICITACIONES, formarSilaba, pronunciar, pronunciarNombre } from './data.js';

const $ = (sel) => document.querySelector(sel);
const azar = (lista) => lista[Math.floor(Math.random() * lista.length)];
const mezclar = (lista) => lista.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);

/* =========================================================
   VOZ (Web Speech API)
   ========================================================= */
// Voces conocidas: se prefieren las femeninas y de mejor calidad, que suenan
// más claras y amigables para un niño. Las masculinas graves se evitan.
const VOCES_PREFERIDAS = [
  'paulina', 'mónica', 'monica', 'angélica', 'angelica', 'sabina', 'dalia', 'elvira', 'helena', 'laura',
  'lucía', 'lucia', 'esperanza', 'marisol', 'penélope', 'penelope', 'google español', 'google us spanish',
];
const VOCES_EVITADAS = ['jorge', 'juan', 'diego', 'carlos', 'pablo', 'raúl', 'raul', 'andrés', 'andres', 'enrique', 'álvaro', 'alvaro'];
const IDIOMAS_PRIORIDAD = ['es-MX', 'es-US', 'es-419', 'es-CO', 'es-AR', 'es-ES'];

function puntuarVoz(v) {
  const nombre = (v.name || '').toLowerCase();
  const uri = (v.voiceURI || '').toLowerCase();
  const lang = (v.lang || '').replace('_', '-');
  let puntos = 0;
  if (VOCES_PREFERIDAS.some((n) => nombre.includes(n))) puntos += 40;
  if (VOCES_EVITADAS.some((n) => nombre.includes(n))) puntos -= 40;
  if (/enhanced|premium|natural|neural|mejorad|siri/.test(nombre + ' ' + uri)) puntos += 25;
  if (/compact|eloquence|espeak/.test(nombre + ' ' + uri)) puntos -= 15;
  const i = IDIOMAS_PRIORIDAD.indexOf(lang);
  puntos += i === -1 ? 0 : (IDIOMAS_PRIORIDAD.length - i) * 2;
  if (v.localService) puntos += 3;
  return puntos;
}

const voz = {
  voces: [],
  elegida: null,
  avisado: false,
  cargar() {
    if (!('speechSynthesis' in window)) return;
    const todas = speechSynthesis.getVoices();
    const enEspanol = todas.filter((v) => v.lang && v.lang.toLowerCase().startsWith('es'));
    enEspanol.sort((a, b) => puntuarVoz(b) - puntuarVoz(a));
    voz.voces = enEspanol;
    const guardada = localStorage.getItem('silabas.voz');
    voz.elegida = enEspanol.find((v) => v.voiceURI === guardada) || enEspanol[0] || null;
    ajustes.pintarVoces();
  },
  elegir(voiceURI) {
    voz.elegida = voz.voces.find((v) => v.voiceURI === voiceURI) || voz.elegida;
    if (voz.elegida) localStorage.setItem('silabas.voz', voz.elegida.voiceURI);
  },
  hablar(texto, { rate = 0.85, pitch = 1.15, alTerminar } = {}) {
    if (!('speechSynthesis' in window)) {
      if (!voz.avisado) { voz.avisado = true; aviso('Este navegador no puede leer en voz alta 😢'); }
      alTerminar?.();
      return;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    if (!voz.voces.length) voz.cargar();
    if (voz.elegida) { u.voice = voz.elegida; u.lang = voz.elegida.lang; } else { u.lang = 'es-MX'; }
    u.rate = rate; u.pitch = pitch; u.volume = 1;
    if (alTerminar) { u.onend = alTerminar; u.onerror = alTerminar; }
    // Pequeña espera: algunos navegadores ignoran el "speak" justo después del "cancel".
    setTimeout(() => speechSynthesis.speak(u), 40);
  },
  // Lee una sílaba (con la vocal acentuada para que suene completa y no como abreviatura).
  silaba(silaba, opciones = {}) { voz.hablar(pronunciar(silaba), opciones); },
};
if ('speechSynthesis' in window) {
  speechSynthesis.addEventListener('voiceschanged', voz.cargar);
  // En iPhone la lista de voces a veces solo se llena tras el primer toque.
  window.addEventListener('pointerdown', () => { if (!voz.voces.length) voz.cargar(); }, { once: true });
}

/* =========================================================
   AJUSTES (elección de voz)
   ========================================================= */
const ajustes = {
  pintarVoces() {
    const sel = $('#voz-select'); if (!sel) return;
    sel.innerHTML = '';
    if (!voz.voces.length) {
      const o = document.createElement('option'); o.textContent = 'No hay voces en español instaladas'; sel.appendChild(o);
      $('#voz-ayuda').hidden = false;
      return;
    }
    $('#voz-ayuda').hidden = true;
    voz.voces.forEach((v) => {
      const o = document.createElement('option');
      o.value = v.voiceURI; o.textContent = `${v.name} (${v.lang})`;
      if (voz.elegida && v.voiceURI === voz.elegida.voiceURI) o.selected = true;
      sel.appendChild(o);
    });
  },
  iniciar() {
    $('#btn-ajustes').addEventListener('click', () => { sonidos.pop(); voz.cargar(); $('#modal-ajustes').hidden = false; });
    $('#btn-cerrar-ajustes').addEventListener('click', () => { sonidos.pop(); $('#modal-ajustes').hidden = true; });
    $('#modal-ajustes').addEventListener('click', (e) => { if (e.target.id === 'modal-ajustes') $('#modal-ajustes').hidden = true; });
    $('#voz-select').addEventListener('change', (e) => { voz.elegir(e.target.value); voz.hablar('Hola, soy tu nueva voz. ¡Vamos a leer!', { rate: 0.95 }); });
    $('#btn-probar-voz').addEventListener('click', () => voz.hablar(`${pronunciar('ma')}, ${pronunciar('pa')}, ${pronunciar('nu')}. Mamá, papá, nube.`, { rate: 0.85 }));
  },
};

/* =========================================================
   SONIDOS (WebAudio: pops y campanitas)
   ========================================================= */
let ctxAudio = null;
function audio() {
  if (!ctxAudio) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctxAudio = new AC();
  }
  if (ctxAudio.state === 'suspended') ctxAudio.resume();
  return ctxAudio;
}
function tono(frecuencia, duracion = 0.12, tipo = 'sine', volumen = 0.25, retraso = 0) {
  const ctx = audio(); if (!ctx) return;
  const osc = ctx.createOscillator(); const gan = ctx.createGain();
  osc.type = tipo; osc.frequency.value = frecuencia;
  const t = ctx.currentTime + retraso;
  gan.gain.setValueAtTime(0.0001, t);
  gan.gain.exponentialRampToValueAtTime(volumen, t + 0.01);
  gan.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
  osc.connect(gan).connect(ctx.destination);
  osc.start(t); osc.stop(t + duracion + 0.05);
}
const sonidos = {
  pop: () => tono(520 + Math.random() * 200, 0.1, 'triangle'),
  acierto: () => { [523, 659, 784, 1047].forEach((f, i) => tono(f, 0.18, 'sine', 0.2, i * 0.09)); },
  error: () => { tono(220, 0.25, 'sawtooth', 0.12); tono(180, 0.3, 'sawtooth', 0.1, 0.12); },
  estrella: () => { [880, 1175, 1568].forEach((f, i) => tono(f, 0.14, 'sine', 0.18, i * 0.06)); },
};

/* =========================================================
   CONFETI, AVISOS Y ESTRELLAS
   ========================================================= */
function confeti(cantidad = 40) {
  const capa = $('#confeti');
  const colores = ['#ff6b6b', '#ffd43b', '#69db7c', '#4dabf7', '#da77f2', '#ffa94d'];
  for (let i = 0; i < cantidad; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = azar(colores);
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    capa.appendChild(p);
    const duracion = 1400 + Math.random() * 1200;
    p.animate(
      [{ transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
       { transform: `translate(${(Math.random() - 0.5) * 200}px, 110vh) rotate(${Math.random() * 720}deg)`, opacity: 0.6 }],
      { duration: duracion, easing: 'cubic-bezier(.2,.7,.4,1)' }
    ).onfinish = () => p.remove();
  }
}

let temporizadorAviso = null;
function aviso(texto) {
  const el = $('#aviso');
  el.textContent = texto; el.hidden = false;
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => { el.hidden = true; }, 2600);
}

const estrellas = {
  valor: Number(localStorage.getItem('silabas.estrellas') || 0),
  pintar() { $('#num-estrellas').textContent = estrellas.valor; },
  sumar(n = 1) {
    estrellas.valor += n;
    localStorage.setItem('silabas.estrellas', String(estrellas.valor));
    estrellas.pintar();
    const el = $('#estrellas');
    el.classList.remove('brillo'); void el.offsetWidth; el.classList.add('brillo');
    sonidos.estrella();
  },
};
estrellas.pintar();

/* =========================================================
   MAYÚSCULAS / MINÚSCULAS
   ========================================================= */
const caso = {
  actual: localStorage.getItem('silabas.caso') || 'mayus',
  aplicar() {
    document.body.dataset.caso = caso.actual;
    $('#btn-caso').textContent = caso.actual === 'mayus' ? 'Aa' : 'aA';
    localStorage.setItem('silabas.caso', caso.actual);
    escribe.pintarGuia();
  },
  mostrar: (texto) => (caso.actual === 'mayus' ? texto.toUpperCase() : texto.toLowerCase()),
};
$('#btn-caso').addEventListener('click', () => {
  caso.actual = caso.actual === 'mayus' ? 'minus' : 'mayus';
  sonidos.pop(); caso.aplicar();
});

/* =========================================================
   PANTALLA: FORMAR SÍLABAS
   ========================================================= */
const formar = {
  consonante: null, // objeto de CONSONANTES
  vocal: null,      // 'a' | 'e' | ...
  silaba: null,

  iniciar() {
    const contVocales = $('#vocales');
    VOCALES.forEach((v) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'vocal'; b.dataset.vocal = v;
      b.innerHTML = `<span class="letra">${v}</span>`;
      b.addEventListener('click', () => formar.elegirVocal(v, b));
      contVocales.appendChild(b);
    });
    const contCons = $('#consonantes');
    CONSONANTES.forEach((c) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'consonante'; b.style.setProperty('--c', c.color); b.dataset.letra = c.letra;
      b.innerHTML = `<span class="letra">${c.letra}</span>`;
      b.addEventListener('click', () => formar.elegirConsonante(c, b));
      contCons.appendChild(b);
    });
    $('#btn-oir').addEventListener('click', () => formar.decir(0.85));
    $('#btn-lento').addEventListener('click', () => formar.decir(0.45));
    $('#btn-palabra').addEventListener('click', () => formar.decirPalabra());
    $('#btn-letras').addEventListener('click', () => formar.decirLetras());
    $('#btn-limpiar').addEventListener('click', () => { sonidos.pop(); formar.limpiar(); });
    // Tocar una ranura dice el nombre de la letra que contiene.
    $('#ranura-consonante').addEventListener('click', () => {
      if (!formar.consonante) return;
      sonidos.pop(); rebotar($('#ranura-consonante'));
      voz.hablar(`La letra ${pronunciarNombre(formar.consonante.nombre)}`, { rate: 0.85 });
    });
    $('#ranura-vocal').addEventListener('click', () => {
      if (!formar.vocal) return;
      sonidos.pop(); rebotar($('#ranura-vocal'));
      voz.hablar(`La vocal ${pronunciar(formar.vocal)}`, { rate: 0.85 });
    });
  },

  elegirConsonante(c, boton) {
    sonidos.pop();
    formar.consonante = c;
    document.querySelectorAll('.consonante').forEach((b) => b.classList.remove('seleccionada'));
    boton.classList.add('seleccionada'); rebotar(boton);
    const ranura = $('#ranura-consonante');
    ranura.dataset.vacia = 'false'; ranura.style.background = c.color;
    ranura.querySelector('.letra').textContent = c.letra;
    $('#nombre-consonante').textContent = c.nombre;
    // Algunas consonantes solo se juntan con ciertas vocales (la "q" con e/i).
    document.querySelectorAll('.vocal').forEach((b) => {
      b.classList.toggle('deshabilitada', !!c.soloCon && !c.soloCon.includes(b.dataset.vocal));
    });
    if (formar.vocal && c.soloCon && !c.soloCon.includes(formar.vocal)) formar.quitarVocal();
    // Siempre se dice el nombre de la letra; si ya hay vocal, después suena la sílaba.
    if (formar.vocal) formar.combinar({ anunciarLetra: true });
    else { $('#pista').textContent = 'Ahora toca una vocal 🎈'; voz.hablar(pronunciarNombre(c.nombre)); }
  },

  elegirVocal(v, boton) {
    sonidos.pop();
    formar.vocal = v;
    document.querySelectorAll('.vocal').forEach((b) => b.classList.remove('seleccionada'));
    boton.classList.add('seleccionada'); rebotar(boton);
    const ranura = $('#ranura-vocal');
    ranura.dataset.vacia = 'false';
    ranura.querySelector('.letra').textContent = v;
    $('#nombre-vocal').textContent = 'vocal';
    if (formar.consonante) formar.combinar();
    else { $('#pista').textContent = 'Ahora toca una consonante 🎈'; voz.silaba(v); }
  },

  quitarVocal() {
    formar.vocal = null;
    document.querySelectorAll('.vocal').forEach((b) => b.classList.remove('seleccionada'));
    const ranura = $('#ranura-vocal');
    ranura.dataset.vacia = 'true'; ranura.querySelector('.letra').textContent = '';
    $('#nombre-vocal').textContent = '';
  },

  combinar({ anunciarLetra = false } = {}) {
    const silaba = formarSilaba(formar.consonante.letra, formar.vocal);
    formar.silaba = silaba;
    const res = $('#resultado');
    res.classList.remove('listo'); void res.offsetWidth; res.classList.add('listo');
    res.querySelector('.letra').textContent = silaba;
    const datos = PALABRAS[silaba];
    const cajaPalabra = $('#palabra');
    if (datos) {
      const [palabra, emoji] = datos;
      $('#palabra-emoji').textContent = emoji;
      const inicio = palabra.startsWith(silaba) ? silaba : '';
      $('#palabra-texto').innerHTML = inicio
        ? `<b>${caso.mostrar(inicio)}</b>${caso.mostrar(palabra.slice(inicio.length))}`
        : caso.mostrar(palabra);
      cajaPalabra.hidden = false; $('#btn-palabra').hidden = false;
    } else {
      cajaPalabra.hidden = true; $('#btn-palabra').hidden = true;
    }
    $('#botones-tarjeta').hidden = false;
    $('#pista').textContent = '¡Escucha! Prueba con otra vocal 🎉';
    confeti(18);
    escribe.fijarSilaba(silaba);
    if (anunciarLetra) voz.hablar(`${pronunciarNombre(formar.consonante.nombre)}. ${pronunciar(silaba)}`, { rate: 0.85 });
    else formar.decir(0.85);
  },

  // Vacía las dos casillas para volver a explorar letras sueltas.
  limpiar() {
    formar.consonante = null; formar.silaba = null;
    formar.quitarVocal();
    document.querySelectorAll('.consonante').forEach((b) => b.classList.remove('seleccionada'));
    document.querySelectorAll('.vocal').forEach((b) => b.classList.remove('deshabilitada'));
    const ranura = $('#ranura-consonante');
    ranura.dataset.vacia = 'true'; ranura.style.background = '';
    ranura.querySelector('.letra').textContent = ''; $('#nombre-consonante').textContent = '';
    const res = $('#resultado'); res.classList.remove('listo'); res.querySelector('.letra').textContent = '?';
    $('#palabra').hidden = true; $('#botones-tarjeta').hidden = true;
    $('#pista').textContent = 'Toca una consonante 👇';
  },

  decir(rate) {
    if (!formar.silaba) return;
    voz.silaba(formar.silaba, { rate });
  },

  // Deletrea: nombre de la letra, la vocal y cómo suenan juntas.
  decirLetras() {
    if (!formar.silaba) return;
    const nombre = pronunciarNombre(formar.consonante.nombre);
    voz.hablar(`${nombre}. ${pronunciar(formar.vocal)}. ${pronunciar(formar.silaba)}`, { rate: 0.75 });
  },

  decirPalabra() {
    const datos = PALABRAS[formar.silaba]; if (!datos) return;
    voz.hablar(`${pronunciar(formar.silaba)}... ${datos[0]}`, { rate: 0.8 });
  },
};

function rebotar(el) {
  el.classList.remove('saltito'); void el.offsetWidth; el.classList.add('saltito');
}

/* =========================================================
   PANTALLA: ADIVINA (escucha y elige)
   ========================================================= */
const TODAS_LAS_SILABAS = [];
CONSONANTES.forEach((c) => {
  VOCALES.forEach((v) => {
    if (c.soloCon && !c.soloCon.includes(v)) return;
    TODAS_LAS_SILABAS.push({ silaba: formarSilaba(c.letra, v), consonante: c, vocal: v });
  });
});

const adivina = {
  objetivo: null,
  racha: 0,
  bloqueado: false,
  iniciado: false,

  iniciar() {
    $('#btn-repetir').addEventListener('click', () => adivina.decirObjetivo());
  },

  entrar() {
    if (!adivina.iniciado) { adivina.iniciado = true; adivina.nuevaRonda(); }
  },

  nuevaRonda() {
    adivina.bloqueado = false;
    adivina.objetivo = azar(TODAS_LAS_SILABAS);
    const { objetivo } = adivina;
    // Distractores parecidos: misma consonante u otra vocal, para afinar el oído.
    const parecidos = TODAS_LAS_SILABAS.filter((s) =>
      s.silaba !== objetivo.silaba && (s.consonante === objetivo.consonante || s.vocal === objetivo.vocal));
    const opciones = mezclar([objetivo, ...mezclar(parecidos).slice(0, 2)]);
    const cont = $('#opciones'); cont.innerHTML = '';
    opciones.forEach((op) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'opcion'; b.style.setProperty('--c', op.consonante.color);
      b.innerHTML = `<span class="letra">${op.silaba}</span>`;
      b.addEventListener('click', () => adivina.responder(op, b));
      cont.appendChild(b);
    });
    adivina.pintarRacha();
    setTimeout(() => adivina.decirObjetivo(), 400);
  },

  decirObjetivo() {
    if (!adivina.objetivo) return;
    const btn = $('#btn-repetir');
    btn.classList.add('sonando');
    voz.silaba(adivina.objetivo.silaba, { rate: 0.8, alTerminar: () => btn.classList.remove('sonando') });
  },

  responder(op, boton) {
    if (adivina.bloqueado) return;
    if (op.silaba === adivina.objetivo.silaba) {
      adivina.bloqueado = true;
      boton.classList.add('correcta');
      sonidos.acierto(); confeti(40);
      adivina.racha += 1; estrellas.sumar(1);
      $('#mascota').classList.add('saltando');
      setTimeout(() => $('#mascota').classList.remove('saltando'), 700);
      voz.hablar(`${azar(FELICITACIONES)} ${pronunciar(op.silaba)}`, { rate: 0.95 });
      setTimeout(() => adivina.nuevaRonda(), 1700);
    } else {
      sonidos.error();
      boton.classList.add('incorrecta'); boton.disabled = true;
      adivina.racha = 0; adivina.pintarRacha();
      voz.hablar('Casi. Escucha otra vez', { rate: 0.95, alTerminar: () => adivina.decirObjetivo() });
    }
  },

  pintarRacha() {
    $('#racha').textContent = adivina.racha ? '⭐'.repeat(Math.min(adivina.racha, 10)) : '';
  },
};

/* =========================================================
   PANTALLA: ESCRIBE (repasar la sílaba con el dedo)
   ========================================================= */
const escribe = {
  silaba: 'ma',
  color: '#e8590c',
  lienzo: null, ctx: null,
  trazos: [],        // puntos normalizados (0..1) para que sobrevivan a cambios de tamaño
  dibujando: false,

  iniciar() {
    escribe.lienzo = $('#lienzo');
    escribe.ctx = escribe.lienzo.getContext('2d');
    const l = escribe.lienzo;
    l.addEventListener('pointerdown', escribe.empezar);
    l.addEventListener('pointermove', escribe.mover);
    l.addEventListener('pointerup', escribe.terminar);
    l.addEventListener('pointercancel', escribe.terminar);
    $('#btn-borrar').addEventListener('click', () => { sonidos.pop(); escribe.trazos = []; escribe.pintar(); });
    $('#btn-otra').addEventListener('click', () => { sonidos.pop(); escribe.fijarSilaba(azar(TODAS_LAS_SILABAS).silaba); voz.silaba(escribe.silaba, { rate: 0.8 }); });
    $('#btn-oir-trazo').addEventListener('click', () => voz.silaba(escribe.silaba, { rate: 0.8 }));
    document.querySelectorAll('.crayon').forEach((c) => {
      c.addEventListener('click', () => {
        sonidos.pop();
        document.querySelectorAll('.crayon').forEach((x) => x.classList.remove('activo'));
        c.classList.add('activo'); escribe.color = c.dataset.color;
      });
    });
    // El lienzo se adapta al espacio disponible (ancho completo, alto restante).
    new ResizeObserver(() => escribe.ajustarTamano()).observe($('#lienzo-envoltura'));
    escribe.ajustarTamano();
  },

  ajustarTamano() {
    const caja = $('#lienzo-envoltura');
    const ancho = caja.clientWidth, alto = caja.clientHeight;
    if (!ancho || !alto) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    escribe.lienzo.width = Math.round(ancho * dpr);
    escribe.lienzo.height = Math.round(alto * dpr);
    escribe.pintar();
  },

  fijarSilaba(silaba) {
    escribe.silaba = silaba; escribe.trazos = []; escribe.pintar();
  },

  punto(ev) {
    const r = escribe.lienzo.getBoundingClientRect();
    return { x: (ev.clientX - r.left) / r.width, y: (ev.clientY - r.top) / r.height };
  },

  empezar(ev) {
    ev.preventDefault();
    escribe.lienzo.setPointerCapture(ev.pointerId);
    escribe.dibujando = true;
    escribe.trazos.push({ color: escribe.color, puntos: [escribe.punto(ev)] });
    escribe.pintar();
  },
  mover(ev) {
    if (!escribe.dibujando) return;
    ev.preventDefault();
    escribe.trazos[escribe.trazos.length - 1].puntos.push(escribe.punto(ev));
    escribe.pintar();
  },
  terminar() {
    if (!escribe.dibujando) return;
    escribe.dibujando = false;
    const ultimo = escribe.trazos[escribe.trazos.length - 1];
    if (ultimo && ultimo.puntos.length > 8) { tono(700 + Math.random() * 300, 0.08, 'triangle', 0.15); }
  },

  pintarGuia() {
    if (!escribe.ctx) return;
    const { ctx, lienzo } = escribe;
    const W = lienzo.width, H = lienzo.height;
    const texto = caso.mostrar(escribe.silaba);
    const fuente = getComputedStyle(document.body).fontFamily;
    // La letra se hace tan grande como quepa: 88% del ancho y 70% del alto.
    let tam = Math.floor(H * 0.7);
    ctx.font = `700 ${tam}px ${fuente}`;
    while (ctx.measureText(texto).width > W * 0.88 && tam > 20) {
      tam -= Math.max(2, Math.floor(tam * 0.04)); ctx.font = `700 ${tam}px ${fuente}`;
    }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    const cx = W / 2, cy = H / 2 + tam * 0.06;
    // Letra hueca con borde punteado, como en los cuadernos de caligrafía.
    ctx.fillStyle = '#f1f3f5';
    ctx.fillText(texto, cx, cy);
    ctx.setLineDash([tam * 0.05, tam * 0.04]); ctx.lineWidth = Math.max(2, tam * 0.02); ctx.strokeStyle = '#adb5bd';
    ctx.strokeText(texto, cx, cy);
    ctx.setLineDash([]);
    // Líneas de cuaderno: base y guía superior
    ctx.strokeStyle = '#ffe8a3'; ctx.lineWidth = Math.max(2, H * 0.006);
    [cy + tam * 0.36, cy - tam * 0.36].forEach((y) => {
      ctx.beginPath(); ctx.moveTo(W * 0.04, y); ctx.lineTo(W * 0.96, y); ctx.stroke();
    });
  },

  pintar() {
    const { ctx, lienzo } = escribe;
    if (!ctx || !lienzo.width) return;
    const W = lienzo.width, H = lienzo.height;
    ctx.clearRect(0, 0, W, H);
    escribe.pintarGuia();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(10, Math.min(W, H) * 0.07);
    escribe.trazos.forEach((t) => {
      ctx.strokeStyle = t.color; ctx.beginPath();
      t.puntos.forEach((p, i) => (i ? ctx.lineTo(p.x * W, p.y * H) : ctx.moveTo(p.x * W, p.y * H)));
      if (t.puntos.length === 1) ctx.lineTo(t.puntos[0].x * W + 0.1, t.puntos[0].y * H);
      ctx.stroke();
    });
  },
};

/* =========================================================
   NAVEGACIÓN ENTRE PANTALLAS
   ========================================================= */
document.querySelectorAll('.pestana').forEach((p) => {
  p.addEventListener('click', () => {
    sonidos.pop();
    document.querySelectorAll('.pestana').forEach((x) => x.classList.remove('activa'));
    document.querySelectorAll('.pantalla').forEach((x) => x.classList.remove('activa'));
    p.classList.add('activa');
    $(`#pantalla-${p.dataset.pantalla}`).classList.add('activa');
    if (p.dataset.pantalla === 'adivina') adivina.entrar();
    if (p.dataset.pantalla === 'escribe') requestAnimationFrame(() => escribe.ajustarTamano());
  });
});

$('#mascota').addEventListener('click', () => {
  const m = $('#mascota');
  m.classList.add('saltando'); setTimeout(() => m.classList.remove('saltando'), 700);
  sonidos.acierto();
  voz.hablar('¡Hola! Vamos a jugar con las sílabas', { rate: 0.95 });
});

/* =========================================================
   PWA: service worker e instalación
   ========================================================= */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((e) => console.warn('SW no registrado', e));
  });
}

let eventoInstalar = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); eventoInstalar = e;
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'chip'; b.id = 'btn-instalar'; b.textContent = '📲 Instalar';
  b.addEventListener('click', async () => {
    if (!eventoInstalar) return;
    eventoInstalar.prompt();
    const { outcome } = await eventoInstalar.userChoice;
    if (outcome === 'accepted') b.remove();
    eventoInstalar = null;
  });
  $('.acciones').prepend(b);
});
window.addEventListener('appinstalled', () => { $('#btn-instalar')?.remove(); aviso('¡Listo! Ya está instalado 🎉'); });

/* =========================================================
   ARRANQUE
   ========================================================= */
formar.iniciar();
adivina.iniciar();
escribe.iniciar();
ajustes.iniciar();
caso.aplicar();
voz.cargar();
// Repintar la guía cuando la fuente web termine de cargar.
document.fonts?.ready.then(() => escribe.pintar());
window.addEventListener('orientationchange', () => setTimeout(() => escribe.ajustarTamano(), 300));
