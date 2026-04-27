import React, { useState, useEffect, useRef, useCallback } from "react";
import MainLayout from "../layouts/MainLayout";
import useWebSocket from "../hooks/useWebSocket";

const API = "http://localhost:8000/api/community";

const css = `
  .community-container {
    display: flex;
    width: 100%;
    height: calc(100vh - 160px);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    border: 1px solid var(--card-border);
    background: var(--card-bg);
    backdrop-filter: blur(10px);
  }

  /* ── Group Sidebar ── */
  .group-sidebar {
    width: 260px;
    min-width: 260px;
    border-right: 1px solid var(--card-border);
    display: flex;
    flex-direction: column;
    background: var(--input-bg);
  }
  .group-sidebar-header {
    padding: 20px;
    border-bottom: 1px solid var(--card-border);
    font-family: var(--font-heading);
    font-size: 18px;
    font-weight: 700;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .group-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }
  .group-item {
    padding: 12px 16px;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;
    font-size: 14px;
    color: var(--text-muted);
  }
  .group-item:hover {
    background: var(--accent-dim);
    color: var(--text-main);
  }
  .group-item.active {
    background: var(--accent-dim);
    color: var(--accent);
    font-weight: 600;
  }
  .group-item-icon {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: var(--accent-dim);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }

  /* ── Chat Area ── */
  .chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .chat-header {
    padding: 16px 24px;
    border-bottom: 1px solid var(--card-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .chat-header h2 {
    font-family: var(--font-heading);
    font-size: 20px;
    font-weight: 700;
    margin: 0;
  }
  .chat-header-badge {
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 20px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px 24px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .msg-bubble {
    max-width: 75%;
    padding: 10px 16px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.5;
    animation: msgFade 0.2s ease;
  }
  .msg-bubble.sent {
    align-self: flex-end;
    background: var(--accent);
    color: #fff;
    border-bottom-right-radius: 4px;
  }
  .msg-bubble.received {
    align-self: flex-start;
    background: var(--input-bg);
    border: 1px solid var(--card-border);
    border-bottom-left-radius: 4px;
  }
  .msg-sender {
    font-size: 11px;
    font-weight: 700;
    color: var(--accent);
    margin-bottom: 2px;
    text-transform: capitalize;
  }
  .msg-time {
    font-size: 10px;
    color: var(--text-muted);
    margin-top: 4px;
    opacity: 0.7;
  }
  .msg-bubble.sent .msg-time { color: rgba(255,255,255,0.6); }

  .system-msg {
    text-align: center;
    font-size: 12px;
    color: var(--text-muted);
    padding: 8px;
    font-style: italic;
  }

  /* ── Input Bar ── */
  .chat-input-bar {
    padding: 16px 24px;
    border-top: 1px solid var(--card-border);
    display: flex;
    gap: 12px;
    align-items: center;
  }
  .chat-input {
    flex: 1;
    padding: 12px 18px;
    border-radius: 14px;
    border: 1px solid var(--card-border);
    background: var(--input-bg);
    color: inherit;
    font-family: var(--font-primary);
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }
  .chat-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-dim);
  }
  .chat-send-btn {
    padding: 12px 24px;
    border-radius: 14px;
    background: var(--accent);
    color: #fff;
    border: none;
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .chat-send-btn:hover { background: var(--accent-hover); transform: translateY(-1px); }
  .chat-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* ── Empty / Welcome State ── */
  .chat-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--text-muted);
    padding: 40px;
    text-align: center;
  }
  .chat-empty-icon { font-size: 48px; opacity: 0.5; }

  /* ── Modal Overlay ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    animation: msgFade 0.15s ease;
  }
  .modal-card {
    background: var(--card-bg);
    backdrop-filter: blur(20px);
    border: 1px solid var(--card-border);
    border-radius: var(--border-radius-lg);
    padding: 32px;
    width: 100%;
    max-width: 440px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  }
  .modal-card h2 {
    font-family: var(--font-heading);
    font-size: 24px;
    margin-bottom: 20px;
  }
  .modal-input {
    width: 100%;
    padding: 12px 16px;
    border-radius: var(--border-radius-md);
    border: 1px solid var(--card-border);
    background: var(--input-bg);
    color: inherit;
    font-family: var(--font-primary);
    font-size: 14px;
    outline: none;
    margin-bottom: 12px;
    transition: border-color 0.2s;
  }
  .modal-input:focus { border-color: var(--accent); }
  .modal-btns { display: flex; gap: 12px; margin-top: 8px; }
  .modal-btn {
    flex: 1;
    padding: 12px;
    border-radius: var(--border-radius-md);
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }
  .modal-btn.primary { background: var(--accent); color: #fff; }
  .modal-btn.primary:hover { background: var(--accent-hover); }
  .modal-btn.secondary { background: transparent; color: var(--text-muted); border: 1px solid var(--card-border); }
  .modal-btn.secondary:hover { background: var(--accent-dim); color: var(--accent); }

  /* ── Browse tab ── */
  .browse-group-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    border-bottom: 1px solid var(--card-border);
    transition: background 0.15s;
  }
  .browse-group-item:hover { background: var(--accent-dim); border-radius: var(--border-radius-md); }
  .browse-join-btn {
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    font-family: var(--font-heading);
  }

  .ws-status {
    width: 8px; height: 8px; border-radius: 50%; display: inline-block;
    margin-right: 6px;
  }
  .ws-status.connected { background: #22c55e; box-shadow: 0 0 6px #22c55e; }
  .ws-status.disconnected { background: #ef4444; box-shadow: 0 0 6px #ef4444; }

  @keyframes msgFade {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    .community-container { flex-direction: column; height: calc(100vh - 120px); }
    .group-sidebar { width: 100%; min-width: 100%; max-height: 200px; border-right: none; border-bottom: 1px solid var(--card-border); }
    .group-list { display: flex; gap: 4px; overflow-x: auto; padding: 8px; }
    .group-item { white-space: nowrap; margin-bottom: 0; }
  }
`;

