import { useState, useEffect, useRef, useCallback } from "react";

export function useCountUp(endValue: number, duration: number = 1500, delay: number = 0) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number>();

  const animate = useCallback((timestamp: number) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = timestamp;
    }
    
    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth deceleration
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const currentCount = Math.floor(easeOutQuart * endValue);
    
    if (currentCount !== countRef.current) {
      countRef.current = currentCount;
      setCount(currentCount);
    }
    
    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      setCount(endValue);
    }
  }, [endValue, duration]);

  useEffect(() => {
    setCount(0);
    countRef.current = 0;
    startTimeRef.current = null;
    
    const timeoutId = setTimeout(() => {
      animationFrameRef.current = requestAnimationFrame(animate);
    }, delay);
    
    return () => {
      clearTimeout(timeoutId);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate, delay, endValue]);

  return count;
}
