import { VOCALES, CONSONANTES, PALABRAS, FELICITACIONES, formarSilaba } from './data.js';

const $ = (sel) => document.querySelector(sel);
const azar = (lista) => lista[Math.floor(Math.random() * lista.length)];
const mezclar = (lista) => lista.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);

/* =========================================================
   VOZ (Web Speech API)
   ========================================================= */
const voz = {
  voces: [],
  avisado: false,
  cargar() {
    if (!('speechSynthesis' in window)) return;
    const todas = speechSynthesis.getVoices();
    const prioridad = ['es-MX', 'es-US', 'es-419', 'es-CO', 'es-AR', 'es-ES'];
    const enEspanol = todas.filter((v) => v.lang && v.lang.toLowerCase().startsWith('es'));
    enEspanol.sort((a, b) => {
      const ia = prioridad.indexOf(a.lang.replace('_', '-')); const ib = prioridad.indexOf(b.lang.replace('_', '-'));
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    voz.voces = enEspanol;
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
    if (voz.voces[0]) { u.voice = voz.voces[0]; u.lang = voz.voces[0].lang; } else { u.lang = 'es-ES'; }
    u.rate = rate; u.pitch = pitch; u.volume = 1;
    if (alTerminar) { u.onend = alTerminar; u.onerror = alTerminar; }
    // Pequeña espera: algunos navegadores ignoran el "speak" justo después del "cancel".
    setTimeout(() => speechSynthesis.speak(u), 40);
  },
};
if ('speechSynthesis' in window) {
  voz.cargar();
  speechSynthesis.addEventListener('voiceschanged', voz.cargar);
}

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
  },

  elegirConsonante(c, boton) {
    sonidos.pop();
    formar.consonante = c;
    document.querySelectorAll('.consonante').forEach((b) => b.classList.remove('seleccionada'));
    boton.classList.add('seleccionada'); rebotar(boton);
    const ranura = $('#ranura-consonante');
    ranura.dataset.vacia = 'false'; ranura.style.background = c.color;
    ranura.querySelector('.letra').textContent = c.letra;
    // Algunas consonantes solo se juntan con ciertas vocales (la "q" con e/i).
    document.querySelectorAll('.vocal').forEach((b) => {
      b.classList.toggle('deshabilitada', !!c.soloCon && !c.soloCon.includes(b.dataset.vocal));
    });
    if (formar.vocal && c.soloCon && !c.soloCon.includes(formar.vocal)) formar.quitarVocal();
    if (formar.vocal) formar.combinar();
    else { $('#pista').textContent = 'Ahora toca una vocal 🎈'; voz.hablar(c.nombre); }
  },

  elegirVocal(v, boton) {
    sonidos.pop();
    formar.vocal = v;
    document.querySelectorAll('.vocal').forEach((b) => b.classList.remove('seleccionada'));
    boton.classList.add('seleccionada'); rebotar(boton);
    const ranura = $('#ranura-vocal');
    ranura.dataset.vacia = 'false';
    ranura.querySelector('.letra').textContent = v;
    if (formar.consonante) formar.combinar();
    else { $('#pista').textContent = 'Ahora toca una consonante 🎈'; voz.hablar(v); }
  },

  quitarVocal() {
    formar.vocal = null;
    document.querySelectorAll('.vocal').forEach((b) => b.classList.remove('seleccionada'));
    const ranura = $('#ranura-vocal');
    ranura.dataset.vacia = 'true'; ranura.querySelector('.letra').textContent = '';
  },

  combinar() {
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
    formar.decir(0.85);
  },

  decir(rate) {
    if (!formar.silaba) return;
    voz.hablar(formar.silaba, { rate });
  },

  decirPalabra() {
    const datos = PALABRAS[formar.silaba]; if (!datos) return;
    voz.hablar(`${formar.silaba}... ${datos[0]}`, { rate: 0.8 });
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
    voz.hablar(adivina.objetivo.silaba, { rate: 0.8, alTerminar: () => btn.classList.remove('sonando') });
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
      voz.hablar(`${azar(FELICITACIONES)} ${op.silaba}`, { rate: 0.95 });
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
  trazos: [],
  dibujando: false,

  iniciar() {
    escribe.lienzo = $('#lienzo');
    escribe.ctx = escribe.lienzo.getContext('2d');
    const l = escribe.lienzo;
    l.addEventListener('pointerdown', escribe.empezar);
    l.addEventListener('pointermove', escribe.mover);
    l.addEventListener('pointerup', escribe.terminar);
    l.addEventListener('pointercancel', escribe.terminar);
    l.addEventListener('pointerleave', escribe.terminar);
    $('#btn-borrar').addEventListener('click', () => { sonidos.pop(); escribe.trazos = []; escribe.pintar(); });
    $('#btn-otra').addEventListener('click', () => { sonidos.pop(); escribe.fijarSilaba(azar(TODAS_LAS_SILABAS).silaba); voz.hablar(escribe.silaba, { rate: 0.8 }); });
    $('#btn-oir-trazo').addEventListener('click', () => voz.hablar(escribe.silaba, { rate: 0.8 }));
    document.querySelectorAll('.crayon').forEach((c) => {
      c.addEventListener('click', () => {
        sonidos.pop();
        document.querySelectorAll('.crayon').forEach((x) => x.classList.remove('activo'));
        c.classList.add('activo'); escribe.color = c.dataset.color;
      });
    });
    escribe.pintar();
  },

  fijarSilaba(silaba) {
    escribe.silaba = silaba; escribe.trazos = []; escribe.pintar();
  },

  punto(ev) {
    const r = escribe.lienzo.getBoundingClientRect();
    return { x: (ev.clientX - r.left) * (escribe.lienzo.width / r.width), y: (ev.clientY - r.top) * (escribe.lienzo.height / r.height) };
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
    const texto = caso.mostrar(escribe.silaba);
    let tam = 230;
    ctx.font = `700 ${tam}px ${getComputedStyle(document.body).fontFamily}`;
    while (ctx.measureText(texto).width > lienzo.width * 0.85 && tam > 60) {
      tam -= 10; ctx.font = `700 ${tam}px ${getComputedStyle(document.body).fontFamily}`;
    }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    // Letra hueca con borde punteado, como en los cuadernos de caligrafía.
    ctx.fillStyle = '#f1f3f5';
    ctx.fillText(texto, lienzo.width / 2, lienzo.height / 2 + tam * 0.06);
    ctx.setLineDash([10, 8]); ctx.lineWidth = 4; ctx.strokeStyle = '#adb5bd';
    ctx.strokeText(texto, lienzo.width / 2, lienzo.height / 2 + tam * 0.06);
    ctx.setLineDash([]);
    // Línea base de escritura
    ctx.strokeStyle = '#ffe8a3'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(30, lienzo.height * 0.82); ctx.lineTo(lienzo.width - 30, lienzo.height * 0.82); ctx.stroke();
  },

  pintar() {
    const { ctx, lienzo } = escribe;
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);
    escribe.pintarGuia();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 26;
    escribe.trazos.forEach((t) => {
      ctx.strokeStyle = t.color; ctx.beginPath();
      t.puntos.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      if (t.puntos.length === 1) ctx.lineTo(t.puntos[0].x + 0.1, t.puntos[0].y);
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
    if (p.dataset.pantalla === 'escribe') escribe.pintar();
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
caso.aplicar();
// Repintar la guía cuando la fuente web termine de cargar.
document.fonts?.ready.then(() => escribe.pintar());
