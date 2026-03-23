// Navbar — premium glassmorphic navigation
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../hooks/useTheme";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a14]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
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
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/")
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Browse
            </Link>
            {isAuthenticated && (
              <Link
                to="/add-title"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive("/add-title")
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                + Add Title
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to="/profile"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive("/profile")
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Profile
              </Link>
            )}
          </div>

          {/* Auth section */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="text-sm text-gray-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
              title="Toggle dark mode"
            >
              {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
            </button>
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.username} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                      {user?.username?.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm text-gray-300 font-medium">
                    {user?.username}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-red-400 transition px-3 py-1.5 cursor-pointer"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-400 hover:text-white transition px-3 py-1.5"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 px-5 py-2 rounded-lg transition-all shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-400 hover:text-white p-2 cursor-pointer"
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
              <div className="pb-4 pt-2 border-t border-white/5 space-y-1">
                <Link to="/" onClick={() => setMenuOpen(false)} className="block px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5">
                  Browse
                </Link>
                <button
                  onClick={toggleTheme}
                  className="w-full text-left px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 cursor-pointer"
                >
                  {theme === "dark" ? "🌙 Dark mode" : "☀️ Light mode"}
                </button>
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5">
                      Profile
                    </Link>
                    <Link to="/add-title" onClick={() => setMenuOpen(false)} className="block px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5">
                      + Add Title
                    </Link>
                    <div className="px-4 py-2 text-sm text-gray-500">Signed in as {user?.username}</div>
                    <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full text-left px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-white/5 cursor-pointer">
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5">
                      Sign in
                    </Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-4 py-2 rounded-lg text-sm text-rose-400 hover:bg-white/5">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
