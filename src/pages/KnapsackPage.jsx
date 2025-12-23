import React, { useState, useEffect, useRef } from 'react';
import './KnapsackPage.css';
import '../pages/DijkstraPage.css'; // Reuse button/layout classes
import { generateKnapsackSteps } from '../algorithms/knapsack';

const KnapsackPage = () => {
  const [capacity, setCapacity] = useState(10);
  // Initialize with some random values
  const [items, setItems] = useState(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      weight: Math.floor(Math.random() * 5) + 1, // 1-5
      value: Math.floor(Math.random() * 20) + 10 // 10-29
    }));
  });

  // Simulation
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const timerRef = useRef(null);

  // Helpers
  const handleAddItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    setItems([...items, { id: newId, weight: 1, value: 1 }]);
    handleReset();
  };

  const handleUpdateItem = (id, field, val) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: Number(val) } : i));
    handleReset();
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter(i => i.id !== id));
    handleReset();
  };

  const handleReset = () => {
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIndex(-1);
  };

  const handlePlay = () => {
    if (steps.length === 0) {
      const s = generateKnapsackSteps(items, capacity);
      setSteps(s);
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(true);
    }
  };

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

  const currentStep = currentStepIndex >= 0 && currentStepIndex < steps.length ? steps[currentStepIndex] : null;

  // Derived Render Data
  // We need to render the DP table rows (0..n) and cols (0..capacity)
  // The table content relies on `currentStep.dp` OR initial empty state if not started

  // If we haven't started, dp is n+1 x cap+1 zeros
  const displayDP = currentStep ? currentStep.dp : Array(items.length + 1).fill(0).map(() => Array(capacity + 1).fill(0));

  // Cell Class Helper
  const getCellClass = (i, w) => {
    if (!currentStep) return 'dp-cell';

    let cls = 'dp-cell';

    if (currentStep.action === 'COMPARE' || currentStep.action === 'UPDATE') {
      // Current Computing Cell
      if (currentStep.i === i && currentStep.w === w) return 'dp-cell active';

      // Previous Value (Top)
      if (currentStep.i - 1 === i && currentStep.w === w) return 'dp-cell compare';

      // Source Value (Top-Left) if taking
      if (currentStep.compare && currentStep.compare.canTake) {
        if (currentStep.i - 1 === i && currentStep.w - currentStep.compare.weight === w) return 'dp-cell source';
      }
    }

    if (currentStep.action === 'FINISHED') {
      // Highlight path
      if (currentStep.pathCells && currentStep.pathCells.some(p => p.r === i && p.c === w)) return 'dp-cell path';
      // Also logic for highlighting selected items row headers? Handled in render.
    }

    return cls;
  };

  return (
    <div className="knapsack-container">
      {/* LEFT PANEL */}
      <div className="control-panel">
        <div className="panel-header">0/1 Knapsack</div>

        <div className="control-group">
          <label className="control-label">Capacity (W)</label>
          <input
            type="number" min="1" max="20"
            value={capacity}
            onChange={(e) => { setCapacity(Number(e.target.value)); handleReset(); }}
          />
        </div>

        <div className="control-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <label className="control-label">Items</label>
            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={handleAddItem}>+ Add</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '30px 1fr 1fr 20px', gap: '5px', marginBottom: '5px', fontSize: '0.8rem', color: '#aaa', padding: '0 8px' }}>
            <span>#</span>
            <span>Weight</span>
            <span>Value</span>
            <span></span>
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {items.map((item, idx) => (
              <div key={item.id} className={`item-row ${currentStep && currentStep.selected && currentStep.selected.includes(idx) ? 'selected' : ''}`}>
                <div style={{ width: '20px', color: '#aaa' }}>#{idx + 1}</div>
                <input
                  type="number" className="small-input" style={{ width: '80px' }}
                  value={item.weight} placeholder="W" title="Weight"
                  onChange={(e) => handleUpdateItem(item.id, 'weight', e.target.value)}
                />
                <input
                  type="number" className="small-input" style={{ width: '80px' }}
                  value={item.value} placeholder="V" title="Value"
                  onChange={(e) => handleUpdateItem(item.id, 'value', e.target.value)}
                />
                <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} onClick={() => handleDeleteItem(item.id)}>×</button>
              </div>
            ))}
          </div>
        </div>

        <div className="control-group">
          <label className="control-label">Controls</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button className="btn btn-primary" style={{ gridColumn: 'span 2' }} onClick={handlePlay} disabled={isPlaying || (steps.length > 0 && currentStepIndex === steps.length - 1)}>
              {isPlaying ? 'Computing...' : (steps.length > 0 ? 'Resume' : 'Start DP')}
            </button>
            <button className="btn btn-secondary" onClick={() => setIsPlaying(false)}>Pause</button>
            <button className="btn btn-secondary" onClick={() => { if (!isPlaying && steps.length > 0 && currentStepIndex < steps.length - 1) setCurrentStepIndex(p => p + 1) }}>Step</button>
            <button className="btn btn-secondary" style={{ gridColumn: 'span 2' }} onClick={handleReset}>Reset</button>
          </div>
        </div>

        <div className="control-group">
          <label className="control-label">Speed</label>
          <input type="range" min="100" max="1000" value={speed} onChange={e => setSpeed(Number(e.target.value))} style={{ width: '100%' }} />
        </div>
      </div>

      {/* CENTER PANEL - DP TABLE */}
      <div className="dp-area">
        <table className="dp-table">
          <thead>
            <tr className="dp-header-row">
              <th className="dp-header-col">Item</th>
              {Array(capacity + 1).fill(0).map((_, w) => (
                <th key={w} className="dp-cell">W:{w}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Row 0 (No items) */}
            <tr>
              <td className="dp-header-col">0 (Init)</td>
              {displayDP[0].map((val, w) => (
                <td key={`0-${w}`} className={getCellClass(0, w)}>{val}</td>
              ))}
            </tr>
            {/* Item Rows */}
            {items.map((item, idx) => {
              const rowIndex = idx + 1;
              const isCurrentRow = currentStep && currentStep.i === rowIndex;
              // Check safely if row exists in DP (it should)
              if (rowIndex >= displayDP.length) return null;

              return (
                <tr key={item.id}>
                  <td className="dp-header-col" style={{ color: isCurrentRow ? '#f59e0b' : '' }}>
                    #{idx + 1} (w:{item.weight}, v:{item.value})
                  </td>
                  {displayDP[rowIndex].map((val, w) => (
                    <td key={`${rowIndex}-${w}`} className={getCellClass(rowIndex, w)}>
                      {val}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* RIGHT PANEL - INFO */}
      <div className="info-panel">
        <div className="panel-header">Status</div>
        {currentStep ? (
          <>
            <div className="step-box">
              <div style={{ fontWeight: 'bold', color: '#3b82f6', marginBottom: '5px' }}>{currentStep.action}</div>
              <div>{currentStep.message}</div>
            </div>

            {currentStep.action === 'COMPARE' && currentStep.compare && (
              <>
                <div className="panel-header" style={{ marginTop: '20px' }}>Logic</div>
                <div className="formula-box">
                  {/* Formula: dp[i][w] = max(dp[i-1][w], val + dp[i-1][w-weight]) */}
                  dp[{currentStep.i}][{currentStep.w}] = max(<br />
                  &nbsp;&nbsp;<span className="val-compare">Skip: {currentStep.compare.valWithout}</span>,<br />
                  &nbsp;&nbsp;{currentStep.compare.canTake ? (
                    <span className="val-source">
                      Take: {currentStep.compare.value} + {currentStep.compare.valWith - currentStep.compare.value} = {currentStep.compare.valWith}
                    </span>
                  ) : (
                    <span style={{ color: '#ef4444' }}>Take: Impossible (W &gt; Cap)</span>
                  )}<br />
                  )<br />
                  ➔ <span className="val-highlight">{currentStep.compare.canTake
                    ? Math.max(currentStep.compare.valWithout, currentStep.compare.valWith)
                    : currentStep.compare.valWithout}
                  </span>
                </div>
              </>
            )}

            {currentStep.action === 'FINISHED' && (
              <div className="step-box" style={{ marginTop: '20px', borderLeftColor: '#10b981' }}>
                <strong>Conclusion</strong>
                <p>Optimal Value: {displayDP[items.length][capacity]}</p>
                <p>Items: {currentStep.selected.map(idx => `#${idx + 1}`).join(', ')}</p>
              </div>
            )}
          </>
        ) : (
          <div className="step-box" style={{ borderLeftColor: '#555' }}>Set Capacity and Items, then Click Start.</div>
        )}

        <div className="panel-header" style={{ marginTop: '20px' }}>Legend</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: '#f59e0b' }}></div> Computing</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: '#3b82f6', border: '2px solid #3b82f6', background: 'transparent' }}></div> Compare (Skip)</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: '#8b5cf6', border: '2px solid #8b5cf6', background: 'transparent' }}></div> Compare (Take)</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: '#10b981' }}></div> Final Path</div>
      </div>
    </div>
  );
};

export default KnapsackPage;