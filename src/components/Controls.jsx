import React from 'react';

const Controls = ({ onPlay, onPause, onStep, onReset, isPlaying, speed, setSpeed }) => {
  return (
    <div className="controls">
      {!isPlaying ? (
        <button className="btn-primary" onClick={onPlay}>Play Animation</button>
      ) : (
        <button className="btn-secondary" onClick={onPause}>Pause</button>
      )}
      <button className="btn-secondary" onClick={onStep} disabled={isPlaying}>Step ➡️</button>
      <button className="btn-secondary" onClick={onReset}>Reset ⟲</button>
      
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
        <span>Slow</span>
        <input 
          type="range" 
          min="50" 
          max="1000" 
          step="50" 
          value={1050 - speed} 
          onChange={(e) => setSpeed(1050 - Number(e.target.value))} 
        />
        <span>Fast</span>
      </div>
    </div>
  );
};

export default Controls;