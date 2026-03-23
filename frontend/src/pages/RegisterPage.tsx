// Register page — premium registration form
import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, loginUser } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import type { AuthResponse } from "../types";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await registerUser({ username, email, password });
    if (!res.success) {
      setError(res.error || "Registration failed");
      setLoading(false);
      return;
    }

    const loginRes = await loginUser({ email, password });
    if (loginRes.success && loginRes.data) {
      const data = loginRes.data as AuthResponse;
      login(data.token, data.user);
      navigate("/");
    } else {
      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a14] px-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-orange-500/8 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-rose-600/8 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-rose-500/25">
            A
          </div>
          <span className="text-xl font-bold text-white">AniMah</span>
        </div>

        <div className="bg-surface-2 rounded-2xl border border-white/5 p-8 shadow-2xl shadow-black/40">
          <h1 className="text-2xl font-bold text-white mb-1 text-center">
            Join AniMah
          </h1>
          <p className="text-gray-500 text-sm text-center mb-8">
            Create your account and start tracking anime, manhwa & movies
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="animefan42"
                className="w-full bg-[#0a0a14] border border-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/25 transition"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#0a0a14] border border-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/25 transition"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">
                Password
                <span className="text-gray-600 normal-case tracking-normal ml-1">(min 6 chars)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                className="w-full bg-[#0a0a14] border border-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/25 transition"
                minLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-semibold py-3 rounded-xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Creating account...
                </span>
              ) : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-gray-600 text-sm text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-rose-400 hover:text-rose-300 font-medium transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
