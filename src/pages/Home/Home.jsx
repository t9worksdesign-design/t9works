import { homeVisuals } from '../../data/homeVisuals';
import RevealSquare from '../../components/RevealSquare/RevealSquare';
import './Home.css';

// Texture squares and the title are positioned by percentage directly
// against `.home__hero`, so the composition always fills the hero edge
// to edge — no leftover space, on any screen aspect ratio. Squares stay
// true squares via `aspect-ratio: 1` in RevealSquare.css, independent
// of the hero's own proportions.
export default function Home() {
  return (
    <div className="home__hero">
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
  );
}
