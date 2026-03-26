// WatchlistDropdown — Status selector dropdown for watchlist management
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getWatchlistEntry, addToWatchlist, updateWatchlistStatus, removeFromWatchlist } from "../services/api";
import type { WatchlistStatus } from "../types";
import { useToast } from "../hooks/useToast";

interface WatchlistDropdownProps {
  titleId: string;
  size?: "sm" | "md" | "lg";
  initialStatus?: WatchlistStatus | null;
  onStatusChange?: (status: WatchlistStatus | null) => void;
}

const statusOptions: { value: WatchlistStatus; label: string; icon: string; color: string }[] = [
  { value: "PLAN_TO_WATCH", label: "Plan to Watch", icon: "📋", color: "text-blue-400" },
  { value: "WATCHING", label: "Watching", icon: "👀", color: "text-green-400" },
  { value: "COMPLETED", label: "Completed", icon: "✅", color: "text-emerald-400" },
  { value: "DROPPED", label: "Dropped", icon: "❌", color: "text-red-400" },
];

const WatchlistDropdown = ({
  titleId,
  size = "md",
  initialStatus,
  onStatusChange,
}: WatchlistDropdownProps) => {
  const [status, setStatus] = useState<WatchlistStatus | null>(initialStatus ?? null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const sizeClasses = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  useEffect(() => {
    if (initialStatus !== undefined) return;

    const fetchStatus = async () => {
      const res = await getWatchlistEntry(titleId);
      if (res.success && res.data) {
        setStatus(res.data.status);
      }
    };
    fetchStatus();
  }, [titleId, initialStatus]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (newStatus: WatchlistStatus | null) => {
    if (isLoading) return;
    setIsLoading(true);
    setIsOpen(false);

    try {
      if (newStatus === null) {
        // Remove from watchlist
        const res = await removeFromWatchlist(titleId);
        if (res.success) {
          setStatus(null);
          onStatusChange?.(null);
          showToast("Removed from watchlist", "info");
        } else {
          showToast(res.error || "Failed to remove", "error");
        }
      } else if (status === null) {
        // Add to watchlist
        const res = await addToWatchlist(titleId, newStatus);
        if (res.success) {
          setStatus(newStatus);
          onStatusChange?.(newStatus);
          showToast(`Added to ${statusOptions.find((s) => s.value === newStatus)?.label}`, "success");
        } else {
          showToast(res.error || "Failed to add", "error");
        }
      } else {
        // Update status
        const res = await updateWatchlistStatus(titleId, newStatus);
        if (res.success) {
          setStatus(newStatus);
          onStatusChange?.(newStatus);
          showToast(`Updated to ${statusOptions.find((s) => s.value === newStatus)?.label}`, "success");
        } else {
          showToast(res.error || "Failed to update", "error");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const currentOption = statusOptions.find((s) => s.value === status);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        disabled={isLoading}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-lg bg-black/40 backdrop-blur-sm border ${
          status ? "border-rose-500/30" : "border-white/10"
        } hover:border-rose-500/30 transition-all cursor-pointer disabled:opacity-50`}
        title={status ? currentOption?.label : "Add to watchlist"}
      >
        {status ? (
          <span className="text-sm">{currentOption?.icon}</span>
        ) : (
          <svg className={`${iconSizes[size]} text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-surface-2 border border-white/10 shadow-xl shadow-black/40 overflow-hidden z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-1">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                    status === option.value
                      ? "bg-rose-500/20 text-white"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                  {status === option.value && (
                    <svg className="w-4 h-4 ml-auto text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}

              {status && (
                <>
                  <div className="border-t border-white/5 my-1" />
                  <button
                    onClick={() => handleSelect(null)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <span>🗑️</span>
                    <span>Remove from list</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WatchlistDropdown;
