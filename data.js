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
  // Las que ya traen su propia tilde ("tén", "vión", "plá") se leen tal cual.
  if (/[áéíóú]/.test(silaba)) return silaba;
  // La última vocal es la que suena fuerte en una sílaba suelta.
  const partes = silaba.match(/^(.*)([aeiou])([^aeiou]*)$/);
  if (!partes) return silaba;
  const [, antes, vocal, despues] = partes;
  // Sílaba abierta ("ma", "llo"): tilde + "h" muda.
  if (!despues) return antes + TILDES[vocal] + 'h';
  // Sílaba cerrada ("pan", "sol", "car"): la consonante final ya evita que se
  // confunda con una vocal suelta, pero la tilde impide que se lea como
  // abreviatura ("pág.", "núm.") y marca bien el golpe de voz.
  return antes + TILDES[vocal] + despues;
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

/* =========================================================
   PALABRAS PARTIDAS EN SÍLABAS (pantalla "Palabras")
   =========================================================
   Cada palabra viene ya separada como se lee en voz alta. La lista mezcla
   sílabas abiertas ("ca-sa") con sílabas cerradas o inversas, las que terminan
   en consonante ("sol", "car-ta", "pas-tel", "ár-bol"), que son el siguiente
   paso después de dominar consonante + vocal.
   Están ordenadas de menos a más sílabas: la pantalla va soltando las largas
   a medida que el niño acierta. */
