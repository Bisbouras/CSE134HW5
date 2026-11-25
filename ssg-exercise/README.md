# CSE 134B HW5 Part 4 - Eleventy shared footer

Two pages from my portfolio, **Home** (`src/index.html`) and **About** (`src/about.html`), built by
[Eleventy](https://www.11ty.dev/). Both pages use one shared footer, `src/_includes/footer.njk`, through
`{% include "footer.njk" %}`.

Links to portfolio pages that aren't part of this exercise point to the deployed site.

## Commands

Run these from this `ssg-exercise/` folder. You need Node.js 18 or newer.

| Step | Command |
| --- | --- |
| Install dependencies | `npm install` |
| Build the pages into `_site/` | `npm run build` |
| Preview both pages locally | `npm start`, then open http://localhost:8080/index.html and http://localhost:8080/about.html |

## Checking the shared footer

1. Edit the text in `src/_includes/footer.njk`.
2. Run `npm run build`, or let `npm start` rebuild on save.
3. Refresh both pages. Both show the change.

## Files

- `eleventy.config.js` - input `src/`, output `_site/`, `.html` pages processed as Nunjucks, asset copying,
  and output file names kept as `index.html` and `about.html`
- `src/index.html`, `src/about.html` - the two pages, each with its own content
- `src/_includes/footer.njk` - the shared footer
- `src/css`, `src/js`, `src/images`, `src/docs` - the styles, scripts, images and CV the pages use
