import { useState, useEffect, useRef } from 'react';

// This hook handles the "Game Loop" of the visualization
const useAlgorithmPlayer = (steps, initialSpeed = 500) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < steps.length - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, speed);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, steps.length, speed]);

  const stepForward = () => {
    if (currentStep < steps.length - 1) setCurrentStep(c => c + 1);
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return { currentStep, isPlaying, setIsPlaying, stepForward, reset, speed, setSpeed };
};

export default useAlgorithmPlayer;