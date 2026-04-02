const toggleBtn = document.getElementById("theme-img");
const movieGrid = document.getElementById("movie-grid");
const searchInput = document.getElementById("search-input");
const randomBtn = document.getElementById("random");
const watchlistBtn = document.getElementById("watchlist");

const API_KEY = "4ebbe81";
const API_URL = "https://www.omdbapi.com/";

let currentMovies = [];

// Theme
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

if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
    toggleBtn.textContent = "🌙";
}

//Fetched Home movies
async function fetchAllMovies(filterType = "") {
    try {
        let queries = [];
        
        if (filterType && filterType !== "all") {
            let baseTerms = [];
            if (filterType === "episode") {
                baseTerms = ["Pilot", "Christmas", "Finale", "Halloween", "Wedding", "Part 1", "Home", "Love", "Night", "Day", "Secret", "Truth"];
            } else if (filterType === "series") {
                baseTerms = ["Breaking", "Office", "Stranger", "Game of Thrones", "Walking", "Doctor", "Sherlock", "Friends", "Black", "Mirror", "Wire"];
            } else {
                baseTerms = ["Batman", "Avengers", "Harry Potter", "Star Wars", "Matrix", "Walking", "Spider-Man", "Iron Man", "Lord of the Rings", "Superman", "X-Men", "Pirates"];
            }
            queries = baseTerms.map(term => ({ term: term, type: filterType }));
        } else {
            queries = [
                { term: "Avengers", type: "movie" },
                { term: "Batman", type: "movie" },
                { term: "Harry Potter", type: "movie" },
                { term: "Star Wars", type: "movie" },
                { term: "Spider-Man", type: "movie" },
                { term: "Matrix", type: "movie" },
                { term: "Lord of the Rings", type: "movie" },
                { term: "Superman", type: "movie" },
                
                { term: "Stranger Things", type: "series" },
                { term: "Breaking Bad", type: "series" },
                { term: "Game of Thrones", type: "series" },
                { term: "The Office", type: "series" },
                { term: "Sherlock", type: "series" },
                { term: "Walking Dead", type: "series" },
                { term: "Doctor Who", type: "series" },
                
                { term: "Friends", type: "episode" },
                { term: "Office", type: "episode" },
                { term: "Breaking Bad", type: "episode" },
                { term: "Game of Thrones", type: "episode" },
                { term: "Stranger Things", type: "episode" }
            ];
        }

        const promises = queries.map(q => {
            let url = `${API_URL}?apikey=${API_KEY}&s=${q.term}`;
            if (q.type && q.type !== "all") {
                url += `&type=${q.type}`;
            }
            return fetch(url).then(res => res.json());
        });
        
        const results = await Promise.all(promises);
        let allMovies = [];
        
        results.forEach(data => {
            if (data.Response === "True") {
                allMovies = allMovies.concat(data.Search);
            }
        });
        
        if (allMovies.length > 0) {
            const uniqueMovies = Array.from(new Map(allMovies.map(m => [m.imdbID, m])).values());
            currentMovies = uniqueMovies.sort(() => 0.5 - Math.random());
            displayMovies(currentMovies);
        } else {
            movieGrid.innerHTML = `<p class="no-results">No results found.</p>`;
        }
    } catch (error) {
        console.error("Error fetching movies:", error);
        movieGrid.innerHTML = `<p class="error">Something went wrong. Please try again later.</p>`;
    }
}

function displayMovies(movies) {
    movieGrid.innerHTML = "";

    movies.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.className = "movie-card";
        
        let posterHTML;
        if (movie.Poster !== "N/A") {
            posterHTML = `<img src="${movie.Poster}" alt="${movie.Title}">`;
        } else {
            posterHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: #2a2a2a; color: #777; font-size: 16px; font-weight: 500; position: absolute; top: 0; left: 0;">No Cover</div>`;
        }

        movieCard.innerHTML = `
            <div class="poster-wrapper">
                ${posterHTML}
                <div class="movie-badge">${movie.Type}</div>
            </div>
            <div class="movie-info">
                <h3 class="movie-title" title="${movie.Title}">${movie.Title}</h3>
                <p class="movie-year">${movie.Year}</p>
                <button class="add-to-watchlist-btn">
                    <span>+ Watchlist</span>
                </button>
            </div>
        `;

        movieGrid.appendChild(movieCard);
    });
}

// Search
let debounceTimer;
searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const query = searchInput.value.trim();
        if (query.length > 2) {
            searchMovies(query);
        } else if (query.length === 0) {
            fetchAllMovies();
        }
    }, 500);
});

async function searchMovies(query) {
    try {
        movieGrid.innerHTML = '<div class="loading">Searching...</div>';
        let url = `${API_URL}?apikey=${API_KEY}&s=${query}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.Response === "True") {
            currentMovies = data.Search;
            displayMovies(currentMovies);
        } else {
            currentMovies = [];
            movieGrid.innerHTML = `<p class="no-results">No results found for "${query}".</p>`;
        }
    } catch (error) {
        console.error("Error searching movies:", error);
        movieGrid.innerHTML = `<p class="error">Something went wrong. Please try again later.</p>`;
    }
}


fetchAllMovies();
