# Nicholas Gray — portfolio

A static portfolio site. No build step, no dependencies, no framework. Edit a
file, save, refresh.

```
index.html      Home — hero, belief statement, featured work, disciplines, about, CTA
work.html       Work list + filter + all case studies
ask.html        Contact
404.html        Shown by GitHub Pages for any unknown URL
styles.css      All styling — design tokens at the top
script.js       Nav toggle, filter, case-study routing, scroll reveal, copy email
images/         Hero portrait at five widths (360–1000px)
.nojekyll       Tells GitHub Pages to serve files as-is
```

---

## Deploy to GitHub Pages

### Option A — upload through the browser (no command line)

1. Create a new repository on GitHub. To publish at
   `https://<username>.github.io`, name it exactly `<username>.github.io`.
   Any other name publishes to `https://<username>.github.io/<repo-name>/`.
2. On the empty repo page choose **uploading an existing file**.
3. Drag in **the contents of this folder** — `index.html`, `work.html`,
   `ask.html`, `404.html`, `styles.css`, `script.js`, and the `images` folder.
   Drag the *files*, not the enclosing folder, so `index.html` sits at the
   repository root.
4. Commit.
5. Go to **Settings → Pages**. Under *Build and deployment*, set **Source** to
   *Deploy from a branch*, branch `main`, folder `/ (root)`. Save.
6. Wait about a minute, then load the URL Pages shows you.

> `.nojekyll` and `.gitignore` start with a dot, so the browser uploader and
> macOS Finder both hide them. The site works without either — `.nojekyll`
> only matters if you later add folders whose names start with an underscore.
> To include them, use Option B.

### Option B — command line

```bash
cd path/to/this/folder
git init -b main
git add -A
git commit -m "Portfolio site"
git remote add origin https://github.com/<username>/<repo-name>.git
git push -u origin main
```

Then enable Pages under **Settings → Pages** as in step 5 above.

To update after that: edit, then `git add -A && git commit -m "..." && git push`.

### Custom domain

Add a file named `CNAME` at the repo root containing only your domain
(`nicholasgray.com`), then point a `CNAME` DNS record at
`<username>.github.io`. Set it in **Settings → Pages → Custom domain** too.

---

## Before you publish — fill these in

The site ships with bracketed placeholders. Search for `[` across the three
HTML files and replace every hit. The ones that appear on every page:

| Placeholder | Where | Count |
|---|---|---|
| `[MONTH YEAR]` | footers — update when you add a project | 4 |

Email (`nic.gray.dsgn@proton.me`) and LinkedIn are wired up already. The email
appears in 10 places — the four footers, the Ask page mailto and its
`data-copy` attribute, and the two navy CTA bands in `work.html` (mailto plus
`data-copy` each). If it ever changes, change all of them; the `data-copy`
attributes are easy to miss and fail silently by copying the wrong string.
| `[MONTH YEAR]` | footers — update when you add a project | 3 |

Also outstanding:

- **Provider Data Central** and **OnboardIQ** still use the generic case-study
  template — every section is bracketed placeholder copy. Either write them or
  drop the cards until you do.
- **`[PROJECT TITLE]`** and the two **`[EXPERIMENT TITLE]`** cards on `work.html`
  are empty slots. Delete any you don't need.
- **Fee Schedule Hub** — confirm `[CONFIRM DATES]` and `[CONFIRM TEAM]`, and add
  a redacted screenshot where the figure placeholder sits.
- **Care Pathways** — the banner is an Unsplash stock photo. Swap it for a
  cleared product screen when you have one, or delete the
  `<figure class="case-hero">` block.

### Updating the résumé

The résumé lives at `assets/resume/nicholas-gray-resume.pdf` and is linked from
the nav and the footer on every page. The filename is deliberately stable and
unversioned — **overwrite this file in place** to publish a new revision, so the
URL never breaks and no markup needs touching. Do not add dates or version
numbers to the filename, and do not keep a second copy elsewhere in the repo.

Note that `.gitignore` excludes `assets/` and `*.pdf` wholesale, with an
explicit carve-out for this one file. If you rename it, update those negation
lines too or the résumé will silently stop deploying.

---

## What is deliberately NOT in this folder

Anything published to a public GitHub repo is public — including files you
never link to, and including anything in the repo's history even after you
delete it. These were left out on purpose:

- Internal research decks stamped **© 2024 Optum. All Rights Reserved.**
- Source case-study PDFs and raw project exports (`ux_project/`)
- Design mockup screenshots (`portfolio_examples/`)
- Your résumé PDF and portrait source files (`assets/`)
- Local tooling config (`.claude/`)

The included `.gitignore` re-excludes these patterns as a backstop. Keep the
source material outside this folder rather than relying on it.

**Before making the repo public**, take one pass through `work.html` for
employer-internal shorthand and any client names, metrics, or screenshots you
haven't cleared for publication.

