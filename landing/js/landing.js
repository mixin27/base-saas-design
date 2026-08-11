document.addEventListener("click", (e) => {
  const opt = e.target.closest("[data-pricing-period]");
  if (opt) {
    const period = opt.getAttribute("data-pricing-period");
    document.querySelectorAll("[data-pricing-period]").forEach((el) => el.classList.toggle("active", el === opt));
    document.querySelectorAll("[data-price-monthly]").forEach((el) => {
      el.textContent = period === "annual" ? el.getAttribute("data-price-annual") : el.getAttribute("data-price-monthly");
    });
    document.querySelectorAll("[data-price-period-label]").forEach((el) => {
      el.textContent = period === "annual" ? "/mo, billed annually" : "/month";
    });
    document.querySelectorAll("[data-annual-badge]").forEach((el) => el.classList.toggle("hidden", period !== "annual"));
  }

  if (e.target.closest("[data-landing-menu-toggle]")) {
    document.getElementById("landing-mobile-menu")?.classList.toggle("hidden");
  }
});