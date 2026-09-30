import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, PlusCircle, History, PieChart, Target, User } from "lucide-react";

function Navbar() {
  const location = useLocation();

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
      isActive 
      ? 'bg-purple-200 text-purple-800 font-bold shadow-sm' 
      : 'text-slate-500 hover:text-purple-700 hover:bg-purple-50'
    }`;
  };

  return (
    <nav className="bg-white/70 backdrop-blur-xl border-b border-purple-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2 transition-transform hover:scale-105 active:scale-95">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-purple-400 rounded-xl flex items-center justify-center shadow-md shadow-pink-200">
          <span className="text-white font-extrabold text-2xl">S</span>
        </div>
        <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500 tracking-tight">
          Savynx
        </h1>
      </Link>

      {/* Links */}
      <div className="hidden md:flex space-x-1">
        <Link to="/" className={getLinkClass('/')}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>
        <Link to="/add" className={getLinkClass('/add')}>
          <PlusCircle size={18} />
          <span>Add</span>
        </Link>
        <Link to="/history" className={getLinkClass('/history')}>
          <History size={18} />
          <span>History</span>
        </Link>
        <Link to="/analytics" className={getLinkClass('/analytics')}>
          <PieChart size={18} />
          <span>Analytics</span>
        </Link>
        <Link to="/savings" className={getLinkClass('/savings')}>
          <Target size={18} />
          <span>Goals</span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors shadow-sm cursor-pointer">
          <User size={20} />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;