export const PALABRAS_SILABAS = [
  // Una sola sílaba, todas cerradas.
  { silabas: ['sol'], emoji: '☀️' },
  { silabas: ['pan'], emoji: '🍞' },
  { silabas: ['flor'], emoji: '🌸' },
  { silabas: ['mar'], emoji: '🌊' },
  { silabas: ['pez'], emoji: '🐟' },
  { silabas: ['luz'], emoji: '💡' },
  { silabas: ['sal'], emoji: '🧂' },
  { silabas: ['tren'], emoji: '🚂' },
  // Dos sílabas abiertas.
  { silabas: ['ma', 'má'], emoji: '👩' },
  { silabas: ['pa', 'pá'], emoji: '👨' },
  { silabas: ['ca', 'sa'], emoji: '🏠' },
  { silabas: ['ga', 'to'], emoji: '🐱' },
  { silabas: ['pe', 'rro'], emoji: '🐶' },
  { silabas: ['lu', 'na'], emoji: '🌙' },
  { silabas: ['me', 'sa'], emoji: '🍽️' },
  { silabas: ['pa', 'to'], emoji: '🦆' },
  { silabas: ['ra', 'na'], emoji: '🐸' },
  { silabas: ['fo', 'ca'], emoji: '🦭' },
  { silabas: ['va', 'ca'], emoji: '🐮' },
  { silabas: ['ta', 'za'], emoji: '☕' },
  { silabas: ['so', 'pa'], emoji: '🍲' },
  { silabas: ['pi', 'ña'], emoji: '🍍' },
  { silabas: ['si', 'lla'], emoji: '🪑' },
  { silabas: ['que', 'so'], emoji: '🧀' },
  { silabas: ['glo', 'bo'], emoji: '🎈' },
  { silabas: ['li', 'bro'], emoji: '📖' },
  { silabas: ['ti', 'gre'], emoji: '🐯' },
  { silabas: ['re', 'loj'], emoji: '⏰' },
  // Dos sílabas con alguna cerrada.
  { silabas: ['car', 'ta'], emoji: '✉️' },
  { silabas: ['cam', 'po'], emoji: '🏞️' },
  { silabas: ['bar', 'co'], emoji: '⛵' },
  { silabas: ['cas', 'co'], emoji: '⛑️' },
  { silabas: ['tam', 'bor'], emoji: '🥁' },
  { silabas: ['pas', 'tel'], emoji: '🎂' },
  { silabas: ['ár', 'bol'], emoji: '🌳' },
  { silabas: ['sar', 'tén'], emoji: '🍳' },
  { silabas: ['del', 'fín'], emoji: '🐬' },
  { silabas: ['jar', 'dín'], emoji: '🌷' },
  { silabas: ['a', 'vión'], emoji: '✈️' },
  { silabas: ['ca', 'mión'], emoji: '🚚' },
  { silabas: ['ra', 'tón'], emoji: '🐭' },
  { silabas: ['le', 'ón'], emoji: '🦁' },
  { silabas: ['me', 'lón'], emoji: '🍈' },
  // Tres sílabas.
  { silabas: ['za', 'pa', 'to'], emoji: '👟' },
  { silabas: ['pe', 'lo', 'ta'], emoji: '⚽' },
  { silabas: ['to', 'ma', 'te'], emoji: '🍅' },
  { silabas: ['plá', 'ta', 'no'], emoji: '🍌' },
  { silabas: ['ca', 'mi', 'sa'], emoji: '👕' },
  { silabas: ['ji', 'ra', 'fa'], emoji: '🦒' },
  { silabas: ['ti', 'je', 'ras'], emoji: '✂️' },
  { silabas: ['man', 'za', 'na'], emoji: '🍎' },
  { silabas: ['ven', 'ta', 'na'], emoji: '🪟' },
  { silabas: ['es', 'tre', 'lla'], emoji: '⭐' },
  { silabas: ['mon', 'ta', 'ña'], emoji: '⛰️' },
  { silabas: ['ser', 'pien', 'te'], emoji: '🐍' },
  { silabas: ['cas', 'ti', 'llo'], emoji: '🏰' },
  { silabas: ['can', 'gre', 'jo'], emoji: '🦀' },
  { silabas: ['cham', 'pi', 'ñón'], emoji: '🍄' },
  { silabas: ['pin', 'güi', 'no'], emoji: '🐧' },
  { silabas: ['hos', 'pi', 'tal'], emoji: '🏥' },
  { silabas: ['ca', 'ra', 'col'], emoji: '🐌' },
  { silabas: ['gi', 'ra', 'sol'], emoji: '🌻' },
  { silabas: ['co', 'ra', 'zón'], emoji: '❤️' },
  { silabas: ['cua', 'der', 'no'], emoji: '📒' },
  { silabas: ['pa', 'ra', 'guas'], emoji: '☔' },
  // Cuatro sílabas.
  { silabas: ['ma', 'ri', 'po', 'sa'], emoji: '🦋' },
  { silabas: ['e', 'le', 'fan', 'te'], emoji: '🐘' },
  { silabas: ['bi', 'ci', 'cle', 'ta'], emoji: '🚲' },
  { silabas: ['cho', 'co', 'la', 'te'], emoji: '🍫' },
  { silabas: ['es', 'ca', 'le', 'ra'], emoji: '🪜' },
  { silabas: ['se', 'má', 'fo', 'ro'], emoji: '🚦' },
  { silabas: ['ham', 'bur', 'gue', 'sa'], emoji: '🍔' },
];

// La palabra completa, tal como se escribe.
export const unirSilabas = (silabas) => silabas.join('');

// Color de una sílaba: el de su consonante inicial, para que la misma letra se
// reconozca siempre del mismo color. Si empieza por vocal ("es", "ár"), se usa
// el color de esa vocal.
const SIN_TILDE = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u' };
const COLOR_VOCAL = { a: '#fd79a8', e: '#fdcb6e', i: '#00cec9', o: '#0984e3', u: '#6c5ce7' };
export function colorSilaba(silaba) {
  const s = silaba.toLowerCase();
  const doble = CONSONANTES.find((c) => c.letra.length === 2 && s.startsWith(c.letra));
  if (doble) return doble.color;
  const simple = CONSONANTES.find((c) => c.letra === s[0]);
  if (simple) return simple.color;
  const vocal = s.match(/[aeiouáéíóúü]/);
  return (vocal && COLOR_VOCAL[SIN_TILDE[vocal[0]] || vocal[0]]) || '#6c5ce7';
}
