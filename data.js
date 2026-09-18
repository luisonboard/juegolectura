// Datos del juego: consonantes, vocales y palabras de ejemplo por sílaba.
// Todo en vocabulario sencillo y familiar para niños de habla hispana.

export const VOCALES = ['a', 'e', 'i', 'o', 'u'];

// Cada consonante tiene un nombre (para pronunciar la letra), un color propio
// y, si aplica, las vocales con las que puede combinarse.
export const CONSONANTES = [
  { letra: 'm', nombre: 'eme', color: '#ff6b6b' },
  { letra: 'p', nombre: 'pe', color: '#ffa94d' },
  { letra: 's', nombre: 'ese', color: '#ffd43b' },
  { letra: 'l', nombre: 'ele', color: '#69db7c' },
  { letra: 't', nombre: 'te', color: '#38d9a9' },
  { letra: 'n', nombre: 'ene', color: '#4dabf7' },
  { letra: 'd', nombre: 'de', color: '#748ffc' },
  { letra: 'b', nombre: 'be', color: '#da77f2' },
  { letra: 'c', nombre: 'ce', color: '#f783ac' },
  { letra: 'f', nombre: 'efe', color: '#ff8787' },
  { letra: 'g', nombre: 'ge', color: '#ffc078' },
  { letra: 'j', nombre: 'jota', color: '#a9e34b' },
  { letra: 'r', nombre: 'erre', color: '#3bc9db' },
  { letra: 'v', nombre: 'uve', color: '#9775fa' },
  { letra: 'z', nombre: 'zeta', color: '#e599f7' },
  { letra: 'h', nombre: 'hache', color: '#63e6be' },
  { letra: 'ñ', nombre: 'eñe', color: '#ffe066' },
  { letra: 'y', nombre: 'i griega', color: '#74c0fc' },
  { letra: 'll', nombre: 'elle', color: '#b197fc' },
  { letra: 'ch', nombre: 'che', color: '#ff922b' },
  { letra: 'q', nombre: 'cu', color: '#20c997', soloCon: ['e', 'i'] },
  { letra: 'k', nombre: 'ka', color: '#94d82d' },
];

// Cómo se escribe la sílaba resultante (la "q" siempre lleva "u").
export function formarSilaba(consonante, vocal) {
  if (consonante === 'q') return 'qu' + vocal;
  return consonante + vocal;
}

// Texto que se envía al sintetizador de voz para que lea la sílaba como tal.
// Los lectores de voz (sobre todo en iPhone) confunden las sílabas sueltas con
// abreviaturas: "pa" → "por autorización", "sá" → "sábado". Para evitarlo se
// acentúa la vocal (suena completa) y se añade una "h" final, que en español es
// muda pero impide que el texto coincida con alguna abreviatura.
const TILDES = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' };
// Casos especiales: la "y" suelta se lee como "i griega", así que se escribe con
// "ll", que suena igual en las voces en español (yeísmo).
const EXCEPCIONES = { ya: 'lláh', ye: 'lléh', yi: 'llíh', yo: 'yo', yu: 'llúh' };
export function pronunciar(silaba) {
  if (EXCEPCIONES[silaba]) return EXCEPCIONES[silaba];
  const ultima = silaba[silaba.length - 1];
  return TILDES[ultima] ? silaba.slice(0, -1) + TILDES[ultima] + 'h' : silaba;
}

// Nombre de la letra tal como debe leerlo la voz (los nombres de dos letras
// también se protegen para que no se lean como abreviaturas).
export function pronunciarNombre(nombre) {
  return nombre.length <= 2 ? pronunciar(nombre) : nombre;
}

// Palabra de ejemplo + emoji para cada sílaba (clave = sílaba escrita).
export const PALABRAS = {
  ma: ['mamá', '👩'], me: ['mesa', '🍽️'], mi: ['miel', '🍯'], mo: ['mono', '🐵'], mu: ['muñeca', '🪆'],
  pa: ['papá', '👨'], pe: ['pelota', '⚽'], pi: ['piña', '🍍'], po: ['pollo', '🐥'], pu: ['puerta', '🚪'],
  sa: ['sapo', '🐸'], se: ['semáforo', '🚦'], si: ['silla', '🪑'], so: ['sol', '☀️'], su: ['sushi', '🍣'],
  la: ['lápiz', '✏️'], le: ['león', '🦁'], li: ['limón', '🍋'], lo: ['lobo', '🐺'], lu: ['luna', '🌙'],
  ta: ['taza', '☕'], te: ['tele', '📺'], ti: ['tigre', '🐯'], to: ['tomate', '🍅'], tu: ['tucán', '🦜'],
  na: ['nariz', '👃'], ne: ['nene', '👶'], ni: ['nido', '🪺'], no: ['noche', '🌃'], nu: ['nube', '☁️'],
  da: ['dado', '🎲'], de: ['dedo', '☝️'], di: ['dinosaurio', '🦖'], do: ['dona', '🍩'], du: ['ducha', '🚿'],
  ba: ['barco', '⛵'], be: ['bebé', '👶'], bi: ['bicicleta', '🚲'], bo: ['bota', '👢'], bu: ['búho', '🦉'],
  ca: ['casa', '🏠'], ce: ['cebolla', '🧅'], ci: ['cine', '🎬'], co: ['cometa', '🪁'], cu: ['cubo', '🧊'],
  fa: ['familia', '👨‍👩‍👧'], fe: ['feliz', '😊'], fi: ['fiesta', '🎉'], fo: ['foca', '🦭'], fu: ['fuego', '🔥'],
  ga: ['gato', '🐱'], ge: ['gemelos', '👯'], gi: ['girasol', '🌻'], go: ['gorro', '🧢'], gu: ['gusano', '🐛'],
  ja: ['jamón', '🍖'], je: ['jefe', '🧑‍💼'], ji: ['jirafa', '🦒'], jo: ['joya', '💎'], ju: ['jugo', '🧃'],
  ra: ['rana', '🐸'], re: ['regalo', '🎁'], ri: ['río', '🏞️'], ro: ['rosa', '🌹'], ru: ['rueda', '🛞'],
  va: ['vaca', '🐮'], ve: ['vela', '🕯️'], vi: ['violín', '🎻'], vo: ['volcán', '🌋'], vu: ['vuelo', '✈️'],
  za: ['zapato', '👟'], zo: ['zorro', '🦊'], zu: ['zumbido', '🐝'],
  ha: ['hada', '🧚'], he: ['helado', '🍦'], hi: ['hipopótamo', '🦛'], ho: ['hoja', '🍃'], hu: ['huevo', '🥚'],
  ña: ['ñam ñam', '😋'], ñu: ['ñu', '🐃'],
  ya: ['yate', '🛥️'], ye: ['yema', '🍳'], yo: ['yogur', '🥛'], yu: ['yuca', '🍠'],
  lla: ['llave', '🔑'], lle: ['lleno', '🥤'], llo: ['llorar', '😢'], llu: ['lluvia', '🌧️'],
  cha: ['chocolate', '🍫'], che: ['chef', '🧑‍🍳'], chi: ['chile', '🌶️'], cho: ['chorizo', '🌭'], chu: ['churros', '🥖'],
  que: ['queso', '🧀'], qui: ['quince', '🔢'],
  ka: ['karate', '🥋'], ki: ['kiwi', '🥝'], ko: ['koala', '🐨'],
};

// Frases de ánimo que se dicen en voz alta al acertar.
export const FELICITACIONES = [
  '¡Muy bien!', '¡Excelente!', '¡Genial!', '¡Lo lograste!', '¡Eres una estrella!', '¡Bravo!', '¡Fantástico!',
];
