/**
 * CreatePostModal.jsx — Modal for creating a new forum post.
 *
 * Fetches categories internally so it always has them regardless of
 * whether the parent has finished loading when the modal opens.
 */
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { apiUrl } from "../../config";

const API = apiUrl("/community");

export default function CreatePostModal({ token, onClose, onCreated }) {
  const [categories, setCategories] = useState([]);
  const [catsLoading, setCatsLoading] = useState(true);

  const [title, setTitle]       = useState("");
  const [content, setContent]   = useState("");
  const [category, setCategory] = useState("");   // set after categories load
  const [tags, setTags]         = useState("");
  const [image, setImage]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]     = useState({});

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ── Fetch categories when modal mounts ──────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/categories/`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setCategories(data);
          // Pre-select the first category once loaded
          if (data.length > 0) setCategory(String(data[0].id));
        }
      } catch (_) {
      } finally {
        if (!cancelled) setCatsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!title.trim())   e.title    = "Title is required";
    if (!content.trim()) e.content  = "Content is required";
    if (!category)       e.category = "Please select a category";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/posts/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title:    title.trim(),
          content:  content.trim(),
          category: Number(category),
          tags:     tags.trim(),
          image:    image,
        }),
      });


      if (res.ok) {
        toast.success("Post published!");
        onCreated();
      } else {
        const data = await res.json();
        // Surface field-level errors if DRF returns them
        const msg = data.detail
          || data.category?.[0]
          || data.title?.[0]
          || data.content?.[0]
          || "Failed to create post";
        toast.error(msg);
      }
    } catch (_) {
      toast.error("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Keyboard shortcut: Escape closes ────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // ── Shared input style ───────────────────────────────────────────────────
  const inputStyle = (hasError) => ({
    width: "100%",
    padding: "11px 14px",
    borderRadius: "12px",
    border: `1px solid ${hasError ? "var(--danger-color)" : "var(--card-border)"}`,
    background: "var(--input-bg)",
    color: "inherit",
    fontSize: "14px",
    outline: "none",
    fontFamily: "var(--font-primary)",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  });

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px",
  };

  const errorStyle = {
    color: "var(--danger-color)",
    fontSize: "12px",
    margin: "4px 0 0",
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.65)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          borderRadius: "20px",
          padding: "32px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 800, margin: 0 }}>
            ✏️ New <span className="heading-gradient">Discussion</span>
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "20px", color: "var(--text-muted)", lineHeight: 1,
              padding: "4px",
            }}
            title="Close (Esc)"
          >
            ×
          </button>
        </div>

        {/* ── Category ── */}
        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>Category *</label>

          {catsLoading ? (
            <div style={{
              padding: "11px 14px", borderRadius: "12px",
              border: "1px solid var(--card-border)", background: "var(--input-bg)",
              color: "var(--text-muted)", fontSize: "14px",
            }}>
              Loading categories…
            </div>
          ) : categories.length === 0 ? (
            <div style={{
              padding: "11px 14px", borderRadius: "12px",
              border: "1px solid var(--danger-color)", background: "var(--input-bg)",
              color: "var(--danger-color)", fontSize: "13px",
            }}>
              ⚠️ No categories found. Ask an admin to run{" "}
              <code style={{ fontFamily: "monospace" }}>python manage.py seed_forum_categories</code>.
            </div>
          ) : (
            <select
              value={category}
              onChange={e => {
                setCategory(e.target.value);
                setErrors(prev => ({ ...prev, category: undefined }));
              }}
              style={{
                ...inputStyle(!!errors.category),
                cursor: "pointer",
                appearance: "auto",
              }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = errors.category ? "var(--danger-color)" : "var(--card-border)"}
            >
              <option value="" disabled>— Select a category —</option>
              {categories.map(c => (
                <option key={c.id} value={String(c.id)}>
                  {c.icon}  {c.name}
                </option>
              ))}
            </select>
          )}

          {errors.category && <p style={errorStyle}>{errors.category}</p>}
        </div>

        {/* ── Title ── */}
        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>Title *</label>
          <input
            value={title}
            onChange={e => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setErrors(prev => ({ ...prev, title: undefined }));
            }}
            placeholder="What do you want to discuss?"
            maxLength={300}
            style={inputStyle(!!errors.title)}
            onFocus={e => e.target.style.borderColor = "var(--accent)"}
            onBlur={e => e.target.style.borderColor = errors.title ? "var(--danger-color)" : "var(--card-border)"}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
            {errors.title
              ? <p style={errorStyle}>{errors.title}</p>
              : <span />
            }
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{title.length}/300</span>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>Content *</label>
          <textarea
            value={content}
            onChange={e => {
              setContent(e.target.value);
              if (e.target.value.trim()) setErrors(prev => ({ ...prev, content: undefined }));
            }}
            placeholder="Share your thoughts, analysis, or questions in detail…"
            rows={6}
            style={{
              ...inputStyle(!!errors.content),
              resize: "vertical",
              lineHeight: 1.6,
            }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"}
            onBlur={e => e.target.style.borderColor = errors.content ? "var(--danger-color)" : "var(--card-border)"}
          />
          {errors.content && <p style={errorStyle}>{errors.content}</p>}
        </div>

        {/* ── Tags ── */}
        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>
            Tags{" "}
            <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
              (comma-separated, optional)
            </span>
          </label>
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="e.g. NABIL, technical-analysis, long-term"
            style={inputStyle(false)}
            onFocus={e => e.target.style.borderColor = "var(--accent)"}
            onBlur={e => e.target.style.borderColor = "var(--card-border)"}
          />
          {/* Live tag preview */}
          {tags.trim() && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
              {tags.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                <span key={t} style={{
                  fontSize: "11px", padding: "3px 10px", borderRadius: "8px",
                  background: "var(--accent-dim)", color: "var(--accent)",
                  border: "1px solid var(--accent)",
                }}>
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Image Upload ── */}
        <div style={{ marginBottom: "28px" }}>
          <label style={labelStyle}>Image (Optional)</label>
          {image ? (
            <div style={{ position: "relative", display: "inline-block", width: "100%", maxHeight: "220px", overflow: "hidden", borderRadius: "12px", border: "1px solid var(--card-border)" }}>
              <img src={image} alt="Upload preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button
                type="button"
                onClick={() => setImage("")}
                style={{
                  position: "absolute", top: "10px", right: "10px",
                  background: "rgba(0,0,0,0.8)", color: "white",
                  border: "none", borderRadius: "50%", width: "28px", height: "28px",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", fontWeight: "bold"
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="btn-cancel" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              padding: "16px", borderRadius: "12px", border: "1px dashed var(--card-border)",
              background: "var(--input-bg)", color: "var(--text-muted)", cursor: "pointer",
              fontSize: "14px", transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--card-border)"}
            >
              📷 Upload Post Image
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
            </label>
          )}
        </div>


        {/* ── Action buttons ── */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "12px", borderRadius: "12px", fontWeight: 700,
              cursor: "pointer", border: "1px solid var(--card-border)",
              background: "var(--input-bg)", color: "inherit",
              fontFamily: "var(--font-heading)", fontSize: "14px",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--card-border)"}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || catsLoading || categories.length === 0}
            style={{
              flex: 2, padding: "12px", borderRadius: "12px", fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer",
              border: "none",
              background: "var(--accent)", color: "white",
              fontFamily: "var(--font-heading)", fontSize: "14px",
              opacity: (submitting || catsLoading || categories.length === 0) ? 0.6 : 1,
              transition: "all 0.2s",
            }}
          >
            {submitting ? "Publishing…" : "🚀 Publish Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
