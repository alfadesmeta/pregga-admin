import { useState, useEffect, useRef } from "react";

export function useCountUp(endValue: number, duration: number = 1500, delay: number = 0) {
  const [count, setCount] = useState(0);
  const endValueRef = useRef(endValue);
  const durationRef = useRef(duration);

  useEffect(() => {
    endValueRef.current = endValue;
    durationRef.current = duration;
  }, [endValue, duration]);

  useEffect(() => {
    let animationFrameId: number;
    let startTime: number | null = null;
    let currentCount = 0;

    const animate = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / durationRef.current, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const newCount = Math.floor(easeOutQuart * endValueRef.current);

      if (newCount !== currentCount) {
        currentCount = newCount;
        setCount(newCount);
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(endValueRef.current);
      }
    };

    setCount(0);

    const timeoutId = setTimeout(() => {
      animationFrameId = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [delay]);

  return count;
}
