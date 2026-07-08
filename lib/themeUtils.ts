// ============================================================
// 主题动态效果高级绘图工具库
// Theme Dynamic Effects — Advanced Drawing Utilities
// ============================================================

// ---- Math Utilities ----

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function fract(x: number): number {
  return x - Math.floor(x);
}

// ---- Seeded Random ----

export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function hash11(n: number): number {
  return fract(Math.sin(n) * 43758.5453123);
}

export function hash21(x: number, y: number): number {
  return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453);
}

// ---- Noise Functions ----

export function noise1D(x: number): number {
  const i = Math.floor(x);
  const f = fract(x);
  const u = f * f * (3 - 2 * f);
  return lerp(hash11(i), hash11(i + 1), u);
}

export function noise2D(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = fract(x);
  const fy = fract(y);
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const a = hash21(ix, iy);
  const b = hash21(ix + 1, iy);
  const c = hash21(ix, iy + 1);
  const d = hash21(ix + 1, iy + 1);

  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy);
}

export function fbm2D(x: number, y: number, octaves: number = 4): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise2D(x * frequency, y * frequency);
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
}

// ---- Bezier Curves ----

export function bezierQuadratic(t: number, p0: number, p1: number, p2: number): number {
  const mt = 1 - t;
  return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2;
}

export function bezierCubic(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

export interface Point2D {
  x: number;
  y: number;
}

export function bezierCubicPoint(t: number, p0: Point2D, p1: Point2D, p2: Point2D, p3: Point2D): Point2D {
  return {
    x: bezierCubic(t, p0.x, p1.x, p2.x, p3.x),
    y: bezierCubic(t, p0.y, p1.y, p2.y, p3.y),
  };
}

// ---- Glow Effects ----

export function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  intensity: number = 1
): void {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  const alpha = Math.floor(intensity * 255)
    .toString(16)
    .padStart(2, '0');
  grad.addColorStop(0, color + alpha);
  grad.addColorStop(0.4, color + Math.floor(intensity * 120).toString(16).padStart(2, '0'));
  grad.addColorStop(1, color + '00');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

export function drawSoftGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  r: number,
  g: number,
  b: number,
  alpha: number
): void {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
  grad.addColorStop(0.5, `rgba(${r},${g},${b},${alpha * 0.3})`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

// ---- Light Shaft (Volumetric Light) ----

export function drawLightShaft(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number,
  color: string,
  alpha: number
): void {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / len;
  const ny = dx / len;

  const grad = ctx.createLinearGradient(
    x1 + nx * width, y1 + ny * width,
    x1 - nx * width, y1 - ny * width
  );
  grad.addColorStop(0, color + '00');
  grad.addColorStop(0.3, color + Math.floor(alpha * 40).toString(16).padStart(2, '0'));
  grad.addColorStop(0.5, color + Math.floor(alpha * 80).toString(16).padStart(2, '0'));
  grad.addColorStop(0.7, color + Math.floor(alpha * 40).toString(16).padStart(2, '0'));
  grad.addColorStop(1, color + '00');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(x1 + nx * width, y1 + ny * width);
  ctx.lineTo(x2 + nx * width * 0.3, y2 + ny * width * 0.3);
  ctx.lineTo(x2 - nx * width * 0.3, y2 - ny * width * 0.3);
  ctx.lineTo(x1 - nx * width, y1 - ny * width);
  ctx.closePath();
  ctx.fill();
}

// ---- Bubble with Highlight ----

export function drawBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  alpha: number
): void {
  // Main bubble body
  const bodyGrad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
  bodyGrad.addColorStop(0, `rgba(220, 245, 255, ${alpha * 0.15})`);
  bodyGrad.addColorStop(0.5, `rgba(180, 230, 255, ${alpha * 0.08})`);
  bodyGrad.addColorStop(0.8, `rgba(140, 210, 255, ${alpha * 0.04})`);
  bodyGrad.addColorStop(1, `rgba(100, 190, 255, ${alpha * 0.01})`);

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Thin rim
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(200, 240, 255, ${alpha * 0.25})`;
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Highlight
  const hlGrad = ctx.createRadialGradient(
    x - radius * 0.35, y - radius * 0.35, 0,
    x - radius * 0.35, y - radius * 0.35, radius * 0.35
  );
  hlGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.9})`);
  hlGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);

  ctx.beginPath();
  ctx.arc(x - radius * 0.35, y - radius * 0.35, radius * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = hlGrad;
  ctx.fill();
}

