// frontend/src/components/common/Sidebar.jsx

import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiCheckSquare,
  FiList,
  FiBriefcase,
  FiBarChart2,
  FiAlertTriangle,
  FiLogOut,
  FiChevronsLeft,
  FiDatabase,
  FiBookOpen,
  FiSettings,
  FiChevronDown,
  FiLayers,
  FiArrowDownCircle,
  FiArrowRightCircle,
  FiMap,
  FiKey,
  FiUsers,
  FiMoreVertical,
  FiUser,
  FiLock,
  FiBox,
  FiShuffle,
  FiFileText,
  FiActivity,
  FiGlobe,
  FiZap,
  FiPieChart,
  FiCommand,
  FiCpu,
} from "react-icons/fi";
import { HiCalculator } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";

// --- DATA MENU ---
const menuItems = [
  { title: "Dashboard", path: "/dashboard", icon: <FiGrid />, requiredPermission: "view_dashboard" },

  // GROUP: QUICK RISK CHECK (New)
  {
    key: "qrc",
    title: "Quick Risk Scan",
    icon: <FiZap className="text-yellow-400" />, // Icon warna spesial
    requiredPermission: "view_qrc_menu",
    children: [
      { title: "QRC Asesmen", path: "/qrc/assessments", icon: <FiCheckSquare />, requiredPermission: "submit_qrc_assessment" },
      { title: "QRC Consultant", path: "/qrc/consultant", icon: <FiPieChart />, requiredPermission: "view_qrc_consultant" },
      { title: "Template QRC", path: "/qrc/templates", icon: <FiFileText />, requiredPermission: "view_admin_area" },
    ],
  },

  // GROUP: RISK LEVELS
  {
    key: "riskLevel",
    title: "Risk Levels",
    icon: <FiLayers />,
    children: [
      { title: "Asesmen Dasar", path: "/risk-management/dasar", icon: <FiArrowDownCircle />, requiredPermission: "view_risk_dasar" },
      { title: "Asesmen Madya", path: "/risk-management/madya", icon: <FiArrowRightCircle />, requiredPermission: "view_risk_madya" },
      { title: "Template Peta", path: "/risk-management/templates", icon: <FiMap />, requiredPermission: "view_risk_templates" },
    ],
  },

  // GROUP: RISK AI
  {
    key: "riskAI",
    title: "Risk AI",
    icon: <FiCpu className="text-cyan-400" />, // Icon warna spesial
    children: [
      { title: "Risk Assessment", path: "/risk-ai/assessments", icon: <FiCheckSquare />, requiredPermission: "view_risk_assessment_ai" },
      { title: "Risk Register", path: "/risk-ai/risk-register", icon: <FiList />, requiredPermission: "view_risk_register_main" },
    ],
  },

  // GROUP: ADD-ONS
  {
    key: "addons",
    title: "Add-ons",
    icon: <FiBox />,
    requiredPermission: "view_addons_menu",
    children: [
      {
        key: "rsca",
        title: "Modul RSCA",
        icon: <FiFileText />,
        requiredPermission: "view_rsca",
        children: [
          { title: "Tugas Kuesioner", path: "/addons/rsca", icon: <FiCheckSquare />, requiredPermission: "submit_rsca" },
          { title: "Manajemen Siklus", path: "/admin/rsca", icon: <FiSettings />, requiredPermission: "manage_rsca_cycles" },
          { title: "Manajemen Dept", path: "/admin/departments", icon: <FiBriefcase />, requiredPermission: "manage_departments" },
          { title: "Pantau Mitigasi", path: "/admin/mitigation-monitor", icon: <FiActivity />, requiredPermission: "view_mitigation_monitor" },
        ],
      },
      { title: "Modul BPR", path: "/addons/bpr", icon: <FiBarChart2 />, requiredPermission: "view_bpr" },
      { title: "Horizon Scanner", path: "/addons/horizon-scanner", icon: <FiGlobe />, requiredPermission: "view_horizon_scanner" },
      { title: "Modul BIA", path: "/addons/bia", icon: <FiAlertTriangle />, requiredPermission: "view_bia" },
      { title: "CBA Calculator", path: "/addons/cba", icon: <HiCalculator />, requiredPermission: "view_cba_calculator" },
      { title: "Monte Carlo", path: "/addons/monte-carlo", icon: <FiShuffle />, requiredPermission: "view_monte_carlo" },
    ],
  },

  // GROUP: ADMIN
  {
    key: "admin",
    title: "Admin Panel",
    icon: <FiSettings />,
    requiredPermission: "view_admin_area",
    children: [
      { title: "Master Data", path: "/admin/master-data", icon: <FiDatabase />, requiredPermission: "manage_master_data" },
      { title: "Master Regulasi", path: "/admin/regulations", icon: <FiBookOpen />, requiredPermission: "manage_regulations" },
      { title: "Role & Access", path: "/admin/roles", icon: <FiKey />, requiredPermission: "manage_roles" },
      { title: "Member Mgmt", path: "/admin/members", icon: <FiUsers />, requiredPermission: "manage_users" },
    ],
  },
];

