import { toggleTheme, useTheme } from "../theme";

export default function ThemeToggle({ floating = false }) {
  const isDark = useTheme() === "dark";
  const label = isDark ? "تغییر به حالت روشن" : "تغییر به حالت تاریک";

  return (
    <button
      type="button"
      className={`secondary theme-toggle${floating ? " theme-toggle-floating" : ""}`}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {isDark ? "☀️ حالت روشن" : "🌙 حالت تاریک"}
    </button>
  );
}
