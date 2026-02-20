import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  MessageSquare,
  BookOpen,
  Brain,
  Bookmark,
  BarChart3,
  Settings,
  Menu,
  X,
  Code2,
  ChevronLeft,
  FileText,
  Database,
  UserCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { path: "/", icon: MessageSquare, label: "Developer Chat" },
    { path: "/flashcards", icon: Brain, label: "Flashcards" },
    { path: "/documentation", icon: BookOpen, label: "Documentation" },
    { path: "/saved", icon: Bookmark, label: "Saved Answers" },
    { path: "/analytics", icon: BarChart3, label: "Usage Analytics" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  const topNavLinks = [
    { path: "/documentation", label: "Documentation" },
    { path: "/", label: "Stack Overflow Sources" },
    { path: "/flashcards", label: "Flashcards" },
    { path: "/", label: "API" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#0F172A] text-white border-b border-slate-700">
        <div className="flex items-center justify-between px-6 h-16">
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 bg-[#3B82F6] rounded-lg">
              <Code2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">DevDoc AI</h1>
          </div>

          {/* Center: Navigation Links (hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-6">
            {topNavLinks.map((link) => (
              <Link
                key={link.path + link.label}
                to={link.path}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg">
              <Database className="w-4 h-4 text-[#3B82F6]" />
              <span className="text-sm">Workspace</span>
            </div>
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 hover:bg-slate-800 rounded-lg px-2 py-1 transition-colors"
              >
                <div className="flex items-center justify-center w-9 h-9 bg-[#3B82F6] rounded-full text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-slate-700">
                      <p className="font-medium text-white">{user?.name}</p>
                      <p className="text-sm text-gray-400 truncate">{user?.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors"
                      >
                        <UserCircle className="w-5 h-5" />
                        Profile Settings
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors"
                      >
                        <Settings className="w-5 h-5" />
                        App Settings
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-slate-700 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 w-full hover:bg-slate-700 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`${
            sidebarCollapsed ? "w-16" : "w-64"
          } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
        >
          {/* Collapse Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center justify-center h-12 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {sidebarCollapsed ? (
              <Menu className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Navigation Items */}
          <nav className="flex-1 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/" && location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#3B82F6] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section - Version Info */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                <p className="font-medium text-gray-700 mb-1">DevDoc AI v1.0</p>
                <p>Enterprise Edition</p>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}