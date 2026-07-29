export function animateFlyToTarget(startRef, targetRef) {
  if (!startRef?.current || !targetRef?.current) return;

  const startRect = startRef.current.getBoundingClientRect();
  const targetRect = targetRef.current.getBoundingClientRect();
  const flyingElement = startRef.current.cloneNode(true);

  const startX = startRect.left + startRect.width / 2;
  const startY = startRect.top + startRect.height / 2;
  const endX = targetRect.left + targetRect.width / 2;
  const endY = targetRect.top + targetRect.height / 2;

  const controlX = (startX + endX) / 2;
  const controlY = Math.min(startY, endY) - 50; // raise curve

  const time = Math.max(Math.floor(Math.hypot(endX - startX, endY - startY) * 0.6), 600);

  Object.assign(flyingElement.style, {
    position: "fixed",
    left: "0px",
    top: "0px",
    width: `${startRect.width}px`,
    height: `${startRect.height}px`,
    zIndex: 9999,
    pointerEvents: "none",
    opacity: 0.8,

    offsetPath: `path("M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}")`,
    offsetDistance: "0%",
    offsetRotate: "0deg",
    offsetAnchor: "50% 50%",

    transform: "scale(1)",
    transition: `offset-distance ${time}ms, transform ${time}ms, opacity ${time}ms`,
  });

  document.body.appendChild(flyingElement);

  requestAnimationFrame(() => {
    flyingElement.style.offsetDistance = '100%';
    flyingElement.style.transform = `scale(${30 / startRect.width})`;
    flyingElement.style.opacity = '0.2';
  });

  setTimeout(() => {
    if (document.body.contains(flyingElement)) {
      document.body.removeChild(flyingElement);
    }
  }, time + 50);
}
