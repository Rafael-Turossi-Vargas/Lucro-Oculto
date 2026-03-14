"use client"

import Image from "next/image"
import { useTheme } from "@/lib/theme"

interface ThemeLogoProps {
  width?: number
  height?: number
  priority?: boolean
}

export function ThemeLogo({ width = 152, height = 38, priority }: ThemeLogoProps) {
  const { theme } = useTheme()
  return (
    <Image
      src={theme === "light" ? "/logo-light.svg" : "/logo.svg"}
      alt="Lucro Oculto"
      width={width}
      height={height}
      priority={priority}
    />
  )
}
