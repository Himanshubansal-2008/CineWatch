# CineWatch 🎬

## 📖 Project Overview
**CineWatch** is a dynamic web application designed for movie and TV show enthusiasts. It serves as a centralized hub to discover new content, track favorite films, and explore detailed information about the cinematic universe. The platform aims to provide a visually stunning, responsive user interface to make exploring movies an effortless and enjoyable experience.

## 🎯 Purpose
The primary goal of CineWatch is to provide users with an intuitive tool to search, filter, and learn about any movie or TV series. Whether you're looking for the top trending films of the week or need details on a classic masterpiece, CineWatch brings the world of cinema right to your fingertips. 

## 🔌 API Being Used
This project leverages the **[OMDb API](https://www.omdbapi.com/)** (The Open Movie Database). The OMDb API is a RESTful web service used to obtain movie information, providing rich data including metadata, high-quality posters, cast details, ratings, and much more.

## ✨ Features
- **Trending Hub:** Fetch and display the most popular and trending movies and TV shows.
- **Robust Search Functionality:** Search exactly what you're looking for in real-time.
- **Advanced Filtering & Sorting:** Narrow down your discovery by filtering content by genres or release years, and sort results seamlessly (e.g., by highest rating, popularity, or release date).
- **Comprehensive Details Display:** View in-depth information on any title, including the plot synopsis, main cast, runtime, release date, and user ratings.
- **Responsive Design:** A tailored, modern interface that works flawlessly across desktops, tablets, and mobile devices.

## 🛠️ Technologies Involved
- **HTML5:** For semantic content structure.
- **CSS3:** For customized styling, fluid layouts, and modern aesthetics like dark themes and clean typography.
- **JavaScript:** For fetching API data, handling the core business logic, executing dynamic searches, and updating the DOM without page reloads.

## 🚀 Setup & Run Instructions

To set up and run this project locally, follow these simple steps:

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   ```

2. **Navigate into the project directory:**
   ```bash
   cd CineWatch
   ```

3. **Get an API Key:**
   - Go to the [OMDb API](https://www.omdbapi.com/apikey.aspx) to generate a free API key.
   - Verify the email sent to you to activate the key.
   - Insert your API key into the `script.js` file where designated.

4. **Run the Application:**
   - Simply double-click on `index.html` to open it in your default web browser.
   - *Recommended:* For the best development experience, open the project with a local development server like VS Code's "Live Server" extension, or run:
     ```bash
     npx live-server
     ```