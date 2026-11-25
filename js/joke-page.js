/*
  joke-page.js - CSE 134B HW5 Parts 1 and 3
  Author: Christos-Iason Enotiadis
  The page button outside <joke-panel> toggles its compact attribute, and the
  choice is saved in localStorage so it survives a reload. Storage failures
  only cost persistence; the button keeps working for the current page.
*/

const JOKE_MODE_KEY = "hw5-joke-panel-mode";
const JOKE_MODES = ["expanded", "compact"];
const DEFAULT_JOKE_MODE = "expanded";

// storage - saved mode, the default if missing, unknown or storage is blocked
function readSavedJokeMode() {
  try {
    const saved = localStorage.getItem(JOKE_MODE_KEY);
    return JOKE_MODES.includes(saved) ? saved : DEFAULT_JOKE_MODE;
  } catch (error) {
    console.warn("The joke panel mode could not be read.", error);
    return DEFAULT_JOKE_MODE;
  }
}

// storage - save the mode, a failure only loses persistence
function saveJokeMode(mode) {
  try {
    localStorage.setItem(JOKE_MODE_KEY, mode);
  } catch (error) {
    console.warn("The joke panel mode could not be saved.", error);
  }
}

// toggle button - label names the action it performs
function updateJokeModeButton(button, mode) {
  button.textContent = mode === "compact" ? "Expanded view" : "Compact view";
}

// mode - the observed attribute is the only switch, the component reacts
function applyJokeMode(panel, button, mode) {
  panel.toggleAttribute("compact", mode === "compact");
  updateJokeModeButton(button, mode);
}

const jokePanel = document.querySelector("joke-panel");
const jokeModeButton = document.querySelector("#joke-mode-toggle");

if (jokePanel && jokeModeButton) {
  // startup - restore through the same path as the button
  applyJokeMode(jokePanel, jokeModeButton, readSavedJokeMode());

  // toggle - apply first, then save
  jokeModeButton.addEventListener("click", function () {
    const isCompact = jokePanel.toggleAttribute("compact");
    const mode = isCompact ? "compact" : "expanded";
    updateJokeModeButton(jokeModeButton, mode);
    saveJokeMode(mode);
  });

  jokeModeButton.hidden = false;
}
