"use client";

import { useEffect, useState, useCallback } from 'react';
import { Joyride, STATUS, type EventData, type Step } from 'react-joyride';

interface TourProviderProps {
  /** Matches the module id in lib/module-catalogue.ts — used for the server-side seen-tours record and the replay-tour event. */
  moduleId: string;
  steps: Step[];
}

export const REPLAY_TOUR_EVENT = 'okleevo:replay-tour';

export default function TourProvider({ moduleId, steps }: TourProviderProps) {
  const [run, setRun] = useState(false);

  // Auto-start on first visit to this module, once ever per account —
  // seen state lives on the user record so it doesn't repeat across devices/logins.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    fetch('/api/user/tours')
      .then(res => (res.ok ? res.json() : { seenTours: [] }))
      .then((data: { seenTours?: string[] }) => {
        if (cancelled) return;
        const seen = data.seenTours?.includes(moduleId);
        if (!seen) {
          timer = setTimeout(() => {
            if (!cancelled) setRun(true);
          }, 600);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
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
      fetch('/api/user/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId }),
      }).catch(() => {});
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
