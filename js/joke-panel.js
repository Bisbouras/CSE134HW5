/*
  joke-panel.js - CSE 134B HW5 Parts 1-3
  Author: Christos-Iason Enotiadis
  <joke-panel> web component. Starts with two sample jokes stored below and
  fetches fresh ones from icanhazdadjoke.com when the visitor asks. Previous
  and Next browse every joke seen so far.
  Observed attribute: compact (hides the joke details and tightens spacing).
  Themed from the page through the --joke-* custom properties.
*/

const JOKE_API_URL = "https://icanhazdadjoke.com/";
const JOKE_TIMEOUT_MS = 8000;
const JOKE_HISTORY_LIMIT = 20;

// sample jokes - shown before the first request
const SAMPLE_JOKES = [
  "I'm reading a book about anti-gravity. It's impossible to put down.",
  "Why don't skeletons fight each other? They don't have the guts."
];

// styles - every colour reads a --joke-* property with a dark theme fallback
const JOKE_PANEL_STYLES = `
  :host {
    display: block;
  }

  [hidden] {
    display: none !important;
  }

  .panel {
    padding: 1.35rem 1.4rem 1.2rem;
    color: var(--joke-text, #d2d9e6);
    background-color: var(--joke-bg, #101a30);
    border: 1px solid var(--joke-border, #1d2942);
    border-radius: var(--joke-radius, 3px);
  }

  h2 {
    margin: 0 0 0.9rem;
    font-family: var(--joke-font-display, inherit);
    font-size: 1.08rem;
    font-weight: 600;
    line-height: 1.3;
    color: var(--joke-heading, #eef2f8);
  }

  .joke {
    margin: 0 0 1rem;
    font-size: 1.3rem;
    line-height: 1.45;
    color: var(--joke-heading, #eef2f8);
    white-space: pre-line;
    transition: opacity 150ms ease;
  }

  .joke[aria-busy="true"] {
    opacity: 0.55;
  }

  .details {
    margin: 0 0 1rem;
    font-size: 0.9rem;
    color: var(--joke-text-dim, #8792a6);
  }

  a {
    color: var(--joke-accent, #f0c98a);
    text-decoration: none;
    border-bottom: 1px solid currentColor;
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0 0 0.9rem;
  }

  button {
    padding: 0.5em 1.1em;
    font: inherit;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--joke-text, #d2d9e6);
    background-color: transparent;
    border: 1px solid var(--joke-border, #1d2942);
    border-radius: var(--joke-radius, 3px);
    cursor: pointer;
  }

  button:hover {
    border-color: var(--joke-accent, #f0c98a);
  }

  /* groan button - main action, pushed to the right */
  .groan {
    margin-left: auto;
    color: var(--joke-on-accent, #080e1c);
    background-color: var(--joke-accent, #f0c98a);
    border-color: var(--joke-accent, #f0c98a);
  }

  .groan:hover {
    background-color: var(--joke-accent-hover, #f6dcb0);
  }

  .groan[aria-disabled="true"] {
    opacity: 0.6;
    cursor: progress;
  }

  button:focus-visible,
  a:focus-visible {
    outline: 2px solid var(--joke-accent, #f0c98a);
    outline-offset: 3px;
  }

  .status {
    margin: 0;
    font-size: 0.92rem;
    color: var(--joke-text-dim, #8792a6);
  }

  .status[data-state="error"] {
    padding-left: 0.75rem;
    font-weight: 500;
    color: var(--joke-error, #ff9b94);
    border-left: 3px solid currentColor;
  }

  /* compact mode - tighter spacing, smaller joke */
  :host([compact]) .panel {
    padding: 0.9rem 1rem;
  }

  :host([compact]) .joke {
    font-size: 1.1rem;
  }

  /* narrow screens - groan button on its own row */
  @media (max-width: 30rem) {
    .groan {
      flex-basis: 100%;
      margin-left: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .joke {
      transition: none;
    }
  }
`;

// errors - carry a message written for the visitor
function jokeError(message, visitorMessage) {
  const error = new Error(message);
  error.visitorMessage = visitorMessage;
  return error;
}

// response - only accept a non-empty joke string, the id is optional
function readJoke(data) {
  if (typeof data?.joke !== "string" || data.joke.trim() === "") {
    throw jokeError(
      "Expected a joke string in the response.",
      "The joke server sent something unexpected. Press Try again for another go."
    );
  }

  // id - only letters and digits, since it goes into a link
  const id = typeof data.id === "string" && /^[A-Za-z0-9]+$/.test(data.id) ? data.id : null;

  return { text: data.joke.trim(), id: id, source: "api" };
}

// errors - pick a message for anything without one
function visitorMessageFor(error) {
  if (error.visitorMessage) {
    return error.visitorMessage;
  }
  if (error.name === "TimeoutError" || error.name === "AbortError") {
    return "The joke server took too long to answer. Press Try again.";
  }
  if (error.name === "SyntaxError") {
    return "The joke server sent something unexpected. Press Try again for another go.";
  }
  return "Couldn't reach the joke server. Check your connection, then press Try again.";
}

