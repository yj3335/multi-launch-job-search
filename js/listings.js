/*
 * Live Listings: reads a SimplifyJobs-style listings.json feed directly and
 * filters it client-side, instead of relying on Google's index/ranking. Only
 * active postings are shown, and only a few thousand of those, so it's
 * fetched fresh each time rather than cached.
 */

// Entries explicitly flagged as unavailable to someone who needs sponsorship.
// "Other" (the vast majority) means unspecified, not "no" — only exclude the
// values that actually rule it out.
const NO_SPONSORSHIP_VALUES = ["Does Not Offer Sponsorship", "U.S. Citizenship is Required"];

const LISTING_SOURCES = [
  {
    label: "New Grad Positions (SimplifyJobs)",
    url: "https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/.github/scripts/listings.json",
  },
  {
    label: "Internships (SimplifyJobs)",
    url: "https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json",
  },
  { label: "Custom URL…", url: null },
];

const POSTED_WITHIN_OPTIONS = [
  ["all", "All time"],
  ["1day", "Past 24 hours"],
  ["3days", "Past 3 days"],
  ["week", "Past week"],
  ["2weeks", "Past 2 weeks"],
  ["month", "Past month"],
];
const POSTED_WITHIN_SECONDS = {
  all: null,
  "1day": 86400,
  "3days": 3 * 86400,
  week: 7 * 86400,
  "2weeks": 14 * 86400,
  month: 30 * 86400,
};

const LISTINGS_PAGE_SIZE = 50;

const listingsSourceEl = document.getElementById("listingsSource");
const listingsCustomUrlWrapEl = document.getElementById("listingsCustomUrlWrap");
const listingsCustomUrlEl = document.getElementById("listingsCustomUrl");
const listingsKeywordEl = document.getElementById("listingsKeyword");
const listingsLocationEl = document.getElementById("listingsLocation");
const listingsPostedWithinEl = document.getElementById("listingsPostedWithin");
const listingsStatusEl = document.getElementById("listingsStatus");
const listingsRefreshEl = document.getElementById("listingsRefresh");
const listingsResultsEl = document.getElementById("listingsResults");

LISTING_SOURCES.forEach(({ label }, i) => {
  const opt = document.createElement("option");
  opt.value = String(i);
  opt.textContent = label;
  listingsSourceEl.appendChild(opt);
});
POSTED_WITHIN_OPTIONS.forEach(([val, label]) => {
  const opt = document.createElement("option");
  opt.value = val;
  opt.textContent = label;
  if (val === "week") opt.selected = true;
  listingsPostedWithinEl.appendChild(opt);
});

let currentListingsData = null; // full parsed array for the active source, this session
let listingsMatches = []; // filtered+sorted matches for the current filter state
let listingsPage = 1;

function activeSourceUrl() {
  const idx = parseInt(listingsSourceEl.value, 10) || 0;
  const preset = LISTING_SOURCES[idx];
  return preset.url || listingsCustomUrlEl.value.trim();
}

listingsSourceEl.addEventListener("change", () => {
  const idx = parseInt(listingsSourceEl.value, 10) || 0;
  listingsCustomUrlWrapEl.style.display = LISTING_SOURCES[idx].url ? "none" : "";
});

async function loadListings(url) {
  listingsStatusEl.textContent = "Fetching…";
  listingsRefreshEl.disabled = true;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!Array.isArray(json)) throw new Error("Unexpected response shape (expected an array)");

    currentListingsData = json;
    const active = json.filter((d) => d && d.active);
    const sponsorshipEligible = active.filter((d) => !NO_SPONSORSHIP_VALUES.includes(d.sponsorship));
    const excludedForSponsorship = active.length - sponsorshipEligible.length;
    listingsStatusEl.textContent =
      `Loaded ${active.length} active listings` +
      (excludedForSponsorship ? ` (${excludedForSponsorship} excluded: no sponsorship)` : "");
    applyListingsFiltersAndRender();
  } catch (err) {
    listingsStatusEl.textContent = `Couldn't load listings: ${err.message}`;
    listingsResultsEl.innerHTML = "";
  } finally {
    listingsRefreshEl.disabled = false;
  }
}

