// one-off: produces an Apple-icon-style PNG for the marka.md README
//   bun run scripts/make-readme-icon.mjs
//
// composites the marka.md mascot onto a soft warm-white squircle with a
// subtle peach drop-shadow. result lands at ../mdview/assets/readme-icon.png

import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { mkdir } from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SIZE = 640;
const CORNER = Math.round(SIZE * 0.22);
const PAD = Math.round(SIZE * 0.16);
const LOGO_SIZE = SIZE - PAD * 2;

const sitePublic = path.resolve(__dirname, "..", "public");
const mascotPath = path.join(sitePublic, "mascot", "logo.png");

const outDir = path.resolve(__dirname, "..", "..", "mdview", "assets");
const outPath = path.join(outDir, "readme-icon.png");

const bgSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <defs>
    <radialGradient id="g" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="55%" stop-color="#fff3eb"/>
      <stop offset="100%" stop-color="#fbe2cd"/>
    </radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}"
    rx="${CORNER}" ry="${CORNER}"
    fill="url(#g)"/>
  <rect x="2" y="2" width="${SIZE - 4}" height="${SIZE - 4}"
    rx="${CORNER - 2}" ry="${CORNER - 2}"
    fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2"/>
</svg>`;

const shadowSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <defs>
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="22"/>
    </filter>
  </defs>
  <rect x="${PAD * 0.7}" y="${PAD * 0.8}"
    width="${SIZE - PAD * 1.4}" height="${SIZE - PAD * 1.4}"
    rx="${CORNER}" ry="${CORNER}"
    fill="rgba(226,114,46,0.35)" filter="url(#s)"/>
</svg>`;

await mkdir(outDir, { recursive: true });

const logo = await sharp(mascotPath)
  .resize(LOGO_SIZE, LOGO_SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toBuffer();

const finalBuffer = await sharp(Buffer.from(shadowSvg))
  .composite([
    { input: Buffer.from(bgSvg), top: 0, left: 0 },
    { input: logo, top: PAD, left: PAD },
  ])
  .png({ compressionLevel: 9 })
  .toBuffer();

await sharp(finalBuffer).toFile(outPath);

console.log(`✓ wrote ${outPath} (${(finalBuffer.length / 1024).toFixed(0)} KB)`);