class JokePanel extends HTMLElement {
  static observedAttributes = ["compact"];

  constructor() {
    super();

    // state - every joke seen so far and which one is showing
    this.jokes = SAMPLE_JOKES.map(function (text) {
      return { text: text, id: null, source: "sample" };
    });
    this.currentIndex = 0;
    this.loading = false;

    this.buildInterface();
  }

  // interface - built once, inside the shadow root
  buildInterface() {
    const root = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = JOKE_PANEL_STYLES;
    root.appendChild(style);

    const panel = document.createElement("section");
    panel.className = "panel";
    panel.setAttribute("aria-labelledby", "joke-heading");
    root.appendChild(panel);

    const heading = document.createElement("h2");
    heading.id = "joke-heading";
    heading.textContent = "Dad joke dispenser";
    panel.appendChild(heading);

    this.jokeText = document.createElement("p");
    this.jokeText.className = "joke";
    panel.appendChild(this.jokeText);

    this.details = document.createElement("p");
    this.details.className = "details";
    panel.appendChild(this.details);

    const controls = document.createElement("div");
    controls.className = "controls";
    panel.appendChild(controls);

    this.previousButton = this.createButton("Previous", "", () => this.showJoke(this.currentIndex - 1));
    this.nextButton = this.createButton("Next", "", () => this.showJoke(this.currentIndex + 1));
    this.groanButton = this.createButton("Make me groan", "groan", () => this.requestJoke());
    controls.appendChild(this.previousButton);
    controls.appendChild(this.nextButton);
    controls.appendChild(this.groanButton);

    this.status = document.createElement("p");
    this.status.className = "status";
    this.status.setAttribute("role", "status");
    panel.appendChild(this.status);
  }

  createButton(label, className, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    if (className) {
      button.className = className;
    }
    button.addEventListener("click", onClick);
    return button;
  }

  connectedCallback() {
    this.showJoke(this.currentIndex);
    this.setStatus(`${this.positionText()}. Press Make me groan for a fresh one.`, "idle");
  }

  // compact attribute - hide the details, styles in :host([compact])
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "compact") {
      this.details.hidden = newValue !== null;
    }
  }

  positionText() {
    return `Joke ${this.currentIndex + 1} of ${this.jokes.length}`;
  }

  // display - wraps around at either end of the list
  showJoke(index) {
    const count = this.jokes.length;
    this.currentIndex = ((index % count) + count) % count;
    const joke = this.jokes[this.currentIndex];

    // remote text - only ever set through textContent
    this.jokeText.textContent = joke.text;
    this.renderDetails(joke);

    if (!this.loading) {
      this.setStatus(this.positionText(), "idle");
    }
  }

  renderDetails(joke) {
    this.details.replaceChildren();

    if (joke.source === "sample") {
      this.details.textContent = "A sample joke stored in this page's script.";
      return;
    }

    this.details.appendChild(document.createTextNode("From icanhazdadjoke.com"));
    if (joke.id) {
      this.details.appendChild(document.createTextNode(", joke "));
      const link = document.createElement("a");
      link.href = `${JOKE_API_URL}j/${joke.id}`;
      link.textContent = joke.id;
      this.details.appendChild(link);
    }
    this.details.appendChild(document.createTextNode("."));
  }

  setStatus(message, state) {
    this.status.textContent = message;
    this.status.dataset.state = state;
  }

  // loading - aria-disabled, focus stays on the button
  setLoading(isLoading) {
    this.loading = isLoading;
    this.groanButton.setAttribute("aria-disabled", String(isLoading));
    this.jokeText.setAttribute("aria-busy", String(isLoading));
  }

  async requestJoke() {
    // pending request - ignore extra presses
    if (this.loading) {
      return;
    }

    this.setLoading(true);
    this.setStatus("Fetching a fresh joke…", "loading");

    try {
      const options = { headers: { Accept: "application/json" } };
      if (AbortSignal.timeout) {
        options.signal = AbortSignal.timeout(JOKE_TIMEOUT_MS);
      }

      const response = await fetch(JOKE_API_URL, options);

      if (!response.ok) {
        throw jokeError(
          `HTTP status ${response.status}`,
          `The joke server returned an error (status ${response.status}). Press Try again.`
        );
      }

      const data = await response.json();
      const joke = readJoke(data);

      // history - drop the oldest once the list is full
      this.jokes.push(joke);
      if (this.jokes.length > JOKE_HISTORY_LIMIT) {
        this.jokes.shift();
      }

      this.setLoading(false);
      this.showJoke(this.jokes.length - 1);
      this.groanButton.textContent = "Make me groan";
      this.setStatus(`New joke loaded. ${this.positionText()}.`, "success");
    } catch (error) {
      console.error("Could not load a dad joke.", error);
      this.setLoading(false);
      this.groanButton.textContent = "Try again";
      this.setStatus(visitorMessageFor(error), "error");
    }
  }
}

customElements.define("joke-panel", JokePanel);
