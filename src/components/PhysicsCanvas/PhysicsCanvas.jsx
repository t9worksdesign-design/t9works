import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import FloatingFruit from '../FloatingFruit/FloatingFruit';
import './PhysicsCanvas.css';

const { Engine, Runner, World, Bodies, Body, Events } = Matter;

const CLICK_DIST_THRESHOLD = 6; // px — below this, a pointerdown+up is a click, not a drag
const CLICK_TIME_THRESHOLD = 600; // ms
const MAX_ANGULAR_VELOCITY = 0.18;
const SPIN_FROM_RELEASE = 0.035; // converts release vx into a natural-feeling flick spin
const MAX_RELEASE_SPEED = 22;
const WALL_THICKNESS = 100;
const HISTORY_WINDOW_MS = 120;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Same base-unit formula everywhere (category pages and ALL) so a given
// fruit's `scale` reads as the same physical size no matter which page
// it's viewed on.
function computeSize(width, height) {
  const base = width / 3.4;
  return clamp(Math.min(base, height * 0.5), 56, 360);
}

function fruitScale(fruit) {
  return fruit.scale ?? 1;
}

function buildWalls(width, height) {
  const t = WALL_THICKNESS;
  const opts = { isStatic: true, restitution: 0.4, friction: 0.05, label: 'wall' };
  return [
    Bodies.rectangle(width / 2, -t / 2, width + t * 2, t, opts),
    Bodies.rectangle(width / 2, height + t / 2, width + t * 2, t, opts),
    Bodies.rectangle(-t / 2, height / 2, t, height + t * 2, opts),
    Bodies.rectangle(width + t / 2, height / 2, t, height + t * 2, opts),
  ];
}

function initialPositions(fruits, width, height, size, randomLayout) {
  const pad = size * 0.7;
  const minX = pad;
  const maxX = Math.max(pad, width - pad);
  const minY = pad;
  const maxY = Math.max(pad, height - pad);

  if (randomLayout) {
    return fruits.map((fruit) => ({
      id: fruit.id,
      x: minX + Math.random() * (maxX - minX),
      y: minY + Math.random() * (maxY - minY),
    }));
  }

  return fruits.map((fruit, i) => {
    const colWidth = width / fruits.length;
    const x = clamp(
      colWidth * i + colWidth * 0.5 + (Math.random() - 0.5) * colWidth * 0.4,
      minX,
      maxX
    );
    const y = clamp(height * 0.32 + Math.random() * height * 0.4, minY, maxY);
    return { id: fruit.id, x, y };
  });
}

