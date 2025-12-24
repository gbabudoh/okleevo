"use client";

import { useEffect } from "react";

export function FaviconLinks() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined" || !document.head) {
      return;
    }

    try {
      const head = document.head;
      
      // Remove ALL existing favicon links first (including Next.js defaults)
      const existingIcons = head.querySelectorAll('link[rel*="icon"]');
      existingIcons.forEach(icon => icon.remove());

      // Add our custom favicon.png FIRST (primary - works in Safari, Edge, Firefox, Chrome)
      const faviconPng = document.createElement("link");
      faviconPng.rel = "icon";
      faviconPng.type = "image/png";
      faviconPng.href = "/favicon.png?v=" + Date.now(); // Cache bust
      faviconPng.sizes = "32x32";
      
      // Insert at the very beginning of head (safely)
      if (head.firstChild) {
        head.insertBefore(faviconPng, head.firstChild);
      } else {
        head.appendChild(faviconPng);
      }

      // Add shortcut icon for legacy browsers
      const shortcutIcon = document.createElement("link");
      shortcutIcon.rel = "shortcut icon";
      shortcutIcon.type = "image/png";
      shortcutIcon.href = "/favicon.png?v=" + Date.now();
      head.appendChild(shortcutIcon);

      // Add apple touch icon (Safari, iOS)
      const appleIcon = document.createElement("link");
      appleIcon.rel = "apple-touch-icon";
      appleIcon.href = "/favicon.png?v=" + Date.now();
      appleIcon.sizes = "180x180";
      head.appendChild(appleIcon);

      // Force immediate favicon update
      setTimeout(() => {
        const currentFavicon = head.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (currentFavicon) {
          currentFavicon.href = "/favicon.png?v=" + Date.now();
        }
      }, 0);
    } catch (error) {
      // Silently fail if there's an error
      console.error("Error setting favicon:", error);
    }
  }, []);

  return null;
}