// --- KOMPONEN ICON CPU (Khusus karena tidak ada di react-icons standar dengan nama FiCpu yang pas untuk AI context di sini, kita pakai FiCpu saja tapi di-rename visualnya) ---
// (Sudah diimport di atas)

function Sidebar({ isOpen, toggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedKeys, setExpandedKeys] = useState({});
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const hasPermission = (requiredPermission) => {
    if (user?.role === "admin") return true;
    if (!requiredPermission) return true;
    if (!user?.permissions) return false;
    return user.permissions.includes(requiredPermission);
  };

  const isItemActive = (item) => {
    if (item.path && location.pathname.startsWith(item.path)) return true;
    if (item.children) {
      return item.children.some((child) => isItemActive(child));
    }
    return false;
  };

  // Auto Expand Menu yang Aktif
  useEffect(() => {
    const newExpandedKeys = { ...expandedKeys };
    let hasChanges = false;

    const checkExpand = (items) => {
      items.forEach((item) => {
        if (item.children && isItemActive(item)) {
          if (!newExpandedKeys[item.key]) {
            newExpandedKeys[item.key] = true;
            hasChanges = true;
          }
          checkExpand(item.children);
        }
      });
    };

    checkExpand(menuItems);
    if (hasChanges) {
      setExpandedKeys(newExpandedKeys);
    }
  }, [location.pathname, user]);

  const handleToggle = (key) => {
    setExpandedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Close user menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    if (isUserMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
    navigate("/");
  };

  // --- STYLING CLASSES (Modern Dark Theme) ---
  // Base container
  const sidebarClass = `
    flex flex-col h-screen sticky top-0 z-50
    bg-slate-900 text-slate-300 
    border-r border-slate-800 shadow-2xl
    transition-[width] duration-300 ease-in-out
    ${isOpen ? "w-72" : "w-20"}
  `;

  // Link Styles
  const linkBaseClass = `
    flex items-center px-4 py-3 my-1 mx-2 rounded-xl
    transition-all duration-200 group relative overflow-hidden
  `;

  // Active State: Glassmorphism effect + Neon border
  const linkActiveClass = `
    bg-indigo-600/20 text-white font-medium
    shadow-[0_0_15px_rgba(79,70,229,0.15)]
    before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-indigo-500 before:rounded-r-full
  `;

  // Inactive State: Hover effect
  const linkInactiveClass = `
    hover:bg-slate-800/50 hover:text-white
  `;

  // Submenu Indentation
  const getPaddingLeft = (level) => (isOpen ? level * 16 + 16 : 16);

  // --- RENDER MENU ITEM REKUSIF ---
  const renderMenuItem = (item, level = 0) => {
    // Filter by Permission
    const visibleChildren = item.children ? item.children.filter((child) => hasPermission(child.requiredPermission)) : [];
    const canView = hasPermission(item.requiredPermission) && (!item.children || visibleChildren.length > 0);

    if (!canView) return null;

    const isActive = isItemActive(item);
    const isExpanded = expandedKeys[item.key];
    const paddingLeft = getPaddingLeft(level);

    // JIKA PUNYA ANAK (SUBMENU)
    if (item.children && visibleChildren.length > 0) {
      return (
        <div key={item.key} className="mb-1">
          <button
            onClick={() => handleToggle(item.key)}
            className={`
              ${linkBaseClass} w-full justify-between
              ${isActive ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"}
              hover:bg-slate-800/30
            `}
            style={{ paddingLeft: isOpen ? paddingLeft : "1rem" }} // Reset padding saat collapsed agar icon di tengah
            title={!isOpen ? item.title : ""}
          >
            <div className={`flex items-center ${!isOpen && "mx-auto"}`}>
              <span className={`text-xl flex-shrink-0 transition-colors ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`}>{item.icon}</span>

              {/* Text Label (Hidden when collapsed) */}
              <span className={`ml-3 whitespace-nowrap transition-all duration-300 origin-left ${isOpen ? "opacity-100 w-auto scale-100" : "opacity-0 w-0 scale-90 overflow-hidden"}`}>{item.title}</span>
            </div>

            {/* Chevron Arrow */}
            {isOpen && <FiChevronDown className={`w-4 h-4 transition-transform duration-300 text-slate-500 ${isExpanded ? "rotate-180" : ""}`} />}
          </button>

          {/* Submenu Container (Animasi Height) */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded && isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="mt-1">{visibleChildren.map((child) => renderMenuItem(child, level + 1))}</div>
          </div>
        </div>
      );
    }

    // JIKA SINGLE LINK
    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) => `
          ${linkBaseClass}
          ${isActive ? linkActiveClass : linkInactiveClass}
          ${!isOpen && "justify-center px-0"}
        `}
        style={{ paddingLeft: isOpen ? paddingLeft : 0 }} // Reset padding saat collapsed
        title={!isOpen ? item.title : ""}
      >
        <span className={`text-xl flex-shrink-0 transition-transform duration-300 ${isOpen ? "" : "group-hover:scale-110"}`}>{item.icon}</span>

        <span className={`ml-3 whitespace-nowrap transition-all duration-300 origin-left ${isOpen ? "opacity-100 w-auto scale-100" : "opacity-0 w-0 scale-0 overflow-hidden"}`}>{item.title}</span>

        {/* Tooltip-like effect for collapsed sidebar (optional) */}
        {!isOpen && (
          <div className="fixed left-20 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg border border-slate-700 whitespace-nowrap">
            {item.title}
          </div>
        )}
      </NavLink>
    );
  };

  const userInitial = user?.nama_lengkap ? user.nama_lengkap[0].toUpperCase() : "U";

  return (
    <aside className={sidebarClass}>
      {/* --- HEADER (LOGO) --- */}
      <div className="flex items-center h-20 px-6 border-b border-slate-800/50 relative">
        <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${isOpen ? "w-full" : "w-0 opacity-0"}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <FiCommand className="text-white text-lg" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">SIRICO</span>
        </div>

        {/* Toggle Button (Absolute Position agar rapi) */}
        <button
          onClick={toggle}
          className={`
            absolute right-[-12px] top-8 
            bg-slate-800 text-slate-400 hover:text-white border border-slate-700 
            w-6 h-6 rounded-full flex items-center justify-center 
            shadow-md transition-all hover:scale-110 z-50
            ${!isOpen && "rotate-180 left-1/2 -translate-x-1/2 top-6 right-auto"} 
          `}
        >
          <FiChevronsLeft size={14} />
        </button>
      </div>

      {/* --- MENU LIST (Scrollable) --- */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <nav className="space-y-0.5">{menuItems.map((item) => renderMenuItem(item))}</nav>
      </div>

      {/* --- USER PROFILE (Footer) --- */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/50" ref={userMenuRef}>
        {/* Dropdown Menu */}
        {isUserMenuOpen && isOpen && (
          <div className="absolute bottom-20 left-4 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 p-1.5 animate-in fade-in slide-in-from-bottom-4 z-50 origin-bottom-left">
            <div className="px-3 py-2 border-b border-gray-100 mb-1">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.nama_lengkap}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <Link to="/account-setting" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <FiUser className="mr-3" /> Account
            </Link>
            <Link to="/password-setting" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <FiLock className="mr-3" /> Password
            </Link>
            {user?.role === "admin" && (
              <Link to="/account/api-key" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors mt-1 mb-1 border border-blue-100">
                <FiKey className="mr-3" /> API Key Setting
              </Link>
            )}
            <div className="h-px bg-gray-100 my-1"></div>
            <button onClick={handleLogout} className="flex w-full items-center px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
              <FiLogOut className="mr-3" /> Logout
            </button>
          </div>
        )}

        {/* User Card Button */}
        <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className={`flex items-center w-full p-2 rounded-xl transition-all duration-200 ${isUserMenuOpen ? "bg-slate-800" : "hover:bg-slate-800"}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg border-2 border-slate-700 shrink-0">{userInitial}</div>

          <div className={`ml-3 overflow-hidden transition-all duration-300 text-left ${isOpen ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
            <p className="text-sm font-medium text-white truncate">{user?.nama_lengkap}</p>
            <p className="text-xs text-slate-500 truncate">{user?.role || "User"}</p>
          </div>

          {isOpen && <FiMoreVertical className="ml-auto text-slate-500" />}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
