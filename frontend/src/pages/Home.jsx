import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";

const features = [
  {
    icon: "📱",
    title: "QR Verification",
    desc: "Validate code identity against registered records",
  },
  {
    icon: "🏛️",
    title: "CDSCO Check",
    desc: "Cross-check manufacturer license authenticity",
  },
  {
    icon: "⛓️",
    title: "Blockchain Audit",
    desc: "Audit every medicine event via hash chain",
  },
  {
    icon: "📦",
    title: "Packaging Fingerprint",
    desc: "Detect tampered label or copied packaging",
  },
];

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ medicines: 5, manufacturers: 3, counterfeits: 0 });
  const [seededIds, setSeededIds] = useState([]);

  useEffect(() => {
    api
      .get("/api/stats")
      .then((res) => {
        if (res.data?.success) setStats(res.data.data);
      })
      .catch(() => {
        // Safe fallback to defaults.
      });
  }, []);

  useEffect(() => {
    api
      .get("/api/demo/seeded-ids")
      .then((res) => setSeededIds(res.data?.data || []))
      .catch(() => setSeededIds([]));
  }, []);

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Hero Section */}
      <motion.section
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl p-8 sm:p-12"
        style={{
          background: "linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(59,130,246,0.08) 50%, rgba(139,92,246,0.06) 100%)",
          border: "1px solid rgba(6,182,212,0.15)",
        }}
      >
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400 mb-4"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Blockchain-powered verification
          </motion.div>

          <h1 className="text-3xl font-bold sm:text-5xl text-white leading-tight">
            Verify Medicine Authenticity
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              in 4 Proofs
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400 text-sm sm:text-base leading-relaxed">
            Protecting India from the ₹12,000 crore fake medicine problem with QR verification,
            CDSCO license checks, blockchain auditing, and packaging fingerprint analysis.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 transition-all"
              onClick={() => navigate("/scanner")}
            >
              Scan Medicine
            </button>
            <button
              type="button"
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all"
              onClick={() => navigate("/scanner", { state: { demoId: seededIds[0] || "" } })}
            >
              Demo Mode →
            </button>
          </div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon, title, desc }) => (
          <motion.article
            key={title}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="glass-card p-5 cursor-default group"
          >
            <span className="text-2xl block mb-3 group-hover:scale-110 transition-transform">
              {icon}
            </span>
            <h3 className="text-base font-semibold text-slate-200">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{desc}</p>
          </motion.article>
        ))}
      </motion.section>

      {/* Why MedTrace */}
      <motion.section variants={fadeUp} className="glass-card-strong p-6 sm:p-8">
        <h3 className="text-xl font-semibold text-slate-200">Why MedTrace is different</h3>
        <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-3xl">
          Most systems stop at QR verification. MedTrace combines 4 independent proofs with
          behavior-based fraud detection (cross-city clone checks) to catch real-world counterfeit
          patterns. Each verification is logged on an immutable blockchain trail.
        </p>
      </motion.section>

      {/* Stats Bar */}
      <motion.section
        variants={fadeUp}
        className="glass-card p-4 sm:p-5 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-center"
      >
        {[
          [stats.medicines, "Medicines", "text-cyan-400"],
          [stats.manufacturers, "Manufacturers", "text-blue-400"],
          [stats.counterfeits, "Counterfeits", "text-red-400"],
        ].map(([value, label, color]) => (
          <div key={label}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </motion.section>

      {/* Demo IDs */}
      {seededIds.length > 0 && (
        <motion.section variants={fadeUp} className="glass-card p-4">
          <p className="text-xs font-medium text-slate-500 mb-2">Demo Seeded IDs (click to verify):</p>
          <div className="flex flex-wrap gap-2">
            {seededIds.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => navigate("/scanner", { state: { demoId: id } })}
                className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5 font-mono text-xs text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400 transition-all truncate max-w-[280px]"
              >
                {id}
              </button>
            ))}
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}

export default Home;
