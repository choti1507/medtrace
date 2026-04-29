import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import JourneyScore from "../components/JourneyScore";
import VerdictCard from "../components/VerdictCard";

const proofIcons = {
  "Database Verification": "🗄️",
  "CDSCO License Check": "🏛️",
  "Blockchain Integrity": "🔗",
  "Packaging Fingerprint": "📦",
};

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function Result() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const data = state || {};
  const details = data.medicineDetails || {};
  const trail = data.blockchainTrail || [];
  const proofChecks = data.proofChecks || {};

  const proofRows = useMemo(
    () => [
      ["Database Verification", proofChecks.databaseVerification, "Registered and active in central registry"],
      ["CDSCO License Check", proofChecks.cdscoLicenseCheck, "Manufacturer license verified and not expired"],
      ["Blockchain Integrity", proofChecks.blockchainIntegrity, "Hash and chain consistency verified"],
      ["Packaging Fingerprint", proofChecks.packagingFingerprintCheck, "Scanned packaging sample matches manufacturer fingerprint"],
    ],
    [proofChecks]
  );

  if (!state) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card-strong p-8 text-center max-w-md mx-auto mt-12"
      >
        <div className="text-4xl mb-4">🔍</div>
        <p className="text-slate-300 text-lg font-medium">No verification result found</p>
        <p className="text-slate-500 text-sm mt-1">Please scan a medicine QR code first</p>
        <button
          type="button"
          onClick={() => navigate("/scanner")}
          className="mt-6 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
        >
          Go to Scanner
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-5 max-w-4xl mx-auto"
    >
      {/* Verdict */}
      <motion.div variants={fadeUp}>
        <VerdictCard verdict={data.verdict} />
      </motion.div>

      {/* Expiry Warning */}
      {details.isExpired && (
        <motion.div
          variants={fadeUp}
          className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3"
        >
          <span className="text-xl flex-shrink-0">⏰</span>
          <div>
            <p className="text-amber-400 font-semibold text-sm">Expired Medicine</p>
            <p className="text-amber-400/70 text-xs mt-0.5">
              This medicine has expired. Do not consume without professional medical advice.
            </p>
          </div>
        </motion.div>
      )}

      {/* Score + Proofs Grid */}
      <motion.div variants={fadeUp} className="grid gap-5 lg:grid-cols-2">
        <JourneyScore score={data.journeyScore} />

        <motion.section variants={fadeUp} className="glass-card p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-1">4 Proofs</h3>
          <p className="text-xs text-slate-500 mb-4">
            {data.proofsPassed || 0} of 4 checks passed
          </p>
          <div className="space-y-2.5">
            {proofRows.map(([name, passed, description]) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`rounded-xl border p-3.5 transition-all ${
                  passed === "NOT_CHECKED"
                    ? "border-slate-500/20 bg-slate-500/5"
                    : passed
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-red-500/20 bg-red-500/5"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg flex-shrink-0">
                      {proofIcons[name] || "🔍"}
                    </span>
                    <p className="font-semibold text-sm text-slate-200 truncate">{name}</p>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      passed === "NOT_CHECKED"
                        ? "bg-slate-500/20 text-slate-400"
                        : passed
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {passed === "NOT_CHECKED" ? "NOT CHECKED" : passed ? "PASS" : "FAIL"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 ml-8">{description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </motion.div>

      {/* Medicine Details */}
      <motion.section variants={fadeUp} className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">💊</span>
          <h3 className="text-lg font-semibold text-slate-200">Medicine Details</h3>
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          {[
            ["Name", details.name],
            ["Manufacturer", details.manufacturer],
            ["Batch Number", details.batchNumber],
            ["Manufacture Date", details.manufactureDate ? new Date(details.manufactureDate).toLocaleDateString() : "—"],
            ["Expiry Date", details.expiryDate ? new Date(details.expiryDate).toLocaleDateString() : "—"],
            ["Drug Type", details.drugType],
            ["CDSCO License", details.cdscoLicenseNumber],
            ["Packaging Sample", details.packagingImageName || "Not provided"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
              <p className="text-slate-200 mt-0.5 font-medium">{value || "—"}</p>
            </div>
          ))}
          <div className="sm:col-span-2 rounded-lg border border-white/5 bg-white/[0.02] p-3">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Composition</p>
            <p className="text-slate-200 mt-0.5 font-medium">{details.composition || "—"}</p>
          </div>
        </div>
      </motion.section>

      {/* Risk Diagnostics */}
      {data.errors && (
        <motion.section variants={fadeUp} className="glass-card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🛡️</span>
            <h3 className="text-lg font-semibold text-slate-200">Risk Diagnostics</h3>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            {[
              ["Expired Medicine", data.errors.expiredMedicine],
              ["Expired CDSCO License", data.errors.expiredLicense],
              ["Blockchain Tampering", data.errors.blockchainTampering],
              ["Packaging Mismatch", data.errors.packagingMismatch],
            ].map(([label, flagged]) => (
              <div
                key={label}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  flagged
                    ? "border-red-500/20 bg-red-500/5"
                    : "border-emerald-500/10 bg-emerald-500/[0.02]"
                }`}
              >
                <span className="text-slate-300">{label}</span>
                <span className={`text-xs font-bold ${flagged ? "text-red-400" : "text-emerald-400"}`}>
                  {flagged ? "⚠ YES" : "✓ NO"}
                </span>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Blockchain Trail */}
      <motion.section variants={fadeUp} className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">⛓️</span>
          <h3 className="text-lg font-semibold text-slate-200">Blockchain Trail</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {trail.map((block, idx) => (
            <div key={block.hash} className="flex items-center gap-2.5">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 min-w-[140px]">
                <p className="font-semibold text-cyan-400 text-xs">{block.action}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(block.timestamp).toLocaleString()}
                </p>
                <p className="font-mono text-[10px] text-slate-500 mt-1">
                  {String(block.hash).slice(0, 14)}...
                </p>
              </div>
              {idx < trail.length - 1 && (
                <span className="text-cyan-600 text-lg">→</span>
              )}
            </div>
          ))}
        </div>
      </motion.section>

      {/* Fraud Alerts */}
      {["suspicious", "counterfeit"].includes(data.verdict) && (
        <motion.section
          variants={fadeUp}
          className="rounded-xl border border-red-500/20 bg-red-500/5 p-5"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🚨</span>
            <div>
              <h4 className="font-semibold text-red-400">Fraud Alert</h4>
              <p className="text-sm text-red-300/80 mt-1">
                {data.fraudMessage || "Potential tampering detected for this medicine."}
              </p>
            </div>
          </div>
        </motion.section>
      )}

      {/* Verification Alerts */}
      {Array.isArray(data.alerts) && data.alerts.length > 0 && (
        <motion.section
          variants={fadeUp}
          className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">📋</span>
            <div>
              <h4 className="font-semibold text-amber-400">Verification Alerts</h4>
              <ul className="mt-2 space-y-1">
                {data.alerts.map((alert, i) => (
                  <li key={i} className="text-sm text-amber-300/80 flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    {alert}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>
      )}

      {/* Action Buttons */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3 pt-2 pb-4">
        <button
          type="button"
          onClick={() => navigate("/scanner")}
          className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
        >
          Scan Another
        </button>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-lg border border-white/10 px-6 py-3 font-medium text-slate-300 hover:bg-white/5 transition-all"
        >
          Back to Home
        </button>
      </motion.div>
    </motion.div>
  );
}

export default Result;
