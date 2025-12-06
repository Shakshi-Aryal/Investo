import React, { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("jwt"); // or "token" depending on your auth setup
        if (!token) {
          setError("You are not logged in.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://127.0.0.1:8000/api/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <p className="text-white p-6">Loading...</p>;
  if (error) return <p className="text-red-500 p-6">{error}</p>;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-[#0F0505] text-white p-6">
      <h1 className="text-4xl font-bold mb-8">Profile</h1>
      <div className="bg-[#1A0B0B] p-6 rounded-xl shadow-lg w-full max-w-md">
        <p><strong>Full Name:</strong> {user.first_name} {user.last_name}</p>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Date of Birth:</strong> {user.date_of_birth || "Not Provided"}</p>
      </div>
    </div>
  );
}

export default Profile;
