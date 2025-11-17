import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BehaviorMetrics {
  mouseMovements: number;
  interactions: number;
  timeOnPage: number;
  formFillTime: number;
  suspicionScore: number;
}

export const useBehavioralAnalysis = (formType: string) => {
  const [metrics, setMetrics] = useState<BehaviorMetrics>({
    mouseMovements: 0,
    interactions: 0,
    timeOnPage: 0,
    formFillTime: 0,
    suspicionScore: 0
  });
  
  const pageLoadTime = useRef(Date.now());
  const firstInteractionTime = useRef<number | null>(null);
  const lastInteractionTime = useRef<number | null>(null);

  // Track mouse movements
  useEffect(() => {
    let movementCount = 0;
    
    const handleMouseMove = () => {
      movementCount++;
      setMetrics(prev => ({ ...prev, mouseMovements: movementCount }));
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Track form interactions
  const trackInteraction = useCallback(() => {
    const now = Date.now();
    
    if (!firstInteractionTime.current) {
      firstInteractionTime.current = now;
    }
    lastInteractionTime.current = now;
    
    setMetrics(prev => ({
      ...prev,
      interactions: prev.interactions + 1,
      timeOnPage: now - pageLoadTime.current,
      formFillTime: firstInteractionTime.current ? now - firstInteractionTime.current : 0
    }));
  }, []);

  // Calculate suspicion score
  const calculateSuspicionScore = useCallback((): number => {
    let score = 0;
    
    // No mouse movement is highly suspicious
    if (metrics.mouseMovements === 0) {
      score += 50;
    } else if (metrics.mouseMovements < 5) {
      score += 30;
    }
    
    // Very few interactions before submission
    if (metrics.interactions < 3) {
      score += 20;
    }
    
    // Instant submission (less than 2 seconds)
    if (metrics.formFillTime < 2000) {
      score += 40;
    } else if (metrics.formFillTime < 5000) {
      score += 20;
    }
    
    // Too fast on page (less than 3 seconds)
    if (metrics.timeOnPage < 3000) {
      score += 30;
    }
    
    return Math.min(score, 100);
  }, [metrics]);

  // Log suspicious activity
  const logSuspiciousActivity = useCallback(async () => {
    const suspicionScore = calculateSuspicionScore();
    
    setMetrics(prev => ({ ...prev, suspicionScore }));
    
    // Only log if suspicion score is high (>= 60)
    if (suspicionScore >= 60) {
      try {
        await supabase.functions.invoke('log-suspicious-activity', {
          body: {
            activityType: `suspicious_${formType}_submission`,
            details: {
              mouseMovements: metrics.mouseMovements,
              interactions: metrics.interactions,
              timeOnPage: metrics.timeOnPage,
              formFillTime: metrics.formFillTime,
              suspicionScore,
              formType
            }
          }
        });
      } catch (error) {
        console.error('Error logging suspicious activity:', error);
      }
    }
    
    return suspicionScore;
  }, [formType, metrics, calculateSuspicionScore]);

  return {
    metrics,
    trackInteraction,
    logSuspiciousActivity,
    isSuspicious: () => calculateSuspicionScore() >= 60
  };
};
