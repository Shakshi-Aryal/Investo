/**
 * PostDetail.jsx — Full post view with comments and replies.
 */
import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

const API = "http://localhost:8000/api/community";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function Avatar({ name, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "10px",
      background: "var(--accent-dim)", display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: size * 0.4, fontWeight: 800,
      color: "var(--accent)", fontFamily: "var(--font-heading)", flexShrink: 0,
    }}>
      {(name || "?")[0].toUpperCase()}
    </div>
  );
}

// ── Reply component ───────────────────────────────────────────────────────────
function ReplyItem({ reply, token, onDelete }) {
  const currentUser = JSON.parse(localStorage.getItem("user_info") || "{}");
  const isMine = reply.author?.username === currentUser.username;

  const handleDelete = async () => {
    if (!window.confirm("Delete this reply?")) return;
    try {
      const res = await fetch(`${API}/replies/${reply.id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) onDelete(reply.id);
    } catch (_) {}
  };

  return (
    <div style={{
      display: "flex", gap: "10px", padding: "10px 0",
      borderBottom: "1px solid var(--divider)",
    }}>
      <Avatar name={reply.author?.username} size={28} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span style={{ fontSize: "13px", fontWeight: 700 }}>{reply.author?.username}</span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{timeAgo(reply.created_at)}</span>
          {isMine && (
            <button onClick={handleDelete} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--danger-color)", cursor: "pointer", fontSize: "12px" }}>
              Delete
            </button>
          )}
        </div>
        <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6 }}>{reply.content}</p>
      </div>
    </div>
  );
}

// ── Comment component ─────────────────────────────────────────────────────────
function CommentItem({ comment, token, onDelete, onReplyAdded }) {
  const currentUser = JSON.parse(localStorage.getItem("user_info") || "{}");
  const isMine = comment.author?.username === currentUser.username;
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText]       = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [replies, setReplies]           = useState(comment.replies || []);
  const [liked, setLiked]               = useState(comment.is_liked);
  const [likeCount, setLikeCount]       = useState(comment.like_count);

  const handleLike = async () => {
    if (!token) { toast.error("Log in to like"); return; }
    try {
      const res = await fetch(`${API}/comments/${comment.id}/like/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikeCount(data.like_count);
      }
    } catch (_) {}
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const res = await fetch(`${API}/comments/${comment.id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) onDelete(comment.id);
    } catch (_) {}
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/comments/${comment.id}/replies/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText }),
      });
      if (res.ok) {
        const newReply = await res.json();
        setReplies(prev => [...prev, newReply]);
        setReplyText("");
        setShowReplyBox(false);
        onReplyAdded();
      }
    } catch (_) {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      background: "var(--card-bg)", border: "1px solid var(--card-border)",
      borderRadius: "14px", padding: "16px 20px", marginBottom: "12px",
    }}>
      {/* Comment header */}
      <div style={{ display: "flex", gap: "12px" }}>
        <Avatar name={comment.author?.username} size={36} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "14px", fontWeight: 700 }}>{comment.author?.username}</span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{timeAgo(comment.created_at)}</span>
            {isMine && (
              <button onClick={handleDelete} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--danger-color)", cursor: "pointer", fontSize: "12px" }}>
                Delete
              </button>
            )}
          </div>
          <p style={{ margin: "0 0 12px", fontSize: "14px", lineHeight: 1.6 }}>{comment.content}</p>

          {/* Comment actions */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={handleLike}
              style={{
                background: liked ? "var(--accent-dim)" : "none",
                border: "none", cursor: "pointer", fontSize: "13px",
                fontWeight: 700, padding: "4px 10px", borderRadius: "8px",
                color: liked ? "var(--accent)" : "var(--text-muted)",
                transition: "all 0.15s",
              }}
            >
              {liked ? "❤️" : "🤍"} {likeCount}
            </button>
            {token && (
              <button
                onClick={() => setShowReplyBox(!showReplyBox)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "13px", color: "var(--text-muted)", fontWeight: 600,
                  padding: "4px 8px", borderRadius: "8px", transition: "all 0.15s",
                }}
              >
                ↩ Reply {replies.length > 0 && `(${replies.length})`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div style={{ marginTop: "12px", paddingLeft: "48px", borderLeft: "2px solid var(--divider)" }}>
          {replies.filter(r => !r.is_removed).map(reply => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              token={token}
              onDelete={id => setReplies(prev => prev.filter(r => r.id !== id))}
            />
          ))}
        </div>
      )}

      {/* Reply input */}
      {showReplyBox && (
        <div style={{ marginTop: "12px", paddingLeft: "48px", display: "flex", gap: "8px" }}>
          <input
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && submitReply()}
            style={{
              flex: 1, padding: "8px 14px", borderRadius: "10px",
              border: "1px solid var(--card-border)", background: "var(--input-bg)",
              color: "inherit", fontSize: "13px", outline: "none",
              fontFamily: "var(--font-primary)",
            }}
          />
          <button
            onClick={submitReply}
            disabled={submitting || !replyText.trim()}
            style={{
              padding: "8px 16px", borderRadius: "10px", background: "var(--accent)",
              color: "white", border: "none", cursor: "pointer", fontWeight: 700,
              fontSize: "13px", fontFamily: "var(--font-heading)",
            }}
          >
            {submitting ? "…" : "Reply"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main PostDetail ───────────────────────────────────────────────────────────
export default function PostDetail({ postId, onBack, token }) {
  const [post, setPost]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [liked, setLiked]         = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("spam");

  const currentUser = JSON.parse(localStorage.getItem("user_info") || "{}");

  const fetchPost = useCallback(async () => {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API}/posts/${postId}/`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPost(data);
        setLiked(data.is_liked);
        setLikeCount(data.like_count);
        setBookmarked(data.is_bookmarked);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, [postId, token]);

  useEffect(() => { fetchPost(); }, [fetchPost]);

  const handleLike = async () => {
    if (!token) { toast.error("Log in to like"); return; }
    try {
      const res = await fetch(`${API}/posts/${postId}/like/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikeCount(data.like_count);
      }
    } catch (_) {}
  };

  const handleBookmark = async () => {
    if (!token) { toast.error("Log in to bookmark"); return; }
    try {
      const res = await fetch(`${API}/posts/${postId}/bookmark/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.bookmarked);
        toast.success(data.bookmarked ? "Bookmarked!" : "Bookmark removed");
      }
    } catch (_) {}
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      const res = await fetch(`${API}/posts/${postId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { toast.success("Post deleted"); onBack(); }
    } catch (_) {}
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/posts/${postId}/comments/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setPost(prev => ({
          ...prev,
          comments: [...(prev.comments || []), newComment],
          comment_count: (prev.comment_count || 0) + 1,
        }));
        setCommentText("");
      }
    } catch (_) {
    } finally {
      setSubmitting(false);
    }
  };

  const submitReport = async () => {
    try {
      const res = await fetch(`${API}/report/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ post: postId, reason: reportReason }),
      });
      if (res.ok) { toast.success("Report submitted"); setShowReport(false); }
    } catch (_) {}
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px", color: "var(--text-muted)" }}>
        Loading post…
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
        Post not found.
        <br />
        <button onClick={onBack} style={{ marginTop: "12px", padding: "8px 20px", background: "var(--accent)", color: "white", border: "none", borderRadius: "10px", cursor: "pointer" }}>
          ← Back
        </button>
      </div>
    );
  }

  const isAuthor = post.author?.username === currentUser.username;
  const visibleComments = (post.comments || []).filter(c => !c.is_removed);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          alignSelf: "flex-start", background: "var(--input-bg)",
          border: "1px solid var(--card-border)", borderRadius: "10px",
          padding: "8px 16px", cursor: "pointer", fontSize: "13px",
          fontWeight: 600, color: "var(--text-muted)", transition: "all 0.15s",
          display: "flex", alignItems: "center", gap: "6px",
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--card-border)"}
      >
        ← Back to Feed
      </button>

      {/* Post body */}
      <article style={{
        background: "var(--card-bg)", border: "1px solid var(--card-border)",
        borderRadius: "16px", padding: "28px",
      }}>
        {/* Category + meta */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          <span style={{
            fontSize: "12px", fontWeight: 700, padding: "4px 12px", borderRadius: "10px",
            background: "var(--accent-dim)", color: "var(--accent)",
          }}>
            {post.category_icon} {post.category_name}
          </span>
          {post.is_pinned && <span style={{ fontSize: "12px", color: "var(--accent)" }}>📌 Pinned</span>}
          {post.is_locked && <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>🔒 Locked</span>}
          <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--text-muted)" }}>
            {timeAgo(post.created_at)}
          </span>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.3 }}>
          {post.title}
        </h1>

        {/* Author */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <Avatar name={post.author?.username} size={36} />
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700 }}>{post.author?.first_name || post.author?.username}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{post.author?.post_count} posts</div>
          </div>
        </div>

        {/* Content */}
        <div style={{
          fontSize: "15px", lineHeight: 1.8, color: "var(--text-main)",
          whiteSpace: "pre-wrap", marginBottom: "20px",
        }}>
          {post.content}
        </div>

        {/* Post Image */}
        {post.image && (
          <div style={{
            marginBottom: "20px", borderRadius: "12px", overflow: "hidden",
            border: "1px solid var(--card-border)",
          }}>
            <img
              src={post.image}
              alt={post.title}
              style={{ width: "100%", display: "block", cursor: "pointer" }}
              onClick={() => window.open(post.image, "_blank")}
              title="Click to view full size"
            />
          </div>
        )}

        {/* Tags */}
        {post.tags_list && post.tags_list.length > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
            {post.tags_list.map(tag => (
              <span key={tag} style={{
                fontSize: "12px", padding: "3px 10px", borderRadius: "8px",
                background: "var(--input-bg)", border: "1px solid var(--card-border)",
                color: "var(--text-muted)",
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div style={{
          display: "flex", gap: "10px", alignItems: "center",
          paddingTop: "16px", borderTop: "1px solid var(--divider)", flexWrap: "wrap",
        }}>
          <button
            onClick={handleLike}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", borderRadius: "10px", border: "none",
              cursor: "pointer", fontWeight: 700, fontSize: "14px",
              background: liked ? "var(--accent)" : "var(--input-bg)",
              color: liked ? "white" : "var(--text-muted)",
              transition: "all 0.2s",
            }}
          >
            {liked ? "❤️" : "🤍"} {likeCount} {likeCount === 1 ? "Like" : "Likes"}
          </button>

          <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            💬 {post.comment_count} Comments
          </span>
          <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            👁 {post.view_count} Views
          </span>

          <button
            onClick={handleBookmark}
            style={{
              marginLeft: "auto", background: bookmarked ? "var(--accent-dim)" : "var(--input-bg)",
              border: "1px solid var(--card-border)", borderRadius: "10px",
              padding: "8px 14px", cursor: "pointer", fontSize: "13px",
              color: bookmarked ? "var(--accent)" : "var(--text-muted)",
              fontWeight: 600, transition: "all 0.2s",
            }}
          >
            {bookmarked ? "🔖 Saved" : "📄 Save"}
          </button>

          {token && !isAuthor && (
            <button
              onClick={() => setShowReport(true)}
              style={{
                background: "none", border: "1px solid var(--card-border)",
                borderRadius: "10px", padding: "8px 14px", cursor: "pointer",
                fontSize: "13px", color: "var(--text-muted)", transition: "all 0.2s",
              }}
            >
              🚩 Report
            </button>
          )}

          {isAuthor && (
            <button
              onClick={handleDeletePost}
              style={{
                background: "var(--danger-bg)", border: "none", borderRadius: "10px",
                padding: "8px 14px", cursor: "pointer", fontSize: "13px",
                color: "var(--danger-color)", fontWeight: 600,
              }}
            >
              🗑 Delete Post
            </button>
          )}
        </div>
      </article>

      {/* Comments section */}
      <section>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 700, margin: "0 0 16px" }}>
          💬 {post.comment_count} {post.comment_count === 1 ? "Comment" : "Comments"}
        </h2>

        {/* Comment input */}
        {token && !post.is_locked ? (
          <div style={{
            background: "var(--card-bg)", border: "1px solid var(--card-border)",
            borderRadius: "14px", padding: "16px", marginBottom: "16px",
          }}>
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              style={{
                width: "100%", padding: "12px", borderRadius: "10px",
                border: "1px solid var(--card-border)", background: "var(--input-bg)",
                color: "inherit", fontSize: "14px", outline: "none", resize: "vertical",
                fontFamily: "var(--font-primary)", lineHeight: 1.6, boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--card-border)"}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
              <button
                onClick={submitComment}
                disabled={submitting || !commentText.trim()}
                style={{
                  padding: "10px 24px", borderRadius: "10px", background: "var(--accent)",
                  color: "white", border: "none", cursor: "pointer", fontWeight: 700,
                  fontSize: "14px", fontFamily: "var(--font-heading)",
                  opacity: (!commentText.trim() || submitting) ? 0.6 : 1,
                }}
              >
                {submitting ? "Posting…" : "Post Comment"}
              </button>
            </div>
          </div>
        ) : post.is_locked ? (
          <div style={{
            padding: "14px 18px", borderRadius: "12px", marginBottom: "16px",
            background: "var(--input-bg)", border: "1px solid var(--card-border)",
            fontSize: "14px", color: "var(--text-muted)",
          }}>
            🔒 This thread is locked. No new comments allowed.
          </div>
        ) : (
          <div style={{
            padding: "14px 18px", borderRadius: "12px", marginBottom: "16px",
            background: "var(--input-bg)", border: "1px solid var(--card-border)",
            fontSize: "14px", color: "var(--text-muted)",
          }}>
            <a href="/login" style={{ color: "var(--accent)" }}>Log in</a> to join the discussion.
          </div>
        )}

        {/* Comment list */}
        {visibleComments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontSize: "14px" }}>
            No comments yet. Be the first!
          </div>
        ) : (
          visibleComments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              token={token}
              onDelete={id => setPost(prev => ({
                ...prev,
                comments: prev.comments.filter(c => c.id !== id),
                comment_count: Math.max(0, prev.comment_count - 1),
              }))}
              onReplyAdded={() => {}}
            />
          ))
        )}
      </section>

      {/* Report modal */}
      {showReport && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
        }}>
          <div style={{
            background: "var(--card-bg)", border: "1px solid var(--card-border)",
            borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "380px",
          }}>
            <h3 style={{ fontFamily: "var(--font-heading)", margin: "0 0 16px" }}>Report Post</h3>
            <select
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: "10px",
                border: "1px solid var(--card-border)", background: "var(--input-bg)",
                color: "inherit", fontSize: "14px", outline: "none", marginBottom: "16px",
              }}
            >
              {[["spam","Spam"],["misinformation","Misinformation"],["harassment","Harassment"],["inappropriate","Inappropriate"],["other","Other"]].map(([v,l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowReport(false)} style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "var(--input-bg)", border: "1px solid var(--card-border)", cursor: "pointer", fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={submitReport} style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "var(--accent)", color: "white", border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "var(--font-heading)" }}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
