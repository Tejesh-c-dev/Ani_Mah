"use client";

// Navbar — premium glassmorphic navigation
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../hooks/useTheme";

const Navbar = () => {
  const { isAuthenticated, user, logout, isHydrated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLight = theme === "light";

  const isActive = (path: string) => pathname.split("?")[0] === path;

  // Only show auth-dependent UI after hydration to prevent mismatch
  const showAuthUI = isHydrated;

  return (
    <nav
      className={`sticky top-0 z-40 backdrop-blur-xl ${
        isLight
          ? "border-b border-slate-200/80 bg-white/80"
          : "border-b border-white/5 bg-[#0a0a14]/80"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-rose-500/25 group-hover:shadow-rose-500/50 transition-shadow">
              A
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
              AniMah
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/")
                  ? isLight
                    ? "bg-rose-100 text-rose-700"
                    : "bg-white/10 text-white"
                  : isLight
                    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Browse
            </Link>
            {showAuthUI && isAuthenticated && (
              <Link
                href="/add-title"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive("/add-title")
                    ? isLight
                      ? "bg-rose-100 text-rose-700"
                      : "bg-white/10 text-white"
                    : isLight
                      ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                + Add Title
              </Link>
            )}
            {showAuthUI && isAuthenticated && (
              <Link
                href="/profile"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive("/profile")
                    ? isLight
                      ? "bg-rose-100 text-rose-700"
                      : "bg-white/10 text-white"
                    : isLight
                      ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Profile
              </Link>
            )}
            {showAuthUI && isAuthenticated && user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive("/admin")
                    ? isLight
                      ? "bg-rose-100 text-rose-700"
                      : "bg-white/10 text-white"
                    : isLight
                      ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Auth section */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`text-sm transition px-3 py-1.5 rounded-lg cursor-pointer ${
                isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              title="Toggle dark mode"
            >
              {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
            </button>
            {showAuthUI && isAuthenticated ? (
              <>
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                    isLight
                      ? "bg-slate-100 border-slate-200"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.username} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                      {user?.username?.charAt(0)}
                    </div>
                  )}
                  <span className={`text-sm font-medium ${isLight ? "text-slate-700" : "text-gray-300"}`}>
                    {user?.username}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className={`text-sm transition px-3 py-1.5 cursor-pointer ${
                    isLight ? "text-slate-500 hover:text-red-500" : "text-gray-500 hover:text-red-400"
                  }`}
                >
                  Sign out
                </button>
              </>
            ) : showAuthUI ? (
              <>
                <Link
                  href="/login"
                  className={`text-sm transition px-3 py-1.5 ${
                    isLight ? "text-slate-600 hover:text-slate-900" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium text-white bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 px-5 py-2 rounded-lg transition-all shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40"
                >
                  Get Started
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2 cursor-pointer ${
              isLight ? "text-slate-500 hover:text-slate-900" : "text-gray-400 hover:text-white"
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="md:hidden overflow-hidden"
            >
              <div className={`pb-4 pt-2 space-y-1 ${isLight ? "border-t border-slate-200" : "border-t border-white/5"}`}>
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm ${
                    isLight ? "text-slate-700 hover:bg-slate-100" : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  Browse
                </Link>
                <button
                  onClick={toggleTheme}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm cursor-pointer ${
                    isLight ? "text-slate-700 hover:bg-slate-100" : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {theme === "dark" ? "🌙 Dark mode" : "☀️ Light mode"}
                </button>
                {showAuthUI && isAuthenticated ? (
                  <>
                    {user?.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className={`block px-4 py-2 rounded-lg text-sm ${
                          isLight ? "text-slate-700 hover:bg-slate-100" : "text-gray-300 hover:bg-white/5"
                        }`}
                      >
                        Admin
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className={`block px-4 py-2 rounded-lg text-sm ${
                        isLight ? "text-slate-700 hover:bg-slate-100" : "text-gray-300 hover:bg-white/5"
                      }`}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/add-title"
                      onClick={() => setMenuOpen(false)}
                      className={`block px-4 py-2 rounded-lg text-sm ${
                        isLight ? "text-slate-700 hover:bg-slate-100" : "text-gray-300 hover:bg-white/5"
                      }`}
                    >
                      + Add Title
                    </Link>
                    <div className={`px-4 py-2 text-sm ${isLight ? "text-slate-500" : "text-gray-500"}`}>
                      Signed in as {user?.username}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm cursor-pointer ${
                        isLight ? "text-red-500 hover:bg-red-50" : "text-red-400 hover:bg-white/5"
                      }`}
                    >
                      Sign out
                    </button>
                  </>
                ) : showAuthUI ? (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className={`block px-4 py-2 rounded-lg text-sm ${
                        isLight ? "text-slate-700 hover:bg-slate-100" : "text-gray-300 hover:bg-white/5"
                      }`}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMenuOpen(false)}
                      className={`block px-4 py-2 rounded-lg text-sm ${
                        isLight ? "text-rose-600 hover:bg-rose-50" : "text-rose-400 hover:bg-white/5"
                      }`}
                    >
                      Get Started
                    </Link>
                  </>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
