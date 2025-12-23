import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css'; // Contains the CSS provided in the previous step

// Import Page Components
import Home from './pages/Home';
import DijkstraPage from './pages/DijkstraPage';
import RatInMazePage from './pages/RatInMazePage';
import KnapsackPage from './pages/KnapsackPage';
import DSUPage from './pages/DSUPage';

function App() {
  return (
    <Router>
      {/* Global Navigation Bar */}
      <nav className="navbar">
        <div className="container nav-container">
          <Link to="/" className="nav-logo">
            <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>🔮</span>
            <span className="logo-text">DSA Visualizer</span>
          </Link>
          <div className="nav-links">
            <Link to="/dijkstra">Dijkstra</Link>
            <Link to="/rat-maze">Rat in Maze</Link>
            <Link to="/knapsack">Knapsack</Link>
            <Link to="/dsu">DSU</Link>
          </div>
        </div>
      </nav>

      {/* Page Content Switcher */}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dijkstra" element={<DijkstraPage />} />
          <Route path="/rat-maze" element={<RatInMazePage />} />
          <Route path="/knapsack" element={<KnapsackPage />} />
          <Route path="/dsu" element={<DSUPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;