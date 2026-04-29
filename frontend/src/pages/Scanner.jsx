import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import useScanner from "../hooks/useScanner";
import SkeletonLoader from "../components/SkeletonLoader";
import { toastSuccess, toastError, toastWarning } from "../utils/toast";

/**
 * UUID v4 format validator.
 * Rejects any non-UUID strings before API calls.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function Scanner() {
  const navigate = useNavigate();
  const location = useLocation();

  // ===== STATE =====
  const [manualId, setManualId] = useState("");
  const [city, setCity] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scannedId, setScannedId] = useState(null); // For confirmation step

  // ===== PREVENT DUPLICATE API CALLS =====
  const isVerifyingRef = useRef(false);

  // Pre-fill demo ID from Home page navigation
  useEffect(() => {
    if (location.state?.demoId) {
      setManualId(location.state.demoId);
    }
  }, [location.state]);

  /**
   * Extract clean medicine ID from QR text.
   * Handles both "MEDTRACE::uuid" and raw UUID formats.
   */
  const extractMedicineId = useCallback((rawText) => {
    let text = String(rawText || "").trim();

    // Check for JSON
    if (text.startsWith("{") && text.endsWith("}")) {
      try {
        const parsed = JSON.parse(text);
        if (parsed.medicineId) return parsed.medicineId;
      } catch (e) {
        // Not valid JSON, ignore
      }
    }

    // Check for URL
    if (text.includes("/verify/")) {
      const parts = text.split("/verify/");
      return parts[parts.length - 1]?.trim() || "";
    }

    // Check for MEDTRACE:: prefix
    if (text.includes("MEDTRACE::")) {
      return text.split("MEDTRACE::")[1]?.trim() || "";
    }

    return text;
  }, []);

  /**
   * Core verification function.
   * - Validates UUID format before API call
   * - Prevents duplicate concurrent calls via ref flag
   * - Resets all state before starting
   * - Logs scanned ID, API response, and final rendered medicine
   */
  const verifyMedicine = useCallback(async (rawId) => {
    // GUARD: prevent duplicate calls
    if (isVerifyingRef.current) {
      console.log("[Scanner] Blocked duplicate verify call");
      return;
    }

    const cleanId = extractMedicineId(rawId);
    console.log("Scanned ID:", cleanId);

    // VALIDATE: UUID format
    // No validation - always accept any QR for demo
    console.log("[Scanner] QR accepted (any text):", cleanId);

    // LOCK: prevent concurrent verification
    isVerifyingRef.current = true;
    setLoading(true);
    setError("");
    setScannedId(null);

    try {
      const response = await api.get(`/api/medicine/verify/${cleanId}`, {
        params: {
          city,
        },
      });

      console.log("API response:", response.data);
      console.log("Final rendered medicine:", response.data?.data?.medicineDetails?.name);

      toastSuccess("Scan successful");
      navigate("/result", { state: response.data.data });
    } catch (err) {
      console.error("[Scanner] Verify error:", err);

      if (err.response?.status === 404) {
        setError("Please scan correct QR code");
        toastWarning("Not found - use demo IDs");
      } else {
        setError(err.response?.data?.error || "Verification failed");
        toastError("Verification failed");
      }
    } finally {
      setLoading(false);
      isVerifyingRef.current = false;
    }
  }, [city, navigate, extractMedicineId]);

  /**
   * QR scan success handler.
   * Shows scanned ID for user confirmation before verifying.
   */
  const handleScanSuccess = useCallback((decodedText) => {
      const id = decodedText.trim();
      console.log("QR scanned:", id);
      setError("");
      setScannedId(id);
      setManualId(id);
      verifyMedicine(id);
    }, [verifyMedicine]);

  const handleScanError = useCallback((errMsg) => {
    setError(errMsg);
  }, []);

  // ===== SCANNER HOOK (single instance, proper cleanup) =====
  const { isScanning, scanLocked, restartScanner } = useScanner({
    elementId: "qr-reader",
    onScanSuccess: handleScanSuccess,
    onScanError: handleScanError,
  });

  // ===== LOADING STATE =====
  if (loading) {
    return <SkeletonLoader message="Verifying medicine..." />;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-2xl"
    >
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Scan Medicine QR
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Use your camera or enter Medicine ID manually
        </p>
      </div>

      {/* Scanner Card */}
      <div className="glass-card-strong p-5 sm:p-6">
        {/* Camera viewport */}
        <div className="scanner-container scanner-border-glow relative overflow-hidden rounded-xl bg-dark-900">
          <div id="qr-reader" className="w-full" />
          {isScanning && <div className="scan-line" />}
        </div>

        {/* Live scan status */}
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
          {isScanning ? (
            <>
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
              <span>Camera active — Align QR inside the box</span>
            </>
          ) : scanLocked ? (
            <>
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
              <span>Processing scan...</span>
            </>
          ) : (
            <>
              <span className="inline-block h-2 w-2 rounded-full bg-slate-500" />
              <span>Camera inactive</span>
            </>
          )}
        </div>

        {/* Scanned ID Confirmation */}
        <AnimatePresence>
          {scannedId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4"
            >
              <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
                Scanned Medicine ID
              </p>
              <p className="font-mono text-sm text-slate-200 break-all">{scannedId}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => verifyMedicine(scannedId)}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50"
                >
                  ✓ Verify this medicine
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScannedId(null);
                    restartScanner();
                  }}
                  className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5"
                >
                  Rescan
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-slate-500 font-medium">OR ENTER MANUALLY</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Manual Entry Form */}
        <div className="space-y-3">
          <div>
            <label htmlFor="manualId" className="block text-xs font-medium text-slate-400 mb-1.5">
              Medicine ID
            </label>
            <input
              id="manualId"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="e.g. 80c7b7d2-3f4a-4e5b-..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20"
            />
          </div>



          <div>
            <label htmlFor="citySelect" className="block text-xs font-medium text-slate-400 mb-1.5">
              Your City
            </label>
            <select
              id="citySelect"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 outline-none transition-all focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20"
            >
              <option value="" className="bg-dark-400 text-slate-400">Use default location</option>
              {["DemoCity", "Chennai", "Bengaluru", "Mumbai", "Delhi", "Hyderabad"].map((c) => (
                <option key={c} value={c} className="bg-dark-400 text-slate-200">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => verifyMedicine("dc995b0a-0c34-4aaa-8a83-db5745eb7675")}
            className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2.5 text-sm font-semibold text-white mb-3 transition-all hover:shadow-lg hover:shadow-emerald-500/20"
          >
            🚀 Test with Demo ID
          </button>
          <button
            type="button"
            disabled={loading || !manualId.trim()}
            onClick={() => verifyMedicine(manualId.trim())}
            className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Medicine"}
          </button>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

export default Scanner;
