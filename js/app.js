/*
 * DOM wiring: renders the source chips from SOURCES, tracks selection state,
 * and launches searches (combining Google-backed sources into batches).
 */

const jobTitleEl = document.getElementById("jobTitle");
const timeFilterEl = document.getElementById("timeFilter");
const locationEl = document.getElementById("location");
const excludeTermsEl = document.getElementById("excludeTerms");
const remoteOnlyEl = document.getElementById("remoteOnly");
const batchSizeEl = document.getElementById("batchSize");
const groupsEl = document.getElementById("groups");
const launchBtn = document.getElementById("launchBtn");
const selCountEl = document.getElementById("selCount");
const totalCountEl = document.getElementById("totalCount");
const tabsPreviewEl = document.getElementById("tabsPreview");

const STORAGE = {
  selected: "multiLaunch.selected",
  remoteOnly: "multiLaunch.remoteOnly",
  batchSize: "multiLaunch.batchSize",
  location: "multiLaunch.location",
  excludeTerms: "multiLaunch.excludeTerms",
};

function currentOptions() {
  const exclude = excludeTermsEl.value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return {
    time: timeFilterEl.value,
    remote: remoteOnlyEl.checked,
    location: locationEl.value.trim(),
    exclude,
  };
}

function loadSelected() {
  try { return JSON.parse(localStorage.getItem(STORAGE.selected) || "null"); }
  catch { return null; }
}
function saveSelected(names) {
  localStorage.setItem(STORAGE.selected, JSON.stringify(names));
}

TIME_OPTIONS.forEach(([val, label]) => {
  const opt = document.createElement("option");
  opt.value = val; opt.textContent = label;
  if (val === "24hours") opt.selected = true;
  timeFilterEl.appendChild(opt);
});

let totalSources = 0;
const checkboxes = [];
const savedSelection = loadSelected();

SOURCES.forEach(([groupName, items]) => {
  const groupEl = document.createElement("div");
  groupEl.className = "group";
  const h2 = document.createElement("h2");
  h2.textContent = groupName;
  groupEl.appendChild(h2);
  const chipsEl = document.createElement("div");
  chipsEl.className = "chips";

  items.forEach(([name, site, specialBuild]) => {
    totalSources++;
    const chip = document.createElement("label");
    chip.className = "chip";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = savedSelection ? savedSelection.includes(name) : true;
    cb.dataset.name = name;

    const nameSpan = document.createElement("span");
    nameSpan.className = "name";
    nameSpan.textContent = name;

    const openOne = document.createElement("a");
    openOne.className = "open-one";
    openOne.textContent = "open →";
    openOne.target = "_blank";
    openOne.rel = "noopener";
    openOne.href = "#";
    openOne.addEventListener("click", (e) => {
      e.stopPropagation();
      const job = jobTitleEl.value.trim();
      if (!job) { e.preventDefault(); jobTitleEl.focus(); return; }
      const options = currentOptions();
      openOne.href = specialBuild ? specialBuild(job, options) : googleUrl(site, job, options);
    });

    function syncChipState() {
      chip.classList.toggle("checked", cb.checked);
    }
    cb.addEventListener("change", () => { syncChipState(); updateCounts(); });
    syncChipState();

    chip.appendChild(cb);
    chip.appendChild(nameSpan);
    chip.appendChild(openOne);
    chipsEl.appendChild(chip);
    checkboxes.push({ name, cb, site, specialBuild });
  });

  groupEl.appendChild(chipsEl);
  groupsEl.appendChild(groupEl);
});

totalCountEl.textContent = totalSources;

function tabsForSelection() {
  const selected = checkboxes.filter((c) => c.cb.checked);
  const googleSources = selected.filter((c) => !c.specialBuild);
  const specialSources = selected.filter((c) => c.specialBuild);
  const batchSize = Math.max(1, parseInt(batchSizeEl.value, 10) || 6);
  return chunk(googleSources, batchSize).length + specialSources.length;
}

