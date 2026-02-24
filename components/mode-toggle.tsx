"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Wait until mounted to avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full" />
    }

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            // className="w-10 h-10 rounded-full duration-300 relative overflow-hidden group bg-background text-foreground"
            className="w-10 h-10 rounded-full
    bg-background text-foreground
    border border-border
    hover:bg-accent hover:text-accent-foreground
    focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
    transition-all duration-300"
        >
            {/* The logic requested: In dark mode image should be sun and in light mode image should be moon */}
            {theme === "dark" ? (
                <Sun className="h-[1.2rem] w-[1.2rem] animate-in fade-in zoom-in spin-in-90 duration-300" />
            ) : (
                <Moon className="h-[1.2rem] w-[1.2rem]  animate-in fade-in zoom-in -spin-in-90 duration-300" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}

