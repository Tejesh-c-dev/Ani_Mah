// FavoriteButton — Animated heart toggle for favoriting titles
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { checkFavorite, toggleFavorite } from "../services/api";
import { useToast } from "../hooks/useToast";

interface FavoriteButtonProps {
  titleId: string;
  size?: "sm" | "md" | "lg";
  initialFavorite?: boolean;
  onToggle?: (isFavorite: boolean) => void;
}

const FavoriteButton = ({
  titleId,
  size = "md",
  initialFavorite,
  onToggle,
}: FavoriteButtonProps) => {
  const [isFavorite, setIsFavorite] = useState(initialFavorite ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
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
    if (initialFavorite !== undefined) return;

    const fetchStatus = async () => {
      const res = await checkFavorite(titleId);
      if (res.success && res.data) {
        setIsFavorite(res.data.isFavorite);
      }
    };
    fetchStatus();
  }, [titleId, initialFavorite]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;
    setIsLoading(true);

    const res = await toggleFavorite(titleId);
    if (res.success && res.data) {
      setIsFavorite(res.data.isFavorite);
      onToggle?.(res.data.isFavorite);

      if (res.data.isFavorite) {
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 600);
        showToast("Added to favorites", "success");
      } else {
        showToast("Removed from favorites", "info");
      }
    } else {
      showToast(res.error || "Failed to update", "error");
    }

    setIsLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`${sizeClasses[size]} relative flex items-center justify-center rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 hover:border-rose-500/30 transition-all cursor-pointer disabled:opacity-50`}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {/* Particles */}
      <AnimatePresence>
        {showParticles && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: 1,
                  x: Math.cos((i * Math.PI) / 3) * 20,
                  y: Math.sin((i * Math.PI) / 3) * 20,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute w-1.5 h-1.5 rounded-full bg-rose-400"
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Heart icon */}
      <motion.svg
        className={`${iconSizes[size]} ${isFavorite ? "text-rose-500" : "text-gray-400"} transition-colors`}
        fill={isFavorite ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        animate={isFavorite ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </motion.svg>
    </button>
  );
};

export default FavoriteButton;
