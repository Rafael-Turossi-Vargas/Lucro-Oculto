"use client"

import { useState, useEffect, useCallback } from "react"

type Theme = "dark" | "light"

const THEME_EVENT = "lucro:themeChange"

function readTheme(): Theme {
  if (typeof window === "undefined") return "dark"
  return (document.documentElement.getAttribute("data-theme") as Theme) || "dark"
}

/**
 * Standalone hook — reads from / writes to the DOM directly.
 * No React Context needed. Any component calling this will stay in sync
 * because all changes fire a custom DOM event that every hook instance listens to.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    setTheme(readTheme())

    const handler = () => setTheme(readTheme())
    window.addEventListener(THEME_EVENT, handler)
    return () => window.removeEventListener(THEME_EVENT, handler)
  }, [])

  const toggleTheme = useCallback(() => {
    const next: Theme = readTheme() === "dark" ? "light" : "dark"
    document.documentElement.classList.add("theme-switching")
    document.documentElement.setAttribute("data-theme", next)
    localStorage.setItem("theme", next)
    window.dispatchEvent(new Event(THEME_EVENT))
    setTimeout(() => document.documentElement.classList.remove("theme-switching"), 300)
  }, [])

  return { theme, toggleTheme }
}

/** Passthrough — keeps existing imports in layout files from breaking. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
