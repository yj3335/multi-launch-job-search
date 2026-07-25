/*
 * Pure URL-building logic: no DOM access, no state. Given a job title / time
 * window / remote flag, produce the search URL for a given source.
 */

const TIME_OPTIONS = [
  ["all", "All time"],
  ["1hour", "Past hour"],
  ["4hours", "Past 4 hours"],
  ["8hours", "Past 8 hours"],
  ["12hours", "Past 12 hours"],
  ["24hours", "Past 24 hours"],
  ["48hours", "Past 48 hours"],
  ["72hours", "Past 72 hours"],
  ["week", "Past week"],
  ["month", "Past month"],
  ["older1month", "Older than 1 month"],
  ["older3months", "Older than 3 months"],
  ["older6months", "Older than 6 months"],
];

function mmddyyyy(d) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

// Google's undocumented qdr:hN (past N hours) and cdr custom-range tricks,
// reverse-engineered from briansjobsearch.com's own generated links.
function tbsFor(time) {
  const now = new Date();
  switch (time) {
    case "all": return null;
    case "1hour": return "qdr:h";
    case "4hours": return "qdr:h4";
    case "8hours": return "qdr:h8";
    case "12hours": return "qdr:h12";
    case "24hours": return "qdr:d";
    case "48hours": return "qdr:h48";
    case "72hours": return "qdr:h72";
    case "week": return "qdr:w";
    case "month": return "qdr:m";
    case "older1month": {
      const d = new Date(now); d.setMonth(d.getMonth() - 1);
      return `cdr:1,cd_max:${mmddyyyy(d)}`;
    }
    case "older3months": {
      const d = new Date(now); d.setMonth(d.getMonth() - 3);
      return `cdr:1,cd_max:${mmddyyyy(d)}`;
    }
    case "older6months": {
      const d = new Date(now); d.setMonth(d.getMonth() - 6);
      return `cdr:1,cd_max:${mmddyyyy(d)}`;
    }
    default: return null;
  }
}

function quoteIfMultiWord(term) {
  return term.includes(" ") ? `"${term}"` : term;
}

// options: { time, remote, location, exclude }
// - location only narrows the search when remote is off (remote already implies "anywhere")
// - exclude is an array of terms to strip out via Google's `-term` operator
function googleUrl(siteExpr, jobTitle, options) {
  const { time, remote, location, exclude = [] } = options;
  let q = `"${jobTitle}" ${siteExpr}`;
  if (remote) q += ` remote`;
  else if (location) q += ` "${location}"`;
  exclude.forEach((term) => { q += ` -${quoteIfMultiWord(term)}`; });
  let url = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  const tbs = tbsFor(time);
  if (tbs) url += `&tbs=${tbs}`;
  return url;
}

// LinkedIn's keyword search supports boolean NOT for exclusion terms.
function linkedInUrl(jobTitle, options) {
  const { time, remote, location, exclude = [] } = options;
  const tprMap = {
    "1hour": "r3600", "4hours": "r14400", "8hours": "r28800", "12hours": "r43200",
    "24hours": "r86400", "48hours": "r172800", "72hours": "r259200",
    "week": "r604800", "month": "r2592000",
  };
  const tpr = tprMap[time];
  const effectiveLocation = remote ? "Remote" : (location || "United States");
  let keywords = jobTitle;
  exclude.forEach((term) => { keywords += ` NOT ${quoteIfMultiWord(term)}`; });
  let u = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(effectiveLocation)}`;
  if (tpr) u += `&f_TPR=${tpr}`;
  return u;
}

function remoteRocketshipUrl(jobTitle) {
  return `https://remoterocketship.com/?ref=multi-launch&jobTitle=${encodeURIComponent(jobTitle)}`;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
