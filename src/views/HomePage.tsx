"use client";

// Home page — hero + animated grid with search/filter/sort + category tabs
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getRecommendedTitles, getTitles } from "../services/api";
import type { Title } from "../types";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { motion } from "framer-motion";

type SortOption = "newest" | "oldest" | "rating" | "name";
type CategoryTab = "ALL" | "ANIME" | "MANHWA" | "MOVIE";

const splitGenres = (genreText: string | undefined) =>
  (genreText || "General")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

const HomePage = () => {
  const pathname = usePathname();
  const defaultTab: CategoryTab = pathname === "/manhwa" ? "MANHWA" : "ALL";

  const [titles, setTitles] = useState<Title[]>([]);
  const [recommended, setRecommended] = useState<Title[]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [category, setCategory] = useState<CategoryTab>(defaultTab);
  const [genreFilter, setGenreFilter] = useState("ALL");
  const [ratingFilter, setRatingFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === "light";

  useEffect(() => {
    const fetchTitles = async () => {
      const res = await getTitles();
      if (res.success && res.data) setTitles(res.data as Title[]);
      setLoading(false);
    };
    fetchTitles();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!isAuthenticated) {
        setRecommended([]);
        setRecommendedLoading(false);
        return;
      }

      setRecommendedLoading(true);
      const res = await getRecommendedTitles();
      if (res.success && res.data) {
        setRecommended(res.data as Title[]);
      }
      setRecommendedLoading(false);
    };

    fetchRecommendations();
  }, [isAuthenticated]);

  const availableGenres = useMemo(
    () => ["ALL", ...Array.from(new Set(titles.flatMap((t) => splitGenres(t.genre)))).sort()],
    [titles]
  );

  const availableYears = useMemo(
    () => ["ALL", ...Array.from(new Set(titles.map((t) => String(t.releaseYear)))).sort((a, b) => Number(b) - Number(a))],
    [titles]
  );

  const filtered = useMemo(() => {
    const result = titles.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        t.description.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = category === "ALL" || t.type === category;
      const matchesGenre =
        genreFilter === "ALL" || splitGenres(t.genre).includes(genreFilter);
      const matchesRating = ratingFilter === "ALL" || t.averageRating >= Number(ratingFilter);
      const matchesYear = yearFilter === "ALL" || String(t.releaseYear) === yearFilter;
      return matchesSearch && matchesCategory && matchesGenre && matchesRating && matchesYear;
    });
    switch (sort) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "rating":
        result.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return result;
  }, [titles, debouncedSearch, sort, category, genreFilter, ratingFilter, yearFilter]);

  const animeCount = titles.filter((t) => t.type === "ANIME").length;
  const manhwaCount = titles.filter((t) => t.type === "MANHWA").length;
  const movieCount = titles.filter((t) => t.type === "MOVIE").length;

  return (
    <div className={`min-h-screen ${isLight ? "bg-slate-50" : "bg-[#0a0a14]"}`}>
      {/* Hero Section */}
      <section className={`relative overflow-hidden ${isLight ? "bg-gradient-to-b from-rose-50 via-white to-slate-50" : "bg-mesh"}`}>
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-float-delayed" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6 animate-fade-in ${
              isLight
                ? "bg-rose-100 border border-rose-200 text-rose-700"
                : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              Community-driven anime, manhwa & movies tracking
            </div>
            <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tight animate-fade-in ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              Track. Rate.{" "}
              <span className="bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                Discover.
              </span>
            </h1>
            <p className={`mt-6 text-lg sm:text-xl leading-relaxed animate-fade-in animate-fade-in-delay-1 ${
              isLight ? "text-slate-600" : "text-gray-400"
            }`}>
              Your <span className={isLight ? "text-slate-900 font-medium" : "text-white font-medium"}>anime, manhwa & movies universe</span>, organized.
              Rate your favorites, discover hidden gems, and join the community.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 animate-fade-in animate-fade-in-delay-2">
              <a
                href="#browse"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-semibold rounded-xl shadow-xl shadow-rose-500/25 hover:shadow-rose-500/40 transition-all text-center"
              >
                Start Exploring
              </a>
              {!isAuthenticated && (
                <Link
                  href="/register"
                  className={`w-full sm:w-auto px-8 py-3.5 border font-medium rounded-xl transition-all text-center ${
                    isLight
                      ? "border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-white"
                      : "border-white/10 hover:border-white/20 text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Create Account
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-8 mt-16 animate-fade-in animate-fade-in-delay-3">
              <div>
                <div className={`text-2xl sm:text-3xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{animeCount}</div>
                <div className={`text-sm mt-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>Anime</div>
              </div>
              <div>
                <div className={`text-2xl sm:text-3xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{manhwaCount}</div>
                <div className={`text-sm mt-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>Manhwa</div>
              </div>
              <div>
                <div className={`text-2xl sm:text-3xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{movieCount}</div>
                <div className={`text-sm mt-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>Movies</div>
              </div>
              <div>
                <div className={`text-2xl sm:text-3xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                  {titles.length > 0
                    ? (titles.reduce((s, t) => s + t.averageRating, 0) / titles.length || 0).toFixed(1)
                    : "0"}
                </div>
                <div className={`text-sm mt-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>Avg Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Gradient fade to content */}
        <div className={`h-24 bg-gradient-to-b from-transparent ${isLight ? "to-slate-50" : "to-[#0a0a14]"}`} />
      </section>

      {/* Browse Section */}
      <section id="browse" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {isAuthenticated && recommendedLoading && (
          <div className="mb-8">
            <h2 className={`text-xl font-bold mb-3 ${isLight ? "text-slate-900" : "text-white"}`}>Recommended for you</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`rounded-xl border p-4 ${isLight ? "border-slate-200 bg-white" : "border-white/5 bg-surface-2"}`}>
                  <div className="skeleton h-5 w-4/5 mb-2" />
                  <div className="skeleton h-4 w-2/3 mb-2" />
                  <div className="skeleton h-4 w-1/3" />
                </div>
              ))}
            </div>
          </div>
        )}

        {isAuthenticated && !recommendedLoading && recommended.length > 0 && (
          <div className="mb-8">
            <h2 className={`text-xl font-bold mb-3 ${isLight ? "text-slate-900" : "text-white"}`}>Recommended for you</h2>
            <p className={`text-sm mb-4 ${isLight ? "text-slate-500" : "text-gray-500"}`}>Based on your highly rated genres and watch preferences.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommended.slice(0, 4).map((title) => (
                <motion.div
                  key={title.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <Link
                    href={`/anime/${title.id}`}
                    className={`rounded-xl border p-4 transition block ${
                      isLight
                        ? "border-slate-200 bg-white hover:border-rose-300"
                        : "border-white/5 bg-surface-2 hover:border-rose-500/30"
                    }`}
                  >
                    <div className={`font-semibold line-clamp-1 ${isLight ? "text-slate-900" : "text-white"}`}>{title.name}</div>
                    <div className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>{title.genre || "General"} · {title.releaseYear}</div>
                    <div className="text-xs text-yellow-400 mt-2">★ {title.averageRating.toFixed(1)}</div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {(["ALL", "ANIME", "MANHWA", "MOVIE"] as CategoryTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setCategory(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                category === tab
                  ? "bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-lg shadow-rose-500/20"
                  : isLight
                    ? "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
                    : "bg-surface-2 border border-white/5 text-gray-400 hover:text-white hover:border-white/10"
              }`}
            >
              {tab === "ALL" ? "All" : tab === "ANIME" ? "Anime" : tab === "MANHWA" ? "Manhwa" : "Movies"}
              <span className="ml-1.5 text-xs opacity-60">
                {tab === "ALL" ? titles.length : tab === "ANIME" ? animeCount : tab === "MANHWA" ? manhwaCount : movieCount}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
          <div className="relative flex-1">
            <svg
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isLight ? "text-slate-400" : "text-gray-500"}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search titles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/25 transition ${
                isLight
                  ? "bg-white border border-slate-200 text-slate-900 placeholder-slate-400"
                  : "bg-surface-2 border border-white/5 text-white placeholder-gray-500"
              }`}
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className={`rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500/50 cursor-pointer min-w-[160px] ${
              isLight
                ? "bg-white border border-slate-200 text-slate-700"
                : "bg-surface-2 border border-white/5 text-gray-300"
            }`}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating">Top Rated</option>
            <option value="name">A — Z</option>
          </select>
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className={`rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500/50 cursor-pointer min-w-[150px] ${
              isLight
                ? "bg-white border border-slate-200 text-slate-700"
                : "bg-surface-2 border border-white/5 text-gray-300"
            }`}
          >
            {availableGenres.map((genre) => (
              <option key={genre} value={genre}>{genre === "ALL" ? "All Genres" : genre}</option>
            ))}
          </select>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className={`rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500/50 cursor-pointer min-w-[140px] ${
              isLight
                ? "bg-white border border-slate-200 text-slate-700"
                : "bg-surface-2 border border-white/5 text-gray-300"
            }`}
          >
            <option value="ALL">All Ratings</option>
            <option value="4">4★ and up</option>
            <option value="3">3★ and up</option>
            <option value="2">2★ and up</option>
          </select>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className={`rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500/50 cursor-pointer min-w-[130px] ${
              isLight
                ? "bg-white border border-slate-200 text-slate-700"
                : "bg-surface-2 border border-white/5 text-gray-300"
            }`}
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>{year === "ALL" ? "All Years" : year}</option>
            ))}
          </select>
          <span className={`text-sm whitespace-nowrap self-center ${isLight ? "text-slate-500" : "text-gray-600"}`}>
            {filtered.length} title{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`rounded-2xl overflow-hidden border ${isLight ? "bg-white border-slate-200" : "bg-surface-2 border-white/5"}`}>
                <div className="skeleton h-40" />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-5 w-3/4" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-2/3" />
                  <div className="skeleton h-4 w-24 mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-2 border border-white/5 flex items-center justify-center text-4xl">
              {category === "MANHWA" ? "📖" : category === "ANIME" ? "🎬" : category === "MOVIE" ? "🎥" : "🔍"}
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              {search ? "No matches found" : `No ${category === "ALL" ? "titles" : category === "MOVIE" ? "movies" : category.toLowerCase()} yet`}
            </h3>
            <p className={`mb-6 max-w-sm mx-auto ${isLight ? "text-slate-500" : "text-gray-500"}`}>
              {search
                ? `Nothing matches "${search}". Try a different search.`
                : "Be the first to add a title to the collection!"}
            </p>
            {!search && isAuthenticated && (
              <Link
                href="/add-title"
                className="inline-flex px-6 py-2.5 bg-gradient-to-r from-rose-600 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/25 transition-all hover:shadow-rose-500/40"
              >
                + Add Title
              </Link>
            )}
            {!search && !isAuthenticated && (
              <Link
                href="/login"
                className={`inline-flex px-6 py-2.5 border rounded-xl transition-all ${
                  isLight
                    ? "border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-white"
                    : "border-white/10 hover:border-white/20 text-gray-300 hover:text-white"
                }`}
              >
                Sign in to add title
              </Link>
            )}
          </div>
        )}

        {/* Card Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((title, idx) => (
              <motion.div
                key={title.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: idx * 0.03 }}
              >
                <Link
                  href={`/anime/${title.id}`}
                  className={`glow-card group relative rounded-2xl overflow-hidden border block ${
                    isLight
                      ? "bg-white border-slate-200 hover:border-rose-300"
                      : "bg-surface-2 border-white/5 hover:border-rose-500/30"
                  }`}
                >
                  {/* Gradient header / Cover image */}
                  <div className={`h-32 relative ${
                    title.type === "MANHWA"
                      ? "bg-gradient-to-br from-cyan-600/20 via-teal-600/10 to-transparent"
                      : title.type === "MOVIE"
                      ? "bg-gradient-to-br from-purple-600/20 via-pink-600/10 to-transparent"
                      : "bg-gradient-to-br from-rose-600/20 via-orange-500/10 to-transparent"
                  }`}>
                    {title.image && (
                      <img src={title.image} alt={title.name} className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    <div className={`absolute inset-0 bg-gradient-to-t ${isLight ? "from-white to-transparent" : "from-surface-2 to-transparent"}`} />
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-lg px-2.5 py-1">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-white text-sm font-bold tabular-nums">
                        {title.averageRating > 0 ? title.averageRating.toFixed(1) : "—"}
                      </span>
                    </div>
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${
                        title.type === "MANHWA"
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/20"
                          : title.type === "MOVIE"
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/20"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/20"
                      }`}>
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
                      <span>{title.type}</span>
                      <span className="flex items-center gap-1 text-rose-400/70 group-hover:text-rose-400 transition">
                        View details →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className={`border-t py-8 ${isLight ? "border-slate-200" : "border-white/5"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className={`flex items-center gap-2 text-sm ${isLight ? "text-slate-500" : "text-gray-600"}`}>
            <div className="w-6 h-6 rounded bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white text-[10px] font-black">
              A
            </div>
            AniMah · Track. Rate. Discover.
          </div>
          <div className={`text-xs ${isLight ? "text-slate-500" : "text-gray-700"}`}>
            Built with ♥ for the anime, manhwa & movies community
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
