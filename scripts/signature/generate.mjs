// Sinh dữ liệu SVG cho hiệu ứng "bút viết" chữ ký.
// 1) Lấy đường viền chữ từ font  2) Raster hoá  3) Làm mảnh (Zhang-Suen) để lấy xương nét
// 4) Dò xương thành các nét, sắp theo thứ tự viết từ trái sang phải  5) Xuất module TS.
// Dùng (cần opentype.js, không nằm trong dependencies của dự án):
//   npm i --no-save opentype.js@1.3.4
//   node scripts/signature/generate.mjs KolkerBrush-Regular.ttf anhdt src/components/signature-data.ts \
//     --ductus scripts/signature/ductus-anhdt.json [--debug debug.html]
// Có --ductus: nét đi theo thứ tự và chiều viết khai báo trong file (giống người viết).
// Không có: tự đoán thứ tự từ trái sang phải (kém tự nhiên hơn).
// Font tải từ https://github.com/google/fonts/tree/main/ofl/kolkerbrush (giấy phép OFL).
import fs from "node:fs";
import opentype from "opentype.js";

const [fontFile, text, outFile, ...rest] = process.argv.slice(2);
const flag = (name) => {
  const k = rest.indexOf(name);
  return k >= 0 ? rest[k + 1] : undefined;
};
const ductusFile = flag("--ductus");
const debugFile = flag("--debug");
const font = opentype.loadSync(fontFile);
const SIZE = 400;
const PAD = 40;

// ---------- 1. Đường viền ----------
const raw = font.getPath(text, 0, 0, SIZE, { kerning: true });
const bb = raw.getBoundingBox();
const ox = PAD - bb.x1;
const oy = PAD - bb.y1;
const W = Math.ceil(bb.x2 - bb.x1 + PAD * 2);
const H = Math.ceil(bb.y2 - bb.y1 + PAD * 2);
const path = font.getPath(text, ox, oy, SIZE, { kerning: true });
const glyphD = path.toPathData(1);

// ---------- 2. Raster hoá (nonzero, quét theo hàng) ----------
const contours = [];
let cur = null;
let px = 0;
let py = 0;
for (const c of path.commands) {
  if (c.type === "M") {
    cur = [[c.x, c.y]];
    contours.push(cur);
  } else if (c.type === "L") cur.push([c.x, c.y]);
  else if (c.type === "Q") {
    for (let i = 1; i <= 10; i++) {
      const t = i / 10;
      const u = 1 - t;
      cur.push([u * u * px + 2 * u * t * c.x1 + t * t * c.x, u * u * py + 2 * u * t * c.y1 + t * t * c.y]);
    }
  } else if (c.type === "C") {
    for (let i = 1; i <= 12; i++) {
      const t = i / 12;
      const u = 1 - t;
      cur.push([
        u * u * u * px + 3 * u * u * t * c.x1 + 3 * u * t * t * c.x2 + t * t * t * c.x,
        u * u * u * py + 3 * u * u * t * c.y1 + 3 * u * t * t * c.y2 + t * t * t * c.y,
      ]);
    }
  }
  if (c.x !== undefined) {
    px = c.x;
    py = c.y;
  }
}
const segs = [];
for (const ct of contours) {
  for (let i = 0; i < ct.length; i++) {
    const a = ct[i];
    const b = ct[(i + 1) % ct.length];
    if (a[1] !== b[1]) segs.push([a, b]);
  }
}
let img = new Uint8Array(W * H);
for (let y = 0; y < H; y++) {
  const sy = y + 0.5;
  const xs = [];
  for (const [a, b] of segs) {
    const [y0, y1] = [a[1], b[1]];
    if ((sy >= y0 && sy < y1) || (sy >= y1 && sy < y0)) {
      const x = a[0] + ((sy - y0) / (y1 - y0)) * (b[0] - a[0]);
      xs.push([x, y1 > y0 ? 1 : -1]);
    }
  }
  xs.sort((p, q) => p[0] - q[0]);
  let wind = 0;
  for (let i = 0; i < xs.length - 1; i++) {
    wind += xs[i][1];
    if (wind !== 0) {
      for (let x = Math.ceil(xs[i][0] - 0.5); x < Math.ceil(xs[i + 1][0] - 0.5); x++) if (x >= 0 && x < W) img[y * W + x] = 1;
    }
  }
}

