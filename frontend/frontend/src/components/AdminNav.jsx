import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import logo from '../assets/mainlogo.png';
import { LogOut } from 'lucide-react'; 

function AdminNav() {
  const navigate = useNavigate();
  const [showLogOutPopup, setShowLogOutPopup] = useState(false);
  const location = useLocation();

  const handleLogOutClick = () => {
    setShowLogOutPopup(true);
  };

  const cancelDelete = () => {
    setShowLogOutPopup(false);
  };

  const linkClasses = (path) => {
    const isActive = location.pathname === path;

    return `cursor-pointer px-4 py-2 rounded-md transition-all duration-200 
      ${isActive 
        ? 'bg-[#D90A14] text-white font-semibold shadow-md' 
        : 'hover:text-[#D90A14] hover:bg-white/10'
      }`;
  };

  return (
    <nav className="fixed top-0 left-0 h-screen w-48 bg-[#0F0505] p-4 flex flex-col items-center z-50 justify-between">
      <div className="flex flex-col items-center mb-auto">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src={logo} 
            alt="Brand Logo" 
            className="h-16 w-auto hover:drop-shadow-[0_0_10px_#CD4E17]" 
          />
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col gap-4 text-white text-base md:text-lg w-full items-center">
          {[
            { path: '/admindashboard', label: 'Dashboard' },
            { path: '/usermanagement', label: 'Users' },
            { path: '/exercisemanagement', label: 'Workouts' },
            { path: '/recipemanagement', label: 'Recipes' }
          ].map(({ path, label }) => (
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

      {/* Logout Button */}
      <div>
        <LogOut 
          className="hover:text-[#D90A14] cursor-pointer text-white"
          onClick={handleLogOutClick}
        />
      </div>

      {/* Logout Confirmation Popup */}
      {showLogOutPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <p className="mb-4 text-lg text-black font-semibold">
              Are you sure you want to <span className="text-red-600">Log Out</span>?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                onClick={() => navigate("/")}
              >
                Yes
              </button>
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer"
                onClick={cancelDelete}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default AdminNav;