import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ClassList from './pages/ClassList';
import ClassDetail from './pages/ClassDetail';
import RaceList from './pages/RaceList';
import RaceDetail from './pages/RaceDetail';
import SkillsPage from './pages/SkillsPage';
import SpellList from './pages/SpellList';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/classes" element={<ClassList />} />
        <Route path="/classes/:id" element={<ClassDetail />} />
        <Route path="/races" element={<RaceList />} />
        <Route path="/races/:id" element={<RaceDetail />} />
        <Route path="/spells" element={<SpellList />} />
        <Route path="/skills" element={<SkillsPage />} />
      </Routes>
    </Layout>
  );
}