// ---- Petal with 3D Rotation ----

export function drawPetal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number,
  tilt: number,
  color: { r: number; g: number; b: number },
  alpha: number
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Apply tilt as scale compression (3D effect)
  const tiltScale = Math.abs(Math.cos(tilt));
  ctx.scale(1, tiltScale);

  // Petal shape using bezier curves
  ctx.beginPath();
  ctx.moveTo(0, -height * 0.5);
  ctx.bezierCurveTo(
    width * 0.5, -height * 0.3,
    width * 0.5, height * 0.3,
    0, height * 0.5
  );
  ctx.bezierCurveTo(
    -width * 0.5, height * 0.3,
    -width * 0.5, -height * 0.3,
    0, -height * 0.5
  );

  // Gradient for 3D volume
  const grad = ctx.createLinearGradient(0, -height * 0.5, 0, height * 0.5);
  grad.addColorStop(0, `rgba(${color.r + 20}, ${color.g + 20}, ${color.b + 20}, ${alpha})`);
  grad.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.9})`);
  grad.addColorStop(1, `rgba(${color.r - 10}, ${color.g - 10}, ${color.b - 10}, ${alpha * 0.7})`);

  ctx.fillStyle = grad;
  ctx.fill();

  // Subtle vein line
  ctx.beginPath();
  ctx.moveTo(0, -height * 0.4);
  ctx.lineTo(0, height * 0.4);
  ctx.strokeStyle = `rgba(${color.r - 30}, ${color.g - 30}, ${color.b - 30}, ${alpha * 0.3})`;
  ctx.lineWidth = 0.5;
  ctx.stroke();

  ctx.restore();
}

// ---- Irregular Light Spot (Dappled Light) ----

export function drawDappledSpot(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseRadius: number,
  color: { r: number; g: number; b: number },
  alpha: number,
  distortion: number = 0.3
): void {
  const points = 12;
  const angles: number[] = [];
  const radii: number[] = [];

  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    angles.push(angle);
    const dist = noise2D(cx * 0.01 + i * 0.5, cy * 0.01) * distortion;
    radii.push(baseRadius * (1 + dist));
  }

  ctx.beginPath();
  for (let i = 0; i <= points; i++) {
    const idx = i % points;
    const nextIdx = (i + 1) % points;
    const x = cx + Math.cos(angles[idx]) * radii[idx];
    const y = cy + Math.sin(angles[idx]) * radii[idx];

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      const prevX = cx + Math.cos(angles[idx]) * radii[idx];
      const prevY = cy + Math.sin(angles[idx]) * radii[idx];
      const nextX = cx + Math.cos(angles[nextIdx]) * radii[nextIdx];
      const nextY = cy + Math.sin(angles[nextIdx]) * radii[nextIdx];
      const cpX = (prevX + nextX) / 2;
      const cpY = (prevY + nextY) / 2;
      ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
    }
  }
  ctx.closePath();

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 1.2);
  grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
  grad.addColorStop(0.6, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.4})`);
  grad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

  ctx.fillStyle = grad;
  ctx.fill();
}

// ---- Mist / Fog Layer ----

export function drawMistLayer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  yOffset: number,
  driftSpeed: number,
  color: { r: number; g: number; b: number },
  maxAlpha: number
): void {
  const grad = ctx.createLinearGradient(0, yOffset, 0, yOffset + h * 0.4);
  const drift = Math.sin(t * driftSpeed) * 0.5 + 0.5;
  const alpha = maxAlpha * (0.6 + drift * 0.4);

  grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
  grad.addColorStop(0.3, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.3})`);
  grad.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
  grad.addColorStop(0.7, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.3})`);
  grad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

  ctx.fillStyle = grad;
  ctx.fillRect(0, yOffset, w, h * 0.4);
}

// ---- Star with Twinkle ----

