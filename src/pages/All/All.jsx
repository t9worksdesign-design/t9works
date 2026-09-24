import { useNavigate } from 'react-router-dom';
import { getAllFruitsSorted } from '../../data/fruits';
import PhysicsCanvas from '../../components/PhysicsCanvas/PhysicsCanvas';
import './All.css';

export default function All() {
  const navigate = useNavigate();
  const fruits = getAllFruitsSorted();

  const handleFruitClick = (id) => navigate(`/fruit/${id}`);

  return (
    <div className="all-page">
      <div className="all-page__canvas">
        <PhysicsCanvas fruits={fruits} onFruitClick={handleFruitClick} randomLayout ambientDrift />
      </div>
    </div>
  );
}
