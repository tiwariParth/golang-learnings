// Debug script to help troubleshoot mobile menu
(function () {
  function addDebugInfo() {
    const debugInfo = document.createElement("div");
    debugInfo.className = "debug-info";

    // Get window dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Check hamburger menu
    const hamburger = document.getElementById("hamburger-menu");
    const hamburgerDisplay = hamburger
      ? window.getComputedStyle(hamburger).display
      : "not found";

    // Check mobile nav
    const mobileNav = document.getElementById("mobile-nav");
    const mobileNavTransform = mobileNav
      ? window.getComputedStyle(mobileNav).transform
      : "not found";

    debugInfo.innerHTML = `
      Window: ${width}×${height}<br>
      Hamburger: ${hamburgerDisplay}<br>
      MobileNav: ${mobileNavTransform}<br>
    `;

    document.body.appendChild(debugInfo);

    // Force debug mode for testing
    document.body.classList.add("debug-mode");
  }

  // Add debug button
  const debugButton = document.createElement("button");
  debugButton.textContent = "Debug";
  debugButton.style.cssText = `
    position: fixed;
    bottom: 10px;
    left: 10px;
    z-index: 9999;
    padding: 5px 10px;
    background: #333;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  `;

  debugButton.addEventListener("click", addDebugInfo);

  // Add debug CSS
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "./debug.css";
  document.head.appendChild(link);

  // Add to page after load
  window.addEventListener("load", function () {
    document.body.appendChild(debugButton);
  });
})();
