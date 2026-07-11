import { useEffect, useRef } from 'react';

/* ─── Constants ─── */
const GRID = 50;
const WORM_COUNT = 15;
const TURN_CHANCE = 0.35;

const PALETTE = [
  { r: 255, g: 87, b: 34 },
  { r: 255, g: 167, b: 38 },
  { r: 255, g: 109, b: 51 },
  { r: 255, g: 138, b: 101 },
  { r: 230, g: 74, b: 25 },
  { r: 255, g: 183, b: 77 },
];

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function rand(a, b) {
  return a + Math.random() * (b - a);
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function segDist(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/* ─── Worm lifecycle ─── */
function makeWorm(w, h) {
  const cols = Math.ceil(w / GRID);
  const rows = Math.ceil(h / GRID);
  const sx = Math.floor(Math.random() * (cols + 1)) * GRID;
  const sy = Math.floor(Math.random() * (rows + 1)) * GRID;
  const d = pick(DIRS);

  return {
    hx: sx,
    hy: sy,
    tx: sx + d[0] * GRID,
    ty: sy + d[1] * GRID,
    dx: d[0],
    dy: d[1],
    trail: [{ x: sx, y: sy }],
    speed: rand(1.1, 2),
    len: rand(50, 100),
    color: pick(PALETTE),
  };
}

function tickWorm(worm, cw, ch) {
  // Advance head
  worm.hx += worm.dx * worm.speed;
  worm.hy += worm.dy * worm.speed;

  // Did head reach or pass the target intersection?
  let reached = false;
  if (worm.dx > 0 && worm.hx >= worm.tx) reached = true;
  if (worm.dx < 0 && worm.hx <= worm.tx) reached = true;
  if (worm.dy > 0 && worm.hy >= worm.ty) reached = true;
  if (worm.dy < 0 && worm.hy <= worm.ty) reached = true;

  if (reached) {
    const overshoot = Math.abs(
      worm.dx !== 0 ? worm.hx - worm.tx : worm.hy - worm.ty,
    );

    // Snap to intersection
    worm.hx = worm.tx;
    worm.hy = worm.ty;

    // Record turn-point
    worm.trail.unshift({ x: worm.tx, y: worm.ty });

    // Possibly change direction (perpendicular only → 90° turns)
    if (Math.random() < TURN_CHANCE) {
      const perps =
        worm.dx !== 0
          ? [
              [0, 1],
              [0, -1],
            ]
          : [
              [1, 0],
              [-1, 0],
            ];
      const nd = pick(perps);
      worm.dx = nd[0];
      worm.dy = nd[1];
    }

    // New target
    worm.tx = worm.hx + worm.dx * GRID;
    worm.ty = worm.hy + worm.dy * GRID;

    // Continue leftover distance in new direction
    worm.hx += worm.dx * overshoot;
    worm.hy += worm.dy * overshoot;
  }

  // Update live head position in trail
  worm.trail[0] = { x: worm.hx, y: worm.hy };

  // Trim tail to target length
  let total = 0;
  for (let i = 0; i < worm.trail.length - 1; i++)
    total += segDist(worm.trail[i], worm.trail[i + 1]);

  while (total > worm.len && worm.trail.length > 2) {
    const li = worm.trail.length - 1;
    const seg = segDist(worm.trail[li - 1], worm.trail[li]);
    const excess = total - worm.len;

    if (seg <= excess + 0.1) {
      worm.trail.pop();
      total -= seg;
    } else {
      const tail = worm.trail[li];
      const prev = worm.trail[li - 1];
      const r = excess / seg;
      tail.x += (prev.x - tail.x) * r;
      tail.y += (prev.y - tail.y) * r;
      total = worm.len;
      break;
    }
  }

  // Respawn if way off-screen
  const margin = worm.len + GRID * 2;
  if (
    worm.hx < -margin ||
    worm.hx > cw + margin ||
    worm.hy < -margin ||
    worm.hy > ch + margin
  ) {
    Object.assign(worm, makeWorm(cw, ch));
  }
}

/* ─── Drawing ─── */
function drawWorm(ctx, worm) {
  const pts = worm.trail;
  if (pts.length < 2) return;

  let totalLen = 0;
  for (let i = 0; i < pts.length - 1; i++) totalLen += segDist(pts[i], pts[i + 1]);
  if (totalLen < 1) return;

  const { r, g, b } = worm.color;

  // Three glow layers: outer bloom → mid → core
  const layers = [
    { width: 14, base: 0.01 },
    { width: 6, base: 0.06 },
    { width: 2, base: 0.2 },
  ];

  for (const { width, base } of layers) {
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Walk segments tail → head, accumulating distance
    let dFromTail = 0;

    for (let i = pts.length - 1; i > 0; i--) {
      const from = pts[i];
      const to = pts[i - 1];
      const seg = segDist(from, to);
      if (seg < 0.5) {
        dFromTail += seg;
        continue;
      }

      // t values: 0 = tail, 1 = head
      const t0 = dFromTail / totalLen;
      const t1 = (dFromTail + seg) / totalLen;

      // Quadratic ease so tail fades fast, head stays bright
      const a0 = base * t0 * t0;
      const a1 = base * t1 * t1;

      const grad = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
      grad.addColorStop(0, `rgba(${r},${g},${b},${a0})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},${a1})`);

      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      dFromTail += seg;
    }
  }

  // Bright headlight dot
  const head = pts[0];
  const ha = 0.95;
  ctx.beginPath();
  ctx.arc(head.x, head.y, 1, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${r},${g},${b},${ha})`;
  ctx.fill();

  // Headlight bloom
  const hg = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 16);
  hg.addColorStop(0, `rgba(${r},${g},${b},0.2)`);
  hg.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.beginPath();
  ctx.arc(head.x, head.y, 2, 0, Math.PI * 2);
  // ctx.ellipse(head.x, head.y, 6, 12, 0, 0, Math.PI * 2);
  ctx.fillStyle = hg;
  ctx.fill();
}

/* ─── Component ─── */
export default function NeonBackground() {
  const canvasRef = useRef(null);
  const wormsRef = useRef([]);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    let cw = 0;
    let ch = 0;

    function resize() {
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      cw = rect.width;
      ch = rect.height;
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      canvas.style.width = cw + 'px';
      canvas.style.height = ch + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (wormsRef.current.length === 0) {
        wormsRef.current = Array.from({ length: WORM_COUNT }, () =>
          makeWorm(cw, ch),
        );
      }
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    function loop() {
      ctx.clearRect(0, 0, cw, ch);

      for (const w of wormsRef.current) {
        tickWorm(w, cw, ch);
        drawWorm(ctx, w);
      }

      frameRef.current = requestAnimationFrame(loop);
    }

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
      style={{ zIndex: 0 }}
    >
      {/* Repeating 50×50 grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right,  var(--border) 1px, transparent 1px),
            linear-gradient(to bottom, var(--border) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID}px ${GRID}px`,
          opacity: 0.1,
        }}
      />

      {/* Neon worms rendered on canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
