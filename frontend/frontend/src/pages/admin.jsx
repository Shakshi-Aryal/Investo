import React, { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import MainLayout from "../layouts/MainLayout";

const Admin = () => {
    const [stats, setStats] = useState(null);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Community form state
    const [newGroupName, setNewGroupName] = useState("");
    const [broadcastMsg, setBroadcastMsg] = useState("");
    const [selectedGroupId, setSelectedGroupId] = useState("");

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem("jwt");
            try {
                const response = await fetch("http://localhost:8000/api/admin-portal/stats/", {
                    headers: { 
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) throw new Error("Unauthorized");
                const data = await response.json();
                setStats(data);

                // Fetch community groups for admin
                const commRes = await fetch("http://localhost:8000/api/community/groups/", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (commRes.ok) {
                    const groupsData = await commRes.json();
                    setGroups(groupsData);
                    if (groupsData.length > 0) setSelectedGroupId(groupsData[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch admin stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleCreateAnnouncementGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;
        const token = localStorage.getItem("jwt");
        try {
            const res = await fetch("http://localhost:8000/api/community/groups/", {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    name: newGroupName, 
                    description: "Official Announcement Channel",
                    is_announcement: true 
                })
            });
            if (res.ok) {
                const newGroup = await res.json();
                setGroups([newGroup, ...groups]);
                setNewGroupName("");
                alert("Announcement group created!");
            }
        } catch (err) {
            console.error("Failed to create group", err);
        }
    };

    if (loading) {
        return (
            <MainLayout isAdmin={true}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <Spinner />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout isAdmin={true}>
            <div style={{ width: '100%' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', marginBottom: '8px', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-1px' }}>
                    Admin <span className="heading-gradient">Portal</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>
                    Monitor user activity and platform health
                </p>
                
                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <div className="inv-card" style={{ textAlign: 'center', padding: '28px' }}>
                        <h2 style={{ color: 'var(--accent)', fontSize: '36px', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
                            {stats?.summary?.total_users || 0}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>Total Users</p>
                    </div>
                    <div className="inv-card" style={{ textAlign: 'center', padding: '28px' }}>
                        <h2 style={{ color: 'var(--success-color)', fontSize: '36px', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
                            {stats?.summary?.active_today || 0}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>Active Today</p>
                    </div>
                </div>

                {/* User Activity Table */}
                <div className="inv-card" style={{ maxWidth: '100%', overflowX: 'auto', padding: '28px' }}>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: '20px' }}>
                        User Activity Details
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--divider)' }}>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Username</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Email</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Joined</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Today's Use</th>
                                <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Total Days</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.users?.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid var(--divider)', transition: 'background 0.15s' }}>
                                    <td style={{ padding: '14px 16px', fontWeight: 500 }}>{user.username}</td>
                                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{user.email}</td>
                                    <td style={{ padding: '14px 16px' }}>{new Date(user.date_joined).toLocaleDateString()}</td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{ 
                                            background: 'var(--accent-dim)', 
                                            color: 'var(--accent)', 
                                            fontWeight: 'bold', 
                                            padding: '4px 12px', 
                                            borderRadius: '20px', 
                                            fontSize: '13px' 
                                        }}>
                                            {user.used_today_count} times
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>{user.total_days_active} days</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(!stats?.users || stats.users.length === 0) && (
                        <p style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>No users found.</p>
                    )}
                </div>

                {/* ── Community Management Section ── */}
                <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    
                    <div className="inv-card" style={{ padding: '28px' }}>
                        <h3 style={{ color: 'var(--accent)', fontSize: '18px', fontWeight: 700, marginBottom: '20px', fontFamily: 'var(--font-heading)' }}>
                            Create Announcement Group
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
                            Announcement groups restrict messaging to admins only. Regular users can read but not reply.
                        </p>
                        <form onSubmit={handleCreateAnnouncementGroup}>
                            <input 
                                type="text" 
                                placeholder="e.g. System Updates" 
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'var(--input-bg)', color: 'inherit', marginBottom: '16px' }}
                            />
                            <button 
                                type="submit" 
                                style={{ width: '100%', padding: '12px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-heading)' }}
                                disabled={!newGroupName.trim()}
                            >
                                Create Group
                            </button>
                        </form>
                    </div>

                    <div className="inv-card" style={{ padding: '28px' }}>
                        <h3 style={{ color: 'var(--accent)', fontSize: '18px', fontWeight: 700, marginBottom: '20px', fontFamily: 'var(--font-heading)' }}>
                            Active Communities
                        </h3>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {groups.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No community groups yet.</p>
                            ) : (
                                groups.map(g => (
                                    <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid var(--card-border)' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '14px' }}>
                                                {g.is_announcement ? '📢' : '💬'} {g.name}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{g.member_count} members</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </MainLayout>
    );
};

export default Admin;