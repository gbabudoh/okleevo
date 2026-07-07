"use client";

import { useEffect } from "react";

/**
 * ServiceWorkerCleaner Component
 *
 * Unregisters any stale service worker left over from other projects on the
 * same origin/port, then registers our own PWA service worker (public/sw.js)
 * so the app is installable and reliably opens to start_url ("/").
 */
export function ServiceWorkerCleaner() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then(async (registrations) => {
        let hadStale = false;

        for (const registration of registrations) {
          const isOurs = registration.active?.scriptURL.endsWith("/sw.js");
          if (!isOurs) {
            console.log("Unregistering stale Service Worker:", registration);
            await registration.unregister();
            hadStale = true;
          }
        }

        if (hadStale) {
          console.log("Stale Service Workers removed. Reloading for clean state...");
          window.location.reload();
          return;
        }

        navigator.serviceWorker.register("/sw.js").catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
      }).catch((error) => {
        console.error("Error managing Service Workers:", error);
      });
    }
  }, []);

  return null;
}
