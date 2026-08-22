const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const srcIcon = path.join(rootDir, 'assets', 'Icon.png');
const iconsDir = path.join(rootDir, 'src-tauri', 'icons');
const publicDir = path.join(rootDir, 'public');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

if (fs.existsSync(srcIcon)) {
  console.log(`Found source icon at ${srcIcon}, generating optimized multi-resolution PNGs...`);
  try {
    execSync(`convert "${srcIcon}" -resize 32x32 "${path.join(iconsDir, '32x32.png')}"`);
    execSync(`convert "${srcIcon}" -resize 128x128 "${path.join(iconsDir, '128x128.png')}"`);
    execSync(`convert "${srcIcon}" -resize 256x256 "${path.join(iconsDir, '128x128@2x.png')}"`);
    execSync(`convert "${srcIcon}" -resize 512x512 "${path.join(iconsDir, 'icon.png')}"`);
    execSync(`convert "${srcIcon}" -resize 512x512 "${path.join(publicDir, 'icon.png')}"`);
    execSync(`convert "${srcIcon}" -resize 32x32 "${path.join(publicDir, 'favicon.png')}"`);
    execSync(`convert "${srcIcon}" -resize 64x64 "${path.join(publicDir, 'favicon.ico')}"`);
    console.log('✅ Successfully generated Tauri desktop and Web icons from assets/Icon.png');
    process.exit(0);
  } catch (err) {
    console.warn('ImageMagick convert failed, falling back to manual copy...', err);
  }
}
