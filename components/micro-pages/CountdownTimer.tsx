"use client";

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  targetDate: string;
}

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function getRemaining(targetDate: string): Remaining {
  const diffMs = new Date(targetDate).getTime() - Date.now();
  if (isNaN(diffMs) || diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }
  const totalSeconds = Math.floor(diffMs / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: false,
  };
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState<Remaining>(() => getRemaining(targetDate));

  useEffect(() => {
    const interval = setInterval(() => setRemaining(getRemaining(targetDate)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (remaining.done) {
    return (
      <p className="text-sm font-bold text-slate-900 text-center">We&apos;re live!</p>
    );
  }

  const units: { label: string; value: number }[] = [
    { label: 'Days', value: remaining.days },
    { label: 'Hours', value: remaining.hours },
    { label: 'Minutes', value: remaining.minutes },
    { label: 'Seconds', value: remaining.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6">
      {units.map((unit) => (
        <div key={unit.label} className="flex flex-col items-center">
          <span className="text-2xl sm:text-4xl font-black text-slate-900 tabular-nums">
            {String(unit.value).padStart(2, '0')}
          </span>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