export function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  baseRadius: number,
  twinklePhase: number,
  color: { r: number; g: number; b: number }
): void {
  const twinkle = Math.sin(twinklePhase) * 0.5 + 0.5;
  const radius = baseRadius * (0.7 + twinkle * 0.3);
  const alpha = 0.5 + twinkle * 0.5;

  // Core
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
  ctx.fill();

  // Glow
  const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
  glow.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.4})`);
  glow.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
  ctx.fill();

  // Cross flare for bright stars
  if (baseRadius > 1.5) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.3;
    ctx.strokeStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x - radius * 4, y);
    ctx.lineTo(x + radius * 4, y);
    ctx.moveTo(x, y - radius * 4);
    ctx.lineTo(x, y + radius * 4);
    ctx.stroke();
    ctx.restore();
  }
}

// ---- Shooting Star ----

export interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  length: number;
}

export function drawShootingStar(
  ctx: CanvasRenderingContext2D,
  star: ShootingStar,
  color: { r: number; g: number; b: number }
): void {
  const progress = 1 - star.life / star.maxLife;
  const alpha = Math.sin(progress * Math.PI) * 0.8;
  const tailX = star.x - star.vx * star.length;
  const tailY = star.y - star.vy * star.length;

  const grad = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
  grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
  grad.addColorStop(0.3, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.5})`);
  grad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

  ctx.strokeStyle = grad;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(star.x, star.y);
  ctx.lineTo(tailX, tailY);
  ctx.stroke();

  // Head glow
  const headGlow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 6);
  headGlow.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
  headGlow.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
  ctx.fillStyle = headGlow;
  ctx.beginPath();
  ctx.arc(star.x, star.y, 6, 0, Math.PI * 2);
  ctx.fill();
}

// ---- Ink Wash Cloud ----

export function drawInkWash(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  width: number,
  height: number,
  alpha: number,
  seed: number = 0
): void {
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height));
  grad.addColorStop(0, `rgba(30, 30, 30, ${alpha})`);
  grad.addColorStop(0.5, `rgba(50, 50, 50, ${alpha * 0.5})`);
  grad.addColorStop(1, `rgba(80, 80, 80, 0)`);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(width / 100, height / 100);

  ctx.beginPath();
  const points = 16;
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const noise = fbm2D(Math.cos(angle) * 2 + seed, Math.sin(angle) * 2 + seed, 3);
    const r = 80 + noise * 30;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.restore();
}

// ---- Breathing Animation Helpers ----

export function breathe(t: number, period: number, min: number = 0, max: number = 1): number {
  const phase = (t % period) / period;
  const sine = Math.sin(phase * Math.PI * 2);
  return min + (sine * 0.5 + 0.5) * (max - min);
}

export function breatheSlow(t: number, period: number, min: number = 0, max: number = 1): number {
  const phase = (t % period) / period;
  // Use smoothstep for gentler transitions
  const sine = Math.sin(phase * Math.PI * 2);
  const smooth = sine * sine * (3 - 2 * Math.abs(sine)) * Math.sign(sine);
  return min + (smooth * 0.5 + 0.5) * (max - min);
}

// ---- Particle System Base ----

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  alpha: number;
}

export function updateParticle(p: Particle, dt: number): boolean {
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.life -= dt;
  p.alpha = clamp(p.life / p.maxLife, 0, 1);
  return p.life > 0;
}

// ---- Easing ----

export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// ---- Whale Silhouette Path ----

export function drawWhaleSilhouette(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  alpha: number
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#001020';

  ctx.beginPath();
  // Simple elegant whale shape
  ctx.moveTo(-60, 0);
  ctx.bezierCurveTo(-50, -15, -20, -20, 10, -15);
  ctx.bezierCurveTo(30, -12, 50, -5, 70, -15);
  ctx.lineTo(65, 0);
  ctx.bezierCurveTo(50, 5, 30, 8, 10, 5);
  ctx.bezierCurveTo(-20, 2, -50, 5, -60, 0);
  ctx.closePath();

  // Tail
  ctx.moveTo(65, -5);
  ctx.lineTo(85, -12);
  ctx.lineTo(80, -3);
  ctx.lineTo(85, 5);
  ctx.lineTo(65, 2);
  ctx.closePath();

  ctx.fill();
  ctx.restore();
}

// ---- Bird Silhouette ----

export function drawBird(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  wingPhase: number,
  alpha: number
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#0a0a0a';
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const wingY = Math.sin(wingPhase) * 4;

  ctx.beginPath();
  ctx.moveTo(-8, wingY);
  ctx.quadraticCurveTo(-4, -2 + wingY * 0.3, 0, 0);
  ctx.quadraticCurveTo(4, -2 + wingY * 0.3, 8, wingY);
  ctx.stroke();

  ctx.restore();
}

// ---- Sine wave with multiple harmonics (organic motion) ----

export function organicSine(t: number, frequencies: number[], amplitudes: number[]): number {
  let sum = 0;
  for (let i = 0; i < frequencies.length; i++) {
    sum += Math.sin(t * frequencies[i] + i * 1.7) * (amplitudes[i] || 1);
  }
  return sum;
}
