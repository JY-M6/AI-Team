const navLinks = document.querySelectorAll(".bottom-nav a, .nav-list a");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(`[href="${link.getAttribute("href")}"]`).forEach((item) => {
      item.classList.add("active");
    });
  });
});

document.querySelectorAll(".calendar-grid button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".calendar-grid button").forEach((item) => item.classList.remove("today"));
    button.classList.add("today");
  });
});
