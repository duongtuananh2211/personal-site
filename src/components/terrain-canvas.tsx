"use client";

import { useEffect, useRef } from "react";

// Nền địa hình dạng lưới, vẽ bằng WebGL thuần (không dùng thư viện).
// Độ cao và màu được tính trên GPU trong vertex shader, nên CPU gần như không tốn gì mỗi khung hình.
// Con trỏ chuột nhô lên một ngọn đồi màu hổ phách. Khi không có chuột, ngọn đồi tự trôi.

const SEG = 64;
const SIZE = 26;

const VERT = `
attribute vec2 a;
uniform mat4 vp;
uniform float t;
uniform vec2 mp;
varying vec3 vCol;
varying float vFog;
void main() {
  float zz = a.y + t * 1.2;
  float y = sin(a.x * .55 + t * .4) * cos(zz * .45) * .9 + sin(a.x * 1.2 - t * .3 + zz * .6) * .35;
  vec2 d = a - mp;
  float b = exp(-dot(d, d) / 4.5);
  y += b * 1.7;
  float k = min(1., b * 1.4);
  vCol = vec3(.27 + .73 * k, .89 - .18 * k, .78 - .5 * k);
  vec4 pos = vp * vec4(a.x, y - 2.3, a.y - 2., 1.);
  vFog = 1. - exp(-.045 * .045 * pos.w * pos.w);
  gl_Position = pos;
}`;

const FRAG = `
precision mediump float;
varying vec3 vCol;
varying float vFog;
void main() {
  float al = .55 * (1. - vFog);
  gl_FragColor = vec4(vCol * al, al);
}`;

type Vec3 = [number, number, number];

function perspective(fovy: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovy / 2);
  const o = new Float32Array(16);
  o[0] = f / aspect;
  o[5] = f;
  o[10] = (far + near) / (near - far);
  o[11] = -1;
  o[14] = (2 * far * near) / (near - far);
  return o;
}

