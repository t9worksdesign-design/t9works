import { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import './DraggableSpecimen.css';

const { Engine, Runner, World, Bodies, Body, Events } = Matter;

const WALL_THICKNESS = 100;
const DRIFT_SPEED = 0.7;
const DRIFT_STEER_GAIN = 0.00025;
const DRIFT_CHANGE_MIN_MS = 3000;
const DRIFT_CHANGE_MAX_MS = 6000;
const AMBIENT_SPIN_MAX = 0.03;
const RELEASE_SPIN_MAX = 0.07;
const SPIN_FROM_RELEASE = 0.035;
const MAX_RELEASE_SPEED = 22;
const HISTORY_WINDOW_MS = 120;

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function buildWalls(w, h) {
  const t = WALL_THICKNESS;
  const opts = { isStatic: true, restitution: 0.65, friction: 0.05, label: 'wall' };
  return [
    Bodies.rectangle(w / 2, -t / 2, w + t * 2, t, opts),
    Bodies.rectangle(w / 2, h + t / 2, w + t * 2, t, opts),
    Bodies.rectangle(-t / 2, h / 2, t, h + t * 2, opts),
    Bodies.rectangle(w + t / 2, h / 2, t, h + t * 2, opts),
  ];
}

// A single fruit cutout that floats around its parent stage in zero
// gravity, bounces off the stage edges, and can be grabbed and thrown.
export default function DraggableSpecimen({ image, name, resetKey }) {
  const elRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    const stage = el.parentElement;
    let stageW = stage.clientWidth;
    let stageH = stage.clientHeight;
    const size = el.offsetWidth;
    const radius = size * 0.46;

    const engine = Engine.create({ gravity: { x: 0, y: 0 } });
    const body = Bodies.circle(
      Math.min(stageW * 0.15 + radius, Math.max(radius, stageW - radius)),
      Math.min(stageH * 0.2 + radius, Math.max(radius, stageH - radius)),
      radius,
      { restitution: 0.75, friction: 0.06, frictionAir: 0.035, density: 0.001 }
    );
    let walls = buildWalls(stageW, stageH);
    World.add(engine.world, [body, ...walls]);

    const heading = () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = DRIFT_SPEED * (0.6 + Math.random() * 0.8);
      body.driftX = Math.cos(angle) * speed;
      body.driftY = Math.sin(angle) * speed;
      body.driftChangeAt =
        Date.now() + DRIFT_CHANGE_MIN_MS + Math.random() * (DRIFT_CHANGE_MAX_MS - DRIFT_CHANGE_MIN_MS);
    };
    heading();

    const onCollision = () => {
      body.redirect = true;
    };
    const beforeUpdate = () => {
      if (body.isStatic) return;
      if (Date.now() >= body.driftChangeAt) heading();
      Body.applyForce(body, body.position, {
        x: body.mass * DRIFT_STEER_GAIN * (body.driftX - body.velocity.x),
        y: body.mass * DRIFT_STEER_GAIN * (body.driftY - body.velocity.y),
      });
    };
    const afterUpdate = () => {
      if (body.redirect) {
        const sp = Math.hypot(body.velocity.x, body.velocity.y);
        const a = sp > 0.05 ? Math.atan2(body.velocity.y, body.velocity.x) : Math.random() * Math.PI * 2;
        const target = DRIFT_SPEED * (0.6 + Math.random() * 0.8);
        body.driftX = Math.cos(a) * target;
        body.driftY = Math.sin(a) * target;
        body.driftChangeAt =
          Date.now() + DRIFT_CHANGE_MIN_MS + Math.random() * (DRIFT_CHANGE_MAX_MS - DRIFT_CHANGE_MIN_MS);
        Body.setAngularVelocity(
          body,
          (Math.random() < 0.5 ? -1 : 1) * AMBIENT_SPIN_MAX * (0.35 + Math.random() * 0.65)
        );
        body.redirect = false;
      }
      if (!body.isStatic) {
        const sp = Math.hypot(body.velocity.x, body.velocity.y);
        if (sp > MAX_RELEASE_SPEED * 1.5) {
          const k = (MAX_RELEASE_SPEED * 1.5) / sp;
          Body.setVelocity(body, { x: body.velocity.x * k, y: body.velocity.y * k });
        }
        const x = clamp(body.position.x, radius, Math.max(radius, stageW - radius));
        const y = clamp(body.position.y, radius, Math.max(radius, stageH - radius));
        if (x !== body.position.x || y !== body.position.y) Body.setPosition(body, { x, y });
      }
      el.style.transform = `translate3d(${body.position.x - size / 2}px, ${
        body.position.y - size / 2
      }px, 0) rotate(${body.angle}rad)`;
    };
    Events.on(engine, 'collisionStart', onCollision);
    Events.on(engine, 'beforeUpdate', beforeUpdate);
    Events.on(engine, 'afterUpdate', afterUpdate);

    const runner = Runner.create();
    Runner.run(runner, engine);

    const resizeObserver = new ResizeObserver(() => {
      stageW = stage.clientWidth;
      stageH = stage.clientHeight;
      if (!stageW || !stageH) return;
      World.remove(engine.world, walls);
      walls = buildWalls(stageW, stageH);
      World.add(engine.world, walls);
    });
    resizeObserver.observe(stage);

    let drag = null;
    const onMove = (e) => {
      if (!drag) return;
      const rect = stage.getBoundingClientRect();
      const x = clamp(e.clientX - rect.left + drag.ox, radius, Math.max(radius, stageW - radius));
      const y = clamp(e.clientY - rect.top + drag.oy, radius, Math.max(radius, stageH - radius));
      Body.setPosition(body, { x, y });
      const now = performance.now();
      drag.history.push({ t: now, x, y });
      while (drag.history.length > 1 && now - drag.history[0].t > HISTORY_WINDOW_MS) {
        drag.history.shift();
      }
    };
    const onUp = () => {
      if (!drag) return;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      Body.setStatic(body, false);
      let vx = 0;
      let vy = 0;
      const h = drag.history;
      if (h.length >= 2) {
        const dt = h[h.length - 1].t - h[0].t;
        if (dt > 0) {
          vx = ((h[h.length - 1].x - h[0].x) / dt) * 16.67;
          vy = ((h[h.length - 1].y - h[0].y) / dt) * 16.67;
        }
      }
      const sp = Math.hypot(vx, vy);
      if (sp > MAX_RELEASE_SPEED) {
        vx *= MAX_RELEASE_SPEED / sp;
        vy *= MAX_RELEASE_SPEED / sp;
      }
      Body.setVelocity(body, { x: vx, y: vy });
      Body.setAngularVelocity(body, clamp(vx * SPIN_FROM_RELEASE, -RELEASE_SPIN_MAX, RELEASE_SPIN_MAX));
      body.driftX = vx * 0.3 + Math.sign(vx || 1) * 0.3;
      body.driftY = vy * 0.3;
      body.driftChangeAt =
        Date.now() + DRIFT_CHANGE_MIN_MS + Math.random() * (DRIFT_CHANGE_MAX_MS - DRIFT_CHANGE_MIN_MS);
      el.style.zIndex = '';
      drag = null;
    };
    const onDown = (e) => {
      e.preventDefault();
      const rect = stage.getBoundingClientRect();
      Body.setStatic(body, true);
      drag = {
        ox: body.position.x - (e.clientX - rect.left),
        oy: body.position.y - (e.clientY - rect.top),
        history: [{ t: performance.now(), x: body.position.x, y: body.position.y }],
      };
      el.style.zIndex = '5';
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    };
    el.addEventListener('pointerdown', onDown);

    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      resizeObserver.disconnect();
      Runner.stop(runner);
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [resetKey]);

  return (
    <img
      ref={elRef}
      src={image}
      alt={name}
      draggable={false}
      className="draggable-specimen"
    />
  );
}
