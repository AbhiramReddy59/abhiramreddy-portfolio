/**
 * Main Client Application Foundation
 * Initializes core site lifecycle, state management, and connects to data source.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Validate data module availability
  if (typeof PORTFOLIO_DATA === "undefined") {
    console.error("Critical: PORTFOLIO_DATA source module not found.");
    return;
  }

  // Update dynamic year in footer
  const yearElement = document.getElementById("current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  console.log("Portfolio foundation loaded successfully for:", PORTFOLIO_DATA.profile.fullName);
});