function matchesFilters(entry, { keyword, location, windowSec, nowSec }) {
  if (!entry.active) return false;
  if (NO_SPONSORSHIP_VALUES.includes(entry.sponsorship)) return false;
  if (keyword) {
    const haystack = `${entry.title || ""} ${entry.company_name || ""}`.toLowerCase();
    if (!haystack.includes(keyword)) return false;
  }
  if (location) {
    const haystack = (entry.locations || []).join(" ").toLowerCase();
    if (!haystack.includes(location)) return false;
  }
  if (windowSec !== null && entry.date_posted) {
    if (nowSec - entry.date_posted > windowSec) return false;
  }
  return true;
}

function applyListingsFiltersAndRender() {
  if (!currentListingsData) return;

  const keyword = listingsKeywordEl.value.trim().toLowerCase();
  const location = listingsLocationEl.value.trim().toLowerCase();
  const windowSec = POSTED_WITHIN_SECONDS[listingsPostedWithinEl.value];
  const nowSec = Date.now() / 1000;

  listingsMatches = currentListingsData.filter((d) =>
    matchesFilters(d, { keyword, location, windowSec, nowSec })
  );
  listingsMatches.sort((a, b) => (b.date_posted || 0) - (a.date_posted || 0));
  listingsPage = 1;
  renderListings();
}

function renderListings() {
  if (listingsMatches.length === 0) {
    listingsResultsEl.innerHTML = `<div class="listings-note">No listings match these filters.</div>`;
    return;
  }

  const totalPages = Math.ceil(listingsMatches.length / LISTINGS_PAGE_SIZE);
  const start = (listingsPage - 1) * LISTINGS_PAGE_SIZE;
  const shown = listingsMatches.slice(start, start + LISTINGS_PAGE_SIZE);

  const rowsHtml = shown
    .map((entry) => {
      const company = escapeHtml(entry.company_name || "Unknown");
      const title = escapeHtml(entry.title || "Untitled role");
      const locations = escapeHtml((entry.locations || []).join(", ") || "Unspecified location");
      const category = escapeHtml(entry.category || "");
      const posted = entry.date_posted
        ? new Date(entry.date_posted * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
        : "Unknown date";
      const url = escapeHtml(entry.url || "#");
      return `
        <div class="listing-row">
          <div><span class="company">${company}</span></div>
          <div class="title">${title}</div>
          <div class="meta">${locations}${category ? ` &middot; ${category}` : ""}<br />Posted ${posted}</div>
          <a class="apply-link" href="${url}" target="_blank" rel="noopener">Apply &rarr;</a>
        </div>`;
    })
    .join("");

  const pagerHtml = `
    <div class="listings-pager">
      <button type="button" id="listingsPrevPage" ${listingsPage <= 1 ? "disabled" : ""}>&larr; Prev</button>
      <span>Page ${listingsPage} of ${totalPages} (${listingsMatches.length} matches)</span>
      <button type="button" id="listingsNextPage" ${listingsPage >= totalPages ? "disabled" : ""}>Next &rarr;</button>
    </div>`;

  listingsResultsEl.innerHTML = `${pagerHtml}<div class="listing-rows">${rowsHtml}</div>`;

  document.getElementById("listingsPrevPage").addEventListener("click", () => {
    listingsPage--;
    renderListings();
  });
  document.getElementById("listingsNextPage").addEventListener("click", () => {
    listingsPage++;
    renderListings();
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

listingsRefreshEl.addEventListener("click", () => {
  const url = activeSourceUrl();
  if (!url) {
    listingsStatusEl.textContent = "Enter a custom listings.json URL first.";
    return;
  }
  loadListings(url);
});

[listingsKeywordEl, listingsLocationEl].forEach((el) => {
  el.addEventListener("input", applyListingsFiltersAndRender);
});
listingsPostedWithinEl.addEventListener("change", applyListingsFiltersAndRender);
