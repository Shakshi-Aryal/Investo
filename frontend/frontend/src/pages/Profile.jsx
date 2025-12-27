import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TOKEN_KEY = "jwt";

function Profile() {
  const navigate = useNavigate();
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
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
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
      const token = localStorage.getItem(TOKEN_KEY);
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
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to update profile.");
    }
  };

  if (loading) return <p className="text-white p-6">Loading...</p>;
  if (error && !editing)
    return (
      <div className="text-white p-6">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 bg-[#D90A14] p-2 rounded-md"
        >
          Go to Login
        </button>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-[#0F0505] text-white p-6">
      <h1 className="text-4xl font-bold mb-8">Profile</h1>

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

      {editing && (
        <form
          className="bg-[#1A0B0B] p-6 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4"
          onSubmit={handleSubmit}
        >
          {success && <p className="text-green-400">{success}</p>}
          {error && <p className="text-red-400">{error}</p>}

          {["username", "first_name", "last_name", "email", "date_of_birth"].map(
            (field) => (
              <div key={field}>
                <label className="block text-gray-300 mb-1">{field.replace("_", " ")}</label>
                <input
                  type={field === "date_of_birth" ? "date" : field === "email" ? "email" : "text"}
                  name={field}
                  value={userData[field] || ""}
                  onChange={handleChange}
                  className="w-full p-2 rounded-md bg-[#0F0505] border border-gray-700 text-white"
                />
              </div>
            )
          )}

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
