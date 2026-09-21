# Mis Sílabas 🦉

PWA en español para niños de 4 a 6 años que están aprendiendo a leer y escribir.
El niño junta consonantes con vocales, escucha cómo suena la sílaba, ve una palabra
de ejemplo con su dibujo, arma palabras completas encajando sílabas (incluidas las
que terminan en consonante), adivina sílabas de oído y las repasa con el dedo.

Sin frameworks ni paso de build: HTML, CSS y JavaScript puro. Funciona sin internet
una vez instalada.

## Pantallas

| Pestaña | Qué hace |
| --- | --- |
| 🧩 **Formar** | Toca una consonante y una vocal. Se forma la sílaba, se lee en voz alta y aparece una palabra con emoji (MA → MAMÁ 👩). Botones para oírla normal, despacio o con la palabra completa. |
| 📝 **Palabras** | Aparece un dibujo y un hueco por sílaba: el niño arma la palabra tocando las sílabas en orden (🦀 → CAN + GRE + JO). El banco trae sílabas de sobra como distractores. |
| 🎧 **Adivina** | La app dice una sílaba y el niño elige entre tres tarjetas parecidas. Gana estrellas ⭐ y confeti al acertar. |
| ✍️ **Escribe** | La sílaba (o una palabra corta) aparece punteada a pantalla completa, como en un cuaderno de caligrafía, y el niño la repasa con el dedo usando crayones de colores. |

Detalles pensados para su edad:

- Botones grandes, colores vivos, sonidos y animaciones en cada toque.
- Botón **Aa** para alternar entre MAYÚSCULAS y minúsculas.
- Debajo de cada letra aparece su nombre ("eme", "pe"); al tocar la casilla lo dice en voz alta, y el botón **🔤 Letras** deletrea: "eme, a, ma".
- La **q** solo se combina con **e/i** (que, qui), como en español.
- Las estrellas se guardan en el dispositivo.

En **Palabras** el banco arranca con palabras de una y dos sílabas y va soltando
las de tres y cuatro conforme el niño acierta. Ahí entran las **sílabas cerradas
o inversas**, las que terminan en consonante (SOL, PAN, CAR-TA, PAS-TEL, ÁR-BOL,
MON-TA-ÑA), que es el paso siguiente a consonante + vocal. Cada sílaba lleva el
color de su consonante inicial, así la misma letra siempre se reconoce igual.
Los botones leen la palabra entera (**🔊 Escuchar**), la deletrean sílaba a
sílaba (**🐢 Sílabas**), resaltan y dicen la que toca ahora (**💡 Pista**) o
devuelven la última al banco (**⬅️ Quitar**). Al completarla, esa palabra queda
lista para repasarla en **Escribe**.

## Voz

Usa la Web Speech API del navegador y elige siempre una voz en **español**.
Prefiere automáticamente las voces femeninas y de mejor calidad (Paulina, Mónica,
Sabina, las "mejoradas" de iOS, etc.) y evita las masculinas graves. Con el botón
**🎤** de la cabecera se puede escuchar y elegir otra voz; la elección se guarda.

Las sílabas se envían al lector con la vocal acentuada y una "h" muda al final
("páh", "sáh", "núh"): así Safari no las confunde con abreviaturas ("pa" → "por
autorización", "sa" → "sábado") y pronuncia la vocal completa. La "y" se escribe
con "ll" para la voz ("lláh"), porque la "y" suelta la lee como "i griega". Todo
esto está en `pronunciar()` dentro de `data.js`, donde se pueden añadir excepciones.
Las sílabas cerradas ("pan", "sol", "car") solo llevan la tilde, sin la "h": la
consonante final ya marca el golpe de voz y evita que se lean como abreviatura.

Si el dispositivo no tiene ninguna voz en español instalada, conviene añadirla:

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
data.js               Consonantes, vocales, palabras de ejemplo y palabras partidas en sílabas
sw.js                 Service worker (caché para uso sin conexión)
manifest.webmanifest  Manifiesto de la PWA
icons/                Íconos (generados con scripts/make-icons.js)
```

Para regenerar los íconos: `node scripts/make-icons.js`.
