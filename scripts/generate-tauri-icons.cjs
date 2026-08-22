const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Precomputed CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c >>> 0;
}

function calculateCrc(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(typeStr, dataBuf) {
  const len = dataBuf.length;
  const typeBuf = Buffer.from(typeStr, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, dataBuf]);
  const crc = calculateCrc(typeAndData);

  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  typeBuf.copy(chunk, 4);
  dataBuf.copy(chunk, 8);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function generatePng(width, height) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR (13 bytes)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // Color type 6 = RGBA
  ihdrData[10] = 0; // Compression (deflate)
  ihdrData[11] = 0; // Filter method
  ihdrData[12] = 0; // Interlace (none)
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw RGBA scanlines with filter byte 0
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(rowBytes * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        const ratio = (x + y) / (width + height);
        // Modern Sky-to-Indigo DiskLens Theme
        rawData[pxOffset] = Math.round(14 + (99 - 14) * ratio);     // R: #0ea5e9 -> #6366f1
        rawData[pxOffset + 1] = Math.round(165 + (102 - 165) * ratio); // G
        rawData[pxOffset + 2] = Math.round(233 + (241 - 233) * ratio); // B
        rawData[pxOffset + 3] = 255; // Alpha
      } else {
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0; // Transparent
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.join(__dirname, '..', 'src-tauri', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate all standard icon resolutions
const png32 = generatePng(32, 32);
const png128 = generatePng(128, 128);
const png256 = generatePng(256, 256);
const png512 = generatePng(512, 512);

fs.writeFileSync(path.join(iconsDir, '32x32.png'), png32);
fs.writeFileSync(path.join(iconsDir, '128x128.png'), png128);
fs.writeFileSync(path.join(iconsDir, '128x128@2x.png'), png256);
fs.writeFileSync(path.join(iconsDir, 'icon.png'), png512);

console.log('✅ Standard compliant Tauri PNG icons successfully generated:');
console.log(' - 32x32.png: ' + png32.length + ' bytes');
console.log(' - 128x128.png: ' + png128.length + ' bytes');
console.log(' - 128x128@2x.png: ' + png256.length + ' bytes');
console.log(' - icon.png: ' + png512.length + ' bytes');
