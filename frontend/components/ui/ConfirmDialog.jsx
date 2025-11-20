import { useTheme } from "../../context/ThemeContext";

const ConfirmDialog = ({ message, onConfirm, onCancel }) => {
  const { isDark } = useTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div
        className={`max-w-md w-full border shadow-2xl animate-[scaleIn_0.2s_ease-out] ${
          isDark
            ? "bg-neutral-900 border-neutral-800"
            : "bg-white border-neutral-200"
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b ${
            isDark ? "border-neutral-800" : "border-neutral-200"
          }`}
        >
          <h3
            className={`text-lg font-bold ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            Confirm Action
          </h3>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p
            className={`text-base font-medium ${
              isDark ? "text-neutral-300" : "text-neutral-700"
            }`}
          >
            {message}
          </p>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-end gap-3 ${
            isDark ? "border-neutral-800" : "border-neutral-200"
          }`}
        >
          <button
            onClick={onCancel}
            className={`px-6 py-2 border font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
              isDark
                ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
