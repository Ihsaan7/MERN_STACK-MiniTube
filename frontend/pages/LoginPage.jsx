import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { login } from "../api/services/authServices";

const LoginPage = () => {
  // States
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDark, setIsDark] = useState(true);

  // Hooks
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!emailOrUsername || !password) {
      setError("Email/Username and Password are required!");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }

    // Determine if input is email or username
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(emailOrUsername);

    const credentials = {
      password,
      ...(isEmail ? { email: emailOrUsername } : { username: emailOrUsername }),
    };

    // API Call with try-catch
    setLoading(true);

    try {
      const response = await login(credentials);

      if (response && response.user) {
        handleLogin(response.user);
        navigate("/home");
      }
    } catch (err) {
      // Handle API errors
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false); // Always stop loading
    }
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isDark ? 'bg-neutral-950' : 'bg-white'}`}>
      {/* Left Side - Branding */}
      <div className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${isDark ? 'bg-neutral-900' : 'bg-neutral-50'}`}>
        {/* Inset Shadows from Edges */}
        <div 
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            boxShadow: isDark 
              ? 'inset 60px 0 80px -40px rgba(0, 0, 0, 0.6), inset -60px 0 80px -40px rgba(0, 0, 0, 0.6), inset 0 60px 80px -40px rgba(0, 0, 0, 0.4), inset 0 -60px 80px -40px rgba(0, 0, 0, 0.4)'
              : 'inset 60px 0 80px -40px rgba(0, 0, 0, 0.15), inset -60px 0 80px -40px rgba(0, 0, 0, 0.15), inset 0 60px 80px -40px rgba(0, 0, 0, 0.1), inset 0 -60px 80px -40px rgba(0, 0, 0, 0.1)'
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-16">
          {/* Logo & Tagline */}
          <div>
            <div className="inline-flex items-center gap-3 mb-6 group">
              <div className={`w-11 h-11 ${isDark ? 'bg-white' : 'bg-neutral-900'} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                <svg className={`w-6 h-6 ${isDark ? 'text-neutral-900' : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <h1 className={`text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>StreamVault</h1>
            </div>
            <p className={`text-lg leading-relaxed max-w-md ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Professional video platform for creators and audiences worldwide.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start gap-4 group">
              <div className={`w-1 h-12 ${isDark ? 'bg-white' : 'bg-neutral-900'} transition-all duration-300 group-hover:h-16`} />
              <div>
                <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-neutral-900'}`}>Unlimited Storage</h3>
                <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Upload and manage your content without limits</p>
              </div>
            </div>
            <div className="flex items-start gap-4 group">
              <div className={`w-1 h-12 ${isDark ? 'bg-white' : 'bg-neutral-900'} transition-all duration-300 group-hover:h-16`} />
              <div>
                <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-neutral-900'}`}>HD Streaming</h3>
                <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Crystal clear playback for your audience</p>
              </div>
            </div>
            <div className="flex items-start gap-4 group">
              <div className={`w-1 h-12 ${isDark ? 'bg-white' : 'bg-neutral-900'} transition-all duration-300 group-hover:h-16`} />
              <div>
                <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-neutral-900'}`}>Analytics Dashboard</h3>
                <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Track performance and grow your channel</p>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(${isDark ? '#fff' : '#000'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#fff' : '#000'} 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 relative">
        <div className="w-full max-w-md">
          {/* Mobile Header with Logo and Theme Toggle */}
          <div className="lg:hidden flex items-center justify-between mb-8 sm:mb-12">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 ${isDark ? 'bg-white' : 'bg-neutral-900'} flex items-center justify-center`}>
                <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-neutral-900' : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>StreamVault</h1>
            </div>
            {/* Theme Toggle - Mobile */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2.5 border transition-all duration-300 hover:scale-110 ${
                isDark 
                  ? 'bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800' 
                  : 'bg-white border-neutral-200 text-neutral-900 hover:bg-neutral-50'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>

          {/* Theme Toggle - Desktop */}
          <button
            onClick={() => setIsDark(!isDark)}
            className={`hidden lg:block absolute top-8 right-8 p-3 border transition-all duration-300 hover:scale-110 ${
              isDark 
                ? 'bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800' 
                : 'bg-white border-neutral-200 text-neutral-900 hover:bg-neutral-50'
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <div className={`border p-5 sm:p-6 lg:p-8 transition-all duration-300 ${
            isDark 
              ? 'bg-neutral-900 border-neutral-800 shadow-lg' 
              : 'bg-white border-neutral-200 shadow-lg'
          }`}>
            <div className="mb-6 sm:mb-8">
              <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-neutral-900'}`}>Sign in</h2>
              <p className={`text-sm sm:text-base ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Enter your credentials to continue</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`mb-4 sm:mb-6 p-3 sm:p-4 border-l-4 border-red-500 animate-[slideIn_0.3s_ease-out] ${
                isDark ? 'bg-red-950/50' : 'bg-red-50'
              }`}>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-red-400' : 'text-red-700'}`}>{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Email or Username Input */}
              <div className="group">
                <label htmlFor="emailOrUsername" className={`block text-sm font-medium mb-2 transition-colors ${
                  isDark ? 'text-neutral-300 group-focus-within:text-white' : 'text-neutral-700 group-focus-within:text-neutral-900'
                }`}>
                  Email or Username
                </label>
                <input
                  type="text"
                  id="emailOrUsername"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="Enter your email or username"
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark 
                      ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600 focus:border-orange-500 focus:ring-orange-500 focus:ring-offset-neutral-900' 
                      : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-orange-500 focus:ring-orange-500 focus:ring-offset-white'
                  }`}
                  disabled={loading}
                />
              </div>

              {/* Password Input */}
              <div className="group">
                <label htmlFor="password" className={`block text-sm font-medium mb-2 transition-colors ${
                  isDark ? 'text-neutral-300 group-focus-within:text-white' : 'text-neutral-700 group-focus-within:text-neutral-900'
                }`}>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark 
                      ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600 focus:border-orange-500 focus:ring-orange-500 focus:ring-offset-neutral-900' 
                      : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-orange-500 focus:ring-orange-500 focus:ring-offset-white'
                  }`}
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 sm:py-3.5 px-4 text-sm sm:text-base font-semibold transition-all duration-200 ${
                  loading
                    ? isDark ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-5 sm:mt-6 text-center">
              <p className={`text-sm sm:text-base ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Don't have an account?{" "}
                <a href="/register" className="font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                  Create account
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className={`text-center text-xs sm:text-sm mt-6 sm:mt-8 px-2 ${isDark ? 'text-neutral-600' : 'text-neutral-500'}`}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
