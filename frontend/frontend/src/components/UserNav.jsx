import { useNavigate, useLocation } from "react-router-dom";
import logo from '../assets/mainlogo.png';
import { Menu, User } from 'lucide-react';
import { useState, useRef, useEffect } from "react";

function UserNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogOutPopup, setShowLogOutPopup] = useState(false);

  const dropdownRef = useRef();

  // 🧠 Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const linkClasses = (path) => {
    const isActive = location.pathname === path;
    return `cursor-pointer px-4 py-2 rounded-md transition-all duration-200 
      ${isActive 
        ? 'bg-[#D90A14] text-white font-semibold shadow-md' 
        : 'hover:text-[#D90A14] hover:bg-white/10'
      }`;
  };

  const navLinks = [
    { path: '/dashboard', label: 'Home' },
    { path: '/exercises', label: 'Exercises' },
    { path: '/recipes', label: 'Recipes' },
    { path: '/tools', label: 'Tools' }
  ];

  const handleLogout = () => {
    setShowLogOutPopup(true);
    setUserMenuOpen(false);
  };

  const cancelLogout = () => {
    setShowLogOutPopup(false);
  };

  return (
    <>
      <nav className="w-full bg-[#0F0505] p-4 fixed top-0 left-0 right-0 z-50 shadow-md">
        <div className="flex justify-between items-center relative">
          {/* Left: Logo and hamburger */}
          <div className="flex items-center space-x-4">
            <img 
              src={logo} 
              alt="Brand Logo" 
              className="h-12 md:h-16 w-auto hover:drop-shadow-[0_0_10px_#CD4E17]" 
              onClick={() => navigate('/dashboard')}
            />
            <div className="md:hidden">
              <Menu 
                className="text-white cursor-pointer"
                onClick={() => setMenuOpen(!menuOpen)}
              />
            </div>
          </div>

          {/* Center: Search bar */}
          {/* <input
            type="text"
            placeholder="Search..."
            className="px-3 py-2 mb-2 rounded-md bg-white/10 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#D90A14]"
          /> */}

          {/* Desktop Links */}
          <div className="hidden md:flex flex-col items-center">
            <div className="flex gap-6 text-white text-lg">
              {navLinks.map(({ path, label }) => (
                <a
                  key={path}
                  onClick={() => navigate(path)}
                  className={linkClasses(path)}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Right: User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <User 
              className="hover:text-[#D90A14] cursor-pointer text-white"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            />
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 bg-white text-black rounded shadow-lg z-50 w-32">
                <button
                  className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                  onClick={() => {
                    navigate("/profile");
                    setUserMenuOpen(false);
                  }}
                >
                  Profile
                </button>
                <button
                  className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="md:hidden mt-4 text-white text-base space-y-2 flex flex-col items-center">
            {navLinks.map(({ path, label }) => (
              <a
                key={path}
                onClick={() => {
                  navigate(path);
                  setMenuOpen(false);
                }}
                className={linkClasses(path) + " w-full text-center"}
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Logout Confirmation Popup */}
      {showLogOutPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <p className="mb-4 text-lg text-black font-semibold">
              Are you sure you want to <span className="text-red-600">Log Out</span>?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => {
                  navigate("/");
                }}
              >
                Yes
              </button>
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={cancelLogout}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserNav;