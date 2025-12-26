/**
 * FUSION v10.8.1 - modal-guard.js
 * --------------------------------
 * Safely fixes stuck modal backdrops without breaking Bootstrap behavior.
 */

(function () {

  /**
   * Check if any modal is currently shown
   */
  function anyModalShown() {
    return !!document.querySelector(".modal.show");
  }

  /**
   * Remove stuck backdrops and reset body styles
   */
  function cleanupBackdropsIfStuck() {
    if (anyModalShown()) return; // Normal modal is active

    const backdrops = document.querySelectorAll(".modal-backdrop");
    if (!backdrops.length) return;

    backdrops.forEach(bd => {
      if (bd && bd.parentNode) bd.parentNode.removeChild(bd);
    });

    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }

  /**
   * Listen to Bootstrap modal hide events
   */
  document.addEventListener("hidden.bs.modal", function () {
    setTimeout(cleanupBackdropsIfStuck, 50);
  });

  /**
   * Periodic check for stuck backdrops (safety net)
   */
  setInterval(cleanupBackdropsIfStuck, 1500);

})();
