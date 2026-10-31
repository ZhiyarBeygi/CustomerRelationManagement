
import { toggleTheme, useTheme } from "../theme";

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.807a6.5 6.5 0 0 0 8.268 8.268c.347-.215.829-.003.803.397Z" />
    </svg>
  );
}

export default function ThemeToggle({ floating = false }) {
  const isDark = useTheme() === "dark";
  const label = isDark ? "حالت روشن" : "حالت تاریک";

  return (
    <button
      type="button"
      className={`secondary theme-toggle${floating ? " theme-toggle-floating" : ""}`}
      onClick={toggleTheme}
      aria-label={`تغییر به ${label}`}
      title={`تغییر به ${label}`}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
