import { useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";

const Toast = ({ message, type = "error", onClose, duration = 3000 }) => {
  const { isDark } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    error: isDark
      ? "bg-red-950 border-red-900 text-red-400"
      : "bg-red-50 border-red-200 text-red-700",
    success: isDark
      ? "bg-green-950 border-green-900 text-green-400"
      : "bg-green-50 border-green-200 text-green-700",
    info: isDark
      ? "bg-blue-950 border-blue-900 text-blue-400"
      : "bg-blue-50 border-blue-200 text-blue-700",
  };

  const iconPaths = {
    error:
      "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    success:
      "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    info:
      "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  };

  return (
    <div className="fixed top-20 right-6 z-50 animate-[slideIn_0.3s_ease-out]">
      <div
        className={`flex items-center gap-3 px-6 py-4 border shadow-xl min-w-[320px] ${typeStyles[type]}`}
      >
        <svg
          className="w-6 h-6 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={iconPaths[type]}
          />
        </svg>
        <p className="flex-1 font-semibold">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;
