"use client";

import { useEffect, useState, useCallback } from 'react';
import { Joyride, STATUS, type EventData, type Step } from 'react-joyride';

interface TourProviderProps {
  /** Matches the module id in lib/module-catalogue.ts — used for the localStorage key and the replay-tour event. */
  moduleId: string;
  steps: Step[];
}

const storageKey = (moduleId: string) => `okleevo_tour_seen_${moduleId}`;

export const REPLAY_TOUR_EVENT = 'okleevo:replay-tour';

export default function TourProvider({ moduleId, steps }: TourProviderProps) {
  const [run, setRun] = useState(false);

  // Auto-start on first visit to this module (per browser).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = window.localStorage.getItem(storageKey(moduleId));
    if (seen) return;
    const timer = setTimeout(() => setRun(true), 600);
    return () => clearTimeout(timer);
  }, [moduleId]);

  // Manual "Replay tour" trigger from the sidebar, dispatched as a window event
  // so it can reach whichever page's TourProvider is currently mounted.
  useEffect(() => {
    function handleReplay(e: Event) {
      const detail = (e as CustomEvent<{ moduleId: string }>).detail;
      if (detail?.moduleId === moduleId) setRun(true);
    }
    window.addEventListener(REPLAY_TOUR_EVENT, handleReplay);
    return () => window.removeEventListener(REPLAY_TOUR_EVENT, handleReplay);
  }, [moduleId]);

  const handleEvent = useCallback((data: EventData) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      setRun(false);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey(moduleId), 'true');
      }
    }
  }, [moduleId]);

  if (steps.length === 0) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      onEvent={handleEvent}
      options={{
        showProgress: true,
        primaryColor: '#4f46e5',
        zIndex: 10000,
      }}
    />
  );
}
