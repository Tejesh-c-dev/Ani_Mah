// TitleCard — Reusable card component with 3D tilt and hover actions
import Link from "next/link";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import type { Title } from "../types";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import FavoriteButton from "./FavoriteButton";
import WatchlistDropdown from "./WatchlistDropdown";

interface TitleCardProps {
  title: Title;
  index?: number;
  showActions?: boolean;
}

const TitleCard = ({ title, index = 0, showActions = true }: TitleCardProps) => {
  const { isAuthenticated, isHydrated } = useAuth();
  const { theme } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const isLight = theme === "light";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = (y - centerY) / 20;
    const tiltY = (centerX - x) / 20;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const typeColors = {
    ANIME: {
      gradient: "from-rose-600/20 via-orange-500/10 to-transparent",
      badge: "bg-rose-500/20 text-rose-300 border-rose-500/20",
    },
    MANHWA: {
      gradient: "from-cyan-600/20 via-teal-600/10 to-transparent",
      badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/20",
    },
    MOVIE: {
      gradient: "from-purple-600/20 via-pink-600/10 to-transparent",
      badge: "bg-purple-500/20 text-purple-300 border-purple-500/20",
    },
  };

  const colors = typeColors[title.type] || typeColors.ANIME;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.03 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: "preserve-3d",
      }}
      className="transition-transform duration-200 ease-out"
    >
      <div
        className={`group relative rounded-2xl overflow-hidden transition-all duration-300 ${
          isLight
            ? "bg-white border border-slate-200 hover:border-rose-300"
            : "bg-surface-2 border border-white/5 hover:border-rose-500/30"
        } ${
          isHovered ? (isLight ? "shadow-xl shadow-rose-200/60" : "shadow-2xl shadow-rose-500/20") : ""
        }`}
      >
        {/* Quick Actions - Only show when hovered and authenticated */}
        {showActions && isHydrated && isAuthenticated && isHovered && (
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <FavoriteButton titleId={title.id} size="sm" />
            <WatchlistDropdown titleId={title.id} size="sm" />
          </div>
        )}

        <Link href={`/anime/${title.id}`} className="block">
          {/* Gradient header / Cover image */}
          <div className={`h-32 relative bg-gradient-to-br ${colors.gradient}`}>
            {title.image && (
              <img
                src={title.image}
                alt={title.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
            <div className={`absolute inset-0 bg-gradient-to-t ${isLight ? "from-white to-transparent" : "from-surface-2 to-transparent"}`} />

            {/* Rating badge */}
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-lg px-2.5 py-1">
              <span className="text-yellow-400 text-sm">★</span>
              <span className="text-white text-sm font-bold tabular-nums">
                {title.averageRating > 0 ? title.averageRating.toFixed(1) : "—"}
              </span>
            </div>

            {/* Type and Year badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${colors.badge}`}>
                {title.type}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/5">
                {title.releaseYear}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 pt-2">
            <h3 className={`text-lg font-bold transition-colors leading-snug mb-2 ${
              isLight
                ? "text-slate-900 group-hover:text-rose-600"
                : "text-white group-hover:text-rose-300"
            }`}>
              {title.name}
            </h3>
            <p className={`text-sm line-clamp-2 leading-relaxed mb-4 ${isLight ? "text-slate-500" : "text-gray-500"}`}>
              {title.description}
            </p>
            <div className={`flex items-center justify-between text-xs ${isLight ? "text-slate-500" : "text-gray-600"}`}>
              <span>{title.genre || "General"}</span>
              <span className="flex items-center gap-1 text-rose-400/70 group-hover:text-rose-400 transition">
                View details →
              </span>
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
};

export default TitleCard;
