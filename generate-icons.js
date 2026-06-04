import fs from 'fs';
import sharp from 'sharp';

const bgSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#0a0a0a"/>
</svg>`;

const fgSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <circle cx="512" cy="512" r="340" fill="#facc15" />
  <text x="512" y="650" font-family="sans-serif" font-weight="bold" font-size="400" fill="#0a0a0a" text-anchor="middle">B</text>
</svg>`;

const iconSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#0a0a0a"/>
  <!-- Circle -->
  <circle cx="512" cy="512" r="340" fill="#facc15" />
  <!-- Text B -->
  <text x="512" y="650" font-family="sans-serif" font-weight="bold" font-size="400" fill="#0a0a0a" text-anchor="middle">B</text>
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
      
    await sharp(Buffer.from(iconSvg))
      .png()
      .toFile('assets/splash.png');
      
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