// Đóng kín vết xơ của nét bút lông (giãn rồi co) để xương nét không bị rách.
const morph = (src, r, dilate) => {
  const out = new Uint8Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let v = dilate ? 0 : 1;
      for (let dy = -r; dy <= r && v === (dilate ? 0 : 1); dy++)
        for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy > r * r) continue;
          const yy = y + dy;
          const xx = x + dx;
          const p = yy >= 0 && yy < H && xx >= 0 && xx < W ? src[yy * W + xx] : 0;
          if (dilate && p) {
            v = 1;
            break;
          }
          if (!dilate && !p) {
            v = 0;
            break;
          }
        }
      out[y * W + x] = v;
    }
  return out;
};
const CLOSE = 5;
img = morph(morph(img, CLOSE, true), CLOSE, false);

// Khoảng cách tới nền (để biết bề dày nét).
const dist = new Float32Array(W * H);
{
  const INF = 1e9;
  for (let i = 0; i < W * H; i++) dist[i] = img[i] ? INF : 0;
  const pass = (xs, ys, dirs) => {
    for (const y of ys)
      for (const x of xs) {
        const i = y * W + x;
        if (!img[i]) continue;
        for (const [dx, dy, w] of dirs) {
          const xx = x + dx;
          const yy = y + dy;
          const d = xx >= 0 && xx < W && yy >= 0 && yy < H ? dist[yy * W + xx] : 0;
          if (d + w < dist[i]) dist[i] = d + w;
        }
      }
  };
  const r = (n) => [...Array(n).keys()];
  pass(r(W), r(H), [[-1, 0, 1], [0, -1, 1], [-1, -1, 1.414], [1, -1, 1.414]]);
  pass(r(W).reverse(), r(H).reverse(), [[1, 0, 1], [0, 1, 1], [1, 1, 1.414], [-1, 1, 1.414]]);
}

// ---------- 3. Làm mảnh Zhang-Suen ----------
const sk = img.slice();
const at = (x, y) => (x >= 0 && x < W && y >= 0 && y < H ? sk[y * W + x] : 0);
for (let changed = true; changed; ) {
  changed = false;
  for (const step of [0, 1]) {
    const del = [];
    for (let y = 1; y < H - 1; y++)
      for (let x = 1; x < W - 1; x++) {
        if (!sk[y * W + x]) continue;
        const n = [at(x, y - 1), at(x + 1, y - 1), at(x + 1, y), at(x + 1, y + 1), at(x, y + 1), at(x - 1, y + 1), at(x - 1, y), at(x - 1, y - 1)];
        const B = n.reduce((s, v) => s + v, 0);
        if (B < 2 || B > 6) continue;
        let A = 0;
        for (let k = 0; k < 8; k++) if (!n[k] && n[(k + 1) % 8]) A++;
        if (A !== 1) continue;
        if (step === 0 && (n[0] * n[2] * n[4] || n[2] * n[4] * n[6])) continue;
        if (step === 1 && (n[0] * n[2] * n[6] || n[0] * n[4] * n[6])) continue;
        del.push(y * W + x);
      }
    for (const i of del) sk[i] = 0;
    if (del.length) changed = true;
  }
}

// ---------- 4. Dò xương thành đồ thị ----------
const N8 = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
const nb = (i) => {
  const x = i % W;
  const y = (i / W) | 0;
  const out = [];
  for (const [dx, dy] of N8) {
    if (!at(x + dx, y + dy)) continue;
    // Bỏ hàng xóm chéo nếu đã đi tới được qua một hàng xóm thẳng (bậc thang của nét mảnh).
    if (dx && dy && (at(x + dx, y) || at(x, y + dy))) continue;
    out.push((y + dy) * W + x + dx);
  }
  return out;
};
const isNode = (i) => nb(i).length !== 2;
const edgeKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
const usedEdge = new Set();
let branches = [];
const pixels = [];
for (let i = 0; i < W * H; i++) if (sk[i]) pixels.push(i);
const traceFrom = (start, next) => {
  const pts = [start, next];
  usedEdge.add(edgeKey(start, next));
  let prev = start;
  let c = next;
  while (!isNode(c)) {
    const nx = nb(c).find((p) => p !== prev && !usedEdge.has(edgeKey(c, p)));
    if (nx === undefined) break;
    usedEdge.add(edgeKey(c, nx));
    pts.push(nx);
    prev = c;
    c = nx;
    if (c === start) break;
  }
  return pts;
};
for (const i of pixels)
  if (isNode(i)) for (const n of nb(i)) if (!usedEdge.has(edgeKey(i, n))) branches.push(traceFrom(i, n));
