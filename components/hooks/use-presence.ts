import { useState, useEffect, useCallback } from 'react';

interface PresenceUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isOnline: boolean;
  lastActivity: string | Date | null;
}

interface PresenceData {
  presence: PresenceUser[];
  onlineCount: number;
  totalCount: number;
}

export function usePresence(interval: number = 15000) {
  const [presence, setPresence] = useState<PresenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPresence = useCallback(async () => {
    try {
      const response = await fetch('/api/presence', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setPresence(data);
        setError(null);
      } else {
        setError('Failed to fetch presence');
      }
    } catch (err) {
      setError('Error fetching presence');
      console.error('Presence fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendHeartbeat = useCallback(async () => {
    try {
      await fetch('/api/presence', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Heartbeat error:', err);
    }
  }, []);

  useEffect(() => {
    // Initial fetch and heartbeat - send immediately
    const initializePresence = async () => {
      // Send heartbeat first to mark user as online
      await sendHeartbeat();
      // Then fetch presence to get updated status
      await fetchPresence();
    };
    
    initializePresence();

    // Set up polling
    const presenceInterval = setInterval(() => {
      fetchPresence();
    }, interval);

    // Send heartbeat every 15 seconds to keep status fresh
    const heartbeatInterval = setInterval(() => {
      sendHeartbeat();
    }, 15000);

    // Cleanup on page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchPresence();
        sendHeartbeat();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(presenceInterval);
      clearInterval(heartbeatInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchPresence, sendHeartbeat, interval]);

  return {
    presence,
    loading,
    error,
    refetch: fetchPresence,
  };
}

