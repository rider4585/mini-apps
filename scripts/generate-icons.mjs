import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

// ---- PNG encoder (no deps) ----
const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function encodePng(size, rgba) {
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

// ---- design ----
const STOPS = [
  [0.0, [79, 70, 229]],   // indigo-600
  [0.45, [124, 58, 237]], // violet-600
  [0.78, [168, 85, 247]], // purple-500
  [1.0, [192, 38, 211]]   // fuchsia-600
];

function gradientAt(t) {
  for (let i = 1; i < STOPS.length; i++) {
    if (t <= STOPS[i][0]) {
      const [t0, c0] = STOPS[i - 1];
      const [t1, c1] = STOPS[i];
      const k = (t - t0) / (t1 - t0);
      return c0.map((v, j) => Math.round(v + (c1[j] - v) * k));
    }
  }
  return STOPS[STOPS.length - 1][1];
}

function insideTriangle(px, py, a, b, c) {
  const sign = (x1, y1, x2, y2, x, y) => (x - x2) * (y1 - y2) - (x1 - x2) * (y - y2);
  const d1 = sign(px, py, a[0], a[1], b[0], b[1]);
  const d2 = sign(px, py, b[0], b[1], c[0], c[1]);
  const d3 = sign(px, py, c[0], c[1], a[0], a[1]);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

function renderIcon(size, rounded) {
  const rgba = Buffer.alloc(size * size * 4);
  const R = rounded ? size * 0.22 : size;
  const tip = [size * 0.5, size * 0.24];
  const bl = [size * 0.27, size * 0.56];
  const br = [size * 0.73, size * 0.56];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = Math.max((rounded ? R - x : 0), (rounded ? x - (size - 1 - R) : 0), 0);
      const dy = Math.max((rounded ? R - y : 0), (rounded ? y - (size - 1 - R) : 0), 0);
      if (Math.hypot(dx, dy) > R) continue;

      const cx = x + 0.5;
      const cy = y + 0.5;
      let col = gradientAt(y / (size - 1));
      if (insideTriangle(cx, cy, tip, bl, br)) col = [255, 255, 255];

      const i = (y * size + x) * 4;
      rgba[i] = col[0];
      rgba[i + 1] = col[1];
      rgba[i + 2] = col[2];
      rgba[i + 3] = 255;
    }
  }
  return rgba;
}

function write(name, size, rounded) {
  writeFileSync(join(outDir, name), encodePng(size, renderIcon(size, rounded)));
  console.log("wrote", name);
}

write("icon-192.png", 192, true);
write("icon-512.png", 512, true);
write("icon-512-maskable.png", 512, false);
write("apple-touch-icon.png", 180, true);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4F46E5"/>
      <stop offset="0.45" stop-color="#7C3AED"/>
      <stop offset="0.78" stop-color="#A855F7"/>
      <stop offset="1" stop-color="#C026D3"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  <path d="M256 123 L138 287 L166 287 L256 171 L346 287 L374 287 Z" fill="#fff"/>
</svg>`;
writeFileSync(join(outDir, "favicon.svg"), svg);
console.log("wrote favicon.svg");
console.log("icons ->", outDir);