import { useEffect, useState } from "react";
import Link from "next/link";
import {
  deleteTitleAsAdmin,
  deleteUserAsAdmin,
  getAdminUsers,
  getTitles,
  updateUserRoleAsAdmin,
} from "../services/api";
import type { User, Title } from "../types";
import { useAuth } from "../hooks/useAuth";

const AdminPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [titles, setTitles] = useState<Title[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTitles, setLoadingTitles] = useState(true);
  const [actionError, setActionError] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "titles">("users");
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const { user } = useAuth();

  const refreshUsers = async () => {
    setLoadingUsers(true);
    const res = await getAdminUsers();
    if (res.success && res.data) {
      setUsers(res.data);
      setActionError("");
    } else {
      setActionError(res.error || "Failed to load users");
    }
    setLoadingUsers(false);
  };

  const refreshTitles = async () => {
    setLoadingTitles(true);
    const res = await getTitles();
    if (res.success && res.data) {
      setTitles(res.data as Title[]);
      setActionError("");
    } else {
      setActionError(res.error || "Failed to load titles");
    }
    setLoadingTitles(false);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshUsers();
      void refreshTitles();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleDeleteUser = async (target: User) => {
    const confirmed = window.confirm(`Delete user ${target.username}? This cannot be undone.`);
    if (!confirmed) return;

    const res = await deleteUserAsAdmin(target.id);
    if (res.success) {
      await refreshUsers();
      return;
    }

    setActionError(res.error || "Failed to delete user");
  };

  const handleDeleteTitle = async (target: Title) => {
    const confirmed = window.confirm(`Delete title ${target.name}? This cannot be undone.`);
    if (!confirmed) return;

    const res = await deleteTitleAsAdmin(target.id);
    if (res.success) {
      await refreshTitles();
      return;
    }

    setActionError(res.error || "Failed to delete title");
  };

  const handleRoleUpdate = async (target: User, role: "USER" | "ADMIN") => {
    if (target.id === user?.id) {
      setActionError("You cannot change your own role from this panel.");
      return;
    }

    setUpdatingRoleId(target.id);
    const res = await updateUserRoleAsAdmin(target.id, role);
    if (res.success) {
      setActionError("");
      await refreshUsers();
    } else {
      setActionError(res.error || "Failed to update role");
    }
    setUpdatingRoleId(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-400 transition">Home</Link>
          <span>/</span>
          <span className="text-gray-400">Admin</span>
        </div>

        <div className="rounded-2xl border border-white/5 bg-surface-2 p-6 shadow-2xl shadow-black/30 mb-6">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage users and titles across the platform.</p>
        </div>

        {actionError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
            {actionError}
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
              activeTab === "users"
                ? "bg-gradient-to-r from-rose-600 to-orange-500 text-white"
                : "bg-surface-2 border border-white/5 text-gray-400 hover:text-white"
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("titles")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
              activeTab === "titles"
                ? "bg-gradient-to-r from-rose-600 to-orange-500 text-white"
                : "bg-surface-2 border border-white/5 text-gray-400 hover:text-white"
            }`}
          >
            Titles ({titles.length})
          </button>
        </div>

        {activeTab === "users" && (
          <div className="rounded-2xl border border-white/5 bg-surface-2 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 text-sm text-gray-400">All Users</div>
            {loadingUsers ? (
              <div className="p-5 space-y-3">
                <div className="skeleton h-12" />
                <div className="skeleton h-12" />
              </div>
            ) : users.length === 0 ? (
              <div className="p-5 text-sm text-gray-500">No users found.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {users.map((u) => (
                  <div key={u.id} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-white font-medium">{u.username}</p>
                      <p className="text-xs text-gray-500 mt-1">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-lg border ${
                        u.role === "ADMIN"
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : "bg-white/5 text-gray-300 border-white/10"
                      }`}>
                        {u.role || "USER"}
                      </span>
                      <button
                        onClick={() => void handleRoleUpdate(u, u.role === "ADMIN" ? "USER" : "ADMIN")}
                        disabled={updatingRoleId === u.id || u.id === user?.id}
                        className="px-3 py-1.5 rounded-lg text-xs border border-blue-500/25 text-blue-300 hover:bg-blue-500/10 transition cursor-pointer disabled:opacity-40"
                      >
                        {u.role === "ADMIN" ? "Make User" : "Make Admin"}
                      </button>
                      <button
                        onClick={() => void handleDeleteUser(u)}
                        disabled={u.role === "ADMIN"}
                        className="px-3 py-1.5 rounded-lg text-xs border border-red-500/25 text-red-400 hover:bg-red-500/10 transition cursor-pointer disabled:opacity-40"
                      >
                        Remove User
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "titles" && (
          <div className="rounded-2xl border border-white/5 bg-surface-2 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 text-sm text-gray-400">All Titles</div>
            {loadingTitles ? (
              <div className="p-5 space-y-3">
                <div className="skeleton h-12" />
                <div className="skeleton h-12" />
              </div>
            ) : titles.length === 0 ? (
              <div className="p-5 text-sm text-gray-500">No titles found.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {titles.map((t) => (
                  <div key={t.id} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-white font-medium">{t.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{t.type} • {t.releaseYear} • {t.genre}</p>
                    </div>
                    <button
                      onClick={() => void handleDeleteTitle(t)}
                      className="px-3 py-1.5 rounded-lg text-xs border border-red-500/25 text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                    >
                      Delete Title
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
