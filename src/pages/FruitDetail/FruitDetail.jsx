import { Link, useNavigate, useParams } from 'react-router-dom';
import { getAdjacentFruit, getFruitById } from '../../data/fruits';
import SpreadViewer from '../../components/SpreadViewer/SpreadViewer';
import DraggableSpecimen from '../../components/DraggableSpecimen/DraggableSpecimen';
import './FruitDetail.css';

export default function FruitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fruit = getFruitById(id);

  if (!fruit) {
    return (
      <div className="fruit-detail fruit-detail--missing">
        <p>Fruit not found.</p>
        <Link to="/all">Back to all</Link>
      </div>
    );
  }

  const prev = getAdjacentFruit(id, -1);
  const next = getAdjacentFruit(id, 1);

  return (
    <div className="fruit-detail">
      <div className="fruit-detail__meta">
        <Link to={`/category/${fruit.category}`} className="fruit-detail__back">
          BACK TO {fruit.category.toUpperCase()}
        </Link>

        <div className="fruit-detail__siblings">
          {prev && (
            <button type="button" onClick={() => navigate(`/fruit/${prev.id}`)}>
              &larr; {prev.name.toUpperCase()}
            </button>
          )}
          {next && (
            <button type="button" onClick={() => navigate(`/fruit/${next.id}`)}>
              {next.name.toUpperCase()} &rarr;
            </button>
          )}
        </div>
      </div>

      <div className="fruit-detail__stage">
        <DraggableSpecimen image={fruit.image} name={fruit.name} resetKey={fruit.id} />
        <SpreadViewer spreads={fruit.spreads} fruitName={fruit.name} />
      </div>
    </div>
  );
}
