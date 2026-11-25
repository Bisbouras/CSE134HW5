| Field | Value |
| --- | --- |
| Repository URL | https://github.com/Bisbouras/CSE134HW5 |
| Deployed URL | https://willowy-tapioca-6bcd53.netlify.app/ |
| Web Component | dad-jokes.html (js/joke-panel.js, page toggle in js/joke-page.js) |
| SSG exercise | ssg-exercise/ (Eleventy) |

## SSG exercise

Preview the **Home** (`index.html`) and **About** (`about.html`) pages. The shared footer is
`ssg-exercise/src/_includes/footer.njk`. Install, build and preview commands are in
[ssg-exercise/README.md](ssg-exercise/README.md).

## Design note

The visitor wants a quick dad joke without leaving the page.

Pressing **Make me groan** calls `requestJoke()`, which sends a GET request to `https://icanhazdadjoke.com/`
with `Accept: application/json`. It checks `response.ok` and that `joke` is a non-empty string, then adds
the joke to the history and shows it with `textContent`.

- **While waiting:** the status line says "Fetching a fresh joke…", and the joke and button dim.
- **On success:** the new joke appears, with a link to its source and "Joke 3 of 3" in the status.
- **On failure:** the previous joke stays visible, a red message explains what went wrong, and the button
  becomes **Try again**. A successful retry clears the error without a reload.