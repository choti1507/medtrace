import toast from "react-hot-toast";

/**
 * Toast notification helpers for MedTrace.
 * Uses react-hot-toast with dark glass styling.
 */

const baseStyle = {
  background: "rgba(17, 24, 39, 0.95)",
  backdropFilter: "blur(20px)",
  color: "#f1f5f9",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  fontSize: "14px",
  padding: "12px 16px",
  maxWidth: "400px",
};

export function toastSuccess(message) {
  toast.success(message, {
    style: { ...baseStyle, borderColor: "rgba(16,185,129,0.3)" },
    iconTheme: { primary: "#10b981", secondary: "#0a0e1a" },
    duration: 3000,
  });
}

export function toastError(message) {
  toast.error(message, {
    style: { ...baseStyle, borderColor: "rgba(239,68,68,0.3)" },
    iconTheme: { primary: "#ef4444", secondary: "#0a0e1a" },
    duration: 4000,
  });
}

export function toastWarning(message) {
  toast(message, {
    icon: "⚠️",
    style: { ...baseStyle, borderColor: "rgba(245,158,11,0.3)" },
    duration: 4000,
  });
}

export function toastInfo(message) {
  toast(message, {
    icon: "ℹ️",
    style: { ...baseStyle, borderColor: "rgba(59,130,246,0.3)" },
    duration: 3000,
  });
}
