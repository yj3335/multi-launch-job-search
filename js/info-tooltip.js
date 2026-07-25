/*
 * Reusable "?" info button: shows its tooltip on hover/focus (desktop) and on
 * tap (touch, since there's no hover to rely on). Only one tooltip is open at
 * a time; tapping elsewhere or pressing Escape closes it.
 */

function initInfoButtons(root = document) {
  const buttons = root.querySelectorAll(".info-btn");

  function closeAll(except) {
    buttons.forEach((b) => { if (b !== except) b.setAttribute("aria-expanded", "false"); });
  }

  buttons.forEach((btn) => {
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      closeAll(btn);
      btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });
  });

  document.addEventListener("click", () => closeAll(null));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll(null);
  });
}