export default function PhysicsCanvas({ fruits, onFruitClick, randomLayout = false }) {
  const containerRef = useRef(null);
  const elementRefs = useRef(new Map());
  const bodiesRef = useRef(new Map());
  const wallsRef = useRef([]);
  const dragRef = useRef(null);
  const sizeRef = useRef(96); // canvas base unit (px)
  const fruitSizesRef = useRef({}); // id -> rendered px size (base * fruit.scale)
  const [fruitSizes, setFruitSizes] = useState({});

  useEffect(() => {
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    const engine = Engine.create({ gravity: { x: 0, y: 0 } });

    const initialSize = computeSize(width, height);
    sizeRef.current = initialSize;

    const initialFruitSizes = {};
    fruits.forEach((fruit) => {
      initialFruitSizes[fruit.id] = initialSize * fruitScale(fruit);
    });
    fruitSizesRef.current = initialFruitSizes;
    setFruitSizes(initialFruitSizes);

    const placements = initialPositions(fruits, width, height, initialSize, randomLayout);
    const bodies = placements.map(({ id, x, y }) =>
      Bodies.circle(x, y, initialFruitSizes[id] * 0.49, {
        restitution: 0.4,
        friction: 0.06,
        frictionAir: 0.035,
        density: 0.001,
        label: id,
      })
    );
    bodies.forEach((body, i) => bodiesRef.current.set(placements[i].id, body));

    const walls = buildWalls(width, height);
    wallsRef.current = walls;

    World.add(engine.world, [...bodies, ...walls]);

    const runner = Runner.create();
    Runner.run(runner, engine);

    const syncFrame = () => {
      bodiesRef.current.forEach((body, id) => {
        if (Math.abs(body.angularVelocity) > MAX_ANGULAR_VELOCITY) {
          Body.setAngularVelocity(
            body,
            MAX_ANGULAR_VELOCITY * Math.sign(body.angularVelocity)
          );
        }
        const el = elementRefs.current.get(id);
        if (!el) return;
        const s = fruitSizesRef.current[id] ?? sizeRef.current;
        const left = body.position.x - s / 2;
        const top = body.position.y - s / 2;
        el.style.transform = `translate3d(${left}px, ${top}px, 0) rotate(${body.angle}rad)`;
      });
    };
    Events.on(engine, 'afterUpdate', syncFrame);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width: w, height: h } = entry.contentRect;
      if (w === 0 || h === 0) return;

      World.remove(engine.world, wallsRef.current);
      wallsRef.current = buildWalls(w, h);
      World.add(engine.world, wallsRef.current);

      const newSize = computeSize(w, h);
      sizeRef.current = newSize;

      const newFruitSizes = {};
      fruits.forEach((fruit) => {
        newFruitSizes[fruit.id] = newSize * fruitScale(fruit);
      });
      fruitSizesRef.current = newFruitSizes;
      setFruitSizes(newFruitSizes);

      bodiesRef.current.forEach((body, id) => {
        const s = newFruitSizes[id] ?? newSize;
        const x = clamp(body.position.x, s / 2, Math.max(s / 2, w - s / 2));
        const y = clamp(body.position.y, s / 2, Math.max(s / 2, h - s / 2));
        if (x !== body.position.x || y !== body.position.y) {
          Body.setPosition(body, { x, y });
        }
      });
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      Events.off(engine, 'afterUpdate', syncFrame);
      Runner.stop(runner);
      World.clear(engine.world, false);
      Engine.clear(engine);
      bodiesRef.current.clear();
      wallsRef.current = [];
      dragRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const s = fruitSizesRef.current[drag.id] ?? sizeRef.current;
    const targetX = clamp(x + drag.offsetX, s / 2, Math.max(s / 2, rect.width - s / 2));
    const targetY = clamp(y + drag.offsetY, s / 2, Math.max(s / 2, rect.height - s / 2));
    Body.setPosition(drag.body, { x: targetX, y: targetY });

    const now = performance.now();
    drag.history.push({ t: now, x: targetX, y: targetY });
    while (drag.history.length > 1 && now - drag.history[0].t > HISTORY_WINDOW_MS) {
      drag.history.shift();
    }
  };

  const handlePointerUp = (e) => {
    const drag = dragRef.current;
    if (!drag) return;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('pointercancel', handlePointerUp);

    Body.setStatic(drag.body, false);

    let vx = 0;
    let vy = 0;
    const hist = drag.history;
    if (hist.length >= 2) {
      const first = hist[0];
      const last = hist[hist.length - 1];
      const dt = last.t - first.t;
      if (dt > 0) {
        vx = ((last.x - first.x) / dt) * 16.67;
        vy = ((last.y - first.y) / dt) * 16.67;
      }
    }
    const speed = Math.hypot(vx, vy);
    if (speed > MAX_RELEASE_SPEED) {
      const scale = MAX_RELEASE_SPEED / speed;
      vx *= scale;
      vy *= scale;
    }
    Body.setVelocity(drag.body, { x: vx, y: vy });
    Body.setAngularVelocity(
      drag.body,
      clamp(vx * SPIN_FROM_RELEASE, -MAX_ANGULAR_VELOCITY, MAX_ANGULAR_VELOCITY)
    );

    const el = elementRefs.current.get(drag.id);
    if (el) el.style.zIndex = '';

    const dist = Math.hypot(e.clientX - drag.startClientX, e.clientY - drag.startClientY);
    const elapsed = performance.now() - drag.startTime;
    dragRef.current = null;

    if (dist < CLICK_DIST_THRESHOLD && elapsed < CLICK_TIME_THRESHOLD) {
      onFruitClick(drag.id);
    }
  };

  const handlePointerDown = (id, e) => {
    const body = bodiesRef.current.get(id);
    if (!body) return;
    e.preventDefault();

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    Body.setStatic(body, true);

    dragRef.current = {
      id,
      body,
      offsetX: body.position.x - x,
      offsetY: body.position.y - y,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startTime: performance.now(),
      history: [{ t: performance.now(), x, y }],
    };

    const el = elementRefs.current.get(id);
    if (el) el.style.zIndex = '5';

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  return (
    <div ref={containerRef} className="physics-canvas">
      {fruits.map((fruit) => (
        <FloatingFruit
          key={fruit.id}
          fruit={fruit}
          size={fruitSizes[fruit.id] ?? sizeRef.current}
          ref={(el) => {
            if (el) elementRefs.current.set(fruit.id, el);
            else elementRefs.current.delete(fruit.id);
          }}
          onPointerDown={handlePointerDown}
        />
      ))}
    </div>
  );
}
