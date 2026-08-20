"use client";

import { useRef } from "react";
import Link from "next/link";
import type { MouseEvent as ReactMouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import {
  Globe2,
  Users,
  Calendar,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Lock,
  Zap,
} from "lucide-react";
import { ProductDemoSimulator } from "@/components/product-demo/ProductDemoSimulator";

const featureCards = [
  { icon: Calendar,    text: "Frictionless Client Bookings — zero-login for guests", color: "text-orange-500", bg: "bg-orange-50" },
  { icon: ShieldCheck, text: "Secure, Isolated File Uploads",                       color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: Sparkles,    text: "AI Meeting Transcription & Task Extraction",          color: "text-purple-500", bg: "bg-purple-50" },
  { icon: Globe2,      text: "Built for Distributed Teams, Not One Timezone",       color: "text-blue-500",   bg: "bg-blue-50" },
  { icon: Users,       text: "Team Huddles Included — No Extra Zoom or Slack",      color: "text-indigo-500", bg: "bg-indigo-50" },
];

// Slowly drifting blurred color blobs behind the hero — a light, airy
// mesh (not a dark gradient hero), respects reduced-motion preference.
function GradientMesh() {
  const shouldReduceMotion = useReducedMotion();
  const blobs = [
    { className: "bg-orange-300/30 w-[420px] h-[420px] sm:w-[520px] sm:h-[520px]", style: { top: "-12%", left: "-8%" }, dur: 22, delay: 0, path: { x: [0, 50, -20, 0], y: [0, -30, 25, 0] } },
    { className: "bg-indigo-300/30 w-[380px] h-[380px] sm:w-[460px] sm:h-[460px]", style: { top: "10%", right: "-10%" }, dur: 26, delay: 2, path: { x: [0, -40, 20, 0], y: [0, 35, -20, 0] } },
    { className: "bg-purple-300/25 w-[340px] h-[340px] sm:w-[420px] sm:h-[420px]", style: { bottom: "-14%", left: "28%" }, dur: 20, delay: 4, path: { x: [0, 30, -30, 0], y: [0, -25, 30, 0] } },
  ];

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${b.className}`}
          style={b.style}
          animate={shouldReduceMotion ? undefined : { x: b.path.x, y: b.path.y }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// Small pill badges that drift with the mouse, layered above the tilted
// demo window for a sense of depth. Purely decorative — pointer-events
// disabled so they never intercept clicks on the real demo underneath.
function FloatingBadge({ icon: Icon, label, className, depth, mx, my }: {
  icon: typeof Lock;
  label: string;
  className: string;
  depth: number;
  mx: ReturnType<typeof useSpring>;
  my: ReturnType<typeof useSpring>;
}) {
  const x = useTransform(mx, (v) => v * depth);
  const y = useTransform(my, (v) => v * depth);

  return (
    <motion.div
      style={{ x, y }}
      className={`hidden md:flex absolute items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-100 shadow-lg text-xs font-semibold text-gray-700 pointer-events-none z-10 ${className}`}
    >
      <Icon className="w-3.5 h-3.5 text-indigo-500" />
      {label}
    </motion.div>
  );
}

// Wraps the demo in a subtle 3D perspective tilt that follows the cursor —
// rests at a gentle default angle, straightens toward the viewer on hover.
function TiltedDemo({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const rotateX = useMotionValue(4);
  const rotateY = useMotionValue(-7);
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 22 });
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 22 });

  const badgeX = useMotionValue(0);
  const badgeY = useMotionValue(0);
  const springBadgeX = useSpring(badgeX, { stiffness: 120, damping: 20 });
  const springBadgeY = useSpring(badgeY, { stiffness: 120, damping: 20 });

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(-7 + px * 12);
    rotateX.set(4 - py * 10);
    badgeX.set(px * 16);
    badgeY.set(py * 16);
  };

  const handleMouseLeave = () => {
    rotateX.set(4);
    rotateY.set(-7);
    badgeX.set(0);
    badgeY.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative"
      style={{ perspective: 1600 }}
    >
      <motion.div
        style={shouldReduceMotion ? undefined : { rotateX: springRotateX, rotateY: springRotateY, transformStyle: "preserve-3d" }}
        className="drop-shadow-[0_35px_60px_-15px_rgba(79,70,229,0.25)]"
      >
        {children}
      </motion.div>

      <FloatingBadge icon={Lock} label="AES-256 Encrypted" className="-top-4 -right-4 sm:-right-8" depth={0.6} mx={springBadgeX} my={springBadgeY} />
      <FloatingBadge icon={Zap} label="Live Sync Active" className="-bottom-4 -left-4 sm:-left-8" depth={0.9} mx={springBadgeX} my={springBadgeY} />
    </div>
  );
}

export function HeroAnimation() {
  return (
    <div className="relative flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
      <GradientMesh />

      {/* ── Text – first on mobile, right column on desktop ── */}
      <motion.div
        className="order-1 lg:order-2 space-y-5 lg:space-y-8 text-center lg:text-left"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <motion.h2
          className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-gray-900 leading-[1.05] tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          The Borderless Workspace<br />for Distributed Teams
        </motion.h2>

        <motion.p
          className="text-sm sm:text-base lg:text-xl text-gray-600 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          Bring your global virtual office, async project management, and frictionless client engagement under one single roof. Ditch the costly Slack + Zoom + Asana stack.
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          className="flex flex-col sm:flex-row items-center lg:items-start gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
        >
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#fc6813' }}
          >
            Start Your Borderless Workspace
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs sm:text-sm text-gray-500">No credit card required · 14-day free trial</p>
        </motion.div>

        {/* Mobile: compact 2-col chips */}
        <motion.div
          className="grid grid-cols-2 gap-2 lg:hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {featureCards.map((f, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className={`p-1.5 ${f.bg} rounded-lg shrink-0`}>
                <f.icon className={`w-3.5 h-3.5 ${f.color}`} />
              </div>
              <span className="text-[11px] font-semibold text-gray-700 leading-tight">{f.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Desktop: full cards */}
        <div className="hidden lg:block space-y-4">
          {featureCards.map((feature, i) => (
            <motion.div key={i}
              className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className={`p-3 ${feature.bg} rounded-lg`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <span className="text-lg font-medium text-gray-800">{feature.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Preview – second on mobile, left column on desktop ── */}
      <motion.div
        className="order-2 lg:order-1 w-full"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <TiltedDemo>
          <ProductDemoSimulator />
        </TiltedDemo>
      </motion.div>

    </div>
  );
}