function Community() {
  const token = localStorage.getItem("jwt");
  const currentUser = JSON.parse(localStorage.getItem("user_info") || "{}");

  const [myGroups, setMyGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [historyMessages, setHistoryMessages] = useState([]);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const { messages: wsMessages, sendMessage, isConnected, setMessages: setWsMessages } = useWebSocket(
    selectedGroup?.id
  );

  // Fetch user's groups
  const fetchMyGroups = async () => {
    try {
      const res = await fetch(`${API}/my-groups/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMyGroups(data);
        // Auto-select first group if none selected
        if (!selectedGroup && data.length > 0) {
          setSelectedGroup(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  };

  // Fetch all groups for browsing
  const fetchAllGroups = async () => {
    try {
      const res = await fetch(`${API}/groups/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setAllGroups(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch message history when group changes
  const fetchHistory = async (groupId) => {
    try {
      const res = await fetch(`${API}/groups/${groupId}/messages/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // API returns newest first (paginated), reverse for display
        setHistoryMessages((data.results || []).reverse());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMyGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchHistory(selectedGroup.id);
      setWsMessages([]);
    }
  }, [selectedGroup?.id]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [wsMessages, historyMessages]);

  // All messages = history + live websocket messages
  const allMessages = [...historyMessages, ...wsMessages];

  const handleSend = () => {
    const text = messageInput.trim();
    if (!text || !isConnected) return;
    sendMessage(text);
    setMessageInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const res = await fetch(`${API}/groups/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newGroupName, description: newGroupDesc }),
      });
      if (res.ok) {
        const group = await res.json();
        setShowCreateModal(false);
        setNewGroupName("");
        setNewGroupDesc("");
        await fetchMyGroups();
        setSelectedGroup(group);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await fetch(`${API}/groups/${groupId}/join/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchMyGroups();
      await fetchAllGroups();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaveGroup = async () => {
    if (!selectedGroup) return;
    if (!window.confirm(`Leave "${selectedGroup.name}"?`)) return;
    try {
      await fetch(`${API}/groups/${selectedGroup.id}/leave/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedGroup(null);
      await fetchMyGroups();
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <MainLayout>
      <style>{css}</style>
      <div style={{ width: "100%" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: "8px" }}>
          Community <span className="heading-gradient">Chat</span>
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "24px", fontSize: "15px" }}>
          Chat with fellow investors in real-time
        </p>

        <div className="community-container">
          {/* ── GROUP SIDEBAR ── */}
          <div className="group-sidebar">
            <div className="group-sidebar-header">
              <span>Groups</span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => { fetchAllGroups(); setShowBrowseModal(true); }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", padding: "4px" }}
                  title="Browse Groups"
                >🔍</button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "18px", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}
                  title="Create Group"
                >+</button>
              </div>
            </div>
            <div className="group-list">
              {myGroups.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                  No groups yet.<br />
                  <button 
                    onClick={() => { fetchAllGroups(); setShowBrowseModal(true); }}
                    style={{ marginTop: '10px', padding: '6px 12px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'var(--font-heading)' }}
                  >
                    Browse Groups
                  </button>
                </div>
              ) : (
                myGroups.map((g) => (
                  <div
                    key={g.id}
                    className={`group-item ${selectedGroup?.id === g.id ? "active" : ""}`}
                    onClick={() => setSelectedGroup(g)}
                  >
                    <div className="group-item-icon">
                      {g.is_announcement ? "📢" : "💬"}
                    </div>
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ fontWeight: 600, fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.name}</div>
                      <div style={{ fontSize: "11px", opacity: 0.6 }}>{g.member_count} members</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── CHAT AREA ── */}
          <div className="chat-area">
            {selectedGroup ? (
              <>
                <div className="chat-header">
                  <div>
                    <h2># {selectedGroup.name}</h2>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      <span className={`ws-status ${isConnected ? "connected" : "disconnected"}`}></span>
                      {isConnected ? "Connected" : "Reconnecting..."}
                      {selectedGroup.is_announcement && (
                        <span className="chat-header-badge" style={{ marginLeft: "10px", background: "var(--accent-dim)", color: "var(--accent)" }}>
                          📢 Announcement
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleLeaveGroup}
                    style={{ background: "var(--danger-bg)", color: "var(--danger-color)", border: "none", borderRadius: "10px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-heading)" }}
                  >
                    Leave
                  </button>
                </div>

                <div className="chat-messages" ref={chatContainerRef}>
                  {allMessages.length === 0 ? (
                    <div className="chat-empty">
                      <div className="chat-empty-icon">💬</div>
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    allMessages.map((msg, idx) => {
                      const isMine = msg.sender_name === currentUser.username;
                      return (
                        <div key={msg.id || idx} className={`msg-bubble ${isMine ? "sent" : "received"}`}>
                          {!isMine && <div className="msg-sender">{msg.sender_name}</div>}
                          <div>{msg.content}</div>
                          <div className="msg-time">{formatTime(msg.timestamp)}</div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-bar">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder={selectedGroup.is_announcement ? "Only admins can post here..." : "Type a message..."}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!isConnected}
                  />
                  <button
                    className="chat-send-btn"
                    onClick={handleSend}
                    disabled={!isConnected || !messageInput.trim()}
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="chat-empty">
                <div className="chat-empty-icon">👋</div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "24px" }}>Welcome to Community</h3>
                <p style={{ marginBottom: "16px" }}>Select a group from the sidebar, create a new one, or join an existing community.</p>
                <button 
                  onClick={() => { fetchAllGroups(); setShowBrowseModal(true); }}
                  style={{ padding: '12px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 700 }}
                >
                  Browse Communities
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CREATE GROUP MODAL ── */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Create <span className="heading-gradient">Group</span></h2>
            <input
              className="modal-input"
              placeholder="Group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              autoFocus
            />
            <input
              className="modal-input"
              placeholder="Description (optional)"
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
            />
            <div className="modal-btns">
              <button className="modal-btn secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="modal-btn primary" onClick={handleCreateGroup}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* ── BROWSE GROUPS MODAL ── */}
      {showBrowseModal && (
        <div className="modal-overlay" onClick={() => setShowBrowseModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "70vh", overflow: "auto" }}>
            <h2>Browse <span className="heading-gradient">Groups</span></h2>
            {allGroups.length === 0 ? (
              <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px" }}>No groups available.</p>
            ) : (
              allGroups.map((g) => (
                <div key={g.id} className="browse-group-item">
                  <div>
                    <div style={{ fontWeight: 600 }}>{g.is_announcement ? "📢" : "💬"} {g.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {g.member_count} members • by {g.creator_name}
                    </div>
                  </div>
                  {g.is_member ? (
                    <span className="browse-join-btn" style={{ background: "var(--success-bg)", color: "var(--success-color)" }}>
                      Joined ✓
                    </span>
                  ) : (
                    <button
                      className="browse-join-btn"
                      style={{ background: "var(--accent)", color: "#fff" }}
                      onClick={() => handleJoinGroup(g.id)}
                    >
                      Join
                    </button>
                  )}
                </div>
              ))
            )}
            <div className="modal-btns" style={{ marginTop: "16px" }}>
              <button className="modal-btn secondary" onClick={() => setShowBrowseModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Community;
