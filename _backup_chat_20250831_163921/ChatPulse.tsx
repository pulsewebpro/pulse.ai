import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

type Props = {
  size?: number;         // px
  mood?: "neutral"|"oops";
  className?: string;
  delay?: number;        // seconds
};

export default function ChatPulse({ size = 140, mood = "neutral", className = "", delay = 0.15 }: Props) {
  const prefersReducedMotion = useReducedMotion();

  const src = useMemo(() => {
    return mood === "oops"
      ? "/pulse/pulse-oops-coffee-4k.png"
      : "/pulse/pulse-neutral-coffee-4k.png";
  }, [mood]);

  const variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 40, scale: prefersReducedMotion ? 1 : 0.92, filter: "blur(2px)" },
    show:   { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: prefersReducedMotion ? 0.2 : 0.7, ease: [0.22, 1, 0.36, 1], delay } },
    hover:  { y: prefersReducedMotion ? 0 : -6, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <>
      <motion.div
        className={`pulse-avatar ${className}`}
        initial="hidden"
        animate="show"
        whileHover="hover"
        variants={variants}
        aria-hidden="true"
        style={{ width: size, height: size }}
      >
        <img src={src} alt="" width={size} height={size} decoding="async" />
        <div className="pulse-glow" aria-hidden="true" />
      </motion.div>
      <style jsx>{`
        .pulse-avatar {
          position: relative;
          display: inline-block;
          filter: drop-shadow(0 12px 40px rgba(56,189,248,0.22));
        }
        .pulse-avatar img {
          display: block;
          width: 100%;
          height: auto;
          user-select: none;
          pointer-events: none;
        }
        .pulse-glow {
          position: absolute;
          inset: 0;
          border-radius: 28px;
          box-shadow:
            0 0 0 1px rgba(255,215,0,0.35),
            0 18px 60px rgba(56,189,248,0.25),
            0 -8px 30px rgba(56,189,248,0.12);
          pointer-events: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .pulse-glow { box-shadow: 0 0 0 1px rgba(255,215,0,0.30); }
        }
      `}</style>
    </>
  );
}
