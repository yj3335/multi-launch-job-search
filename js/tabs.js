/*
 * Switches between the Search Launcher and Live Listings panels. Remembers
 * the last active tab (a single string — cheap, unlike the listings data)
 * and supports a ?tab=listings URL param for direct linking.
 */

const tabButtons = document.querySelectorAll(".tab-btn");

function activateTab(tabId) {
  tabButtons.forEach((btn) => {
    const isActive = btn.dataset.tab === tabId;
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
    document.getElementById(btn.getAttribute("aria-controls")).hidden = !isActive;
  });
  try { localStorage.setItem("multiLaunch.activeTab", tabId); } catch {}
}

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => activateTab(btn.dataset.tab));
});

const tabParam = new URLSearchParams(window.location.search).get("tab");
let savedTab = null;
try { savedTab = localStorage.getItem("multiLaunch.activeTab"); } catch {}
activateTab(tabParam || savedTab || "launcher");
