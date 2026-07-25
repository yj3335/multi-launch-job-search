# Yash's Job Search Engine

Two tools in one page: a search launcher that fires off searches across ~40 ATS platforms and job boards at once, and a Live Listings tab that reads structured tracker data directly instead of depending on search results.

## Search Launcher

Rebuilds the search logic behind [Brian's Job Search](https://briansjobsearch.com/), including its Google `tbs` date-filter tricks, but batches multiple platforms' `site:` filters into a single combined search per tab. Fewer tabs open at once means fewer get blocked as pop-ups, and fewer near-identical Google searches fired in a burst means less chance of tripping Google's automated-traffic captcha.

- **Job title + time window** — from "past hour" up to "older than 6 months," using Google's date-range search operators.
- **Remote only** toggle — on by default; uncheck it to search a specific location instead.
- **Location** — free text (city, state, country), used only when Remote only is off.
- **Exclude terms** — comma-separated words to filter out (e.g. `Senior, Manager`), applied as `-term` on Google and `NOT term` on LinkedIn.
- **Sites per tab** — how many platforms get OR'd into a single Google search per tab. Lower it if you still see blocked pop-ups or a captcha.
- Selections and settings persist locally (`localStorage`), and the page accepts `?job=&time=&remote=&location=&exclude=` URL parameters.

## Live Listings

Reads the structured data behind SimplifyJobs' trackers (`New-Grad-Positions`, `Summer2026-Internships`, or a custom `listings.json` URL) directly, rather than searching for it. A posting either matches your filters or it doesn't — there's no ranking for it to fall behind.

- Filters by keyword, location, and how recently a role was posted (24 hours up to a month, or all time).
- Shows active postings only, and drops anything flagged `Does Not Offer Sponsorship` or `U.S. Citizenship is Required`.
- Results are paginated, 50 per page.
- Fetches fresh from GitHub on every click. No caching — the filtered dataset is only a few thousand rows, so there's nothing worth caching.

## Usage

Open `index.html` in a browser — no server or build step needed. On Search Launcher, check the sources you want (all are selected by default), enter a job title, and click **Launch all selected searches**. On Live Listings, pick a data source and click **Fetch listings**.

If your browser blocks a tab, allow pop-ups for the page once and click again.

## Project structure

```
index.html               — page markup, both tabs
css/styles.css            — all styling (light/dark theme aware)
js/search-builder.js      — pure URL-building logic (Google tbs mapping, LinkedIn/Remote Rocketship URLs, batching)
js/sources.js             — Search Launcher's source catalog (ATS platforms, boards, career-page patterns)
js/listings.js            — Live Listings' fetch, filter, and pagination logic
js/info-tooltip.js        — small reusable "?" hover/tap tooltip component
js/tabs.js                — switches between the two tabs, remembers the last one used
js/app.js                 — Search Launcher's DOM rendering, state, and event wiring
```
