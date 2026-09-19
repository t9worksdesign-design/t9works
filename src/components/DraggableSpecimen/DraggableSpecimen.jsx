import { useEffect, useRef } from 'react';
import './DraggableSpecimen.css';

const START_INSET = 16;

// A single freely-draggable cutout, clamped to its positioned parent's
// bounds. No physics engine here — just one object, so plain pointer
// dragging is enough (unlike PhysicsCanvas, which handles many bodies
// colliding with each other).
export default function DraggableSpecimen({ image, name, resetKey }) {
  const elRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    el.style.transform = `translate3d(${START_INSET}px, ${START_INSET}px, 0)`;
    el.dataset.x = String(START_INSET);
    el.dataset.y = String(START_INSET);
  }, [resetKey]);

  const handlePointerDown = (e) => {
    const el = elRef.current;
    const stage = el.parentElement;
    const startX = parseFloat(el.dataset.x || '0');
    const startY = parseFloat(el.dataset.y || '0');
    const pointerStartX = e.clientX;
    const pointerStartY = e.clientY;

    const handleMove = (moveEvent) => {
      const stageRect = stage.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const maxX = Math.max(0, stageRect.width - elRect.width);
      const maxY = Math.max(0, stageRect.height - elRect.height);
      const x = Math.min(Math.max(startX + (moveEvent.clientX - pointerStartX), 0), maxX);
      const y = Math.min(Math.max(startY + (moveEvent.clientY - pointerStartY), 0), maxY);
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      el.dataset.x = String(x);
      el.dataset.y = String(y);
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
  };

  return (
    <img
      ref={elRef}
      src={image}
      alt={name}
      draggable={false}
      className="draggable-specimen"
      onPointerDown={handlePointerDown}
    />
  );
}
