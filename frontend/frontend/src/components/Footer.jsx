import { Instagram, Mail, Phone } from "lucide-react";
import logo from "../assets/mainlogo.png";

const Footer = () => {
  return (
    <footer className="bg-[#0F0505] text-white py-12 px-6 mt-20">
      <div className="max-w-7xl mx-auto md:grid-cols-2 gap-8 justify-items-center">
        {/* Logo and Contact (Center) */}
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

      <p className="text-center text-gray-500 text-xs mt-10">
        © {new Date().getFullYear()} FitForge. All rights reserved.
      </p>
    </footer>

  );
};

export default Footer;