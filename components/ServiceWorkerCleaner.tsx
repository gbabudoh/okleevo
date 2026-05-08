"use client";

import { useEffect } from "react";

/**
 * ServiceWorkerCleaner Component
 * 
 * This component programmatically unregisters any active service workers
 * found for the current origin. This is useful for clearing stale registrations
 * from previous projects running on the same port (e.g., localhost:3000).
 */
export function ServiceWorkerCleaner() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          console.log("Unregistering stale Service Worker:", registration);
          registration.unregister();
        }
        
        // If any registrations were found and removed, reload to ensure a clean state
        if (registrations.length > 0) {
          console.log("Stale Service Workers removed. Reloading for clean state...");
          window.location.reload();
        }
      }).catch((error) => {
        console.error("Error unregistering Service Workers:", error);
      });
    }
  }, []);

  return null;
}
