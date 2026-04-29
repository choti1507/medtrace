import { useEffect, useRef, useCallback, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

/**
 * useScanner — Custom hook for QR code scanning.
 *
 * FIXES:
 *  - Scanner initializes ONLY once via useRef guard
 *  - Proper cleanup on unmount (stops camera, clears instance)
 *  - Scan lock system: prevents duplicate scans for 3 seconds
 *  - Only ONE verification request per scan (isProcessing flag)
 *  - Resets state cleanly before each new scan
 *
 * @param {Object} options
 * @param {string} options.elementId - DOM element ID for the scanner
 * @param {function} options.onScanSuccess - Callback with decoded text
 * @param {function} options.onScanError - Callback for errors
 * @returns {{ isScanning: boolean, scanLocked: boolean, restartScanner: function }}
 */
export default function useScanner({ elementId, onScanSuccess, onScanError }) {
  const scannerRef = useRef(null);
  const isInitializedRef = useRef(false);
  const isProcessingRef = useRef(false);
  const lockTimerRef = useRef(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);

  // Store latest callbacks in refs so the scanner always calls current versions
  const onSuccessRef = useRef(onScanSuccess);
  const onErrorRef = useRef(onScanError);
  onSuccessRef.current = onScanSuccess;
  onErrorRef.current = onScanError;

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        // Html5QrcodeScannerState: 2 = SCANNING, 3 = PAUSED
        if (state === 2 || state === 3) {
          await scannerRef.current.stop();
        }
      } catch {
        // Scanner may already be stopped — safe to ignore
      }
      try {
        scannerRef.current.clear();
      } catch {
        // Safe cleanup
      }
      scannerRef.current = null;
    }
    isInitializedRef.current = false;
    setIsScanning(false);
  }, []);

  const startScanner = useCallback(async () => {
    // Guard: prevent double initialization
    if (isInitializedRef.current || scannerRef.current) {
      console.log("[useScanner] Already initialized, skipping");
      return;
    }

    const el = document.getElementById(elementId);
    if (!el) {
      console.error("[useScanner] Element not found:", elementId);
      return;
    }

    isInitializedRef.current = true;
    const scanner = new Html5Qrcode(elementId);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 },
        async (decodedText) => {
          // SCAN LOCK: prevent rapid duplicate scans
          if (isProcessingRef.current) {
            console.log("[useScanner] Scan blocked — already processing");
            return;
          }

          isProcessingRef.current = true;
          setScanLocked(true);
          console.log("[useScanner] Scanned raw text:", decodedText);

          // Stop scanner immediately after successful scan
          try {
            await scanner.stop();
          } catch {
            // Already stopped
          }
          setIsScanning(false);

          // Delegate to callback
          if (onSuccessRef.current) {
            onSuccessRef.current(decodedText);
          }

          // 3-second lock period before allowing new scans
          lockTimerRef.current = setTimeout(() => {
            isProcessingRef.current = false;
            setScanLocked(false);
          }, 3000);
        },
        () => {
          // QR not detected in this frame — intentionally silent
        }
      );

      setIsScanning(true);
      console.log("[useScanner] Camera started successfully");
    } catch (err) {
      isInitializedRef.current = false;
      scannerRef.current = null;
      setIsScanning(false);

      const errStr = String(err).toLowerCase();
      if (errStr.includes("permission")) {
        onErrorRef.current?.("Please allow camera access to scan QR codes");
      } else {
        onErrorRef.current?.("Camera not available. You can enter Medicine ID manually below.");
      }
      console.error("[useScanner] Start error:", err);
    }
  }, [elementId]);

  const restartScanner = useCallback(async () => {
    isProcessingRef.current = false;
    setScanLocked(false);
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
    await stopScanner();
    // Small delay to let DOM settle
    setTimeout(() => {
      startScanner();
    }, 300);
  }, [stopScanner, startScanner]);

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      startScanner();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current);
      }
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  return { isScanning, scanLocked, restartScanner };
}
