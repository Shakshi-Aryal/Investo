import React from "react";
import { Instagram, Mail, Phone } from "lucide-react";
import logo from "../../assets/mainlogo.png";

const AboutUs = () => {
  return (
    <footer className="bg-[#0f0f0f] text-white py-12 px-6 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Logo and Contact (Left) */}
        <div className="md:col-span-1">
          <img src={logo} alt="FitForge Logo" className="h-12 mb-4" />
          <p className="flex items-center gap-2 text-sm">Kathmandu, Nepal</p>
          <p className="flex items-center gap-2 text-sm mt-2">
            <Phone className="w-4 h-4" /> +977 9801234567
          </p>
          <p className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4" /> info@fitforge.com
          </p>
          <p className="flex items-center gap-2 text-sm">
            <Instagram className="w-4 h-4" /> info@fitforge.com
          </p>
        </div>

        {/* Quick Links (Right) */}
        <div className="md:col-span-1 md:text-right">
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#home" className="hover:text-orange-500">Home</a></li>
            <li><a href="#programs" className="hover:text-orange-500">Programs</a></li>
            <li><a href="#coaching" className="hover:text-orange-500">Coaching</a></li>
            <li><a href="#about us" className="hover:text-orange-500">About Us</a></li>
            <li><a href="#" className="hover:text-orange-500">Contact</a></li>
          </ul>
        </div>

      </div>

      <p className="text-center text-gray-500 text-xs mt-10">
        © {new Date().getFullYear()} FitForge. All rights reserved.
      </p>
    </footer>

  );
};

export default AboutUs;