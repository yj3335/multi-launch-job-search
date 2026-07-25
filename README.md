# Multi-Launch Job Search

A one-click job search dashboard that fires off searches across ~40 ATS platforms, job boards, and career-page patterns at once — instead of clicking through each one individually.

It rebuilds the search logic behind [Brian's Job Search](https://briansjobsearch.com/) (including its Google `tbs` date-filter tricks), but batches multiple platforms' `site:` filters into a single combined search per tab. That means far fewer tabs open at once, which means fewer get blocked as pop-ups and fewer near-identical Google searches get fired in a burst — the thing that trips Google's automated-traffic captcha.

## Features

- **Job title + time window** — from "past hour" up to "older than 6 months," using Google's date-range search operators.
- **Remote only** toggle — on by default; uncheck it to search a specific location instead.
- **Location** — free text (city, state, country), only used when Remote only is off.
- **Exclude terms** — comma-separated words to filter out (e.g. `Senior, Manager`), applied as `-term` on Google and `NOT term` on LinkedIn.
- **Sites per tab** — controls how many platforms get OR'd into a single Google search per tab. Lower it further if you still see blocked pop-ups or a captcha.
- Selections and settings persist locally (`localStorage`), and the page also accepts `?job=&time=&remote=&location=&exclude=` URL parameters.

## Usage

Just open `index.html` in a browser — no server or build step needed. Check the sources you want (all are selected by default), enter a job title, and click **Launch all selected searches**.

If your browser blocks a tab, allow pop-ups for the page once and click again.

## Project structure

```
index.html               — page markup
css/styles.css            — all styling (light/dark theme aware)
js/search-builder.js      — pure URL-building logic (Google tbs mapping, LinkedIn/Remote Rocketship URLs, batching)
js/sources.js             — the source catalog (ATS platforms, boards, career-page patterns)
js/info-tooltip.js        — small reusable "?" hover/tap tooltip component
js/app.js                 — DOM rendering, state, and event wiring
```