// Vòng kín không có nút.
for (const i of pixels) for (const n of nb(i)) if (!usedEdge.has(edgeKey(i, n))) branches.push(traceFrom(i, n));

const len = (b) => {
  let s = 0;
  for (let k = 1; k < b.length; k++) {
    const dx = (b[k] % W) - (b[k - 1] % W);
    const dy = ((b[k] / W) | 0) - ((b[k - 1] / W) | 0);
    s += Math.hypot(dx, dy);
  }
  return s;
};
let maxR = 0;
for (const i of pixels) maxR = Math.max(maxR, dist[i]);

// Cắt gai: nhánh cụt ngắn hơn bề dày nét.
for (let round = 0; round < 4; round++) {
  const deg = new Map();
  for (const b of branches) for (const e of [b[0], b[b.length - 1]]) deg.set(e, (deg.get(e) || 0) + 1);
  const before = branches.length;
  branches = branches.filter((b) => {
    const a = b[0];
    const z = b[b.length - 1];
    const leaf = deg.get(a) === 1 || deg.get(z) === 1;
    const junction = (deg.get(a) || 0) >= 3 || (deg.get(z) || 0) >= 3;
    return !(leaf && junction && len(b) < Math.max(dist[a], dist[z], maxR * 0.6) * 1.6);
  });
  // Nối các nhánh còn 2 đầu sau khi cắt.
  for (let merged = true; merged; ) {
    merged = false;
    const d2 = new Map();
    for (const b of branches) for (const e of [b[0], b[b.length - 1]]) d2.set(e, (d2.get(e) || 0) + 1);
    for (const [node, d] of d2) {
      if (d !== 2) continue;
      const two = branches.filter((b) => b[0] === node || b[b.length - 1] === node);
      if (two.length !== 2 || two[0] === two[1]) continue;
      let [p, q] = two;
      if (p[0] === node) p = p.slice().reverse();
      if (q[q.length - 1] === node) q = q.slice().reverse();
      branches = branches.filter((b) => b !== two[0] && b !== two[1]);
      branches.push([...p, ...q.slice(1)]);
      merged = true;
      break;
    }
  }
  if (branches.length === before) break;
}
branches = branches.filter((b) => len(b) > 3);

// ---------- 5. Thứ tự viết ----------
const xy = (i) => [i % W, (i / W) | 0];
const minX = (b) => Math.min(...b.map((i) => i % W));
const dirAt = (b, fromStart) => {
  const k = Math.min(12, b.length - 1);
  const [x0, y0] = xy(fromStart ? b[0] : b[b.length - 1]);
  const [x1, y1] = xy(fromStart ? b[k] : b[b.length - 1 - k]);
  const l = Math.hypot(x1 - x0, y1 - y0) || 1;
  return [(x1 - x0) / l, (y1 - y0) / l];
};
let strokes = [];

