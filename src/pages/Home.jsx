import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const algorithms = [
  {
    name: 'Dijkstra Algorithm',
    cat: 'Graph',
    path: '/dijkstra',
    desc: 'Visualize shortest path finding in weighted graphs using priority queues.',
    icon: '🕸️'
  },
  {
    name: 'Rat in a Maze',
    cat: 'Backtracking',
    path: '/rat-maze',
    desc: 'Explore recursive backtracking by navigating a rat through complex grid mazes.',
    icon: '🐭'
  },
  {
    name: '0/1 Knapsack',
    cat: 'DP',
    path: '/knapsack',
    desc: 'Master Dynamic Programming by optimizing value in the classic Knapsack problem.',
    icon: '🎒'
  },
  {
    name: 'Disjoint Set Union',
    cat: 'Data Structure',
    path: '/dsu',
    desc: 'Interactive Union-Find visualizer with Path Compression and Rank optimizations.',
    icon: '🌳'
  },
];

const Home = () => {
  return (
    <div className="home-container">
      {/* Animated Background Elements */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>

      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">Master Algorithms <br /> Visually</h1>
        <p className="hero-subtitle">
          An interactive playground to explore, visualize, and understand complex Data Structures and Algorithms.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="home-grid">
        {algorithms.map(algo => (
          <Link to={algo.path} key={algo.name} className="feature-card">
            <div>
              <span className="tag">{algo.cat}</span>
              {/* Icon removed as requested */}
              <h3 className="card-title" style={{ marginTop: '10px' }}>{algo.name}</h3>
              <p className="card-desc">{algo.desc}</p>
            </div>
            <div className="card-arrow">
              Visualize <span>→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-name">Pratik Pankaj</div>
        <div className="footer-links">
          <a href="https://www.linkedin.com/in/pratikpankaj/" target="_blank" rel="noopener noreferrer" className="footer-icon" title="LinkedIn">
            <svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
          </a>
          <a href="https://github.com/Pratikpankaj07" target="_blank" rel="noopener noreferrer" className="footer-icon" title="GitHub">
            <svg viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Home;