/**
 * Community.jsx — Investo Investment Discussion Forum
 *
 * Three-column layout:
 *   Left  — category navigation
 *   Center — post feed / post detail
 *   Right  — trending + top contributors
 *
 * Preserves existing MainLayout, theme variables, and design language.
 */
import React, { useState, useEffect, useCallback } from "react";
import MainLayout from "../layouts/MainLayout";
import ForumFeed from "../components/forum/ForumFeed";
import PostDetail from "../components/forum/PostDetail";
import CreatePostModal from "../components/forum/CreatePostModal";

import { apiUrl } from "../config";

const API = apiUrl("/community");

// ── helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── CSS (scoped to forum, uses existing theme vars) ───────────────────────────
const css = `
  .forum-layout {
    display: grid;
    grid-template-columns: 220px 1fr 240px;
    gap: 24px;
    width: 100%;
    align-items: start;
  }
  @media (max-width: 1100px) {
    .forum-layout { grid-template-columns: 200px 1fr; }
    .forum-right-sidebar { display: none; }
  }
  @media (max-width: 768px) {
    .forum-layout { grid-template-columns: 1fr; }
    .forum-left-sidebar { display: none; }
    .forum-right-sidebar { display: none; }
  }

  /* ── Left sidebar ── */
  .forum-left-sidebar {
    position: sticky;
    top: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .forum-cat-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    transition: all 0.15s;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-muted);
    border: 1px solid transparent;
  }
  .forum-cat-item:hover {
    background: var(--accent-dim);
    color: var(--text-main);
  }
  .forum-cat-item.active {
    background: var(--accent-dim);
    color: var(--accent);
    font-weight: 700;
    border-color: var(--accent);
  }
  .forum-cat-icon {
    font-size: 18px;
    width: 28px;
    text-align: center;
    flex-shrink: 0;
  }
  .forum-cat-count {
    margin-left: auto;
    font-size: 11px;
    background: var(--input-bg);
    padding: 2px 7px;
    border-radius: 10px;
    color: var(--text-muted);
  }

  /* ── Right sidebar ── */
  .forum-right-sidebar {
    position: sticky;
    top: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .forum-sidebar-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--border-radius-lg);
    padding: 18px;
  }
  .forum-sidebar-title {
    font-family: var(--font-heading);
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 14px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .trending-item {
    display: flex;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid var(--divider);
    cursor: pointer;
    transition: all 0.15s;
  }
  .trending-item:last-child { border-bottom: none; }
  .trending-item:hover .trending-title { color: var(--accent); }
  .trending-rank {
    font-size: 18px;
    font-weight: 800;
    color: var(--accent);
    font-family: var(--font-heading);
    min-width: 24px;
    line-height: 1;
  }
  .trending-title {
    font-size: 13px;
    font-weight: 600;
    line-height: 1.4;
    transition: color 0.15s;
  }
  .trending-meta {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 3px;
  }
  .contributor-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid var(--divider);
  }
  .contributor-item:last-child { border-bottom: none; }
  .contributor-avatar {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: var(--accent-dim);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 800;
    color: var(--accent);
    flex-shrink: 0;
    font-family: var(--font-heading);
  }
  .contributor-name { font-size: 13px; font-weight: 600; }
  .contributor-posts { font-size: 11px; color: var(--text-muted); }

  /* ── Sort bar ── */
  .forum-sort-bar {
    display: flex;
    gap: 6px;
    margin-bottom: 16px;
    flex-wrap: wrap;
    align-items: center;
  }
  .sort-btn {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    border: 1px solid var(--card-border);
    background: var(--input-bg);
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s;
    font-family: var(--font-heading);
  }
  .sort-btn:hover { border-color: var(--accent); color: var(--text-main); }
  .sort-btn.active { background: var(--accent); color: white; border-color: var(--accent); }

  /* ── Search bar ── */
  .forum-search {
    flex: 1;
    min-width: 180px;
    padding: 8px 14px;
    border-radius: 20px;
    border: 1px solid var(--card-border);
    background: var(--input-bg);
    color: inherit;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;
    font-family: var(--font-primary);
  }
  .forum-search:focus { border-color: var(--accent); }

  /* ── New post button ── */
  .new-post-btn {
    padding: 10px 20px;
    border-radius: 12px;
    background: var(--accent);
    color: white;
    border: none;
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .new-post-btn:hover { background: var(--accent-hover); transform: translateY(-1px); }

  /* ── Mobile category bar ── */
  .forum-mobile-cats {
    display: none;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
    margin-bottom: 16px;
  }
  @media (max-width: 768px) {
    .forum-mobile-cats { display: flex; }
  }
  .mobile-cat-chip {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    border: 1px solid var(--card-border);
    background: var(--input-bg);
    color: var(--text-muted);
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
  }
  .mobile-cat-chip.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
export default function Community() {
  const token = localStorage.getItem("jwt");

  const [categories, setCategories]       = useState([]);
  const [activeCategory, setActiveCategory] = useState("");  // slug or ""
  const [sort, setSort]                   = useState("newest");
  const [search, setSearch]               = useState("");
  const [searchInput, setSearchInput]     = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPostId, setSelectedPostId]   = useState(null);
  const [trending, setTrending]           = useState([]);
  const [contributors, setContributors]   = useState([]);
  const [refreshKey, setRefreshKey]       = useState(0);

  // ── Fetch sidebar data ──────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API}/categories/`);
      if (res.ok) setCategories(await res.json());
    } catch (_) {}
  }, []);

  const fetchTrending = useCallback(async () => {
    try {
      const res = await fetch(`${API}/trending/`);
      if (res.ok) setTrending(await res.json());
    } catch (_) {}
  }, []);

  const fetchContributors = useCallback(async () => {
    try {
      const res = await fetch(`${API}/contributors/`);
      if (res.ok) setContributors(await res.json());
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchTrending();
    fetchContributors();
  }, [fetchCategories, fetchTrending, fetchContributors]);

  // ── Search with debounce ────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handlePostCreated = () => {
    setShowCreateModal(false);
    setRefreshKey(k => k + 1);
    fetchTrending();
    fetchCategories();
  };

  const handleSelectPost = (id) => setSelectedPostId(id);
  const handleBackToFeed = () => {
    setSelectedPostId(null);
    setRefreshKey(k => k + 1);
  };

  const activeCategoryObj = categories.find(c => c.slug === activeCategory);

  return (
    <MainLayout>
      <style>{css}</style>

      {/* ── Page header ── */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, letterSpacing: "-1px", margin: 0 }}>
          Premium Financial <span className="heading-gradient">Forum</span>
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: "6px", fontSize: "14px" }}>
          The Community Knowledge Hub where you collaborate on market trends and strategy.
        </p>
      </div>

      {/* ── Mobile category chips ── */}
      <div className="forum-mobile-cats">
        <button
          className={`mobile-cat-chip ${activeCategory === "" ? "active" : ""}`}
          onClick={() => { setActiveCategory(""); setSelectedPostId(null); }}
        >All</button>
        {categories.map(c => (
          <button
            key={c.slug}
            className={`mobile-cat-chip ${activeCategory === c.slug ? "active" : ""}`}
            onClick={() => { setActiveCategory(c.slug); setSelectedPostId(null); }}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      <div className="forum-layout">
        {/* ── LEFT SIDEBAR — Categories ── */}
        <nav className="forum-left-sidebar">
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", padding: "0 4px 8px" }}>
            Categories
          </div>

          <div
            className={`forum-cat-item ${activeCategory === "" ? "active" : ""}`}
            onClick={() => { setActiveCategory(""); setSelectedPostId(null); }}
          >
            <span className="forum-cat-icon">🏠</span>
            <span>All Posts</span>
          </div>

          {categories.map(cat => (
            <div
              key={cat.slug}
              className={`forum-cat-item ${activeCategory === cat.slug ? "active" : ""}`}
              onClick={() => { setActiveCategory(cat.slug); setSelectedPostId(null); }}
            >
              <span className="forum-cat-icon">{cat.icon}</span>
              <span style={{ flex: 1 }}>{cat.name}</span>
              <span className="forum-cat-count">{cat.post_count}</span>
            </div>
          ))}

          {token && (
            <>
              <div style={{ height: "1px", background: "var(--divider)", margin: "8px 0" }} />
              <div
                className="forum-cat-item"
                onClick={() => { setActiveCategory("bookmarks"); setSelectedPostId(null); }}
                style={activeCategory === "bookmarks" ? { background: "var(--accent-dim)", color: "var(--accent)", fontWeight: 700, border: "1px solid var(--accent)" } : {}}
              >
                <span className="forum-cat-icon">🔖</span>
                <span>Bookmarks</span>
              </div>
            </>
          )}
        </nav>

        {/* ── CENTER — Feed or Post Detail ── */}
        <div>
          {selectedPostId ? (
            <PostDetail
              postId={selectedPostId}
              onBack={handleBackToFeed}
              token={token}
            />
          ) : (
            <>
              {/* Sort + Search + New Post bar */}
              <div className="forum-sort-bar">
                <input
                  className="forum-search"
                  placeholder="Search discussions..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />
                {["newest", "trending", "popular", "views"].map(s => (
                  <button
                    key={s}
                    className={`sort-btn ${sort === s ? "active" : ""}`}
                    onClick={() => setSort(s)}
                  >
                    {s === "newest"   ? "🕐 New"      :
                     s === "trending" ? "🔥 Hot"      :
                     s === "popular"  ? "💬 Top"      : "👁 Views"}
                  </button>
                ))}
                {token && (
                  <button className="new-post-btn" onClick={() => setShowCreateModal(true)}>
                    ✏️ New Post
                  </button>
                )}
              </div>

              {/* Category header */}
              {activeCategoryObj && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "14px 18px", borderRadius: "12px", marginBottom: "16px",
                  background: "var(--card-bg)", border: "1px solid var(--card-border)",
                }}>
                  <span style={{ fontSize: "28px" }}>{activeCategoryObj.icon}</span>
                  <div>
                    <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "18px" }}>
                      {activeCategoryObj.name}
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      {activeCategoryObj.description}
                    </div>
                  </div>
                </div>
              )}

              <ForumFeed
                key={`${activeCategory}-${sort}-${search}-${refreshKey}`}
                category={activeCategory === "bookmarks" ? "" : activeCategory}
                sort={sort}
                search={search}
                token={token}
                onSelectPost={handleSelectPost}
                bookmarksOnly={activeCategory === "bookmarks"}
              />
            </>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <aside className="forum-right-sidebar">
          {/* Trending */}
          <div className="forum-sidebar-card">
            <div className="forum-sidebar-title">🔥 Trending</div>
            {trending.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No trending posts yet.</p>
            ) : (
              trending.map((post, i) => (
                <div
                  key={post.id}
                  className="trending-item"
                  onClick={() => setSelectedPostId(post.id)}
                >
                  <div className="trending-rank">#{i + 1}</div>
                  <div>
                    <div className="trending-title">{post.title}</div>
                    <div className="trending-meta">
                      ❤️ {post.like_count} · 💬 {post.comment_count} · {timeAgo(post.created_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Top Contributors */}
          <div className="forum-sidebar-card">
            <div className="forum-sidebar-title">🏆 Top Contributors</div>
            {contributors.map(u => (
              <div key={u.id} className="contributor-item">
                <div className="contributor-avatar">
                  {(u.first_name || u.username)[0].toUpperCase()}
                </div>
                <div>
                  <div className="contributor-name">{u.first_name || u.username}</div>
                  <div className="contributor-posts">{u.posts} posts</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="forum-sidebar-card">
            <div className="forum-sidebar-title">📌 Quick Links</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "📈 NEPSE Live Tracker", path: "/market" },
                { label: "💼 My Portfolio",     path: "/portfolio" },
                { label: "🔔 Notifications",    path: "/notifications" },
              ].map(link => (
                <a
                  key={link.path}
                  href={link.path}
                  style={{
                    fontSize: "13px", color: "var(--text-muted)", textDecoration: "none",
                    padding: "6px 0", borderBottom: "1px solid var(--divider)",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={e => e.target.style.color = "var(--accent)"}
                  onMouseLeave={e => e.target.style.color = "var(--text-muted)"}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Create Post Modal ── */}
      {showCreateModal && (
        <CreatePostModal
          token={token}
          onClose={() => setShowCreateModal(false)}
          onCreated={handlePostCreated}
        />
      )}
    </MainLayout>
  );
}
