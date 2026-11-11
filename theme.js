// ===== الدارك مود (مشترك لكل الصفحات) =====
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

const themeBtn = document.getElementById("theme-btn");

if (themeBtn) {
  themeBtn.addEventListener("click", function () {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });
}