// Theo ductus: bắt từng điểm mốc vào xương gần nhất, nối các mốc bằng đường ngắn nhất dọc theo xương.
if (ductusFile) {
  const skel = new Set();
  for (const b of branches) for (const i of b) skel.add(i);
  const skelList = [...skel];
  const snap = ([x, y]) => {
    let best = skelList[0];
    let bd = Infinity;
    for (const i of skelList) {
      const d = ((i % W) - x) ** 2 + (((i / W) | 0) - y) ** 2;
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    if (bd > 15 * 15) console.warn(`Điểm mốc [${x}, ${y}] cách xương ${Math.sqrt(bd).toFixed(1)} đơn vị, kiểm tra lại ductus.`);
    return best;
  };
  const route = (a, b) => {
    const prev = new Map([[a, -1]]);
    const queue = [a];
    for (let h = 0; h < queue.length && !prev.has(b); h++) {
      const c = queue[h];
      const x = c % W;
      const y = (c / W) | 0;
      for (const [dx, dy] of N8) {
        const n = (y + dy) * W + x + dx;
        if (skel.has(n) && !prev.has(n)) {
          prev.set(n, c);
          queue.push(n);
        }
      }
    }
    if (!prev.has(b)) throw new Error(`Không có đường dọc xương giữa hai điểm mốc (${a % W},${(a / W) | 0}) và (${b % W},${(b / W) | 0}).`);
    const path = [];
    for (let c = b; c !== -1; c = prev.get(c)) path.push(c);
    return path.reverse();
  };
  const spec = JSON.parse(fs.readFileSync(ductusFile, "utf8"));
  strokes = spec.strokes.map(({ points }) => {
    const snapped = points.map(snap);
    let line = [snapped[0]];
    for (let k = 1; k < snapped.length; k++) line = line.concat(route(snapped[k - 1], snapped[k]).slice(1));
    return line;
  });
}

const left = new Set(ductusFile ? [] : branches);
while (left.size) {
  // Nhấc bút: bắt đầu ở nhánh có điểm trái nhất, từ đầu bên trái.
  let b = [...left].sort((p, q) => minX(p) - minX(q))[0];
  if (b[0] % W > b[b.length - 1] % W) b = b.slice().reverse();
  left.delete(b);
  let stroke = b.slice();
  for (;;) {
    const end = stroke[stroke.length - 1];
    const d = dirAt(stroke, false).map((v) => -v);
    let best = null;
    let bestScore = -Infinity;
    for (const c of left) {
      for (const rev of [false, true]) {
        const cc = rev ? c.slice().reverse() : c;
        if (cc[0] !== end) continue;
        const e = dirAt(cc, true);
        const score = d[0] * e[0] + d[1] * e[1] - (minX(cc) - (end % W)) / 400;
        if (score > bestScore) {
          bestScore = score;
          best = [c, cc];
        }
      }
    }
    if (!best) break;
    left.delete(best[0]);
    stroke = stroke.concat(best[1].slice(1));
  }
  strokes.push(stroke);
}

// Làm mượt + giản lược (Ramer–Douglas–Peucker).
const rdp = (pts, eps) => {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let idx = 0;
  let dmax = 0;
  for (let k = 1; k < pts.length - 1; k++) {
    const [x, y] = pts[k];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const d = Math.abs((b[1] - a[1]) * x - (b[0] - a[0]) * y + b[0] * a[1] - b[1] * a[0]) / L;
    if (d > dmax) {
      dmax = d;
      idx = k;
    }
  }
  if (dmax <= eps) return [a, b];
  return rdp(pts.slice(0, idx + 1), eps).slice(0, -1).concat(rdp(pts.slice(idx), eps));
};
const smooth = (pts) => {
  const out = pts.map((p) => p.slice());
  for (let it = 0; it < 3; it++)
    for (let k = 1; k < out.length - 1; k++) {
      out[k][0] = (out[k - 1][0] + out[k][0] * 2 + out[k + 1][0]) / 4;
      out[k][1] = (out[k - 1][1] + out[k][1] * 2 + out[k + 1][1]) / 4;
    }
  return out;
};
const r1 = (v) => Math.round(v * 10) / 10;
const out = strokes.map((s) => {
  const pts = rdp(smooth(s.map(xy)), 0.8);
  let L = 0;
  for (let k = 1; k < pts.length; k++) L += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
  const d = pts.map((p, k) => `${k ? "L" : "M"}${r1(p[0])} ${r1(p[1])}`).join("");
  return { d, len: Math.round(L) };
}).filter((s) => s.len >= 12); // Bỏ vòng khép kín li ti: nét dài 0 với đầu bo tròn sẽ thành một chấm to.
// Ngòi bút vừa đủ phủ bề dày nét: rộng hơn thì lộ sớm phần chữ bên cạnh.
const strokeWidth = Math.ceil(maxR * 2 + 8);

const ts = `// File sinh tự động bởi scripts/signature/generate.mjs từ font Kolker Brush. Đừng sửa tay.
// Chữ "${text}": glyph là đường viền chữ thật; strokes là xương của từng nét, theo thứ tự viết.
export const signature = {
  viewBox: "0 0 ${W} ${H}",
  glyph: ${JSON.stringify(glyphD)},
  strokeWidth: ${strokeWidth},
  strokes: ${JSON.stringify(out, null, 2)},
} as const;
`;
fs.writeFileSync(outFile, ts);
console.log(`viewBox ${W}x${H}, strokes ${out.length}, lens ${out.map((s) => s.len).join(",")}, strokeWidth ${strokeWidth}, maxR ${maxR.toFixed(1)}`);

if (debugFile) {
  const colors = ["#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe"];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 1.5}" style="background:#061417">
<path d="${glyphD}" fill="#3a5a5a"/>
${out.map((s, k) => `<path d="${s.d}" fill="none" stroke="${colors[k % colors.length]}" stroke-width="3"/><text x="${s.d.split(/[ML ]/)[1]}" y="${s.d.split(/[ML ]/)[2]}" fill="#fff" font-size="16">${k}</text>`).join("\n")}
</svg>`;
  fs.writeFileSync(debugFile, `<!doctype html><body style="margin:0;background:#061417">${svg}</body>`);
}
