import { useEffect, useRef, useState } from 'react';
import { homeVisuals } from '../../data/homeVisuals';
import RevealSquare from '../../components/RevealSquare/RevealSquare';
import './Home.css';

// The whole composition (texture squares + title) was designed on a
// 590:501 canvas. Rather than stretching it to fill whatever aspect
// ratio the hero happens to have (which skews the squares), we keep
// that ratio fixed and scale + center the ratio-locked stage inside
// the hero — like `object-fit: contain` for a group of elements.
const STAGE_RATIO = 590 / 501;
// When the stage is width-constrained, there's leftover vertical space
// above and below it. Giving more of that leftover to the top nudges
// the whole composition down instead of sitting dead-center.
const VERTICAL_BIAS = 0.65;

export default function Home() {
  const heroRef = useRef(null);
  const [stageBox, setStageBox] = useState({ width: 0, height: 0, marginTop: 0 });

  useEffect(() => {
    const hero = heroRef.current;

    const measure = () => {
      const { width, height } = hero.getBoundingClientRect();
      let stageWidth = width;
      let stageHeight = stageWidth / STAGE_RATIO;
      if (stageHeight > height) {
        stageHeight = height;
        stageWidth = stageHeight * STAGE_RATIO;
      }
      const leftoverY = height - stageHeight;
      setStageBox({ width: stageWidth, height: stageHeight, marginTop: leftoverY * VERTICAL_BIAS });
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(hero);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="home__hero" ref={heroRef}>
      <div
        className="home__stage"
        style={{ width: stageBox.width, height: stageBox.height, marginTop: stageBox.marginTop }}
      >
        {homeVisuals.map((visual) => (
          <RevealSquare key={visual.id} {...visual} />
        ))}

        <div className="home__titles">
          <div className="home__title-grid">
            <p className="home__title-kr">과 채 류,</p>
            <h1 className="home__title">Beneath,</h1>

            <span />
            <h1 className="home__title">the</h1>

            <p className="home__title-kr">벗 기 기.</p>
            <h1 className="home__title">Peel.</h1>

            <span />
            <p className="home__credit">김현태</p>
          </div>
        </div>
      </div>
    </div>
  );
}
