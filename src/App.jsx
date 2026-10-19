import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Home from './pages/Home/Home';
import Category from './pages/Category/Category';
import All from './pages/All/All';
import FruitDetail from './pages/FruitDetail/FruitDetail';
import Video from './pages/Video/Video';

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/all" element={<All />} />
          <Route path="/category/:color" element={<Category />} />
          <Route path="/fruit/:id" element={<FruitDetail />} />
          <Route path="/video" element={<Video />} />
        </Routes>
      </main>
    </div>
  );
}
