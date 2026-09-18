# Mis Sílabas 🦉

PWA en español para niños de 4 a 6 años que están aprendiendo a leer y escribir.
El niño junta consonantes con vocales, escucha cómo suena la sílaba, ve una palabra
de ejemplo con su dibujo, adivina sílabas de oído y las repasa con el dedo.

Sin frameworks ni paso de build: HTML, CSS y JavaScript puro. Funciona sin internet
una vez instalada.

## Pantallas

| Pestaña | Qué hace |
| --- | --- |
| 🧩 **Formar** | Toca una consonante y una vocal. Se forma la sílaba, se lee en voz alta y aparece una palabra con emoji (MA → MAMÁ 👩). Botones para oírla normal, despacio o con la palabra completa. |
| 🎧 **Adivina** | La app dice una sílaba y el niño elige entre tres tarjetas parecidas. Gana estrellas ⭐ y confeti al acertar. |
| ✍️ **Escribe** | La sílaba aparece punteada como en un cuaderno de caligrafía y el niño la repasa con el dedo usando crayones de colores. |

Detalles pensados para su edad:

- Botones grandes, colores vivos, sonidos y animaciones en cada toque.
- Botón **Aa** para alternar entre MAYÚSCULAS y minúsculas.
- La **q** solo se combina con **e/i** (que, qui) y la **z** con **a/o/u**, como en español.
- Las estrellas se guardan en el dispositivo.

## Voz

Usa la Web Speech API del navegador y elige siempre una voz en **español**
(prioriza es-MX, es-US y es-419, luego es-ES). Si el dispositivo no tiene ninguna
voz en español instalada, conviene añadirla:

- **Android**: Ajustes → Sistema → Idioma → Salida de texto a voz → Motor de Google → instalar datos de voz en español.
- **iOS/iPadOS**: Ajustes → Accesibilidad → Contenido leído → Voces → Español.
- **Windows**: Configuración → Hora e idioma → Voz → Agregar voces → Español.

## Probar en local

```bash
npx serve .
# o
python3 -m http.server 8080
```

Abre `http://localhost:8080`. El service worker se registra en `localhost` sin HTTPS.

## Publicar e instalar como app

La PWA necesita HTTPS para poder instalarse. El repositorio incluye un workflow
(`.github/workflows/pages.yml`) que publica la carpeta raíz en **GitHub Pages** en
cada push a `main`. Solo hay que activar Pages en *Settings → Pages → Source: GitHub Actions*.

Luego, desde el celular o tablet:

- **Android (Chrome)**: aparece el botón **📲 Instalar** en la cabecera, o menú ⋮ → *Instalar app*.
- **iPhone/iPad (Safari)**: botón Compartir → *Añadir a pantalla de inicio*.

## Estructura

```
index.html            Pantallas y navegación
styles.css            Estilos (tema colorido, responsive, tablet)
app.js                Lógica: voz, sonidos, juego, lienzo, PWA
data.js               Consonantes, vocales y palabras de ejemplo
sw.js                 Service worker (caché para uso sin conexión)
manifest.webmanifest  Manifiesto de la PWA
icons/                Íconos (generados con scripts/make-icons.js)
```

Para regenerar los íconos: `node scripts/make-icons.js`.
