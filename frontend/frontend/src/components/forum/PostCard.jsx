/**
 * PostCard.jsx — A single post card in the forum feed.
 * Shows title, excerpt, author, stats, and action buttons.
 */
import React, { useState } from "react";
import toast from "react-hot-toast";

import { apiUrl } from "../../config";

const API = apiUrl("/community");

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function PostCard({ post, token, onSelect, onLikeToggle, onBookmarkToggle }) {
  const [liking, setLiking]         = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!token) { toast.error("Log in to like posts"); return; }
    if (liking) return;
    setLiking(true);
    try {
      const res = await fetch(`${API}/posts/${post.id}/like/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        onLikeToggle(post.id, data.liked, data.like_count);
      }
    } catch (_) {
    } finally {
      setLiking(false);
    }
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!token) { toast.error("Log in to bookmark posts"); return; }
    if (bookmarking) return;
    setBookmarking(true);
    try {
      const res = await fetch(`${API}/posts/${post.id}/bookmark/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        onBookmarkToggle(post.id, data.bookmarked);
        toast.success(data.bookmarked ? "Bookmarked!" : "Bookmark removed");
      }
    } catch (_) {
    } finally {
      setBookmarking(false);
    }
  };

  const excerpt = post.content.length > 180
    ? post.content.slice(0, 180) + "…"
    : post.content;

  return (
    <article
      onClick={onSelect}
      style={{
        background: "var(--card-bg)",
        border: `1px solid ${post.is_pinned ? "var(--accent)" : "var(--card-border)"}`,
        borderRadius: "16px",
        padding: "20px 24px",
        cursor: "pointer",
        transition: "all 0.2s",
        position: "relative",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 20px var(--accent-glow)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = post.is_pinned ? "var(--accent)" : "var(--card-border)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Pinned badge */}
      {post.is_pinned && (
        <div style={{
          position: "absolute", top: "12px", right: "16px",
          fontSize: "11px", fontWeight: 700, color: "var(--accent)",
          background: "var(--accent-dim)", padding: "2px 8px", borderRadius: "6px",
        }}>
          📌 Pinned
        </div>
      )}

      {/* Category + meta row */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
        <span style={{
          fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "10px",
          background: "var(--accent-dim)", color: "var(--accent)",
        }}>
          {post.category_icon} {post.category_name}
        </span>
        {post.is_locked && (
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>🔒 Locked</span>
        )}
        <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "auto" }}>
          {timeAgo(post.created_at)}
        </span>
      </div>

      {/* Title */}
      <h2 style={{
        fontFamily: "var(--font-heading)", fontSize: "17px", fontWeight: 700,
        margin: "0 0 8px", lineHeight: 1.3,
      }}>
        {post.title}
      </h2>

      {/* Excerpt */}
      <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.6 }}>
        {excerpt}
      </p>

      {/* Post Image */}
      {post.image && (
        <div style={{
          marginBottom: "14px", borderRadius: "12px", overflow: "hidden",
          border: "1px solid var(--card-border)", maxHeight: "240px",
        }}>
          <img
            src={post.image}
            alt={post.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* Tags */}
      {post.tags_list && post.tags_list.length > 0 && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
          {post.tags_list.map(tag => (
            <span key={tag} style={{
              fontSize: "11px", padding: "2px 8px", borderRadius: "8px",
              background: "var(--input-bg)", border: "1px solid var(--card-border)",
              color: "var(--text-muted)",
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: author + stats + actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        {/* Author */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "8px",
            background: "var(--accent-dim)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "12px", fontWeight: 800,
            color: "var(--accent)", fontFamily: "var(--font-heading)",
          }}>
            {(post.author?.first_name || post.author?.username || "?")[0].toUpperCase()}
          </div>
          <span style={{ fontSize: "13px", fontWeight: 600 }}>
            {post.author?.first_name || post.author?.username}
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "14px", marginLeft: "auto", alignItems: "center" }}>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            👁 {post.view_count}
          </span>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            💬 {post.comment_count}
          </span>

          {/* Like button */}
          <button
            onClick={handleLike}
            disabled={liking}
            style={{
              display: "flex", alignItems: "center", gap: "4px",
              background: "none", border: "none", cursor: "pointer",
              fontSize: "13px", fontWeight: 700, padding: "4px 8px",
              borderRadius: "8px", transition: "all 0.15s",
              color: post.is_liked ? "var(--accent)" : "var(--text-muted)",
              background: post.is_liked ? "var(--accent-dim)" : "transparent",
            }}
          >
            {post.is_liked ? "❤️" : "🤍"} {post.like_count}
          </button>

          {/* Bookmark button */}
          <button
            onClick={handleBookmark}
            disabled={bookmarking}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "16px", padding: "4px", borderRadius: "8px",
              transition: "all 0.15s",
              color: post.is_bookmarked ? "var(--accent)" : "var(--text-muted)",
            }}
            title={post.is_bookmarked ? "Remove bookmark" : "Bookmark"}
          >
            {post.is_bookmarked ? "🔖" : "📄"}
          </button>
        </div>
      </div>
    </article>
  );
}
