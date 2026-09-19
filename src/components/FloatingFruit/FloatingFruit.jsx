import { forwardRef } from 'react';
import './FloatingFruit.css';

// Purely presentational + imperatively positioned: PhysicsCanvas writes
// `transform` on this element's ref every animation frame, so this
// component itself never re-renders during the physics loop.
const FloatingFruit = forwardRef(function FloatingFruit(
  { fruit, size, onPointerDown },
  ref
) {
  return (
    <div
      ref={ref}
      className="floating-fruit"
      style={{ width: size, height: size }}
      onPointerDown={(e) => onPointerDown(fruit.id, e)}
    >
      <img
        src={fruit.image}
        alt={fruit.name}
        draggable={false}
        className="floating-fruit__image"
      />
      <span className="floating-fruit__label">{fruit.name}</span>
    </div>
  );
});

export default FloatingFruit;
