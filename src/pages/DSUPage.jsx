import React, { useState, useEffect, useRef, useMemo } from 'react';
import './DSUPage.css';
import '../pages/DijkstraPage.css';
import { generateDSUSteps } from '../algorithms/dsu';

const DSUPage = () => {
  const [n, setN] = useState(10);
  const [config, setConfig] = useState({ pathCompression: false, unionByRank: false });
  const [operations, setOperations] = useState([]); // List of user clicks
  const [firstSelection, setFirstSelection] = useState(null);

  // Simulation
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const timerRef = useRef(null);

  // Current State (Snapshots)
  // If simulation not running, we show the 'Final' state of current operations immediately?
  // OR we always run simulation. Let's start with simulation mode.
  // If operations change, we re-gen steps but wait for 'Play'.
  // Actually, DSU is best interactive. Let's auto-play new operations if already at end?
  // For simplicity: Manual Play like other pages.

  const currentStep = currentStepIndex >= 0 && currentStepIndex < steps.length ? steps[currentStepIndex] : null;

  // Default state if no steps or before start
  const initialState = {
    parent: Array.from({ length: n }, (_, i) => i),
    rank: Array(n).fill(0),
    activeNode: null,
    message: 'Ready. Click Play to visualize queued operations.'
  };

  const displayState = currentStep || initialState;

  // --- Graph Layout Calculation ---
  // We need to verify the parent structure to draw trees.
  const positions = useMemo(() => {
    const parent = displayState.parent;
    // Group by trees
    const children = Array.from({ length: n }, () => []);
    const roots = [];

    parent.forEach((p, i) => {
      if (p === i) roots.push(i);
      else children[p].push(i);
    });

    // Simple Layout: Roots spread horizontally. Children recursively below.
    const coords = {};
    const canvasWidth = 800;
    const startY = 50;
    const levelHeight = 80;

    // Determine width needed for each tree
    const getTreeWidth = (node) => {
      if (children[node].length === 0) return 60; // Leaf width
      return children[node].reduce((sum, child) => sum + getTreeWidth(child), 0);
    };

    let currentX = 50;

    const assignCoords = (node, x, y, width) => {
      coords[node] = { x: x + width / 2, y };

      let childX = x;
      children[node].forEach(child => {
        const w = getTreeWidth(child);
        assignCoords(child, childX, y + levelHeight, w);
        childX += w;
      });
    };

    roots.forEach(root => {
      const w = getTreeWidth(root);
      assignCoords(root, currentX, startY, w);
      currentX += w + 20; // Gap between trees
    });

    return coords;

  }, [displayState.parent, n]);


  // --- Handlers ---
  const handleAddOperation = (op) => {
    setOperations(prev => [...prev, op]);
    handleResetSim();
  };

  const handleNodeClick = (id) => {
    if (isPlaying) return;

    if (firstSelection === null) {
      setFirstSelection(id);
    } else {
      if (id !== firstSelection) {
        handleAddOperation({ type: 'UNION', u: firstSelection, v: id });
      }
      setFirstSelection(null);
    }
  };

  const handleFind = () => {
    const val = prompt("Enter Node ID to Find (0-" + (n - 1) + "):");
    if (val !== null) {
      const id = parseInt(val);
      if (id >= 0 && id < n) {
        handleAddOperation({ type: 'FIND', u: id });
      }
    }
  };

  const handleGenerate = () => {
    if (steps.length > 0 && currentStepIndex < steps.length - 1) {
      setIsPlaying(true);
    } else {
      const s = generateDSUSteps(operations, n, config);
      setSteps(s);
      setCurrentStepIndex(0);
      setIsPlaying(true);
    }
  };

  const handleResetSim = () => {
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIndex(-1);
  };

  const handleClear = () => {
    setOperations([]);
    setFirstSelection(null);
    handleResetSim();
  };

  // Auto-Scroll Simulation
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
      }, 1050 - speed);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, steps, speed]);


  return (
    <div className="dsu-container">
      {/* LEFT PANEL */}
      <div className="control-panel">
        <div className="panel-header">DSU Visualizer</div>

        <div className="control-group">
          <label className="control-label">Settings</label>
          <div className="checkbox-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '5px' }}>
            <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input type="checkbox" checked={config.pathCompression} onChange={e => setConfig({ ...config, pathCompression: e.target.checked })} />
              Path Compression
            </label>
            <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input type="checkbox" checked={config.unionByRank} onChange={e => setConfig({ ...config, unionByRank: e.target.checked })} />
              Union by Rank
            </label>
          </div>
        </div>

        <div className="control-group">
          <label className="control-label">Operations ({operations.length})</label>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            <button className="btn btn-secondary" onClick={handleFind}>+ Find(x)</button>
            <button className="btn btn-danger" onClick={handleClear}>Clear Ops</button>
          </div>
          <div style={{ maxHeight: '150px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '5px', borderRadius: '4px', fontSize: '0.8rem' }}>
            {operations.length === 0 ? <span style={{ color: '#777' }}>Click nodes to Union...</span> : operations.map((op, i) => (
              <div key={i}>{i + 1}. {op.type === 'UNION' ? `Union(${op.u}, ${op.v})` : `Find(${op.u})`}</div>
            ))}
          </div>
        </div>

        <div className="control-group">
          <label className="control-label">Controls</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button className="btn btn-primary" style={{ gridColumn: 'span 2' }} onClick={handleGenerate} disabled={isPlaying || (operations.length === 0 && steps.length === 0)}>
              {isPlaying ? 'Running...' : (steps.length > 0 && currentStepIndex < steps.length - 1 ? 'Resume' : 'Run Operations')}
            </button>
            <button className="btn btn-secondary" onClick={() => setIsPlaying(false)}>Pause</button>
            <button className="btn btn-secondary" onClick={() => { if (!isPlaying && steps.length > 0 && currentStepIndex < steps.length - 1) setCurrentStepIndex(p => p + 1) }}>Step</button>
            <button className="btn btn-secondary" style={{ gridColumn: 'span 2' }} onClick={handleResetSim}>Reset View</button>
          </div>
        </div>
        <div className="control-group">
          <label className="control-label">Speed</label>
          <input type="range" min="100" max="1000" value={speed} onChange={e => setSpeed(Number(e.target.value))} style={{ width: '100%' }} />
        </div>
      </div>

      {/* CENTER CANVAS */}
      <div className="dsu-canvas-area">
        {positions[0] && ( // Ensure we have positions
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {/* Edges */}
            <svg className="dsu-svg">
              <defs>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="24" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 z" fill="rgba(255,255,255,0.2)" />
                </marker>
              </defs>
              {displayState.parent.map((p, i) => {
                if (p === i) return null; // Root has no edge
                const start = positions[i];
                const end = positions[p];
                if (!start || !end) return null;
                return (
                  <line
                    key={`${i}-${p}`}
                    x1={start.x} y1={start.y}
                    x2={end.x} y2={end.y}
                    className="edge-line"
                    style={{ stroke: currentStep && currentStep.highlights && currentStep.highlights.includes(`${i}-${p}`) ? 'var(--dsu-active)' : '' }}
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            {Array.from({ length: n }).map((_, i) => {
              const pos = positions[i];
              if (!pos) return null;
              const isRoot = displayState.parent[i] === i;
              const isActive = displayState.activeNode === i;
              const isSelected = firstSelection === i;

              return (
                <div
                  key={i}
                  className={`dsu-node ${isRoot ? 'root' : ''} ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`}
                  style={{ left: pos.x - 22, top: pos.y - 22 }}
                  onClick={() => handleNodeClick(i)}
                >
                  {i}
                  {config.unionByRank && isRoot && <div className="rank-badge">{displayState.rank[i]}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="info-panel">
        <div className="panel-header">Status</div>
        {currentStep ? (
          <div className="step-box">
            <div style={{ fontWeight: 'bold', color: '#3b82f6', marginBottom: '5px' }}>{currentStep.action}</div>
            <div>{currentStep.message}</div>
          </div>
        ) : (
          <div className="step-box" style={{ borderLeftColor: '#555' }}>Ready.</div>
        )}

        <div className="panel-header" style={{ marginTop: '20px' }}>Internal State</div>

        <div style={{ marginBottom: '10px' }}>
          <div className="control-label">Parent Array</div>
          <div className="array-container">
            {displayState.parent.map((p, i) => (
              <div key={i} className="array-item">
                <div className="array-val" style={{ color: p === i ? '#8b5cf6' : 'white', borderColor: p === i ? '#8b5cf6' : '' }}>
                  {p}
                </div>
                <div className="array-idx">{i}</div>
              </div>
            ))}
          </div>
        </div>

        {config.unionByRank && (
          <div>
            <div className="control-label">Rank Array</div>
            <div className="array-container">
              {displayState.rank.map((r, i) => (
                <div key={i} className="array-item">
                  <div className="array-val">{r}</div>
                  <div className="array-idx">{i}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="panel-header" style={{ marginTop: '20px' }}>Legend</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: '#8b5cf6' }}></div> Root Node</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: '#f59e0b' }}></div> Active Node</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: '#1f2937' }}></div> Normal Node</div>
      </div>
    </div>
  );
};

export default DSUPage;