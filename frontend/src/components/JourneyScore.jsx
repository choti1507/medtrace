import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function JourneyScore({ score = 0 }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const [animatedOffset, setAnimatedOffset] = useState(circumference);

  const ringColor =
    safeScore >= 80
      ? "stroke-emerald-400"
      : safeScore >= 50
        ? "stroke-amber-400"
        : "stroke-red-400";

  const ringGlow =
    safeScore >= 80
      ? "drop-shadow(0 0 8px rgba(16,185,129,0.5))"
      : safeScore >= 50
        ? "drop-shadow(0 0 8px rgba(245,158,11,0.5))"
        : "drop-shadow(0 0 8px rgba(239,68,68,0.5))";

  const scoreLabel =
    safeScore >= 80 ? "Trustworthy" : safeScore >= 50 ? "Moderate Risk" : "High Risk";

  // Animate the ring fill on mount
  useEffect(() => {
    const target = circumference - (safeScore / 100) * circumference;
    const timer = setTimeout(() => setAnimatedOffset(target), 100);
    return () => clearTimeout(timer);
  }, [safeScore, circumference]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-6"
    >
      <h3 className="mb-1 text-lg font-semibold text-slate-200">Trust Score</h3>
      <p className="text-xs text-slate-500 mb-4">{scoreLabel}</p>

      <div className="flex items-center justify-center">
        <svg
          className="h-44 w-44 -rotate-90"
          viewBox="0 0 180 180"
          style={{ filter: ringGlow }}
        >
          {/* Background ring */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            className="stroke-white/5"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress ring */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            className={ringColor}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={animatedOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
          />
          {/* Score text */}
          <text
            x="90"
            y="86"
            textAnchor="middle"
            className="fill-slate-100 font-bold"
            fontSize="36"
            transform="rotate(90 90 90)"
          >
            {safeScore}
          </text>
          <text
            x="90"
            y="106"
            textAnchor="middle"
            className="fill-slate-500"
            fontSize="12"
            transform="rotate(90 90 90)"
          >
            / 100
          </text>
        </svg>
      </div>
    </motion.div>
  );
}

export default JourneyScore;
