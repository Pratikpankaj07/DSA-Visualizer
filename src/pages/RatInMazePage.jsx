import React, { useState, useEffect, useRef } from 'react';
import './RatInMazePage.css';
import '../pages/DijkstraPage.css'; // Reuse button/layout classes
import { generateMazeSteps } from '../algorithms/ratInMaze';

const RatInMazePage = () => {
  const [gridSize, setGridSize] = useState(8);
  const [grid, setGrid] = useState([]);
  const [startPos, setStartPos] = useState({ r: 0, c: 0 });
  const [endPos, setEndPos] = useState({ r: 7, c: 7 });
  const [interactionMode, setInteractionMode] = useState('WALL'); // WALL, START, END

  // Simulation
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(200);
  const timerRef = useRef(null);

  // Initialize Grid
  useEffect(() => {
    const newGrid = Array(gridSize).fill().map(() => Array(gridSize).fill(1)); // 1 = Path
    setGrid(newGrid);
    setEndPos({ r: gridSize - 1, c: gridSize - 1 });
  }, [gridSize]);

  // Derived
  const currentStep = currentStepIndex >= 0 && currentStepIndex < steps.length ? steps[currentStepIndex] : null;

  // Handlers
  const handleCellClick = (r, c) => {
    if (isPlaying) return; // Lock during play

    // Prevent overwriting logic if needed, but flexibility is nice
    if (interactionMode === 'START') {
      if (grid[r][c] === 0) setGrid(prev => {
        const n = [...prev.map(row => [...row])];
        n[r][c] = 1; // force path
        return n;
      });
      setStartPos({ r, c });
    } else if (interactionMode === 'END') {
      if (grid[r][c] === 0) setGrid(prev => {
        const n = [...prev.map(row => [...row])];
        n[r][c] = 1; // force path
        return n;
      });
      setEndPos({ r, c });
    } else {
      // Toggle Wall (cannot toggle start/end)
      if ((r === startPos.r && c === startPos.c) || (r === endPos.r && c === endPos.c)) return;

      setGrid(prev => {
        const newG = prev.map(row => [...row]);
        newG[r][c] = newG[r][c] === 1 ? 0 : 1;
        return newG;
      });
    }
    handleResetSimulation();
  };

  const generate = () => {
    const s = generateMazeSteps(grid, startPos, endPos);
    setSteps(s);
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  const handlePlay = () => {
    if (steps.length === 0) {
      generate();
    } else {
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    // Clear walls? Or just simulation?
    // "Reset Maze" usually implies clearing walls. "Reset Path" implies simulation.
    const confirm = window.confirm("Clear entire maze?");
    if (confirm) {
      const newGrid = Array(gridSize).fill().map(() => Array(gridSize).fill(1));
      setGrid(newGrid);
      handleResetSimulation();
    }
  };

  const handleResetSimulation = () => {
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIndex(-1);
  };

  // Loop
  useEffect(() => {
    if (isPlaying && steps.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev < steps.length - 1) return prev + 1;
          else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 550 - speed); // Speed scale
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, steps, speed]);


  // Rendering Helpers
  const getCellClass = (r, c) => {
    if (r === startPos.r && c === startPos.c) return 'cell start';
    if (r === endPos.r && c === endPos.c) return 'cell end';
    if (grid[r][c] === 0) return 'cell wall';

    // Simulation states
    // Simulation states
    if (currentStep) {
      if (currentStep.status === 'BLOCKED' && currentStep.r === r && currentStep.c === c) return 'cell wall blocked';
      if (currentStep.status === 'BACKTRACK' && currentStep.r === r && currentStep.c === c) return 'cell backtrack';
      if (currentStep.status === 'VISITING' && currentStep.r === r && currentStep.c === c) return 'cell visiting';

      // Path History
      // Check if in current stack
      const inStack = currentStep.path.findIndex(p => p[0] === r && p[1] === c);
      if (inStack !== -1) return 'cell path';
    }
    return 'cell';
  };

  return (
    <div className="maze-container">
      {/* LEFT PANEL */}
      <div className="control-panel">
        <div className="panel-header">Rat in a Maze</div>

        <div className="control-group">
          <label className="control-label">Maze Config</label>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Grid Size: {gridSize}x{gridSize}</span>
            <input
              type="range" min="4" max="15"
              value={gridSize}
              onChange={(e) => { setGridSize(Number(e.target.value)); handleResetSimulation(); }}
            />
          </div>

          <div className="control-label" style={{ marginTop: '10px' }}>Interaction Mode</div>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button className={`btn ${interactionMode === 'WALL' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setInteractionMode('WALL')}>Wall</button>
            <button className={`btn ${interactionMode === 'START' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setInteractionMode('START')}>Start</button>
            <button className={`btn ${interactionMode === 'END' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setInteractionMode('END')}>End</button>
          </div>
        </div>

        <div className="control-group">
          <label className="control-label">Controls</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button className="btn btn-primary" style={{ gridColumn: 'span 2' }} onClick={handlePlay} disabled={isPlaying}>
              {isPlaying ? 'Running...' : (steps.length > 0 ? 'Resume' : 'Start Backtracking')}
            </button>
            <button className="btn btn-secondary" onClick={() => setIsPlaying(false)}>Pause</button>
            <button className="btn btn-secondary" onClick={() => { if (!isPlaying && steps.length > 0 && currentStepIndex < steps.length - 1) setCurrentStepIndex(p => p + 1) }}>Step</button>
            <button className="btn btn-secondary" style={{ gridColumn: 'span 2' }} onClick={handleResetSimulation}>Reset Path</button>
            <button className="btn btn-danger" style={{ gridColumn: 'span 2' }} onClick={handleReset}>Clear Maze</button>
          </div>
        </div>

        <div className="control-group">
          <label className="control-label">Speed</label>
          <input type="range" min="10" max="500" value={speed} onChange={e => setSpeed(Number(e.target.value))} />
        </div>
      </div>

      {/* CENTER GRID */}
      <div className="maze-grid-area">
        <div
          className="grid-board"
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        >
          {grid.map((row, r) => (
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={getCellClass(r, c)}
                onClick={() => handleCellClick(r, c)}
              >
                {/* Optional Coordinates for debugging or learning */}
                {/* {r},{c} */}
                {r === startPos.r && c === startPos.c && <span style={{ fontSize: '1.2rem' }}>🐀</span>}
                {r === endPos.r && c === endPos.c && <span style={{ fontSize: '1.2rem' }}>🧀</span>}
              </div>
            ))
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="info-panel">
        <div className="panel-header">Status</div>
        {currentStep ? (
          <div className="step-box">
            <div style={{ fontWeight: 'bold', color: currentStep.status === 'BACKTRACK' ? '#ef4444' : '#3b82f6', marginBottom: '5px' }}>
              {currentStep.status}
            </div>
            <div>{currentStep.message}</div>
          </div>
        ) : (
          <div className="step-box" style={{ borderLeftColor: '#555' }}>Ready.</div>
        )}

        <div className="panel-header" style={{ marginTop: '20px' }}>Legend</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: '#3b82f6' }}></div> Path Stack</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: '#f59e0b' }}></div> Visiting</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: '#1f2937' }}></div> Wall</div>
        <div className="legend-item"><span style={{ marginRight: '10px' }}>🐀</span> Start</div>
        <div className="legend-item"><span style={{ marginRight: '10px' }}>🧀</span> Destination</div>

        <div className="panel-header" style={{ marginTop: '20px' }}>Recursion Stack</div>
        <div style={{ fontSize: '0.9rem', color: '#aaa' }}>
          {currentStep ? `Depth: ${currentStep.path.length}` : 'Depth: 0'}
        </div>
        {/* Visual Stack (Optional: small list of coords) */}
      </div>
    </div>
  );
};

export default RatInMazePage;