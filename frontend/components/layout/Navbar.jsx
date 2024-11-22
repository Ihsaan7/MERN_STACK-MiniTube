import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const Navbar = () => {
  const { user, isLoggedIn, handleLogout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const onLogout = async () => {
    await handleLogout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav
      className={`border-b sticky top-0 z-50 transition-colors duration-300 ${
        isDark
          ? "bg-neutral-950 border-neutral-800"
          : "bg-white border-neutral-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 sm:gap-3 group">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 bg-orange-500 flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
            <span
              className={`text-lg sm:text-xl font-bold tracking-tight hidden sm:block ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              StreamVault
            </span>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos..."
                className={`w-full px-4 py-2 pr-24 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isDark
                    ? "bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500 focus:border-orange-500 focus:ring-orange-500 focus:ring-offset-neutral-950"
                    : "bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-orange-500 focus:ring-orange-500 focus:ring-offset-white"
                }`}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 font-medium transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle - Desktop */}
            <button
              onClick={toggleTheme}
              className={`hidden sm:block p-2 border transition-all duration-300 hover:scale-110 ${
                isDark
                  ? "bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800"
                  : "bg-neutral-50 border-neutral-200 text-neutral-900 hover:bg-neutral-100"
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {isLoggedIn ? (
              <>
                {/* Upload Button - Desktop */}
                <Link
                  to="/upload"
                  className="hidden sm:flex bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 font-semibold transition-all duration-200 items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span>Upload</span>
                </Link>

                {/* Upload Button - Mobile (Icon only) */}
                <Link
                  to="/upload"
                  className="sm:hidden bg-orange-500 hover:bg-orange-600 text-white p-2 transition-all duration-200 flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </Link>

                {/* Hamburger Menu - Mobile */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className={`sm:hidden p-2 ${
                    isDark ? "text-white" : "text-neutral-900"
                  }`}
                  aria-label="Toggle menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {showMobileMenu ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>

                {/* User Profile Dropdown - Desktop */}
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className={`flex items-center gap-2 p-1 transition-all duration-200 hover:scale-105`}
                  >
                    <img
                      src={user?.avatar || "https://via.placeholder.com/40"}
                      alt={user?.username}
                      className={`w-11 h-11 rounded-full object-cover border-2 ${
                        isDark ? "border-white" : "border-neutral-900"
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div
                      className={`absolute right-0 mt-2 w-64 border shadow-2xl py-2 z-50 ${
                        isDark
                          ? "bg-neutral-900 border-neutral-800"
                          : "bg-white border-neutral-200"
                      }`}
                    >
                      {/* User Info */}
                      <div
                        className={`px-4 py-3 border-b ${
                          isDark ? "border-neutral-800" : "border-neutral-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              user?.avatar || "https://via.placeholder.com/40"
                            }
                            alt={user?.username}
                            className={`w-12 h-12 rounded-full object-cover border-2 ${
                              isDark ? "border-white" : "border-neutral-900"
                            }`}
                          />
                          <div>
                            <p
                              className={`font-semibold ${
                                isDark ? "text-white" : "text-neutral-900"
                              }`}
                            >
                              {user?.fullName}
                            </p>
                            <p
                              className={`text-sm ${
                                isDark ? "text-neutral-400" : "text-neutral-500"
                              }`}
                            >
                              @{user?.username}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <Link
                        to="/profile"
                        className={`block px-4 py-3 transition-colors ${
                          isDark
                            ? "hover:bg-neutral-800 text-neutral-300"
                            : "hover:bg-neutral-50 text-neutral-700"
                        }`}
                        onClick={() => setShowDropdown(false)}
                      >
                        <div className="flex items-center gap-3">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span>Your Channel</span>
                        </div>
                      </Link>

                      <Link
                        to="/subscriptions"
                        className={`block px-4 py-3 transition-colors ${
                          isDark
                            ? "hover:bg-neutral-800 text-neutral-300"
                            : "hover:bg-neutral-50 text-neutral-700"
                        }`}
                        onClick={() => setShowDropdown(false)}
                      >
                        <div className="flex items-center gap-3">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <span>Subscriptions</span>
                        </div>
                      </Link>

                      <Link
                        to="/dashboard"
                        className={`block px-4 py-3 transition-colors ${
                          isDark
                            ? "hover:bg-neutral-800 text-neutral-300"
                            : "hover:bg-neutral-50 text-neutral-700"
                        }`}
                        onClick={() => setShowDropdown(false)}
                      >
                        <div className="flex items-center gap-3">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          <span>Analytics</span>
                        </div>
                      </Link>

                      <Link
                        to="/settings"
                        className={`block px-4 py-3 transition-colors ${
                          isDark
                            ? "hover:bg-neutral-800 text-neutral-300"
                            : "hover:bg-neutral-50 text-neutral-700"
                        }`}
                        onClick={() => setShowDropdown(false)}
                      >
                        <div className="flex items-center gap-3">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>Settings</span>
                        </div>
                      </Link>

                      <div
                        className={`border-t mt-2 pt-2 ${
                          isDark ? "border-neutral-800" : "border-neutral-200"
                        }`}
                      >
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            onLogout();
                          }}
                          className={`w-full text-left px-4 py-3 transition-colors text-red-500 hover:text-red-600 ${
                            isDark
                              ? "hover:bg-neutral-800"
                              : "hover:bg-neutral-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            <span>Logout</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Login/Register Buttons for non-logged users */
              <>
                {/* Desktop */}
                <div className="hidden sm:flex items-center gap-3">
                  <Link
                    to="/login"
                    className={`font-semibold transition-colors ${
                      isDark
                        ? "text-white hover:text-neutral-300"
                        : "text-neutral-900 hover:text-neutral-600"
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Sign Up
                  </Link>
                </div>
                
                {/* Mobile Hamburger */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className={`sm:hidden p-2 ${
                    isDark ? "text-white" : "text-neutral-900"
                  }`}
                  aria-label="Toggle menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {showMobileMenu ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div
          className={`sm:hidden border-t relative z-50 ${
            isDark ? "border-neutral-800 bg-neutral-950" : "border-neutral-200 bg-white"
          }`}
        >
          {/* Mobile Search */}
          <div className="px-4 py-3 border-b ${isDark ? 'border-neutral-800' : 'border-neutral-200'}">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  className={`w-full px-3 py-2 pr-20 border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isDark
                      ? "bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500 focus:border-orange-500 focus:ring-orange-500 focus:ring-offset-neutral-950"
                      : "bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-orange-500 focus:ring-orange-500 focus:ring-offset-white"
                  }`}
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 text-xs font-medium transition-all duration-200"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {isLoggedIn ? (
            <>
              {/* User Info */}
              <div className={`px-4 py-3 border-b ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
                <div className="flex items-center gap-3">
                  <img
                    src={user?.avatar || "https://via.placeholder.com/40"}
                    alt={user?.username}
                    className={`w-10 h-10 rounded-full object-cover border-2 ${
                      isDark ? "border-white" : "border-neutral-900"
                    }`}
                  />
                  <div>
                    <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-neutral-900"}`}>
                      {user?.fullName}
                    </p>
                    <p className={`text-xs ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                      @{user?.username}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <Link
                  to="/profile"
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isDark ? "hover:bg-neutral-900 text-neutral-300" : "hover:bg-neutral-50 text-neutral-700"
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Your Channel</span>
                </Link>

                <Link
                  to="/subscriptions"
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isDark ? "hover:bg-neutral-900 text-neutral-300" : "hover:bg-neutral-50 text-neutral-700"
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Subscriptions</span>
                </Link>

                <Link
                  to="/dashboard"
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isDark ? "hover:bg-neutral-900 text-neutral-300" : "hover:bg-neutral-50 text-neutral-700"
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Analytics</span>
                </Link>

                <Link
                  to="/settings"
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isDark ? "hover:bg-neutral-900 text-neutral-300" : "hover:bg-neutral-50 text-neutral-700"
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </Link>

                {/* Theme Toggle - Mobile */}
                <button
                  onClick={toggleTheme}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                    isDark ? "hover:bg-neutral-900 text-neutral-300" : "hover:bg-neutral-50 text-neutral-700"
                  }`}
                >
                  {isDark ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>

                <div className={`border-t mt-2 pt-2 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      onLogout();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-red-500 hover:text-red-600 ${
                      isDark ? "hover:bg-neutral-900" : "hover:bg-neutral-50"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Not logged in - Mobile */
            <div className="py-2">
              <Link
                to="/login"
                className={`flex items-center justify-center px-4 py-3 transition-colors font-semibold ${
                  isDark ? "text-white hover:bg-neutral-900" : "text-neutral-900 hover:bg-neutral-50"
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center mx-4 my-2 bg-orange-500 hover:bg-orange-600 text-white py-3 font-semibold transition-all duration-200"
                onClick={() => setShowMobileMenu(false)}
              >
                Sign Up
              </Link>
              
              {/* Theme Toggle - Mobile */}
              <button
                onClick={toggleTheme}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                  isDark ? "hover:bg-neutral-900 text-neutral-300" : "hover:bg-neutral-50 text-neutral-700"
                }`}
              >
                {isDark ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
      
      {/* Close mobile menu when clicking outside */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
