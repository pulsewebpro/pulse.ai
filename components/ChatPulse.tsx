import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

type Props = {
  size?: number;
  mood?: "neutral"|"oops"|"celebrate"|"wink";
  className?: string;
  delay?: number;
};

export default function ChatPulse({ size = 220, mood = "neutral", className = "", delay = 0.12 }: Props) {
  const prefersReducedMotion = useReducedMotion();

  const src = useMemo(() => {
    switch (mood) {
      case "celebrate": return "/pulse/pulse-celebrate-4k.png";
      case "oops":      return "/pulse/pulse-oops-coffee-4k.png";
      case "wink":      return "/pulse/pulse-wink-4k.png";
      default:          return "/pulse/pulse-neutral-coffee-4k.png";
    }
  }, [mood]);

  const variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 26, scale: prefersReducedMotion ? 1 : 0.965, filter: "blur(2px)" },
    show:   { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: prefersReducedMotion ? 0.2 : 0.8, ease: [0.22,1,0.36,1], delay } },
    hover:  { y: prefersReducedMotion ? 0 : -3, transition: { duration: 0.5, ease: "easeOut" } }
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
        style={{ width: size, height: "auto" }}
      >
        <img src={src} alt="" width={size} height={size} decoding="async" />
        <div className="pulse-ring" aria-hidden="true" />
      </motion.div>

      <style jsx>{`
        .pulse-avatar{
          position: relative;
          display: inline-block;
          filter: drop-shadow(0 22px 70px rgba(56,189,248,0.26));
          will-change: transform, filter;
        }
        .pulse-avatar img{
          display:block; width:100%; height:auto; user-select:none; pointer-events:none;
        }
        .pulse-ring{
          position:absolute; inset:-10px -12px -16px -12px; border-radius:28px;
          box-shadow:
            0 0 0 1px rgba(255,215,0,0.35),
            0 22px 70px rgba(56,189,248,0.28),
            0 -10px 36px rgba(56,189,248,0.14),
            inset 0 0 44px rgba(255,215,0,0.10);
          pointer-events:none;
        }
        @media (max-width: 1100px){ .pulse-avatar{ transform-origin:left top; } }
        @media (max-width: 780px){ :global(.left-rail) .pulse-avatar{ width:180px !important; } }
        @media (prefers-reduced-motion: reduce){ .pulse-ring{ box-shadow: 0 0 0 1px rgba(255,215,0,0.30); } }
      `}</style>
    </>
  );
}
