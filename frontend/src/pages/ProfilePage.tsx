import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getMyProfile, updateMyProfileImage } from "../services/api";
import type { UserProfile } from "../types";
import { useAuth } from "../hooks/useAuth";

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
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
          <Link to="/" className="hover:text-gray-400 transition">Home</Link>
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
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
