import fs from 'fs';
import sharp from 'sharp';

// BioCore App-Icon: gelbes Hexagon ("Core") mit Puls-Linie auf dunklem Grund.
// Farben passend zur App: Hintergrund #0a0a0a, Akzent #facc15 (Gelb).

const BG_DARK = '#0a0a0a';
const BG_DARK_SOFT = '#1c1c1c';
const ACCENT = '#facc15';

// Logo-Artwork (Hexagon + Puls), zentriert in einer 1024er-Box.
// Hexagon (flat-top) um (512,512), Radius 330; Puls-Linie verbindet
// den linken und rechten Eckpunkt.
const logoArt = `
  <polygon points="842,512 677,226.2 347,226.2 182,512 347,797.8 677,797.8"
    fill="none" stroke="${ACCENT}" stroke-width="46" stroke-linejoin="round" />
  <polyline points="182,512 408,512 462,512 510,366 562,658 608,458 644,512 842,512"
    fill="none" stroke="${ACCENT}" stroke-width="38"
    stroke-linecap="round" stroke-linejoin="round" />
`;

const backgroundGradient = `
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="75%">
      <stop offset="0%" stop-color="${BG_DARK_SOFT}" />
      <stop offset="100%" stop-color="${BG_DARK}" />
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)" />
`;

// Vollflaechiges App-Icon (Legacy-Launcher, Favicon, PWA).
const iconSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  ${backgroundGradient}
  <g transform="translate(512 512) scale(0.82) translate(-512 -512)">${logoArt}</g>
</svg>`;

// Adaptive-Icon-Hintergrund (Android 8+).
const bgSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  ${backgroundGradient}
</svg>`;

// Adaptive-Icon-Vordergrund: Logo verkleinert in der sicheren Zone,
// da Android den Rand fuer Masken und Parallax-Effekte beschneidet.
const fgSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(512 512) scale(0.7) translate(-512 -512)">${logoArt}</g>
</svg>`;

// Splash-Screen (2732x2732, von @capacitor/assets fuer alle Dichten skaliert).
const splashSvg = `<svg width="2732" height="2732" viewBox="0 0 2732 2732" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="46%" r="70%">
      <stop offset="0%" stop-color="${BG_DARK_SOFT}" />
      <stop offset="100%" stop-color="${BG_DARK}" />
    </radialGradient>
  </defs>
  <rect width="2732" height="2732" fill="url(#bg)" />
  <g transform="translate(1366 1366) scale(0.55) translate(-512 -512)">${logoArt}</g>
</svg>`;

async function generate() {
  try {
    if (!fs.existsSync('assets')) {
      fs.mkdirSync('assets');
    }
    await sharp(Buffer.from(bgSvg))
      .png()
      .toFile('assets/icon-background.png');

    await sharp(Buffer.from(fgSvg))
      .png()
      .toFile('assets/icon-foreground.png');

    await sharp(Buffer.from(iconSvg))
      .png()
      .toFile('assets/icon.png');

    await sharp(Buffer.from(splashSvg))
      .png()
      .toFile('assets/splash.png');

    await sharp(Buffer.from(splashSvg))
      .png()
      .toFile('assets/splash-dark.png');

    await sharp(Buffer.from(iconSvg))
      .resize(512, 512)
      .png()
      .toFile('public/app_icon.png');

    console.log('PNG generated successfully');
  } catch (error) {
    console.error('Error generating PNG:', error);
    process.exit(1);
  }
}

generate();
