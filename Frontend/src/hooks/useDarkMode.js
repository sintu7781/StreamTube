// src/hooks/useDarkMode.js
import { useState, useEffect } from "react";

const useDarkMode = () => {
  // Initialize state with value from localStorage or system preference
  const [darkMode, setdarkMode] = useState(() => {
    // Check localStorage first
    const savedPreference = localStorage.getItem("darkMode");
    if (savedPreference !== null) {
      return JSON.parse(savedPreference);
    }
    // Fallback to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Toggle dark mode
  const toggleDarkMode = () => {
    setdarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", JSON.stringify(newMode));
      return newMode;
    });
  };

  // Apply dark mode class to HTML element
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (darkMode) {
      htmlElement.classList.add("dark");
      htmlElement.setAttribute("data-theme", "dark");
    } else {
      htmlElement.classList.remove("dark");
      htmlElement.setAttribute("data-theme", "light");
    }
  }, [darkMode]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemChange = (e) => {
      // Only respond if user hasn't set an explicit preference
      if (!localStorage.getItem("darkMode")) {
        setdarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, []);

  return { darkMode, toggleDarkMode };
};

export default useDarkMode;
