"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  getMyProfile,
  updateMyProfileImage,
  getMyWatchlist,
  getMyFavorites,
  getMyActivity,
} from "../services/api";
import type { UserProfile, WatchlistEntry, Favorite, ActivityLog } from "../types";
import { useAuth } from "../hooks/useAuth";

type ProfileTab = "watchlist" | "favorites" | "activity";

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<ProfileTab>("watchlist");
  const [tabLoading, setTabLoading] = useState(false);
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const { user, updateUser } = useAuth();

  const fetchProfile = useCallback(async () => {
    const res = await getMyProfile();
    if (res.success && res.data) {
      const data = res.data as UserProfile;
      setProfile(data);
      updateUser({
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
        profileImage: data.profileImage,
        createdAt: data.createdAt,
      });
      setError("");
    } else {
      setError(res.error || "Failed to load profile");
    }
    setLoading(false);
  }, [updateUser]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchProfile();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchProfile]);

  useEffect(() => {
    const fetchTabData = async () => {
      setTabLoading(true);

      if (activeTab === "watchlist") {
        const res = await getMyWatchlist();
        if (res.success && res.data) setWatchlist(res.data);
      }

      if (activeTab === "favorites") {
        const res = await getMyFavorites();
        if (res.success && res.data) setFavorites(res.data);
      }

      if (activeTab === "activity") {
        const res = await getMyActivity();
        if (res.success && res.data) setActivity(res.data);
      }

      setTabLoading(false);
    };

    void fetchTabData();
  }, [activeTab]);

  const onImageSelect = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setLoading(true);
    setError("");
    const res = await updateMyProfileImage(file);
    if (res.success && res.data) {
      await fetchProfile();
    } else {
      setError(res.error || "Failed to upload profile image");
    }
    setUploading(false);
  };

  const formatAction = (action: ActivityLog["action"]) => {
    switch (action) {
      case "REVIEW_CREATED":
        return "Created a review";
      case "REVIEW_UPDATED":
        return "Updated a review";
      case "REVIEW_DELETED":
        return "Deleted a review";
      case "REVIEW_REPLIED":
        return "Replied to a review";
      case "WATCHLIST_ADDED":
        return "Added to watchlist";
      case "WATCHLIST_UPDATED":
        return "Updated watchlist status";
      case "WATCHLIST_REMOVED":
        return "Removed from watchlist";
      case "FAVORITE_ADDED":
        return "Added to favorites";
      case "FAVORITE_REMOVED":
        return "Removed from favorites";
      default:
        return action;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a14] px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="skeleton h-8 w-48 mb-8" />
          <div className="rounded-2xl border border-white/5 bg-surface-2 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="skeleton w-20 h-20 rounded-full" />
              <div className="space-y-2 w-full">
                <div className="skeleton h-6 w-40" />
                <div className="skeleton h-4 w-64" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="skeleton h-24" />
              <div className="skeleton h-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a14] px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-400 transition">Home</Link>
          <span>/</span>
          <span className="text-gray-400">Profile</span>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-white/5 bg-surface-2 p-8 shadow-2xl shadow-black/30">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => onImageSelect(e.target.files?.[0] || null)}
          />

          <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="relative w-20 h-20 rounded-full border border-white/10 overflow-hidden bg-[#0a0a14] cursor-pointer group"
            >
              {profile?.profileImage ? (
                <img src={profile.profileImage} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white">
                  {(profile?.username || user?.username || "?")[0]?.toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs text-white">
                {uploading ? "Uploading..." : "Change"}
              </div>
            </button>

            <div>
              <h1 className="text-2xl font-bold text-white">{profile?.username}</h1>
              <p className="text-gray-400 text-sm">{profile?.email}</p>
              <p className="text-xs text-gray-500 mt-1">Role: {profile?.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/5 bg-[#0a0a14] p-5">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Reviews Count</p>
              <p className="text-3xl font-black text-white tabular-nums">{profile?.stats.reviewsCount ?? 0}</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#0a0a14] p-5">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Likes Received</p>
              <p className="text-3xl font-black text-white tabular-nums">{profile?.stats.likesReceived ?? 0}</p>
            </div>
          </div>

          <div className="mt-8 border-t border-white/5 pt-6">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setActiveTab("watchlist")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                  activeTab === "watchlist"
                    ? "bg-gradient-to-r from-rose-600 to-orange-500 text-white"
                    : "bg-[#0a0a14] border border-white/5 text-gray-400 hover:text-white"
                }`}
              >
                Watchlist
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                  activeTab === "favorites"
                    ? "bg-gradient-to-r from-rose-600 to-orange-500 text-white"
                    : "bg-[#0a0a14] border border-white/5 text-gray-400 hover:text-white"
                }`}
              >
                Favorites
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                  activeTab === "activity"
                    ? "bg-gradient-to-r from-rose-600 to-orange-500 text-white"
                    : "bg-[#0a0a14] border border-white/5 text-gray-400 hover:text-white"
                }`}
              >
                Activity
              </button>
            </div>

            {tabLoading && (
              <div className="space-y-3">
                <div className="skeleton h-16" />
                <div className="skeleton h-16" />
                <div className="skeleton h-16" />
              </div>
            )}

            {!tabLoading && activeTab === "watchlist" && (
              <div className="space-y-3">
                {watchlist.length === 0 && (
                  <p className="text-sm text-gray-500">Your watchlist is empty.</p>
                )}
                {watchlist.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/anime/${entry.titleId}`}
                    className="block rounded-xl border border-white/5 bg-[#0a0a14] p-4 hover:border-rose-500/30 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-white font-medium">{entry.title?.name || "Unknown title"}</p>
                        <p className="text-xs text-gray-500 mt-1">{entry.title?.type || "TITLE"} • {entry.title?.releaseYear || "-"}</p>
                      </div>
                      <span className="text-xs rounded-md px-2 py-1 bg-rose-500/15 text-rose-300 border border-rose-500/20">
                        {entry.status.replaceAll("_", " ")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!tabLoading && activeTab === "favorites" && (
              <div className="space-y-3">
                {favorites.length === 0 && (
                  <p className="text-sm text-gray-500">No favorites yet.</p>
                )}
                {favorites.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/anime/${entry.titleId}`}
                    className="block rounded-xl border border-white/5 bg-[#0a0a14] p-4 hover:border-rose-500/30 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-white font-medium">{entry.title?.name || "Unknown title"}</p>
                        <p className="text-xs text-gray-500 mt-1">{entry.title?.type || "TITLE"} • {entry.title?.genre || "General"}</p>
                      </div>
                      <span className="text-rose-400 text-sm">❤</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!tabLoading && activeTab === "activity" && (
              <div className="space-y-3">
                {activity.length === 0 && (
                  <p className="text-sm text-gray-500">No activity yet.</p>
                )}
                {activity.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-white/5 bg-[#0a0a14] p-4"
                  >
                    <p className="text-sm text-white">{formatAction(entry.action)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(entry.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
