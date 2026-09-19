import { useRef } from 'react';
import './RevealSquare.css';

// A texture photo sits on top of a hidden photo, both the same size.
// Dragging the top texture aside uncovers the hidden image beneath it.
// Movement is clamped to the nearest `.home__hero` ancestor, not this
// square's own small box, so the piece can be dragged freely around
// the whole home screen.
export default function RevealSquare({ id, x, y, size, textureImage, revealImage }) {
  const frontRef = useRef(null);

  const handlePointerDown = (e) => {
    const el = frontRef.current;
    const heroEl = el.closest('.home__hero');
    if (!heroEl) return;

    const elRect = el.getBoundingClientRect();
    const startDx = parseFloat(el.dataset.dx || '0');
    const startDy = parseFloat(el.dataset.dy || '0');
    const originLeft = elRect.left - startDx;
    const originTop = elRect.top - startDy;
    const pointerStartX = e.clientX;
    const pointerStartY = e.clientY;

    el.style.zIndex = '10';

    const handleMove = (moveEvent) => {
      const heroRect = heroEl.getBoundingClientRect();
      const rawDx = startDx + (moveEvent.clientX - pointerStartX);
      const rawDy = startDy + (moveEvent.clientY - pointerStartY);
      const minDx = heroRect.left - originLeft;
      const maxDx = heroRect.right - elRect.width - originLeft;
      const minDy = heroRect.top - originTop;
      const maxDy = heroRect.bottom - elRect.height - originTop;
      const dx = Math.min(Math.max(rawDx, minDx), maxDx);
      const dy = Math.min(Math.max(rawDy, minDy), maxDy);
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      el.dataset.dx = String(dx);
      el.dataset.dy = String(dy);
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
    <div className="reveal-square" style={{ left: `${x}%`, top: `${y}%`, width: `${size}%` }}>
      <img src={revealImage} alt="" className="reveal-square__back" draggable={false} />
      <img
        ref={frontRef}
        src={textureImage}
        alt={`${id} texture`}
        className="reveal-square__front"
        draggable={false}
        onPointerDown={handlePointerDown}
      />
    </div>
  );
}
