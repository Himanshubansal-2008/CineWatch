const toggleBtn = document.getElementById("theme-img");

toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");

    if (document.body.classList.contains("light")) {
        toggleBtn.textContent = "🌙";
        toggleBtn.style.transform = "rotate(45deg)";
    } else {
        toggleBtn.textContent = "☀️";
        toggleBtn.style.transform = "rotate(-45deg)";
    }
});

const API_KEY = "4ebbe81";
const API_URL = "https://www.omdbapi.com/";
