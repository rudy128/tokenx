"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface AnimatedThemeTogglerProps {
  className?: string;
  duration?: number;
  [key: string]: any;
}

export function AnimatedThemeToggler({ 
  className, 
  duration = 400, 
  ...props 
}: AnimatedThemeTogglerProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return;
    
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    
    // Check if the browser supports startViewTransition
    if (!document.startViewTransition) {
      // Fallback for browsers that don't support View Transition API
      setTheme(newTheme);
      return;
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme);
      });
    }).ready;

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    );
    
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  }, [resolvedTheme, setTheme, duration]);

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <button 
        className={cn(
          "flex items-center justify-center w-10 h-10 p-0 min-w-0 rounded-lg cursor-pointer transition-all duration-150 opacity-50",
          className
        )}
        style={{
          backgroundColor: 'var(--interactive-secondary)',
          borderColor: 'var(--border-default)',
          color: 'var(--text-secondary)',
        }}
        disabled
      >
        <Sun className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(
        "flex items-center justify-center w-10 h-10 p-0 min-w-0 rounded-lg cursor-pointer transition-all duration-150 hover:opacity-80",
        className
      )}
      style={{
        backgroundColor: 'var(--interactive-secondary)',
        border: '1px solid var(--border-default)',
        color: 'var(--text-secondary)',
      }}
      {...props}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}