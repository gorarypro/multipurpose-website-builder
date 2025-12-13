/**
 * Modal Guard
 * -----------
 * Fixes stuck gray overlay (leftover .modal-backdrop) safely
 * WITHOUT breaking normal modal behavior.
 */

(function () {
  function anyModalShown() {
    return !!document.querySelector(".modal.show");
  }

  function cleanupBackdropsIfStuck() {
    if (anyModalShown()) return;

    var backdrops = document.querySelectorAll(".modal-backdrop");
    if (!backdrops.length) return;

    for (var i = 0; i < backdrops.length; i++) {
      if (backdrops[i] && backdrops[i].parentNode) {
        backdrops[i].parentNode.removeChild(backdrops[i]);
      }
    }

    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }

  document.addEventListener("hidden.bs.modal", function () {
    setTimeout(cleanupBackdropsIfStuck, 50);
  });

  setInterval(cleanupBackdropsIfStuck, 1500);
})();
