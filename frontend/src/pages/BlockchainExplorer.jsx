import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import api from "../utils/api";

function BlockchainExplorer() {
  const [chain, setChain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverValid, setServerValid] = useState(false);

  const fetchChain = () => {
    setLoading(true);
    api
      .get("/api/blockchain/chain")
      .then((res) => {
        setChain(res.data?.data?.chain || []);
        setServerValid(Boolean(res.data?.data?.isValid));
      })
      .catch(() => {
        setChain([]);
        setServerValid(false);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchChain();
    const timer = setInterval(fetchChain, 10000);
    return () => clearInterval(timer);
  }, []);

  const clientValid = useMemo(() => {
    if (!chain.length) return false;
    for (let i = 1; i < chain.length; i += 1) {
      if (chain[i].previousHash !== chain[i - 1].hash) return false;
    }
    return true;
  }, [chain]);

  const isValid = serverValid && clientValid;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-strong p-5 sm:p-6 max-w-5xl mx-auto"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-200">⛓️ Blockchain Explorer</h1>
          <p className="text-xs text-slate-500 mt-1">{chain.length} blocks • Auto-refreshes every 10s</p>
        </div>
        <span
          className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
            isValid
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/15 text-red-400 border border-red-500/20"
          }`}
        >
          Chain {isValid ? "✓ Valid" : "✗ Invalid"}
        </span>
      </div>

      {loading && chain.length === 0 && (
        <div className="flex items-center gap-3 py-8 justify-center">
          <div className="spinner" style={{ width: 24, height: 24 }} />
          <p className="text-sm text-slate-400">Loading chain...</p>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Block</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Timestamp</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Medicine ID</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Hash</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Prev Hash</th>
            </tr>
          </thead>
          <tbody>
            {chain.map((block, idx) => (
              <tr
                key={block.hash}
                className={`border-b border-white/[0.03] transition-colors hover:bg-white/[0.02] ${
                  idx === 0 ? "bg-cyan-500/[0.03]" : ""
                }`}
              >
                <td className="px-4 py-3 font-semibold text-cyan-400">#{block.index}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {new Date(block.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400 max-w-[140px] truncate">
                  {block.medicineId}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      block.action === "GENESIS"
                        ? "bg-violet-500/15 text-violet-400"
                        : block.action === "MANUFACTURED"
                          ? "bg-blue-500/15 text-blue-400"
                          : block.action === "SCANNED"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-slate-500/15 text-slate-400"
                    }`}
                  >
                    {block.action}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                  {String(block.hash).slice(0, 14)}...
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                  {String(block.previousHash).slice(0, 14)}...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}

export default BlockchainExplorer;
