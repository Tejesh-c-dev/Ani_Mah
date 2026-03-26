"use client";

// Anime Detail page — smart review UX with votes, replies, and sorting
import { useEffect, useState, useCallback, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  getTitleById,
  createReview,
  updateReview,
  deleteReview,
  voteReview,
  createReply,
} from "../services/api";
import type { Title, Review } from "../types";
import { useAuth } from "../hooks/useAuth";
import StarRating from "../components/StarRating";

type ReviewSort = "latest" | "top_rated" | "most_helpful";

const AnimeDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user, isAuthenticated } = useAuth();

  const [title, setTitle] = useState<Title | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewSort, setReviewSort] = useState<ReviewSort>("latest");

  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(4);
  const [editComment, setEditComment] = useState("");

  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const fetchTitle = useCallback(async () => {
    if (!id) return;
    const res = await getTitleById(id, reviewSort);
    if (res.success && res.data) setTitle(res.data as Title);
    else setError(res.error || "Title not found");
    setLoading(false);
  }, [id, reviewSort]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetchTitle updates state after async request resolution.
    fetchTitle();
  }, [fetchTitle]);

  const userHasReviewed = title?.reviews?.some((r) => r.userId === user?.id);

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setReviewError("");
    setSubmitting(true);
    const res = await createReview({ rating, comment, titleId: id });
    if (res.success) {
      setComment("");
      setRating(4);
      await fetchTitle();
    } else {
      setReviewError(res.error || "Failed to submit review");
    }
    setSubmitting(false);
  };

  const handleUpdateReview = async (reviewId: string) => {
    setSubmitting(true);
    const res = await updateReview(reviewId, { rating: editRating, comment: editComment });
    if (res.success) {
      setEditingReviewId(null);
      await fetchTitle();
    } else {
      setReviewError(res.error || "Failed to update review");
    }
    setSubmitting(false);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Delete this review?")) return;
    const res = await deleteReview(reviewId);
    if (res.success) await fetchTitle();
  };

  const handleVote = async (reviewId: string, vote: "helpful" | "not_helpful") => {
    const res = await voteReview(reviewId, vote);
    if (res.success) await fetchTitle();
  };

  const handleReplySubmit = async (reviewId: string) => {
    const commentText = (replyDrafts[reviewId] || "").trim();
    if (!commentText) return;

    setSubmitting(true);
    const res = await createReply(reviewId, commentText);
    if (res.success) {
      setReplyDrafts((prev) => ({ ...prev, [reviewId]: "" }));
      setReplyingTo(null);
      await fetchTitle();
    } else {
      setReviewError(res.error || "Failed to post reply");
    }
    setSubmitting(false);
  };

  const startEdit = (review: Review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating ?? 4);
    setEditComment(review.comment);
  };

  const ratingColor = (r: number) =>
    r >= 4.5 ? "text-emerald-400" : r >= 3.5 ? "text-yellow-400" : r >= 2.5 ? "text-orange-400" : "text-red-400";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a14] px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="skeleton h-8 w-48 mb-8 rounded-lg" />
          <div className="bg-surface-2 rounded-2xl border border-white/5 overflow-hidden">
            <div className="skeleton h-44" />
            <div className="p-8 space-y-4">
              <div className="skeleton h-8 w-3/4 rounded-lg" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-2/3 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !title) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-2 border border-red-500/20 flex items-center justify-center text-4xl">
            😵
          </div>
          <p className="text-red-400 text-lg mb-2 font-medium">{error || "Not found"}</p>
          <p className="text-gray-600 text-sm mb-6">The title you're looking for doesn't exist or was removed.</p>
          <button
            onClick={() => void router.push("/")}
            className="px-6 py-2.5 bg-surface-2 border border-white/10 text-gray-300 hover:text-white rounded-xl transition cursor-pointer hover:border-white/20"
          >
            ← Back to browse
          </button>
        </div>
      </div>
    );
  }

  const reviewCount = title.reviews?.length || 0;

  return (
    <div className="min-h-screen bg-[#0a0a14] px-4 py-12">
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-400 transition">Home</Link>
          <span>/</span>
          <span className="text-gray-400 truncate max-w-[200px]">{title.name}</span>
        </div>

        <div className="bg-surface-2 rounded-2xl border border-white/5 overflow-hidden shadow-2xl shadow-black/40 mb-8">
          <div className="h-44 bg-gradient-to-br from-rose-600/20 via-orange-500/10 to-pink-600/5 relative">
            {title.image && (
              <img src={title.image} alt={title.name} className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-2 via-transparent to-transparent" />

            <div className="absolute top-6 right-6 flex flex-col items-center bg-black/50 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10">
              <span className={`text-3xl font-black tabular-nums ${ratingColor(title.averageRating)}`}>
                {title.averageRating > 0 ? title.averageRating.toFixed(1) : "—"}
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
                {reviewCount} review{reviewCount !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="absolute bottom-4 left-8 flex items-center gap-2">
              <span className="text-xs font-medium px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/20 backdrop-blur-sm">
                {title.type}
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded-lg bg-white/5 text-gray-400 border border-white/5 backdrop-blur-sm">
                {title.releaseYear}
              </span>
            </div>
          </div>

          <div className="p-8 pt-6">
            <h1 className="text-3xl font-black text-white leading-tight mb-4">{title.name}</h1>
            <p className="text-gray-400 leading-relaxed text-[15px]">{title.description}</p>

            {title.averageRating > 0 && (
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/5">
                <StarRating value={Math.round(title.averageRating)} readonly size="md" />
                <span className="text-gray-500 text-sm">Community average</span>
              </div>
            )}
          </div>
        </div>

        {isAuthenticated && !userHasReviewed && (
          <div className="bg-surface-2 rounded-2xl border border-white/5 p-8 shadow-xl shadow-black/20 mb-8">
            <h2 className="text-xl font-bold text-white mb-1">Write a Review</h2>
            <p className="text-gray-600 text-sm mb-6">Rate from 1-5 stars and share your thoughts</p>

            {reviewError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                {reviewError}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div>
                <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">Your Rating</label>
                <div className="flex items-center gap-4">
                  <StarRating value={rating} onChange={setRating} size="lg" />
                  <span className={`text-2xl font-black tabular-nums ${ratingColor(rating)}`}>
                    {rating}<span className="text-gray-600 text-sm font-normal">/5</span>
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="What stood out to you?"
                  className="w-full bg-[#0a0a14] border border-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/25 transition resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        )}

        {!isAuthenticated && (
          <div className="bg-surface-2 rounded-2xl border border-white/5 p-8 shadow-xl shadow-black/20 mb-8">
            <h2 className="text-xl font-bold text-white mb-1">Want to write a review?</h2>
            <p className="text-gray-500 text-sm mb-5">
              You can read all titles and reviews without an account, but posting a review requires sign in.
            </p>
            <Link
              href="/login"
              className="inline-flex px-6 py-2.5 bg-gradient-to-r from-rose-600 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/25 transition-all hover:shadow-rose-500/40"
            >
              Sign in to review
            </Link>
          </div>
        )}

        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              Reviews
              {reviewCount > 0 && (
                <span className="text-xs bg-white/5 border border-white/5 text-gray-500 px-2.5 py-1 rounded-lg">
                  {reviewCount}
                </span>
              )}
            </h2>

            <select
              value={reviewSort}
              onChange={(e) => setReviewSort(e.target.value as ReviewSort)}
              className="bg-surface-2 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-rose-500/50"
            >
              <option value="latest">Latest</option>
              <option value="top_rated">Top rated</option>
              <option value="most_helpful">Most helpful</option>
            </select>
          </div>

          {reviewCount === 0 ? (
            <div className="bg-surface-2 rounded-2xl border border-white/5 p-12 text-center">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-gray-500 mb-1">No reviews yet</p>
              <p className="text-gray-700 text-sm">
                {isAuthenticated ? "Be the first to share your thoughts!" : "Sign in to write a review"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {title.reviews!.map((review, idx) => (
                <div
                  key={review.id}
                  className="bg-surface-2 rounded-2xl border border-white/5 p-6 hover:border-white/10 transition animate-fade-in"
                  style={{ animationDelay: `${idx * 0.04}s`, opacity: 0 }}
                >
                  {editingReviewId === review.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">Rating</label>
                        <div className="flex items-center gap-4">
                          <StarRating value={editRating} onChange={setEditRating} size="md" />
                          <span className={`text-xl font-bold ${ratingColor(editRating)}`}>{editRating}/5</span>
                        </div>
                      </div>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows={3}
                        className="w-full bg-[#0a0a14] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/25 transition resize-none"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleUpdateReview(review.id)}
                          disabled={submitting}
                          className="bg-gradient-to-r from-rose-600 to-orange-500 text-white text-sm font-medium px-5 py-2 rounded-xl transition cursor-pointer disabled:opacity-50"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingReviewId(null)}
                          className="bg-white/5 hover:bg-white/10 text-gray-400 text-sm px-5 py-2 rounded-xl transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500/30 to-orange-500/30 flex items-center justify-center text-xs font-bold text-rose-300 border border-rose-500/20">
                            {(review.user?.username || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="text-white text-sm font-medium">{review.user?.username || "Unknown"}</span>
                            <span className="text-gray-700 text-xs ml-2">
                              {new Date(review.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center gap-1 text-sm font-bold ${ratingColor(review.rating || 0)}`}>
                            <span className="text-yellow-400/60 text-xs">★</span>
                            {review.rating}<span className="text-gray-600 font-normal text-xs">/5</span>
                          </div>
                          {user?.id === review.userId && (
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={() => startEdit(review)}
                                className="p-1.5 rounded-lg hover:bg-white/5 text-gray-600 hover:text-rose-400 transition cursor-pointer"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className="p-1.5 rounded-lg hover:bg-white/5 text-gray-600 hover:text-red-400 transition cursor-pointer"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-300 text-[15px] leading-relaxed pl-12 mb-4">{review.comment}</p>

                      <div className="pl-12 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleVote(review.id, "helpful")}
                          disabled={!isAuthenticated}
                          className="px-3 py-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-white/20 text-xs transition disabled:opacity-60"
                        >
                          👍 Helpful ({review.helpfulCount})
                        </button>
                        <button
                          onClick={() => handleVote(review.id, "not_helpful")}
                          disabled={!isAuthenticated}
                          className="px-3 py-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-white/20 text-xs transition disabled:opacity-60"
                        >
                          👎 Not helpful ({review.notHelpfulCount})
                        </button>

                        {isAuthenticated ? (
                          <button
                            onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                            className="px-3 py-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-white/20 text-xs transition"
                          >
                            Reply
                          </button>
                        ) : (
                          <Link href="/login" className="text-xs text-rose-400 hover:text-rose-300 transition">
                            Sign in to vote/reply
                          </Link>
                        )}
                      </div>

                      {replyingTo === review.id && isAuthenticated && (
                        <div className="pl-12 mt-3 flex gap-2">
                          <input
                            value={replyDrafts[review.id] || ""}
                            onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [review.id]: e.target.value }))}
                            placeholder="Write a reply..."
                            className="flex-1 bg-[#0a0a14] border border-white/5 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose-500/50"
                          />
                          <button
                            onClick={() => handleReplySubmit(review.id)}
                            disabled={submitting}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 text-white text-sm font-medium disabled:opacity-50"
                          >
                            Send
                          </button>
                        </div>
                      )}

                      {(review.replies?.length || 0) > 0 && (
                        <div className="pl-12 mt-4 space-y-2">
                          {review.replies!.map((reply) => (
                            <div key={reply.id} className="rounded-xl border border-white/5 bg-[#0c0c18] px-4 py-3">
                              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                <span className="text-gray-300 font-medium">{reply.user?.username || "Unknown"}</span>
                                <span>•</span>
                                <span>
                                  {new Date(reply.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-300 leading-relaxed">{reply.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailPage;
