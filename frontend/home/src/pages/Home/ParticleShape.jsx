import React, { useRef, useEffect } from 'react';

// A more detailed India map path using standard SVG format (scaled to fit approx 100x100 natively)
// const INDIA_MAP_SVG = "M46 3 L52 10 L59 12 L65 7 L72 10 L75 16 L71 22 L77 24 L85 27 L92 26 L96 32 L98 42 L94 48 L87 46 L82 52 L83 60 L78 68 L73 78 L68 85 L65 95 L59 98 L53 92 L47 84 L41 75 L36 65 L28 55 L21 53 L13 50 L8 45 L5 38 L9 31 L14 28 L21 33 L26 27 L33 28 L37 22 L40 14 Z";
const INDIA_MAP_SVG = "M18 81c2 9 9 27 13 29l7-8 4-10c0-2-2-10 0-11 3-1 24-18 25-19q0-2 1-3l6-1-3-11c-1-1 3-1 2-2q-2-2-2-4 2-1 5 1 0 1 3 3l6 1q-3 2-3 6 2 2 3-2l3 6c2 0 7-17 11-20q4-3-2-7-6-2-11 4t-12 6c-3-1-3-5-4-4l-1 5-12-2q-13-4-15-6l3-5-5-3c-2-1-3-6-2-6h3q1-1-2-4l2-2c1-1 4-5 1-7q-4 0-7 2l-5-5q-5-2-9-1-3 2-2 3l4 4-2 2 1 5 5 4-3 1c-1 5-9 14-10 14q-9-1-7 3c-1 1 2 7 3 10H5l-4 1q0 4 3 4h3l-2 2H3q1 4 6 7 4-1 6-5z"

const SHIELD_SVG ="M40.2.8v99.7m0 0C24.7 97.2.5 79.5.5 55.5V19.4a6 6 0 0 1 5-3.9c4-.2 13.9-1.8 20-5.6C31.9 6 37 .4 40.3.5c3.3 0 8.5 5.5 15.3 9.3s17 5.8 19.8 5.9c2.9 0 5 2.2 5 4.1v33c0 32-27.8 44.4-40 47.7Z"

function drawShape(ctx, shape, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();

  if (shape === 'india') {
    const p = new Path2D(INDIA_MAP_SVG);
    ctx.save();
    // Scale up the India map by 1.6x and center it in the 300x300 canvas
    ctx.translate(width / 2 - 80, height / 2 - 80);
    ctx.scale(1.4, 1.4);
    ctx.stroke(p);
    ctx.restore();
  } else if (shape === 'magnifier') {
    // Circle (larger)
    ctx.arc(width / 2 - 15, height / 2 - 20, 50, 0, Math.PI * 2);
    ctx.stroke();
    // Handle
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(width / 2 + 20, height / 2 + 20);
    ctx.lineTo(width / 2 + 60, height / 2 + 60);
    ctx.stroke();
  } else if (shape === 'shield') {
    const p = new Path2D(SHIELD_SVG);
    ctx.save();
    ctx.translate(width / 2 - 65, height / 2 - 75);
    ctx.scale(1.5, 1.5);
    ctx.stroke(p);
    ctx.restore();
  }
}

class Particle {
  constructor(targetX, targetY, circleX, circleY) {
    this.x = Math.random() * 300;
    this.y = Math.random() * 300;
    this.targetX = targetX;
    this.targetY = targetY;
    this.circleX = circleX;
    this.circleY = circleY;
    this.size = Math.random() * 1.1 + 0.5;
    this.lerpSpeed = 0.02 + Math.random() * 0.1; // Smooth speed
    this.randomPhase = Math.random() * Math.PI * 2;
  }

  update(isHovered, time) {
    // Determine target based on state
    const destX = ! isHovered ? this.circleX : this.targetX;
    const destY = ! isHovered ? this.circleY : this.targetY;

    // Add subtle wander effect
    const wanderX = Math.sin(time * 0.002 + this.randomPhase) * 1;
    const wanderY = Math.cos(time * 0.002 + this.randomPhase) * 1;

    const tx = destX + wanderX;
    const ty = destY + wanderY;

    // Smooth lerp without spring bounce
    const dx = tx - this.x;
    const dy = ty - this.y;

    this.x += dx * this.lerpSpeed;
    this.y += dy * this.lerpSpeed;
  }

  draw(ctx, accentColor) {
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function ParticleShape({ shape, isHovered, hoverColor = null, className = '' }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);
  const colorRef = useRef( '#FF5722'); // Fallback accent color
  const hoveredRef = useRef(isHovered);

  // Sync hovered state to ref for requestAnimationFrame closure
  useEffect(() => {
    hoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = 300; // Increased size
    const height = 300;

    canvas.width = width;
    canvas.height = height;

    // Get accent color from CSS variable if available
    const rootStyles = getComputedStyle(document.documentElement);
    const accent = rootStyles.getPropertyValue('--accent').trim();
    if (accent) colorRef.current = accent;

    // 1. Create offscreen canvas to sample pixels
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d');

    drawShape(offCtx, shape, width, height);

    // 2. Sample pixels
    const imgData = offCtx.getImageData(0, 0, width, height).data;
    const particles = [];
    const step = 4; // Sample every 4th pixel for density

    // We will collect all valid shape coordinates first
    const shapeCoords = [];
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4;
        const alpha = imgData[index + 3];
        if (alpha > 128) {
          shapeCoords.push({ x, y });
        }
      }
    }

    // 3. Create particles with circle mapping
    const radius = 100; // Increased circle radius
    const centerX = width / 2;
    const centerY = height / 2 - 25; // Shift circle slightly up to leave room for text

    shapeCoords.forEach((coord, i) => {
      // Map index to a position on a circle
      const angle = (i / shapeCoords.length) * Math.PI * 2;
      const circleX = centerX + Math.cos(angle) * radius;
      const circleY = centerY + Math.sin(angle) * radius;

      particles.push(new Particle(coord.x, coord.y, circleX, circleY));
    });

    particlesRef.current = particles;

    // 4. Animation loop
    const render = (time) => {
      ctx.clearRect(0, 0, width, height);

      particlesRef.current.forEach(p => {
        p.update(hoveredRef.current, time);
        p.draw(ctx, colorRef.current);
      });

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [shape]); // Re-init if shape changes

  return (
    <canvas
      ref={canvasRef}
      className={ `w-full h-full object-contain ${ className }` }
    />
  );
}
