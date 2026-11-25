# CSE 134B Homework 5 - Christos-Iason Enotiadis

| Field | Value |
| --- | --- |
| Repository URL | https://github.com/Bisbouras/CSE134HW5 |
| Deployed URL | https://willowy-tapioca-6bcd53.netlify.app/ |
| Web Component page | dad-jokes.html (linked as "Dad Jokes" in the main navigation) |
| Component code | js/joke-panel.js (`<joke-panel>`) |
| Page control and saved preference | js/joke-page.js (localStorage key `hw5-joke-panel-mode`) |
| Component theming | `joke-panel` rule in css/styles.css sets the `--joke-*` custom properties |
| SSG exercise | TODO - ssg-exercise/ (see its README) |
| Form without JavaScript | form-no-js.html |
| Form with JavaScript | form-with-js.html (script: form.js) |
| Theme switch and view transitions | js/theme.js and css/styles.css |

## Design note: the dad joke panel

**What the visitor wants:** a quick laugh, or a groan. They press one button and get a fresh joke without
leaving the page, and they can step back through the jokes they have already seen.

**Tracing one action, "Make me groan":**

1. The visitor activates the **Make me groan** button inside `<joke-panel>`. Its click listener calls
   `requestJoke()`.
2. `requestJoke()` ignores the press if a request is already pending. Otherwise it marks the panel as loading.
   The button gets `aria-disabled="true"` (so keyboard focus stays on it), the joke text dims through
   `aria-busy`, and the `role="status"` line reads "Fetching a fresh joke…".
3. `fetch()` sends a GET request to `https://icanhazdadjoke.com/` with `Accept: application/json` and an
   8 second timeout.
4. The response is checked in order:
   - `response.ok` must be true, or the status code becomes an error.
   - The body must parse as JSON.
   - `joke` must be a non-empty string.
   - `id` is only used if it contains just letters and digits, since it is built into a link.
5. On success, the joke is added to the history and shown with `textContent`, so markup in the response is
   never parsed. The details line links to the joke's page, and the status reads "New joke loaded. Joke 3 of 3."
6. On failure (offline, timeout, HTTP error, bad JSON or a missing field), the current joke stays on screen.
   The status turns red with a plain-language message, and the button relabels to **Try again**. Pressing it
   runs the same path; a success clears the error and restores the label.

**While waiting:** the visitor sees the dimmed joke, the "Fetching" status and a dimmed button, and screen
readers announce the status. **On success:** the new joke, its source and its position appear. **On failure:**
an error message they can act on, and the previous joke is still visible.

**Compact mode:** the **Compact view** button outside the component toggles the observed `compact` attribute.
`attributeChangedCallback()` hides the details line, and `:host([compact])` tightens the spacing. The choice is
saved under `hw5-joke-panel-mode` and restored on load by setting the same attribute. Storage errors are caught:
the default is used if reading fails, and the toggle still works for the current page if saving fails.

**Without JavaScript:** a `<noscript>` message near the widget explains that it needs JavaScript. The rest of
the portfolio, including the navigation, works as before.
