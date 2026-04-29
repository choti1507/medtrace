import { motion } from "framer-motion";

const verdictConfig = {
  genuine: {
    icon: "✅",
    label: "Genuine",
    cssClass: "verdict-genuine",
    textColor: "text-emerald-400",
    description: "This medicine has passed all verification checks",
  },
  suspicious: {
    icon: "⚠️",
    label: "Suspicious",
    cssClass: "verdict-suspicious",
    textColor: "text-amber-400",
    description: "Some verification checks did not pass — exercise caution",
  },
  counterfeit: {
    icon: "❌",
    label: "Counterfeit",
    cssClass: "verdict-counterfeit",
    textColor: "text-red-400",
    description: "This medicine failed critical verification checks",
  },
};

function VerdictCard({ verdict = "suspicious" }) {
  const key = (verdict || "suspicious").toLowerCase();
  const config = verdictConfig[key] || verdictConfig.suspicious;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`rounded-2xl p-8 sm:p-10 text-center ${config.cssClass}`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
        className="text-5xl sm:text-6xl mb-3"
      >
        {config.icon}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-[10px] font-semibold tracking-[0.25em] text-slate-400 uppercase"
      >
        Verification Verdict
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`mt-2 text-4xl sm:text-5xl font-extrabold uppercase ${config.textColor}`}
      >
        {config.label}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-3 text-sm text-slate-400"
      >
        {config.description}
      </motion.p>
    </motion.div>
  );
}

export default VerdictCard;
