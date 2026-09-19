import { useNavigate, useParams } from 'react-router-dom';
import { getFruitsByCategory } from '../../data/fruits';
import PhysicsCanvas from '../../components/PhysicsCanvas/PhysicsCanvas';
import './Category.css';

export default function Category() {
  const { color } = useParams();
  const navigate = useNavigate();
  const fruits = getFruitsByCategory(color);

  const handleFruitClick = (id) => navigate(`/fruit/${id}`);

  return (
    <div className="category-page">
      <h1 className="category-page__title">{color.toUpperCase()}</h1>
      <div className="category-page__canvas">
        {/* key forces a clean physics-engine remount whenever the color changes */}
        <PhysicsCanvas key={color} fruits={fruits} onFruitClick={handleFruitClick} />
      </div>
    </div>
  );
}
