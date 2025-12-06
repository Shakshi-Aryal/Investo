import React, { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
  const [userData, setUserData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    date_of_birth: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false); // toggle edit mode

  // Fetch profile info on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) {
          setError("You are not logged in.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://127.0.0.1:8000/api/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserData({
          username: response.data.username || "",
          first_name: response.data.first_name || "",
          last_name: response.data.last_name || "",
          email: response.data.email || "",
          date_of_birth: response.data.date_of_birth || "",
        });
      } catch (err) {
        console.error(err);
        setError("Failed to fetch profile info.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const response = await axios.put(
        "http://127.0.0.1:8000/api/profile/",
        userData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserData({
        username: response.data.username || "",
        first_name: response.data.first_name || "",
        last_name: response.data.last_name || "",
        email: response.data.email || "",
        date_of_birth: response.data.date_of_birth || "",
      });

      setSuccess("Profile updated successfully!");
      setEditing(false); // close edit card
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Failed to update profile. Please try again."
      );
    }
  };

  if (loading) return <p className="text-white p-6">Loading...</p>;
  if (error && !editing) return <p className="text-red-500 p-6">{error}</p>;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-[#0F0505] text-white p-6">
      <h1 className="text-4xl font-bold mb-8">Profile</h1>

      {/* ------------------- Profile Display ------------------- */}
      {!editing && (
        <div className="bg-[#1A0B0B] p-6 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-3">
          <p>
            <strong>Username:</strong> {userData.username}
          </p>
          <p>
            <strong>First Name:</strong> {userData.first_name}
          </p>
          <p>
            <strong>Last Name:</strong> {userData.last_name}
          </p>
          <p>
            <strong>Email:</strong> {userData.email}
          </p>
          <p>
            <strong>Date of Birth:</strong> {userData.date_of_birth || "-"}
          </p>

          <button
            onClick={() => setEditing(true)}
            className="mt-4 bg-[#D90A14] hover:bg-[#FF1A2B] transition-colors duration-200 p-2 rounded-md font-semibold"
          >
            Edit Profile
          </button>
        </div>
      )}

      {/* ------------------- Edit Form ------------------- */}
      {editing && (
        <form
          className="bg-[#1A0B0B] p-6 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4"
          onSubmit={handleSubmit}
        >
          {success && <p className="text-green-400">{success}</p>}
          {error && <p className="text-red-400">{error}</p>}

          <div>
            <label className="block text-gray-300 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={userData.username}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-[#0F0505] border border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1">First Name</label>
            <input
              type="text"
              name="first_name"
              value={userData.first_name}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-[#0F0505] border border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={userData.last_name}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-[#0F0505] border border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-[#0F0505] border border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={userData.date_of_birth || ""}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-[#0F0505] border border-gray-700 text-white"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="mt-4 bg-[#D90A14] hover:bg-[#FF1A2B] transition-colors duration-200 p-2 rounded-md font-semibold flex-1"
            >
              Update Profile
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="mt-4 bg-gray-700 hover:bg-gray-600 transition-colors duration-200 p-2 rounded-md font-semibold flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Profile;
