"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

/**
 * Provider dla zmian motywu (ciemny/jasny)
 * Wykorzystuje bibliotekę next-themes
 * 
 * Przykład użycia w komponentach:
 * ```jsx
 * const { theme, setTheme } = useTheme()
 * 
 * return (
 *   <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
 *     Zmień motyw
 *   </button>
 * )
 * ```
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
