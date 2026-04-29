import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../utils/api";

const navClass = ({ isActive }) =>
  `text-sm font-medium transition-colors duration-200 ${
    isActive
      ? "text-cyan-400"
      : "text-slate-400 hover:text-cyan-300"
  }`;

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [serverHealth, setServerHealth] = useState("checking");

  useEffect(() => {
    api.get("/api/health")
      .then(res => {
        if (res.data.success) {
          setServerHealth("online");
        } else {
          setServerHealth("offline");
        }
      })
      .catch(() => setServerHealth("offline"));
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-dark-700/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-black text-white">
            M
          </span>
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            MedTrace
          </span>
        </Link>

        {/* Desktop Nav & Health */}
        <div className="hidden items-center gap-6 sm:flex">
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1">
            <span className={`h-2 w-2 rounded-full ${serverHealth === "online" ? "bg-emerald-400" : serverHealth === "offline" ? "bg-red-400" : "bg-slate-500 animate-pulse"}`} />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
              {serverHealth === "online" ? "Server Online" : serverHealth === "offline" ? "Server Offline" : "Checking..."}
            </span>
          </div>
          <NavLink to="/scanner" className={navClass}>
            Scanner
          </NavLink>
          <NavLink to="/manufacturer" className={navClass}>
            Manufacturer
          </NavLink>
          <NavLink to="/blockchain" className={navClass}>
            Blockchain
          </NavLink>
        </div>

        {/* Mobile Hamburger */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-cyan-400 sm:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {menuOpen ? (
              <>
                <line x1="4" y1="4" x2="18" y2="18" />
                <line x1="18" y1="4" x2="4" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="19" y2="6" />
                <line x1="3" y1="11" x2="19" y2="11" />
                <line x1="3" y1="16" x2="19" y2="16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-white/5 px-4 py-3 sm:hidden">
          <div className="flex flex-col gap-3">
            <NavLink to="/scanner" className={navClass} onClick={() => setMenuOpen(false)}>
              Scanner
            </NavLink>
            <NavLink to="/manufacturer" className={navClass} onClick={() => setMenuOpen(false)}>
              Manufacturer
            </NavLink>
            <NavLink to="/blockchain" className={navClass} onClick={() => setMenuOpen(false)}>
              Blockchain
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
