import { useEffect, useRef, useState } from 'react';
import './SpreadViewer.css';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

async function preload(src) {
  const image = new Image();
  image.src = src;
  try {
    await image.decode();
  } catch {
    // A failed decode only means the flip may start before the image is
    // painted-ready; the flip itself still works.
  }
}

const url = (src) => `url("${src}")`;

// Shows one InDesign spread at a time. Turning a spread plays a paper
// page-turn: the spread is split down the spine into two halves, and the
// page being turned is a two-sided sheet (old page on the front, the new
// spread's matching page on the back) that rotates around the spine.
export default function SpreadViewer({ spreads, fruitName }) {
  const [index, setIndex] = useState(0);
  const [flip, setFlip] = useState(null);
  const stageRef = useRef(null);
  const imageRef = useRef(null);
  const busyRef = useRef(false);

  useEffect(() => {
    setIndex(0);
    setFlip(null);
    busyRef.current = false;
  }, [spreads]);

  const turn = async (direction) => {
    if (busyRef.current || spreads.length < 2) return;
    const count = spreads.length;
    const to = direction === 'next' ? (index + 1) % count : (index - 1 + count) % count;

    if (prefersReducedMotion()) {
      setIndex(to);
      return;
    }

    busyRef.current = true;
    await preload(spreads[to]);

    const image = imageRef.current;
    const stage = stageRef.current;
    if (!image || !stage) {
      busyRef.current = false;
      return;
    }
    const imageBox = image.getBoundingClientRect();
    const stageBox = stage.getBoundingClientRect();
    setFlip({
      direction,
      to,
      box: {
        left: imageBox.left - stageBox.left,
        top: imageBox.top - stageBox.top,
        width: imageBox.width,
        height: imageBox.height,
      },
    });
  };

  const finishFlip = (event) => {
    if (event.target !== event.currentTarget) return;
    setIndex(flip.to);
    setFlip(null);
    busyRef.current = false;
  };

  const turnRef = useRef(turn);
  turnRef.current = turn;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') turnRef.current('prev');
      if (e.key === 'ArrowRight') turnRef.current('next');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!spreads.length) return null;

  const current = spreads[index];
  const shownIndex = flip ? flip.to : index;

  // Which half of which spread goes where, depending on turn direction.
  // next: right page lifts and lands on the left. prev: the mirror image.
  let layers = null;
  if (flip) {
    const next = spreads[flip.to];
    layers =
      flip.direction === 'next'
        ? { underLeft: current, underRight: next, front: current, frontSide: 'right', back: next, backSide: 'left' }
        : { underLeft: next, underRight: current, front: current, frontSide: 'left', back: next, backSide: 'right' };
  }
  const position = (side) => (side === 'left' ? '0 0' : '100% 0');

  return (
    <div className="spread-viewer">
      <div ref={stageRef} className="spread-viewer__stage">
        {spreads.length > 1 && (
          <button
            type="button"
            className="spread-viewer__arrow spread-viewer__arrow--prev"
            onClick={() => turn('prev')}
            aria-label="Previous spread"
          >
            &larr;
          </button>
        )}

        <img
          ref={imageRef}
          src={current}
          alt={`${fruitName} — spread ${index + 1}`}
          className="spread-viewer__image"
          draggable={false}
        />

        {flip && (
          <div
            className={`book-flip book-flip--${flip.direction}`}
            style={flip.box}
            aria-hidden="true"
          >
            <div
              className="book-flip__half book-flip__half--left"
              style={{ backgroundImage: url(layers.underLeft) }}
            />
            <div
              className="book-flip__half book-flip__half--right"
              style={{ backgroundImage: url(layers.underRight) }}
            />
            <div className="book-flip__page" onAnimationEnd={finishFlip}>
              <div
                className="book-flip__face book-flip__face--front"
                style={{
                  backgroundImage: url(layers.front),
                  backgroundPosition: position(layers.frontSide),
                }}
              />
              <div
                className="book-flip__face book-flip__face--back"
                style={{
                  backgroundImage: url(layers.back),
                  backgroundPosition: position(layers.backSide),
                }}
              />
            </div>
          </div>
        )}

        {spreads.length > 1 && (
          <button
            type="button"
            className="spread-viewer__arrow spread-viewer__arrow--next"
            onClick={() => turn('next')}
            aria-label="Next spread"
          >
            &rarr;
          </button>
        )}
      </div>

      {spreads.length > 1 && (
        <div className="spread-viewer__index">
          {String(shownIndex + 1).padStart(2, '0')} / {String(spreads.length).padStart(2, '0')}
        </div>
      )}
    </div>
  );
}
