const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const srcIcon = path.join(rootDir, 'assets', 'Icon.png');
const iconsDir = path.join(rootDir, 'src-tauri', 'icons');
const publicDir = path.join(rootDir, 'public');
const srcAssetsDir = path.join(rootDir, 'src', 'assets');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(srcAssetsDir)) {
  fs.mkdirSync(srcAssetsDir, { recursive: true });
}

if (fs.existsSync(srcIcon)) {
  console.log(`Processing source icon from ${srcIcon}...`);

  // Copy to web assets
  fs.copyFileSync(srcIcon, path.join(srcAssetsDir, 'Icon.png'));
  fs.copyFileSync(srcIcon, path.join(publicDir, 'Icon.png'));
  fs.copyFileSync(srcIcon, path.join(publicDir, 'icon.png'));

  // Run official Tauri CLI icon builder
  try {
    console.log('Generating multi-platform Tauri icons using @tauri-apps/cli...');
    execSync(`npx @tauri-apps/cli icon "${srcIcon}" --output "${iconsDir}"`, { stdio: 'inherit' });
    console.log('✅ Tauri icon bundle generation complete.');
  } catch (err) {
    console.warn('Tauri icon CLI failed, falling back to convert:', err.message);
    try {
      execSync(`convert "${srcIcon}" -resize 32x32 "${path.join(iconsDir, '32x32.png')}"`);
      execSync(`convert "${srcIcon}" -resize 64x64 "${path.join(iconsDir, '64x64.png')}"`);
      execSync(`convert "${srcIcon}" -resize 128x128 "${path.join(iconsDir, '128x128.png')}"`);
      execSync(`convert "${srcIcon}" -resize 256x256 "${path.join(iconsDir, '128x128@2x.png')}"`);
      execSync(`convert "${srcIcon}" -resize 512x512 "${path.join(iconsDir, 'icon.png')}"`);
    } catch (e) {
      console.error('Fallback convert failed:', e.message);
    }
  }

  // Generate web favicons
  try {
    execSync(`convert "${srcIcon}" -resize 32x32 "${path.join(publicDir, 'favicon.png')}"`);
    execSync(`convert "${srcIcon}" -resize 64x64 "${path.join(publicDir, 'favicon.ico')}"`);
  } catch (_) {
    fs.copyFileSync(srcIcon, path.join(publicDir, 'favicon.png'));
  }

  console.log('✅ Successfully processed and updated all application icons from assets/Icon.png');
} else {
  console.error(`Error: Source icon not found at ${srcIcon}`);
  process.exit(1);
}