---

## Add a project

1. In `work.html`, copy an `<article class="project">` block in `#projects` and
   update six things: `data-category` (`ux` or `experiments`), `data-slug`
   (unique, kebab-case — this becomes the URL), title, kind, description,
   `Role, Year`, and the outcome line. Update the hidden project name inside
   the Open button too.
2. That alone gives the project a case-study page built from the shared
   template, with every section as bracketed placeholder copy.
3. To write a real case study, add `data-case="your-slug"` to the article, then
   add a matching `<template id="case-your-slug">` near the bottom of
   `work.html`. Copy `case-care-pathways` as a starting point — it shows the
   full structure including the facts grid, pull quote, and outcome list.
4. If it's one of your best two or three, add it to Featured work on
   `index.html` as well, linking to `work.html#case/your-slug`.

**Copy rules:** description is one sentence under 110 characters. The outcome
is a number or a clear change — "repeat calls down 16.0%", not "improved the
experience".

## Add a filter category

In `work.html`, copy a `.filter-btn` and give it a new `data-filter` value, then
tag projects with the matching `data-category`. `script.js` needs no changes.

---

## How case studies work

Case studies are not separate files. Clicking **Open** hides `<main>`, shows the
`#case-page` container, and pushes a `#case/<slug>` URL. The browser Back
button, the on-page "← All work" link, and Escape all return to the list.
Loading `work.html#case/<slug>` directly opens that case study — which is how
the homepage's Featured work links work.

Because it's one page, there is no server-side routing to configure. It works on
GitHub Pages as-is.

---

## The design rules this site follows

Worth knowing before you edit, because it's easy to break the look:

1. **No dividers, no cards, no rules.** Space separates sections; weight and
   colour create hierarchy. If something feels crowded, add space, not a border.
2. **One typeface.** Source Sans 3, in three weights (400 / 600 / 700).
3. **Teal is only for interactive things.** Buttons, links, the current-page
   marker. `--color-teal` (`#1B7F78`) clears AA for text (4.82:1 on white,
   4.62:1 on the page bg) and for non-text UI. There is a second token,
   `--color-teal-decorative` (`#2BB3A8`), which fails *both* thresholds — it is
   for ornamental fills only and must never carry text, a border, an icon, or
   any meaning on its own.
4. **Amber is only for hover nuance and focus rings.**
5. **Eyebrows are sentence case** ("Featured work"), never uppercase.
6. **Spacing comes from the scale**, always — the `--space-*` tokens in
   `:root`. Never type a raw pixel value for margin, padding, or gap.

### Layout

- Container maxes at 1376px (`--wrap-max`), fluid below, so the layout holds
  from 360px up.
- Anything in columns uses the 12-column grid. The hero is 5 columns of
  portrait and 7 of copy above 900px; below that the portrait sits *behind* the
  copy so the headline stays above the fold.
- Four reading measures, all tokens: `--measure` (68ch) for running prose,
  `--measure-lead` (46ch), `--measure-heading` (38ch), `--measure-title` (24ch).

### Accessibility notes

- One `<h1>` per page; don't skip heading levels.
- Every image needs alt text describing what it *shows*. Decorative images get
  `alt=""`.
- Focus is a two-part indicator: an amber ring offset 2px from the element,
  plus a 2px navy edge hugging it. Because of the offset, the ring's real
  neighbour is the page background, not the element — `--color-amber`
  (`#BA7008`) is 3.72:1 there, 3.88:1 on white, and 3.72:1 on the navy band.
  The navy edge is 2px rather than 1px because it measures 2.99:1 against the
  teal button fill, fractionally under 3:1.
- Medium buttons are 32px, under the 44px touch minimum, so on touch devices
  they get an invisible 44px hit area instead of growing. See the
  `@media (pointer: coarse)` block in section 5 of `styles.css`.
- The primary button ramp darkens monotonically: 4.82:1 → 6.40:1 → 8.61:1 for
  default → hover → active, all with white labels. States must never lighten;
  the base sits close enough to the 4.5:1 floor that lightening would drop it
  below AA. Hover also carries an inset highlight so the step is visible on dim
  displays, where the colour change alone is easy to miss.
- Disabled buttons stay clearly separate from the ramp (4.00:1 against the
  default fill). Disabled *label* text is 2.19:1, which WCAG exempts for
  inactive controls — but if you ever enable that styling for something
  interactive, it needs to change.

### Turn animation down or off

- **All motion:** set `--speed` to `0s`.
- **Scroll fade only:** delete the two `.js .reveal` rules in section 11 of
  `styles.css`, or remove `class="reveal"` from individual elements.
- Visitors with "reduce motion" enabled in their OS already get a still version.

---

## Preview locally

Case-study routing uses the History API, which needs a real server — opening
`index.html` from the filesystem will not route correctly. From this folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
