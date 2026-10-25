import { useSyncExternalStore } from "react";

const STORAGE_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";
const listeners = new Set();

function getSavedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
}

// Saved choice wins; otherwise follow the operating system.
export function getTheme() {
  const saved = getSavedTheme();
  if (saved) return saved;
  return window.matchMedia?.(DARK_QUERY).matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function setTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked; the theme still changes for this session.
  }
  applyTheme(theme);
  notify();
}

export function toggleTheme() {
  setTheme(getTheme() === "dark" ? "light" : "dark");
}

// Call once at startup. index.html already sets the theme before the first paint.
export function initTheme() {
  applyTheme(getTheme());
  window.matchMedia?.(DARK_QUERY).addEventListener?.("change", () => {
    if (getSavedTheme()) return;
    applyTheme(getTheme());
    notify();
  });
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTheme() {
  return useSyncExternalStore(subscribe, getTheme);
}
