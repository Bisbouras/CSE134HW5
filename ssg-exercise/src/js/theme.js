/*
  theme.js - CSE 134B HW4 Part 4
  Author: Christos-Iason Enotiadis
  Light/dark theme switch with a saved preference and a view transition.
  Loaded in the <head> without defer so a saved theme is applied before
  the page is first drawn (no flash of the dark theme on every page).
*/

const THEME_STORAGE_KEY = "theme";

// storage - read the saved theme, null if missing or storage is blocked
function readSavedTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    console.warn("The saved theme could not be read.", error);
    return null;
  }
}

// storage - save the theme, a failure only loses persistence
function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn("The theme preference could not be saved.", error);
  }
}

function getCurrentTheme() {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

// toggle button - label names the action it performs
function updateThemeButton() {
  const button = document.querySelector("#theme-toggle");
  if (button) {
    button.textContent = getCurrentTheme() === "light" ? "Dark theme" : "Light theme";
  }
}

// theme - dark is the default, so only light needs the attribute
function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.dataset.theme = "light";
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  updateThemeButton();
}

// theme switch - apply first, then save
function switchTheme() {
  const nextTheme = getCurrentTheme() === "light" ? "dark" : "light";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!document.startViewTransition || reduceMotion) {
    // fallback - instant switch without the api or with reduced motion
    applyTheme(nextTheme);
  } else {
    const root = document.documentElement;
    root.dataset.themeSwitching = "";
    const transition = document.startViewTransition(function () {
      applyTheme(nextTheme);
    });
    transition.finished.finally(function () {
      delete root.dataset.themeSwitching;
    });
  }

  saveTheme(nextTheme);
}

// startup - saved theme before the page is drawn
const savedTheme = readSavedTheme();
if (savedTheme === "light" || savedTheme === "dark") {
  applyTheme(savedTheme);
}

// startup - show and wire up the button once the page is parsed
document.addEventListener("DOMContentLoaded", function () {
  const button = document.querySelector("#theme-toggle");
  if (!button) {
    return;
  }
  updateThemeButton();
  button.addEventListener("click", switchTheme);
  button.hidden = false;
});
