"use client";

// Add Title page — form to create a new anime, manhwa, or movie title with image upload
import { useState, useRef, type FormEvent, type DragEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createTitle } from "../services/api";
import { useTheme } from "../hooks/useTheme";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const GENRE_OPTIONS = [
  "Action",
  "Adventure",
  "Drama",
  "Fantasy",
  "Comedy",
  "Romance",
  "Thriller",
  "Sci-Fi",
  "Mystery",
  "Slice of Life",
  "Psychological",
  "Horror",
];

const AddAnimePage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [type, setType] = useState("ANIME");
  const [genres, setGenres] = useState<string[]>(["Action"]);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const processFile = (file: File | null) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG, WebP, and GIF images are allowed");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be under 5 MB");
      return;
    }
    setError("");
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFile(e.target.files?.[0] || null);
  };

  const handleDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    processFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const toggleGenre = (value: string) => {
    setGenres((prev) =>
      prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const year = parseInt(releaseYear, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1900 || year > currentYear) {
      setError(`Release year must be between 1900 and ${currentYear}`);
      setLoading(false);
      return;
    }

    if (genres.length === 0) {
      setError("Please select at least one genre");
      setLoading(false);
      return;
    }

    try {
      const res = await createTitle({
        name,
        description,
        releaseYear: year,
        type,
        genre: genres.join(", "),
        image,
      });
      if (res.success) {
        void router.push("/");
      } else {
        setError(res.error || "Failed to create title");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen px-4 py-12 ${isLight ? "bg-slate-50" : "bg-[#0a0a14]"}`}>
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Breadcrumb */}
        <div className={`flex items-center gap-2 text-sm mb-8 ${isLight ? "text-slate-500" : "text-gray-600"}`}>
          <Link href="/" className={`transition ${isLight ? "hover:text-slate-700" : "hover:text-gray-400"}`}>Home</Link>
          <span>/</span>
          <span className={isLight ? "text-slate-700" : "text-gray-400"}>Add Title</span>
        </div>

        <div
          className={`rounded-2xl border overflow-hidden ${
            isLight
              ? "bg-white border-slate-200 shadow-xl shadow-slate-200/60"
              : "bg-surface-2 border-white/5 shadow-2xl shadow-black/40"
          }`}
        >
          {/* Header with gradient */}
          <div
            className={`bg-gradient-to-r from-rose-600/10 via-orange-500/5 to-transparent px-8 py-6 border-b ${
              isLight ? "border-slate-200" : "border-white/5"
            }`}
          >
            <h1 className={`text-2xl font-bold flex items-center gap-3 ${isLight ? "text-slate-900" : "text-white"}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-lg">
                +
              </div>
              Add New Title
            </h1>
            <p className={`text-sm mt-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>Contribute to the community by adding anime, manhwa, or movies</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type selector */}
              <div>
                <label className={`block text-xs font-medium uppercase tracking-wider mb-3 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Type</label>
                <div className="flex gap-3 flex-wrap">
                  {(["ANIME", "MANHWA", "MOVIE"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 min-w-[120px] py-3 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
                        type === t
                          ? t === "ANIME"
                            ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                            : t === "MANHWA"
                            ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                            : "bg-purple-500/10 border-purple-500/30 text-purple-300"
                          : isLight
                            ? "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                            : "bg-[#0a0a14] border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300"
                      }`}
                    >
                      {t === "ANIME" ? "🎬 Anime" : t === "MANHWA" ? "📖 Manhwa" : "🎥 Movie"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Title Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={type === "ANIME" ? "e.g. Attack on Titan" : type === "MANHWA" ? "e.g. Solo Leveling" : "e.g. The Dark Knight"}
                  className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/25 transition ${
                    isLight
                      ? "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400"
                      : "bg-[#0a0a14] border border-white/5 text-white placeholder-gray-600"
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder={`Write a brief description of the ${type === "MOVIE" ? "movie" : type.toLowerCase()}...`}
                  className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/25 transition resize-none ${
                    isLight
                      ? "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400"
                      : "bg-[#0a0a14] border border-white/5 text-white placeholder-gray-600"
                  }`}
                  required
                />
                <p className={`text-xs mt-1.5 ${isLight ? "text-slate-500" : "text-gray-700"}`}>{description.length}/500 characters</p>
              </div>

              <div>
                <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Genres</label>
                <p className={`text-xs mb-3 ${isLight ? "text-slate-500" : "text-gray-600"}`}>Select one or more genres</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {GENRE_OPTIONS.map((g) => {
                    const selected = genres.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGenre(g)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer border ${
                          selected
                            ? "bg-rose-500/20 border-rose-500/30 text-rose-200"
                            : isLight
                              ? "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
                              : "bg-[#0a0a14] border-white/5 text-gray-400 hover:text-white hover:border-white/10"
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
                <p className={`text-xs mt-2 ${isLight ? "text-slate-500" : "text-gray-500"}`}>
                  Selected: {genres.length > 0 ? genres.join(", ") : "None"}
                </p>
              </div>
              <div>
                <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Release Year</label>
                <input
                  type="number"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                  min={1900}
                  max={new Date().getFullYear()}
                  placeholder={String(new Date().getFullYear())}
                  className={`w-full rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/25 transition ${
                    isLight
                      ? "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400"
                      : "bg-[#0a0a14] border border-white/5 text-white placeholder-gray-600"
                  }`}
                  required
                />
              </div>

              {/* Image upload */}
              <div>
                <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ${isLight ? "text-slate-600" : "text-gray-400"}`}>Cover Image</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {preview ? (
                  <div className={`relative rounded-xl overflow-hidden border ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-[#0a0a14]"}`}>
                    <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-gray-300 hover:text-red-400 transition cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`w-full py-8 rounded-xl border-2 border-dashed bg-[#0a0a14] transition flex flex-col items-center gap-2 cursor-pointer group ${
                      dragging
                        ? "border-rose-500/50 bg-rose-500/5"
                        : isLight
                          ? "border-slate-300 bg-slate-50 hover:border-rose-400"
                          : "border-white/10 hover:border-rose-500/30"
                    }`}
                  >
                    <svg className={`w-8 h-8 transition ${dragging ? "text-rose-400" : isLight ? "text-slate-400 group-hover:text-rose-500" : "text-gray-600 group-hover:text-rose-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className={`text-sm transition ${dragging ? "text-rose-300" : isLight ? "text-slate-500 group-hover:text-slate-700" : "text-gray-600 group-hover:text-gray-400"}`}>
                      {dragging ? "Drop image here" : "Click or drag image from desktop"}
                    </span>
                    <span className={`text-xs ${isLight ? "text-slate-400" : "text-gray-700"}`}>JPEG, PNG, WebP or GIF · Max 5 MB</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-semibold py-3 rounded-xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Adding...
                    </span>
                  ) : `Add ${type === "ANIME" ? "Anime" : type === "MANHWA" ? "Manhwa" : "Movie"}`}
                </button>
                <Link
                  href="/"
                  className={`px-6 py-3 border rounded-xl transition text-center ${
                    isLight
                      ? "border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-900"
                      : "border-white/10 hover:border-white/20 text-gray-400 hover:text-white"
                  }`}
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAnimePage;
