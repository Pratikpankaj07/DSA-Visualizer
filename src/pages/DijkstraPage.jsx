import React, { useState, useEffect, useRef } from 'react';
import './DijkstraPage.css';
import { generateDijkstraSteps } from '../algorithms/dijkstra';

const DijkstraPage = () => {
  // --- State: Graph Data ---
  const [nodes, setNodes] = useState([]); // Start empty
  const [edges, setEdges] = useState([]);

  // --- State: UI & Controls ---
  const [mode, setMode] = useState('MOVE'); // 'MOVE', 'ADD_NODE', 'ADD_EDGE'
  const [startNodeId, setStartNodeId] = useState('');
  const [endNodeId, setEndNodeId] = useState('');
  const [speed, setSpeed] = useState(500);
  const [selectedNode, setSelectedNode] = useState(null);

  // --- Edge Modal State ---
  const [edgeModal, setEdgeModal] = useState({
    isOpen: false,
    from: null,
    to: null,
    x: 0,
    y: 0,
    weight: '1'
  });
  const edgeInputRef = useRef(null);

  // --- State: Simulation ---
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef(null);

  // --- Derived State ---
  const currentStep = currentStepIndex >= 0 && currentStepIndex < steps.length ? steps[currentStepIndex] : null;

  // --- Helpers ---
  const getNextNodeId = () => {
    let charCode = 65; // 'A'
    while (true) {
      const id = String.fromCharCode(charCode);
      if (!nodes.find(n => n.id === id)) return id;
      charCode++;
      // Fallback for many nodes
      if (charCode > 90) return 'N' + (nodes.length + 1);
    }
  };

  // --- Graph Interactions ---
  const handleCanvasClick = (e) => {
    // If modal is open, clicking canvas closes it
    if (edgeModal.isOpen) {
      setEdgeModal({ ...edgeModal, isOpen: false });
      setSelectedNode(null);
      return;
    }

    if (mode === 'ADD_NODE') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Prevent overlapping
      if (nodes.some(n => Math.hypot(n.x - x, n.y - y) < 50)) return;

      const newNode = { id: getNextNodeId(), x, y };
      setNodes([...nodes, newNode]);

      // Auto-set start/end if first nodes
      if (nodes.length === 0) setStartNodeId(newNode.id);
      else if (nodes.length === 1) setEndNodeId(newNode.id);

      handleReset();
    }
  };

  const handleNodeClick = (e, nodeId) => {
    e.stopPropagation();
    if (edgeModal.isOpen) return; // Block interactions when modal is open

    if (mode === 'ADD_EDGE') {
      if (!selectedNode) {
        setSelectedNode(nodeId);
      } else {
        if (selectedNode !== nodeId) {
          // Open Modal instead of prompt
          // Calculate midpoint for modal position
          const nodeA = nodes.find(n => n.id === selectedNode);
          const nodeB = nodes.find(n => n.id === nodeId);
          if (nodeA && nodeB) {
            const svgRect = document.querySelector('.graph-svg').getBoundingClientRect();

            // Verify edge doesn't already exist
            const exists = edges.some(
              edge => (edge.from === selectedNode && edge.to === nodeId) ||
                (edge.from === nodeId && edge.to === selectedNode)
            );

            if (!exists) {
              setEdgeModal({
                isOpen: true,
                from: selectedNode,
                to: nodeId,
                x: (nodeA.x + nodeB.x) / 2, // Relative to SVG space
                y: (nodeA.y + nodeB.y) / 2,
                weight: '1'
              });
            }
          }
        }
      }
    }
  };

  const confirmEdge = () => {
    const { from, to, weight } = edgeModal;
    const w = parseInt(weight);
    if (!isNaN(w) && w > 0) {
      // Add bidirectional edges
      setEdges(prev => [...prev,
      { from, to, weight: w },
      { from: to, to: from, weight: w }
      ]);
      handleReset();
    }
    setEdgeModal({ ...edgeModal, isOpen: false });
    setSelectedNode(null);
  };

  // Focus input when modal opens
  useEffect(() => {
    if (edgeModal.isOpen && edgeInputRef.current) {
      edgeInputRef.current.focus();
      edgeInputRef.current.select();
    }
  }, [edgeModal.isOpen]);

  const handleNodeDragStart = (e, nodeId) => {
    if (mode !== 'MOVE') return;
    if (edgeModal.isOpen) return;
    e.stopPropagation();

    const handleDrag = (moveEvent) => {
      const svg = document.querySelector('.graph-svg');
      const rect = svg.getBoundingClientRect();
      setNodes(prev => prev.map(n => {
        if (n.id === nodeId) {
          return {
            ...n,
            x: Math.max(20, Math.min(rect.width - 20, moveEvent.clientX - rect.left)),
            y: Math.max(20, Math.min(rect.height - 20, moveEvent.clientY - rect.top))
          };
        }
        return n;
      }));
    };
    const handleUp = () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleUp);
    };
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleUp);
  };

  const handleNodeTouchStart = (e, nodeId) => {
    if (mode !== 'MOVE') return;
    if (edgeModal.isOpen) return;
    e.stopPropagation();

    const handleTouchMove = (moveEvent) => {
      // Prevent scrolling while dragging
      if (moveEvent.cancelable) moveEvent.preventDefault();

      const touch = moveEvent.touches[0];
      const svg = document.querySelector('.graph-svg');
      const rect = svg.getBoundingClientRect();

      setNodes(prev => prev.map(n => {
        if (n.id === nodeId) {
          return {
            ...n,
            x: Math.max(20, Math.min(rect.width - 20, touch.clientX - rect.left)),
            y: Math.max(20, Math.min(rect.height - 20, touch.clientY - rect.top))
          };
        }
        return n;
      }));
    };

    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
  };

  // --- Algorithm Control ---
  const generateSteps = () => {
    if (!startNodeId || !endNodeId || startNodeId === endNodeId) {
      alert("Please select valid Source and Destination nodes (must be different).");
      return;
    }
    const result = generateDijkstraSteps(nodes, edges, startNodeId, endNodeId);
    setSteps(result);
    setCurrentStepIndex(0);
  };

  const handlePlay = () => {
    if (nodes.length < 2) {
      alert("Add at least 2 nodes first.");
      return;
    }
    if (steps.length === 0) {
      generateSteps();
      setIsPlaying(true);
    } else {
      setIsPlaying(true);
    }
  };

  const handlePause = () => setIsPlaying(false);

  const handleStepForward = () => {
    if (steps.length === 0) generateSteps();
    else if (currentStepIndex < steps.length - 1) setCurrentStepIndex(prev => prev + 1);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIndex(-1);
    setSelectedNode(null);
    setEdgeModal({ ...edgeModal, isOpen: false });
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

  // --- Render Helpers ---
  const getNodeClass = (id) => {
    let cls = 'neutral';
    if (id === startNodeId) cls = 'start';
    else if (id === endNodeId) cls = 'target';
    else if (currentStep) {
      if (id === currentStep.currentNode) cls = 'current';
      else if (currentStep.path && currentStep.path.includes(id)) cls = 'path';
      else if (currentStep.visited.has(id)) cls = 'visited';
    }
    return cls;
  };

  const getEdgeClass = (edge) => {
    if (!currentStep) return '';
    if (currentStep.type === 'FINISHED') {
      const path = currentStep.path;
      for (let i = 0; i < path.length - 1; i++) {
        if ((edge.from === path[i] && edge.to === path[i + 1]) ||
          (edge.from === path[i + 1] && edge.to === path[i])) return 'path';
      }
    }
    if (currentStep.type === 'UPDATE' &&
      currentStep.message.includes(`Relaxing edge ${edge.from}→${edge.to}`)) {
      return 'highlight';
    }
    return '';
  };

  const uniqueEdges = edges.filter(e => e.from < e.to || edges.findIndex(x => x.from === e.to && x.to === e.from) === -1);

  return (
    <div className="dijkstra-container">
      {/* LEFT PANEL */}
      <div className="control-panel">
        <div className="panel-header">Dijkstra Visualizer</div>

        <div className="control-group">
          <label className="control-label">Graph Tools</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn ${mode === 'MOVE' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode('MOVE')}
              title="Drag nodes to move"
            >Move</button>
            <button
              className={`btn ${mode === 'ADD_NODE' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode('ADD_NODE')}
              title="Click on canvas to add node"
            >+ Node</button>
            <button
              className={`btn ${mode === 'ADD_EDGE' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode('ADD_EDGE')}
              title="Click two nodes to connect"
            >+ Edge</button>
          </div>
          {mode === 'ADD_EDGE' && selectedNode && (
            <div style={{ fontSize: '0.8rem', color: '#f59e0b', padding: '5px' }}>Select second node...</div>
          )}
        </div>

        <div className="control-group">
          <label className="control-label">Pathfinding</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', width: '40px' }}>Start</span>
              <select style={{ flex: 1 }} value={startNodeId} onChange={e => { setStartNodeId(e.target.value); handleReset(); }}>
                <option value="">Select...</option>
                {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', width: '40px' }}>End</span>
              <select style={{ flex: 1 }} value={endNodeId} onChange={e => { setEndNodeId(e.target.value); handleReset(); }}>
                <option value="">Select...</option>
                {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="control-group">
          <label className="control-label">Simulation</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button className="btn btn-primary" style={{ gridColumn: 'span 2' }} onClick={handlePlay} disabled={isPlaying || (steps.length > 0 && currentStepIndex === steps.length - 1)}>
              {isPlaying ? 'Playing...' : (steps.length > 0 && currentStepIndex > -1 ? 'Resume' : 'Start')}
            </button>
            <button className="btn btn-secondary" onClick={handlePause} disabled={!isPlaying}>Pause</button>
            <button className="btn btn-secondary" onClick={handleStepForward} disabled={isPlaying}>Step ➔</button>
            <button className="btn btn-secondary" style={{ gridColumn: 'span 2', borderColor: '#ef4444', color: '#ef4444' }} onClick={() => { setNodes([]); setEdges([]); handleReset(); }}>Clear Board</button>
            <button className="btn btn-secondary" style={{ gridColumn: 'span 2' }} onClick={handleReset}>Reset Path</button>
          </div>
        </div>

        <div className="control-group">
          <label className="control-label">Speed: {speed}ms</label>
          <input
            type="range" min="100" max="1000" step="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* CENTER CANVAS */}
      <div className="canvas-container" onClick={handleCanvasClick}>
        <svg className="graph-svg">
          {/* DEFINITIONS FOR GRADIENTS */}
          <defs>
            <radialGradient id="grad-neutral" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#6b7280" />
              <stop offset="100%" stopColor="#1f2937" />
            </radialGradient>
            <radialGradient id="grad-start" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#2563eb" />
            </radialGradient>
            <radialGradient id="grad-end" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#dc2626" />
            </radialGradient>
            <radialGradient id="grad-visited" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </radialGradient>
            <radialGradient id="grad-current" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>
            <radialGradient id="grad-path" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#7c3aed" />
            </radialGradient>

            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="29" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
            </marker>
            <marker id="arrowhead-highlight" markerWidth="10" markerHeight="7" refX="29" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
            </marker>
            <marker id="arrowhead-path" markerWidth="10" markerHeight="7" refX="29" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((edge, idx) => {
            const start = nodes.find(n => n.id === edge.from);
            const end = nodes.find(n => n.id === edge.to);
            if (!start || !end) return null;

            const cls = getEdgeClass(edge);
            let marker = "url(#arrowhead)";
            if (cls === 'highlight') marker = "url(#arrowhead-highlight)";
            if (cls === 'path') marker = "url(#arrowhead-path)";

            return (
              <g key={`${edge.from}-${edge.to}`}>
                <line
                  x1={start.x} y1={start.y}
                  x2={end.x} y2={end.y}
                  className={`edge-line ${cls}`}
                  markerEnd={marker}
                />
                <rect
                  x={(start.x + end.x) / 2 - 10} y={(start.y + end.y) / 2 - 10}
                  width="20" height="20" rx="4"
                  className="edge-weight-bg"
                />
                <text
                  x={(start.x + end.x) / 2} y={(start.y + end.y) / 2}
                  dy="4"
                  className="edge-weight"
                >{edge.weight}</text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map(node => (
            <g
              key={node.id}
              className="node-group"
              transform={`translate(${node.x},${node.y})`}
              onMouseDown={(e) => handleNodeDragStart(e, node.id)}
              onTouchStart={(e) => handleNodeTouchStart(e, node.id)}
              onClick={(e) => handleNodeClick(e, node.id)}
            >
              <circle
                r="28"
                className={`node-circle ${getNodeClass(node.id)}`}
              />
              <text className="node-label" style={{ fontSize: '16px' }}>{node.id}</text>
              <text y="48" className="node-dist">
                {currentStep && currentStep.distances[node.id] !== Infinity ? currentStep.distances[node.id] : ''}
              </text>
            </g>
          ))}
        </svg>

        {/* ON-SCREEN MODAL FOR EDGE WEIGHT */}
        {edgeModal.isOpen && (
          <div
            className="edge-modal"
            style={{
              left: edgeModal.x,
              top: edgeModal.y,
              transform: 'translate(-50%, -100%) translateY(-15px)' // Position above center
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Connection: {edgeModal.from} ↔ {edgeModal.to}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.8rem', color: '#aaa' }}>Weight:</label>
              <input
                ref={edgeInputRef}
                type="number"
                min="1"
                value={edgeModal.weight}
                onChange={(e) => setEdgeModal({ ...edgeModal, weight: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') confirmEdge(); }}
              />
            </div>
            <div className="edge-modal-actions">
              <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => setEdgeModal({ ...edgeModal, isOpen: false })}>Cancel</button>
              <button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={confirmEdge}>Add Edge</button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="info-panel">
        <div className="panel-header">Status</div>

        {currentStep ? (
          <div className="step-box">
            <div style={{ fontWeight: 'bold', color: '#3b82f6', marginBottom: '5px' }}>{currentStep.type}</div>
            <div>{currentStep.message}</div>
          </div>
        ) : (
          <div className="step-box" style={{ borderLeftColor: '#555' }}>
            {nodes.length === 0 ? "Add nodes to the canvas to begin." : "Ready to run algorithm."}
          </div>
        )}

        <div className="panel-header" style={{ marginTop: '20px' }}>Legend</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}></div> Current</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: 'linear-gradient(135deg, #34d399, #059669)' }}></div> Visited</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}></div> Path</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: 'linear-gradient(135deg, #60a5fa, #2563eb)' }}></div> Start</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: 'linear-gradient(135deg, #f87171, #dc2626)' }}></div> End</div>

        <div className="panel-header" style={{ marginTop: '20px' }}>Distances</div>
        {nodes.length > 0 ? (
          <table className="distance-table">
            <thead>
              <tr>
                <th>Node</th>
                <th>Dist</th>
                <th>Done</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map(n => {
                const d = currentStep ? currentStep.distances[n.id] : Infinity;
                const v = currentStep ? currentStep.visited.has(n.id) : false;
                return (
                  <tr key={n.id} style={{ background: currentStep && currentStep.currentNode === n.id ? 'rgba(251, 191, 36, 0.1)' : 'transparent' }}>
                    <td>{n.id}</td>
                    <td>{d === Infinity ? '∞' : d}</td>
                    <td style={{ color: v ? '#34d399' : 'inherit' }}>{v ? '✓' : ''}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : <div style={{ color: '#666', fontSize: '0.9rem' }}>Graph is empty.</div>}
      </div>
    </div>
  );
};

export default DijkstraPage;