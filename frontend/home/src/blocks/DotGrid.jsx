import React, {
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

const clamp = (v, min = 0, max = 1) =>
  Math.max(min, Math.min(max, v));

function resolveColor(color) {
  if (color.startsWith("var(")) {
    const name = color.slice(4, -1).trim();

    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
  }

  return color;
}

function hexToRgb(hex) {
  let h = hex.replace("#", "");

  if (h.length === 3) {
    h =
      h[0] +
      h[0] +
      h[1] +
      h[1] +
      h[2] +
      h[2];
  }

  const num = parseInt(h, 16);

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function mixColor(a, b, t) {
  t = clamp(t);

  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bb = Math.round(a.b + (b.b - a.b) * t);

  return `rgb(${r},${g},${bb})`;
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export default function DotGrid({
  dotSize = 3,
  gap = 20,

  baseColor = "#2F293A",
  activeColor = "#5227FF",

  proximity = 120,

  shockRadius = 250,
  shockStrength = 5,

  resistance = 750,
  returnDuration = 1.5,

  className,
  style,
}) {
  const canvasRef = useRef(null);

  const dotsRef = useRef([]);

  const animationRef = useRef(null);

  const mouse = useRef({
    x: 0,
    y: 0,
    inside: false,
    moved: false,
  });

  const lastMouse = useRef({
    x: 0,
    y: 0,
  });

  const width = useRef(0);
  const height = useRef(0);

  const dpr = useRef(window.devicePixelRatio || 1);

  const baseRGB = useRef(hexToRgb(resolveColor(baseColor)));
  const activeRGB = useRef(hexToRgb(resolveColor(activeColor)));

  useEffect(() => {
    function updateColors() {
      baseRGB.current = hexToRgb(resolveColor(baseColor));
      activeRGB.current = hexToRgb(resolveColor(activeColor));
    }

    updateColors();

    const observer = new MutationObserver(updateColors);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, [baseColor, activeColor]);

  function buildGrid() {
    const dots = [];

    const cols = Math.ceil(width.current / gap);
    const rows = Math.ceil(height.current / gap);

    const offsetX =
      (width.current - (cols - 1) * gap) / 2;

    const offsetY =
      (height.current - (rows - 1) * gap) / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = offsetX + col * gap;
        const y = offsetY + row * gap;

        dots.push({
          x,
          y,

          ox: x,
          oy: y,

          vx: 0,
          vy: 0,

          offsetX: 0,
          offsetY: 0,
        });
      }
    }

    dotsRef.current = dots;
  }

  useLayoutEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const parent = canvas.parentElement || canvas;

    function resize() {
      const rect = parent.getBoundingClientRect();

      width.current = rect.width;
      height.current = rect.height;

      dpr.current = window.devicePixelRatio || 1;

      canvas.width = width.current * dpr.current;
      canvas.height = height.current * dpr.current;

      canvas.style.width = width.current + "px";
      canvas.style.height = height.current + "px";

      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.setTransform(
          dpr.current,
          0,
          0,
          dpr.current,
          0,
          0
        );
      }

      buildGrid();
    }

    resize();

    const observer = new ResizeObserver(resize);

    observer.observe(parent);

    return () => observer.disconnect();
  }, [gap]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    function pointerMove(e) {
      const rect = canvas.getBoundingClientRect();

      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;

      mouse.current.inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      mouse.current.moved = mouse.current.inside;
    }

    function pointerLeave() {
      mouse.current.inside = false;
      mouse.current.moved = false;
    }

    window.addEventListener(
      "pointermove",
      pointerMove
    );

    window.addEventListener(
      "pointerleave",
      pointerLeave
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        pointerMove
      );

      window.removeEventListener(
        "pointerleave",
        pointerLeave
      );
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let lastTime = performance.now();

    function animate(time) {
      const dt = Math.min((time - lastTime) / 1000, 0.03);
      lastTime = time;

      const dots = dotsRef.current;

      const mx = mouse.current.x;
      const my = mouse.current.y;

      const mouseDX = mx - lastMouse.current.x;
      const mouseDY = my - lastMouse.current.y;

      lastMouse.current.x = mx;
      lastMouse.current.y = my;

      ctx.clearRect(0, 0, width.current, height.current);

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        let influence = 0;

        if (mouse.current.inside) {
          const dx = dot.x - mx;
          const dy = dot.y - my;

          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < proximity) {
            influence =
              1 -
              smoothstep(
                0,
                proximity,
                dist
              );
          }

          if (
            mouse.current.moved &&
            dist < shockRadius
          ) {
            const falloff =
              dist < shockRadius * 0.9
                ? 1
                : 1 - smoothstep(
                  shockRadius * 0.9,
                  shockRadius,
                  dist
                );

            const len =
              Math.sqrt(
                mouseDX * mouseDX +
                mouseDY * mouseDY
              ) || 1;

            const dirX = dx / (dist || 1);
            const dirY = dy / (dist || 1);

            const speed =
              Math.min(len, 40);

            dot.vx +=
              dirX *
              speed *
              shockStrength *
              falloff;

            dot.vy +=
              dirY *
              speed *
              shockStrength *
              falloff;
          }
        }

        // Apply current velocity (from shock only)
        dot.x += dot.vx * dt;
        dot.y += dot.vy * dt;

        // Velocity quickly dies out
        const damping = Math.exp(-resistance * dt / 1000);

        dot.vx *= damping;
        dot.vy *= damping;

        // Smoothly interpolate back to the original position
        const returnSpeed = Math.min(
          1,
          dt / returnDuration * 6
        );

        dot.x += (dot.ox - dot.x) * returnSpeed;
        dot.y += (dot.oy - dot.y) * returnSpeed;

        ctx.beginPath();

        ctx.fillStyle = mixColor(
          baseRGB.current,
          activeRGB.current,
          influence
        );

        ctx.arc(
          dot.x,
          dot.y,
          dotSize,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }

      mouse.current.moved = false;

      animationRef.current =
        requestAnimationFrame(animate);
    }

    animationRef.current =
      requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(
        animationRef.current
      );
    };
  }, [
    dotSize,
    proximity,
    resistance,
    shockRadius,
    shockStrength,
    returnDuration,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let lastTime = performance.now();

    function animate(time) {
      const dt = Math.min((time - lastTime) / 1000, 0.03);
      lastTime = time;

      const dots = dotsRef.current;

      const mx = mouse.current.x;
      const my = mouse.current.y;

      const mouseDX = mx - lastMouse.current.x;
      const mouseDY = my - lastMouse.current.y;

      lastMouse.current.x = mx;
      lastMouse.current.y = my;

      ctx.clearRect(0, 0, width.current, height.current);

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        let influence = 0;

        if (mouse.current.inside) {
          const dx = dot.x - mx;
          const dy = dot.y - my;

          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < proximity) {
            influence =
              1 -
              smoothstep(
                0,
                proximity,
                dist
              );
          }

          if (
            mouse.current.moved &&
            dist < shockRadius
          ) {
            const falloff =
              dist < shockRadius * 0.9
                ? 1
                : 1 - smoothstep(
                  shockRadius * 0.9,
                  shockRadius,
                  dist
                );

            const len =
              Math.sqrt(
                mouseDX * mouseDX +
                mouseDY * mouseDY
              ) || 1;

            const dirX = dx / (dist || 1);
            const dirY = dy / (dist || 1);

            const speed =
              Math.min(len, 40);

            dot.vx +=
              dirX *
              speed *
              shockStrength *
              falloff;

            dot.vy +=
              dirY *
              speed *
              shockStrength *
              falloff;
          }
        }

        // Apply current velocity (from shock only)
        dot.x += dot.vx * dt;
        dot.y += dot.vy * dt;

        // Velocity quickly dies out
        const damping = Math.exp(-10 * dt);

        dot.vx *= damping;
        dot.vy *= damping;

        // Smoothly interpolate back to the original position
        const returnSpeed = Math.min(
          1,
          dt / returnDuration * 6
        );

        dot.x += (dot.ox - dot.x) * returnSpeed;
        dot.y += (dot.oy - dot.y) * returnSpeed;

        ctx.beginPath();

        ctx.fillStyle = mixColor(
          baseRGB.current,
          activeRGB.current,
          influence
        );

        ctx.arc(
          dot.x,
          dot.y,
          dotSize,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }

      mouse.current.moved = false;

      animationRef.current =
        requestAnimationFrame(animate);
    }

    animationRef.current =
      requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(
        animationRef.current
      );
    };
  }, [
    dotSize,
    proximity,
    resistance,
    shockRadius,
    shockStrength,
    returnDuration,
  ]);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      aria-hidden="true"
      style={{ zIndex: 0 }}
    >
    <canvas
      ref= { canvasRef }
      className = { className }
      style = {{
        width: "100%",
        height: "100%",
        display: "block",
        ...style,
    }}
    />
    </div>
  )
}
