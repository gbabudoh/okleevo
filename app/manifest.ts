import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Okleevo — All-in-One Virtual HQ & Business Operating Platform",
    short_name: "Okleevo",
    description:
      "The unified business operating platform for modern SMEs. Seamlessly manage team messaging, video meetings, CRM pipelines, mail engine, booking pages, and task boards in one place.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#f97316",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
