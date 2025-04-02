'use client';

import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

interface DataActivityProps {
  isActive: boolean;
}

export function DataActivity({ isActive }: DataActivityProps) {
  const [dots, setDots] = useState<number[]>([]);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);

  useEffect(() => {
    if (isActive) {
      // Add a new dot when data activity happens
      const newDot = Date.now();
      setDots((prev) => [...prev, newDot].slice(-5)); // Keep only the last 5 dots
      setLastActivity(new Date());
    }
  }, [isActive]);

  // Remove dots after they fade out
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setDots((prev) => prev.filter((d) => now - d < 3000)); // Remove dots older than 3 seconds
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex items-center">
      <Activity className={`h-4 w-4 ${isActive ? 'text-green-500' : 'text-muted-foreground'}`} />

      {/* Activity dots */}
      <div className="absolute left-0 top-0 flex">
        {dots.map((dot, i) => (
          <span
            key={dot}
            className="absolute h-4 w-4 rounded-full bg-green-500/20 animate-ping"
            style={{
              animationDuration: '1.5s',
              animationDelay: `${i * 0.1}s`,
              opacity: Math.max(0, 1 - (Date.now() - dot) / 3000),
            }}
          />
        ))}
      </div>

      {lastActivity && (
        <span className="ml-2 text-xs text-muted-foreground">
          {lastActivity.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
