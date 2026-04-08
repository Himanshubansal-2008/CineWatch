# CineWatch 🎬

**CineWatch** is a dynamic web application designed for movie and TV show enthusiasts. It serves as a centralized hub to discover new content, track favorite films, and explore detailed information about the cinematic universe.

### 🔗 [Live Demo](https://cine-watch-kappa.vercel.app/)

---

## ✨ Features

- **Trending Hub:** Fetch and display the most popular and trending movies and TV shows.
- **Robust Search Functionality:** Search exactly what you're looking for real-time with debouncing.
- **Advanced Filtering & Sorting:** Narrow down discovery by types (Movies, Series, Episodes) and sort by year or shuffle results.
- **Comprehensive Details Display:** View plot synopsis, cast, ratings, and runtime in interactive modals.
- **Watchlist Sidebar:** Save favorites to a persistent local storage and access them via a slide-out menu.
- **Responsive Design:** Modern interface that works flawlessly across desktops, tablets, and mobile devices.
- **Dark/Light Mode:** Seamless theme switching with persistent settings.

---

## 🚀 Setup & Run Instructions

To set up and run this project locally, follow these steps:

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd CineWatch
```

### 2. Get an API Key
- Go to the [OMDb API](https://www.omdbapi.com/apikey.aspx) to generate a free API key.
- Insert your API key into the `script.js` file at the top: `const API_KEY = "YOUR_KEY_HERE";`.

### 3. Run the Application
You have several ways to launch the app:

- **Option A (Recommended):** Use a local development server for the best experience:
  ```bash
  # Try this first (stable and fast)
  npx -y serve .
  
  # Or use Python (built-in on Mac)
  python3 -m http.server 8000
  ```
- **Option B (VS Code):** Use the **"Live Server"** extension and click **"Go Live"** in the status bar.
- **Option C (Quick Preview):** Simply double-click on `index.html` to open it in your browser.

---

## 🛠️ Technologies Involved

- **HTML5:** Semantic content structure and SEO optimization.
- **CSS3:** Customized styling with CSS variables, fluid layouts, and dark/light themes.
- **JavaScript (ES6+):** Responsive UI, async API fetching, and LocalStorage management.
- **OMDb API:** RESTful web service for rich cinematic metadata.

---

## 📂 Project Structure

- `index.html`: Main entry point.
- `style.css`: Core design system and theme logic.
- `script.js`: Application logic (Fetch, Search, Watchlist).
- `images/`: Static assets and UI mockups.

---

*Made with ❤️ for the cinematic community.*