function lookAt(eye: Vec3, center: Vec3, up: Vec3) {
  let zx = eye[0] - center[0];
  let zy = eye[1] - center[1];
  let zz = eye[2] - center[2];
  let l = Math.hypot(zx, zy, zz);
  zx /= l;
  zy /= l;
  zz /= l;
  let xx = up[1] * zz - up[2] * zy;
  let xy = up[2] * zx - up[0] * zz;
  let xz = up[0] * zy - up[1] * zx;
  l = Math.hypot(xx, xy, xz);
  xx /= l;
  xy /= l;
  xz /= l;
  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;
  const o = new Float32Array(16);
  o[0] = xx;
  o[1] = yx;
  o[2] = zx;
  o[4] = xy;
  o[5] = yy;
  o[6] = zy;
  o[8] = xz;
  o[9] = yz;
  o[10] = zz;
  o[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
  o[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
  o[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
  o[15] = 1;
  return o;
}

function multiply(a: Float32Array, b: Float32Array) {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
  }
  return o;
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

type Props = {
  /** false khi banner đã bị nội dung che hết: dừng vẽ để đỡ tốn pin. */
  active: boolean;
  className?: string;
};

export function TerrainCanvas({ active, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const syncRef = useRef<() => void>(() => {});

  useEffect(() => {
    activeRef.current = active;
    syncRef.current();
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Dựng toàn bộ tài nguyên GL và trả về hàm dọn dẹp.
    // Lưu ý: KHÔNG gọi loseContext() khi dọn. React StrictMode chạy effect hai lần trong lúc phát triển,
    // và getContext() sẽ trả lại đúng context đã bị "giết", làm canvas hỏng.
    const setup = (): (() => void) | null => {
      const gl = canvas.getContext("webgl", {
        antialias: true,
        alpha: true,
        premultipliedAlpha: true,
        powerPreference: "low-power",
      });
      // Không có WebGL: nền gradient CSS của .hero vẫn hiện.
      if (!gl || gl.isContextLost()) return null;

      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      const program = gl.createProgram();
      if (!vs || !fs || !program) return null;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
      gl.useProgram(program);

      // Lưới điểm (x, z) và các cạnh: ngang, dọc và một đường chéo mỗi ô.
      const stride = SEG + 1;
      const verts = new Float32Array(stride * stride * 2);
      for (let iy = 0; iy <= SEG; iy++) {
        for (let ix = 0; ix <= SEG; ix++) {
          const i = (iy * stride + ix) * 2;
          verts[i] = -SIZE / 2 + (SIZE * ix) / SEG;
          verts[i + 1] = -SIZE / 2 + (SIZE * iy) / SEG;
        }
      }
      const id = (ix: number, iy: number) => iy * stride + ix;
      const edges: number[] = [];
      for (let iy = 0; iy <= SEG; iy++)
        for (let ix = 0; ix < SEG; ix++) edges.push(id(ix, iy), id(ix + 1, iy));
      for (let ix = 0; ix <= SEG; ix++)
        for (let iy = 0; iy < SEG; iy++) edges.push(id(ix, iy), id(ix, iy + 1));
      for (let iy = 0; iy < SEG; iy++)
        for (let ix = 0; ix < SEG; ix++) edges.push(id(ix, iy + 1), id(ix + 1, iy));

      const vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
      const ibo = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(edges), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(program, "a");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const uVP = gl.getUniformLocation(program, "vp");
      const uT = gl.getUniformLocation(program, "t");
      const uMP = gl.getUniformLocation(program, "mp");

      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);

      const ptr = { x: 0, y: 0, tx: 0, ty: 0, at: -1e9 };
      let proj = perspective((45 * Math.PI) / 180, 1, 0.1, 100);

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        const w = Math.max(2, Math.round(canvas.clientWidth * dpr));
        const h = Math.max(2, Math.round(canvas.clientHeight * dpr));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        gl.viewport(0, 0, w, h);
        proj = perspective((45 * Math.PI) / 180, w / h, 0.1, 100);
      };

      const draw = (ms: number) => {
        const t = ms / 1000;
        const hasPointer = performance.now() - ptr.at < 2500;
        if (!hasPointer) {
          ptr.tx = Math.sin(t * 0.25) * 0.45;
          ptr.ty = Math.cos(t * 0.2) * 0.3;
        }
        ptr.x += (ptr.tx - ptr.x) * 0.05;
        ptr.y += (ptr.ty - ptr.y) * 0.05;
        const view = lookAt([ptr.x * 1.2, 1.8, 7], [0, -1.2, -6], [0, 1, 0]);
        gl.uniformMatrix4fv(uVP, false, multiply(proj, view));
        gl.uniform1f(uT, t);
        gl.uniform2f(uMP, ptr.x * 9, -ptr.y * 5 - 2);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawElements(gl.LINES, edges.length, gl.UNSIGNED_SHORT, 0);
      };

      let raf = 0;
      let running = false;
      const loop = (ms: number) => {
        if (!running) return;
        draw(ms);
        raf = requestAnimationFrame(loop);
      };
      const sync = () => {
        const should = !reduce && activeRef.current && !document.hidden;
        if (should && !running) {
          running = true;
          raf = requestAnimationFrame(loop);
        } else if (!should && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      };
      syncRef.current = sync;

      const onPointer = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        const r = canvas.getBoundingClientRect();
        ptr.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
        ptr.ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
        ptr.at = performance.now();
      };
      const ro = new ResizeObserver(() => {
        resize();
        if (!running) draw(reduce ? 3000 : performance.now());
      });

      resize();
      draw(reduce ? 3000 : performance.now());
      ro.observe(canvas);
      window.addEventListener("pointermove", onPointer);
      document.addEventListener("visibilitychange", sync);
      sync();

      return () => {
        running = false;
        cancelAnimationFrame(raf);
        syncRef.current = () => {};
        ro.disconnect();
        window.removeEventListener("pointermove", onPointer);
        document.removeEventListener("visibilitychange", sync);
        gl.deleteBuffer(vbo);
        gl.deleteBuffer(ibo);
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
      };
    };

    let teardown = setup();

    // Trình duyệt (nhất là trên điện thoại) có thể thu hồi context WebGL khi thiếu bộ nhớ.
    // Chặn hành vi mặc định để được báo khi có thể dùng lại, rồi dựng lại từ đầu.
    const onLost = (e: Event) => {
      e.preventDefault();
      teardown?.();
      teardown = null;
    };
    const onRestored = () => {
      teardown?.();
      teardown = setup();
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    return () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      teardown?.();
      teardown = null;
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
