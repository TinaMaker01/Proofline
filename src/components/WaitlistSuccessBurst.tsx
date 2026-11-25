import { motion, useReducedMotion } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
  rotate: number;
  width: number;
  height: number;
  color: string;
  delay: number;
}

const PARTICLES: Particle[] = [
  { id: 1, x: -78, y: -44, rotate: -38, width: 7, height: 4, color: '#3B82F6', delay: 0.02 },
  { id: 2, x: -52, y: -62, rotate: 24, width: 5, height: 5, color: '#10B981', delay: 0.04 },
  { id: 3, x: -24, y: -70, rotate: -18, width: 8, height: 3.5, color: '#60A5FA', delay: 0.01 },
  { id: 4, x: 10, y: -72, rotate: 32, width: 6, height: 4, color: '#2563EB', delay: 0.03 },
  { id: 5, x: 44, y: -60, rotate: -26, width: 7, height: 4, color: '#34D399', delay: 0.05 },
  { id: 6, x: 74, y: -40, rotate: 42, width: 5, height: 5, color: '#3B82F6', delay: 0.02 },
  { id: 7, x: -86, y: -8, rotate: 16, width: 6, height: 3.5, color: '#94A3B8', delay: 0.06 },
  { id: 8, x: 84, y: -6, rotate: -22, width: 7, height: 3.5, color: '#60A5FA', delay: 0.04 },
  { id: 9, x: -64, y: 24, rotate: -48, width: 5, height: 5, color: '#2563EB', delay: 0.07 },
  { id: 10, x: 64, y: 26, rotate: 36, width: 6, height: 4, color: '#10B981', delay: 0.06 },
  { id: 11, x: -30, y: -48, rotate: 54, width: 4, height: 4, color: '#CBD5E1', delay: 0.08 },
  { id: 12, x: 28, y: -46, rotate: -50, width: 4, height: 4, color: '#3B82F6', delay: 0.05 },
];

export function WaitlistSuccessBurst() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-visible flex items-center justify-center"
    >
      <motion.span
        initial={{ scale: 0.6, opacity: 0.55 }}
        animate={{ scale: 1.9, opacity: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="w-10 h-10 rounded-full border border-[#2563EB]/40 dark:border-[#60A5FA]/50"
      />

      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, scale: 0.4, opacity: 0, rotate: 0 }}
          animate={{
            x: p.x,
            y: [0, p.y, p.y + 18],
            scale: [0.4, 1, 0.75],
            opacity: [0, 1, 0],
            rotate: p.rotate,
          }}
          transition={{
            duration: 0.95,
            delay: p.delay,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            width: `${p.width}px`,
            height: `${p.height}px`,
            backgroundColor: p.color,
          }}
          className="absolute rounded-[1.5px]"
        />
      ))}
    </div>
  );
}
