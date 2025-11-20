import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-64 z-30 border-r flex flex-col justify-center transition-all duration-300 ${
        isDark
          ? "bg-neutral-950 border-neutral-800"
          : "bg-white border-neutral-200"
      }`}
      style={{
        paddingTop: "5vh",
        paddingBottom: "5vh",
        overflowY: "auto",
        scrollbarWidth: "thin",
        scrollbarColor: isDark ? "#f97316 #18181b" : "#f97316 #f3f4f6",
      }}
    >
      <nav className="flex flex-col gap-2 px-4">
        <button onClick={() => navigate("/home")} className={navBtn(isDark)}>
          <HomeIcon /> <span>Home</span>
        </button>
        <button
          onClick={() => navigate("/subscriptions")}
          className={navBtn(isDark)}
        >
          <SubsIcon /> <span>Subscriptions</span>
        </button>
        <button onClick={() => navigate("/library")} className={navBtn(isDark)}>
          <LibraryIcon /> <span>Library</span>
        </button>
        <button onClick={() => navigate("/history")} className={navBtn(isDark)}>
          <HistoryIcon /> <span>History</span>
        </button>
        <button
          onClick={() => navigate("/liked-videos")}
          className={navBtn(isDark)}
        >
          <LikeIcon /> <span>Liked Videos</span>
        </button>
        <button
          onClick={() => navigate("/playlists")}
          className={navBtn(isDark)}
        >
          <PlaylistIcon /> <span>Playlists</span>
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className={navBtn(isDark)}
        >
          <AnalyticsIcon /> <span>Analytics</span>
        </button>
        {user && (
          <button
            onClick={() => navigate("/profile")}
            className={navBtn(isDark)}
          >
            <ProfileIcon /> <span>Your Channel</span>
          </button>
        )}
      </nav>
    </aside>
  );
};

function navBtn(isDark) {
  return `w-full flex items-center gap-4 px-4 py-3 font-medium rounded transition-colors duration-200 ${
    isDark
      ? "text-neutral-400 hover:bg-neutral-900 hover:text-white"
      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
  }`;
}

// Icons
function HomeIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  );
}
function SubsIcon() {
  return (
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
        d="M17 20h5v-2a4 4 0 00-4-4h-1"
      />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth={2} />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 11v9"
      />
    </svg>
  );
}
function LibraryIcon() {
  return (
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
        d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 17V7"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17V7"
      />
    </svg>
  );
}
function HistoryIcon() {
  return (
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
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
function LikeIcon() {
  return (
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
        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
      />
    </svg>
  );
}
function PlaylistIcon() {
  return (
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
        d="M3 17v-2a4 4 0 014-4h14"
      />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth={2} />
    </svg>
  );
}
function AnalyticsIcon() {
  return (
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
        d="M11 17a2 2 0 104 0v-5a2 2 0 10-4 0v5z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 12h14"
      />
    </svg>
  );
}
function ProfileIcon() {
  return (
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
  );
}

export default Sidebar;
