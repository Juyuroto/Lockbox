import { useState, useRef, useEffect } from 'react';
import { generatePassword, getPools, randomChar } from '../utils/generatePassword';

const FRAME_MS = 35;
const SCRAMBLE_FRAMES = 6;

export function usePasswordGenerator(onChange) {
  const [isGenerating, setIsGenerating] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearInterval(timer.current), []);

  const generate = (options) => {
    clearInterval(timer.current);
    const final = generatePassword(options);
    if (!final) {
      setIsGenerating(false);
      onChange('');
      return;
    }

    const pool = getPools(options).join('');
    let frame = 0;
    setIsGenerating(true);

    timer.current = setInterval(() => {
      frame++;
      const settled = Math.max(0, frame - SCRAMBLE_FRAMES);
      if (settled >= final.length) {
        clearInterval(timer.current);
        onChange(final);
        setIsGenerating(false);
        return;
      }
      onChange(Array.from(final, (c, i) => (i < settled ? c : randomChar(pool))).join(''));
    }, FRAME_MS);
  };

  return { generate, isGenerating };
}
