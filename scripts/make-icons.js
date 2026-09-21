// Genera los íconos PNG de la PWA sin dependencias externas.
// Uso: node scripts/make-icons.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(tipo, datos) {
  const len = Buffer.alloc(4); len.writeUInt32BE(datos.length);
  const td = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(ancho, alto, pixeles) {
  const filas = Buffer.alloc((ancho * 4 + 1) * alto);
  for (let y = 0; y < alto; y++) {
    filas[y * (ancho * 4 + 1)] = 0;
    pixeles.copy(filas, y * (ancho * 4 + 1) + 1, y * ancho * 4, (y + 1) * ancho * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0); ihdr.writeUInt32BE(alto, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(filas, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]);
}

const mezclar = (a, b, t) => a + (b - a) * t;
const suave = (d) => Math.max(0, Math.min(1, 0.5 - d)); // cobertura antialias según distancia (px)
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

function dibujar(tam, maskable) {
  const px = Buffer.alloc(tam * tam * 4);
  const s = tam / 64; // todo se define en un lienzo de 64x64
  const c1 = hex('#6c5ce7'), c2 = hex('#fd79a8'), blanco = [255, 255, 255], tinta = [45, 52, 54], rosa = [253, 121, 168];
  const radioEsquina = maskable ? 0 : 14 * s;
  const escalaCara = maskable ? 0.8 : 1; // zona segura para íconos enmascarables
  const cx = tam / 2, cy = tam / 2;
  const sdfRect = (x, y) => {
    const dx = Math.abs(x - cx) - (tam / 2 - radioEsquina), dy = Math.abs(y - cy) - (tam / 2 - radioEsquina);
    return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - radioEsquina;
  };
  const circulo = (x, y, ox, oy, r) => Math.hypot(x - cx - ox * s * escalaCara, y - cy - oy * s * escalaCara) - r * s * escalaCara;
  for (let y = 0; y < tam; y++) for (let x = 0; x < tam; x++) {
    const X = x + 0.5, Y = y + 0.5;
    let a = maskable ? 1 : suave(sdfRect(X, Y));
    let t = (X + Y) / (2 * tam);
    let col = [mezclar(c1[0], c2[0], t), mezclar(c1[1], c2[1], t), mezclar(c1[2], c2[2], t)];
    const pintar = (color, cobertura) => { col = col.map((v, i) => mezclar(v, color[i], cobertura)); };
    pintar(blanco, suave(circulo(X, Y, 0, 0, 20)));
    pintar(rosa, suave(circulo(X, Y, -12, 4, 2.5)) * 0.7);
    pintar(rosa, suave(circulo(X, Y, 12, 4, 2.5)) * 0.7);
    pintar(tinta, suave(circulo(X, Y, -7, -3, 3.5)));
    pintar(tinta, suave(circulo(X, Y, 7, -3, 3.5)));
    // Sonrisa: anillo inferior de un círculo
    const rx = (X - cx) / (s * escalaCara), ry = (Y - cy) / (s * escalaCara);
    const ang = Math.atan2(ry - 2, rx);
    let dSonrisa = Math.abs(Math.hypot(rx, ry - 2) - 9) - 1.5;
    if (ang < 0.55 || ang > Math.PI - 0.55) {
      // Extremos redondeados de la sonrisa
      const ex = 9 * Math.cos(0.55), ey = 2 + 9 * Math.sin(0.55);
      dSonrisa = Math.min(Math.hypot(rx - ex, ry - ey), Math.hypot(rx + ex, ry - ey)) - 1.5;
    }
    pintar(tinta, suave(dSonrisa * s * escalaCara));
    const i = (y * tam + x) * 4;
    px[i] = Math.round(col[0]); px[i + 1] = Math.round(col[1]); px[i + 2] = Math.round(col[2]); px[i + 3] = Math.round(a * 255);
  }
  return png(tam, tam, px);
}

const salida = path.join(__dirname, '..', 'public', 'icons');
fs.writeFileSync(path.join(salida, 'icon-192.png'), dibujar(192, false));
fs.writeFileSync(path.join(salida, 'icon-512.png'), dibujar(512, false));
fs.writeFileSync(path.join(salida, 'icon-maskable-512.png'), dibujar(512, true));
console.log('Íconos generados en', salida);
