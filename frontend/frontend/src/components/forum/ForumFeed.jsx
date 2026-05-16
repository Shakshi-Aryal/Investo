/**
 * ForumFeed.jsx — Paginated list of forum posts.
 * Handles both the regular feed and the bookmarks-only view.
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
import PostCard from "./PostCard";

import { apiUrl } from "../../config";

const API = apiUrl("/community");

export default function ForumFeed({
  category, sort, search, token, onSelectPost, bookmarksOnly,
}) {
  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [hasMore, setHasMore]   = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef(null);

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      let url;
      if (bookmarksOnly) {
        url = `${API}/bookmarks/`;
      } else {
        const params = new URLSearchParams({ page: pageNum, sort });
        if (category) params.set("category", category);
        if (search)   params.set("search", search);
        url = `${API}/posts/?${params}`;
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(url, { headers });
      if (!res.ok) return;

      const data = await res.json();

      // Bookmarks endpoint returns a plain array; posts returns paginated object
      if (bookmarksOnly || Array.isArray(data)) {
        setPosts(data);
        setHasMore(false);
      } else {
        const results = data.results || [];
        setPosts(prev => append ? [...prev, ...results] : results);
        setHasMore(!!data.next);
      }
    } catch (_) {
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, sort, search, token, bookmarksOnly]);

  // Reset and refetch when filters change
  useEffect(() => {
    setPage(1);
    fetchPosts(1, false);
  }, [fetchPosts]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingMore) {
        const next = page + 1;
        setPage(next);
        fetchPosts(next, true);
      }
    }, { threshold: 0.1 });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, fetchPosts]);

  const handleLikeToggle = (postId, liked, newCount) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, is_liked: liked, like_count: newCount } : p
    ));
  };

  const handleBookmarkToggle = (postId, bookmarked) => {
    if (bookmarksOnly && !bookmarked) {
      setPosts(prev => prev.filter(p => p.id !== postId));
    } else {
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, is_bookmarked: bookmarked } : p
      ));
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            height: "140px", borderRadius: "16px",
            background: "var(--card-bg)", border: "1px solid var(--card-border)",
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div style={{
        textAlign: "center", padding: "60px 20px",
        background: "var(--card-bg)", border: "1px solid var(--card-border)",
        borderRadius: "16px",
      }}>
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>
          {bookmarksOnly ? "🔖" : "📭"}
        </div>
        <h3 style={{ fontFamily: "var(--font-heading)", margin: "0 0 8px" }}>
          {bookmarksOnly ? "No bookmarks yet" : "No posts found"}
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>
          {bookmarksOnly
            ? "Bookmark posts to save them for later."
            : search
              ? `No results for "${search}"`
              : "Be the first to start a discussion!"}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          token={token}
          onSelect={() => onSelectPost(post.id)}
          onLikeToggle={handleLikeToggle}
          onBookmarkToggle={handleBookmarkToggle}
        />
      ))}

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={loaderRef} style={{ textAlign: "center", padding: "16px", color: "var(--text-muted)", fontSize: "13px" }}>
          {loadingMore ? "Loading more…" : ""}
        </div>
      )}
    </div>
  );
}
