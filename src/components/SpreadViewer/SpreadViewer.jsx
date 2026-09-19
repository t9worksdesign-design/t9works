import { useEffect, useState } from 'react';
import './SpreadViewer.css';

// Shows one InDesign spread at a time. Arrow-key + button navigation now;
// swipe gestures can be layered on top of goPrev/goNext for mobile later.
export default function SpreadViewer({ spreads, fruitName }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [spreads]);

  const goPrev = () => setIndex((i) => (i - 1 + spreads.length) % spreads.length);
  const goNext = () => setIndex((i) => (i + 1) % spreads.length);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spreads.length]);

  if (!spreads.length) return null;

  return (
    <div className="spread-viewer">
      <div className="spread-viewer__stage">
        {spreads.length > 1 && (
          <button
            type="button"
            className="spread-viewer__arrow spread-viewer__arrow--prev"
            onClick={goPrev}
            aria-label="Previous spread"
          >
            &larr;
          </button>
        )}

        <img
          key={spreads[index]}
          src={spreads[index]}
          alt={`${fruitName} — spread ${index + 1}`}
          className="spread-viewer__image"
          draggable={false}
        />

        {spreads.length > 1 && (
          <button
            type="button"
            className="spread-viewer__arrow spread-viewer__arrow--next"
            onClick={goNext}
            aria-label="Next spread"
          >
            &rarr;
          </button>
        )}
      </div>

      {spreads.length > 1 && (
        <div className="spread-viewer__index">
          {String(index + 1).padStart(2, '0')} / {String(spreads.length).padStart(2, '0')}
        </div>
      )}
    </div>
  );
}
