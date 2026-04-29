import { motion } from "framer-motion";

/**
 * SkeletonLoader — Shows a premium skeleton UI while verifying medicine.
 * Displays a spinner, message, and animated skeleton cards.
 */
function SkeletonLoader({ message = "Verifying medicine..." }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-8 py-12"
    >
      {/* Spinner */}
      <div className="relative">
        <div className="spinner" />
        <div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: "0 0 30px rgba(6, 182, 212, 0.2)" }}
        />
      </div>

      {/* Message */}
      <div className="text-center">
        <p className="text-lg font-semibold text-slate-200">{message}</p>
        <p className="mt-1 text-sm text-slate-400">
          Running 4-proof verification checks...
        </p>
      </div>

      {/* Skeleton Cards */}
      <div className="w-full max-w-2xl space-y-4">
        {/* Verdict skeleton */}
        <div className="glass-card p-8">
          <div className="mx-auto skeleton h-4 w-20 mb-3" />
          <div className="mx-auto skeleton h-10 w-48" />
        </div>

        {/* Score + Proofs skeleton */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass-card p-6">
            <div className="skeleton h-4 w-24 mb-4" />
            <div className="mx-auto skeleton h-36 w-36 rounded-full" />
          </div>
          <div className="glass-card p-6 space-y-3">
            <div className="skeleton h-4 w-20 mb-4" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-12 w-full" />
            ))}
          </div>
        </div>

        {/* Details skeleton */}
        <div className="glass-card p-6">
          <div className="skeleton h-4 w-32 mb-4" />
          <div className="grid gap-2 sm:grid-cols-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default SkeletonLoader;
