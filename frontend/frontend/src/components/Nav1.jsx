import { useNavigate } from "react-router-dom";
import NormalButton from "./NormalButton";
import logo from '../assets/mainlogo.png';

function Nav1(){
    const navigate = useNavigate();

    // Function to handle smooth scrolling
    const scrollToSection = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return(
        <nav className="w-full flex items-center justify-between bg-[#0F0505] p-4 fixed top-0 left-0 right-0 z-50">
        {/* Left Side - Logo or Branding */}
        <div className="flex-shrink-0">
            <img 
                src={logo} 
                alt="Brand Logo" 
                className="h-12 md:h-20 w-auto hover:drop-shadow-[0_0_10px_#CD4E17]" 
            />
        </div>
        {/* Middle - Navigation Links */}
        <div className="hidden md:flex text-white text-base md:text-lg lg:text-xl gap-4 md:gap-6 lg:gap-8">
        <a onClick={()=>scrollToSection('home')} className="relative group text-white hover:text-[#D90A14] cursor-pointer">Home</a>
        <a onClick={()=>scrollToSection('programs')} className="relative group text-white hover:text-[#D90A14] cursor-pointer">Programs</a>
        <a onClick={()=>scrollToSection('coaching')} className="relative group text-white hover:text-[#D90A14] cursor-pointer">Coaching</a>
        <a onClick={()=>scrollToSection('aboutus')} className="relative group text-white hover:text-[#D90A14] cursor-pointer">About Us</a>
        </div>

        {/* Right Side - Buttons */}
        <div className="flex gap-4">
        <NormalButton text="Login" textColor="#CD4E17" hoverText="white" bgColor="black" bColor="#CD4E17" hoverBg="#CD4E17" onClick={()=>navigate("/login")}/>
        <NormalButton text="Register" textColor="white" hoverText="#D90A14" bgColor="#D90A14" hoverBorder="#D90A14" hoverBg="#0F0505" bColor="#D90A14" onClick={()=>navigate("/register")}/>
        </div>
    </nav>
    );
}

export default Nav1;