function updateCounts() {
  const n = checkboxes.filter((c) => c.cb.checked).length;
  selCountEl.textContent = n;
  const tabs = tabsForSelection();
  tabsPreviewEl.textContent = n ? `→ opens ${tabs} tab${tabs === 1 ? "" : "s"}` : "";
  launchBtn.disabled = n === 0 || !jobTitleEl.value.trim();
  saveSelected(checkboxes.filter((c) => c.cb.checked).map((c) => c.name));
}

jobTitleEl.addEventListener("input", updateCounts);
function syncLocationDisabled() {
  locationEl.disabled = remoteOnlyEl.checked;
}
remoteOnlyEl.addEventListener("change", () => {
  localStorage.setItem(STORAGE.remoteOnly, remoteOnlyEl.checked ? "1" : "0");
  syncLocationDisabled();
});
batchSizeEl.addEventListener("input", () => {
  localStorage.setItem(STORAGE.batchSize, batchSizeEl.value);
  updateCounts();
});
locationEl.addEventListener("input", () => {
  localStorage.setItem(STORAGE.location, locationEl.value);
});
excludeTermsEl.addEventListener("input", () => {
  localStorage.setItem(STORAGE.excludeTerms, excludeTermsEl.value);
});
document.getElementById("selectAll").addEventListener("click", () => {
  checkboxes.forEach((c) => { c.cb.checked = true; c.cb.dispatchEvent(new Event("change")); });
});
document.getElementById("selectNone").addEventListener("click", () => {
  checkboxes.forEach((c) => { c.cb.checked = false; c.cb.dispatchEvent(new Event("change")); });
});

launchBtn.addEventListener("click", () => {
  const job = jobTitleEl.value.trim();
  if (!job) { jobTitleEl.focus(); return; }
  const options = currentOptions();
  const batchSize = Math.max(1, parseInt(batchSizeEl.value, 10) || 6);

  const selected = checkboxes.filter((c) => c.cb.checked);
  const googleSources = selected.filter((c) => !c.specialBuild);
  const specialSources = selected.filter((c) => c.specialBuild);

  chunk(googleSources, batchSize).forEach((batch) => {
    const combinedSite = batch.length === 1 ? batch[0].site : `(${batch.map((c) => c.site).join(" OR ")})`;
    window.open(googleUrl(combinedSite, job, options), "_blank", "noopener");
  });
  specialSources.forEach((c) => {
    window.open(c.specialBuild(job, options), "_blank", "noopener");
  });
});

const savedRemote = localStorage.getItem(STORAGE.remoteOnly);
if (savedRemote !== null) remoteOnlyEl.checked = savedRemote === "1";
const savedBatchSize = localStorage.getItem(STORAGE.batchSize);
if (savedBatchSize !== null) batchSizeEl.value = savedBatchSize;
const savedLocation = localStorage.getItem(STORAGE.location);
if (savedLocation !== null) locationEl.value = savedLocation;
const savedExcludeTerms = localStorage.getItem(STORAGE.excludeTerms);
if (savedExcludeTerms !== null) excludeTermsEl.value = savedExcludeTerms;

const params = new URLSearchParams(window.location.search);
const jobParam = params.get("job");
const timeParam = params.get("time");
const remoteParam = params.get("remote");
const locationParam = params.get("location");
const excludeParam = params.get("exclude");
if (jobParam) jobTitleEl.value = decodeURIComponent(jobParam.replace(/\+/g, " "));
if (timeParam) timeFilterEl.value = timeParam;
if (remoteParam) remoteOnlyEl.checked = remoteParam !== "false";
if (locationParam) locationEl.value = decodeURIComponent(locationParam.replace(/\+/g, " "));
if (excludeParam) excludeTermsEl.value = decodeURIComponent(excludeParam.replace(/\+/g, " "));

syncLocationDisabled();
updateCounts();
initInfoButtons();
