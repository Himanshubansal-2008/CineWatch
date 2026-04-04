const toggleBtn = document.getElementById("theme-img");
const movieGrid = document.getElementById("movie-grid");
const searchInput = document.getElementById("search-input");
const randomBtn = document.getElementById("random");
const watchlistBtn = document.getElementById("watchlist");
const filterSelect = document.getElementById("filter");
const loadMoreBtn = document.getElementById("load-more");


const API_KEY = "4ebbe81";
const API_URL = "https://www.omdbapi.com/";

let currentMovies = [];
let currentPage = 1;


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

async function fetchAllMovies(filterType = "all", isLoadMore = false) {
    try {
        if (!isLoadMore) {
            currentPage = 1;
            movieGrid.innerHTML = '<div class="loading">Loading content...</div>';
            loadMoreBtn.style.display = "none";
        }

        const types = filterType === "all" ? ["movie", "series", "episode"] : [filterType];
        const searchTerms = { movie: "marvel", series: "top" };
        const episodeKeywords = ["Friends", "The Office", "Breaking Bad", "Stranger Things", "Game of Thrones"];

        const fetchPromises = [];
        for (let type of types) {
            if (type === "episode") {
                for (let i = 0; i < 5; i++) {
                    const term = encodeURIComponent(episodeKeywords[i]);
                    fetchPromises.push(
                        fetch(`${API_URL}?apikey=${API_KEY}&t=${term}&Season=1&Episode=${currentPage}`)
                            .then(res => res.json())
                            .then(data => {
                                return data.Response === "True" ? { Response: "True", Search: [data] } : { Response: "False" };
                            })
                            .catch(() => ({ Response: "False" }))
                    );
                }
            } else {
                const term = searchTerms[type] || "best";
                for (let i = 0; i < 5; i++) {
                    const pageNum = (currentPage - 1) * 5 + i + 1;
                    fetchPromises.push(
                        fetch(`${API_URL}?apikey=${API_KEY}&s=${term}&type=${type}&page=${pageNum}`)
                            .then(res => res.json())
                            .catch(() => ({ Response: "False" }))
                    );
                }
            }
        }

        const searchResults = await Promise.all(fetchPromises);
        let newMovies = [];

        searchResults.forEach(data => {
            if (data.Response === "True" && data.Search) {
                newMovies = newMovies.concat(data.Search);
            }
        });

        if (newMovies.length > 0) {
            const uniqueMovies = Array.from(new Map(newMovies.map(m => [m.imdbID, m])).values());
            if (!isLoadMore) {
                currentMovies = uniqueMovies.sort(() => 0.5 - Math.random());
                displayMovies(currentMovies);
            } else {
                currentMovies = currentMovies.concat(uniqueMovies);
                appendMovies(uniqueMovies);
            }
            loadMoreBtn.style.display = "block";
        } else if (!isLoadMore) {
            movieGrid.innerHTML = '<p class="no-results">No results found.</p>';
            loadMoreBtn.style.display = "none";
        }
    } catch (error) {
        console.error("Error:", error);
        movieGrid.innerHTML = '<p class="error">Something went wrong.</p>';
    }
}

async function searchMovies(query, filterType = "all") {
    try {
        movieGrid.innerHTML = '<div class="loading">Searching...</div>';
        loadMoreBtn.style.display = "none";
        let url = `${API_URL}?apikey=${API_KEY}&s=${query}`;
        if (filterType && filterType !== "all") url += `&type=${filterType}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.Response === "True") {
            currentMovies = data.Search;
            displayMovies(currentMovies);
        } else {
            if (filterType === "episode") {
                const fallbackUrl = `${API_URL}?apikey=${API_KEY}&t=${encodeURIComponent(query)}&Season=1&Episode=1`;
                try {
                    const fallbackRes = await fetch(fallbackUrl);
                    const fallbackData = await fallbackRes.json();
                    if (fallbackData.Response === "True") {
                        currentMovies = [fallbackData];
                        displayMovies(currentMovies);
                        return;
                    }
                } catch (e) {
                    console.error("Fallback search failed", e);
                }
            }
            currentMovies = [];
            movieGrid.innerHTML = `<p class="no-results">No results for "${query}".</p>`;
        }
    } catch (error) {
        movieGrid.innerHTML = '<p class="error">Search failed.</p>';
    }
}

function displayMovies(movies) {
    movieGrid.innerHTML = "";
    appendMovies(movies);
}

function appendMovies(movies) {
    movies.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.className = "movie-card";

        let posterHTML;
        if (movie.Poster && movie.Poster !== "N/A") {
            // If image not avl then it will show no cover
            posterHTML = `<img src="${movie.Poster}" alt="${movie.Title}" onerror="this.outerHTML='<div class=\\'no-cover\\'><span>No Cover</span></div>';">`;
        } else {
            posterHTML = `<div class="no-cover"><span>No Cover</span></div>`;
        }

        movieCard.innerHTML = `
            <div class="poster-wrapper">
                ${posterHTML}
                <div class="movie-badge">${movie.Type}</div>
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.Title}</h3>
                <p class="movie-year">${movie.Year}</p>
                <button class="add-to-watchlist-btn"><span>+ Watchlist</span></button>
            </div>
        `;
        movieGrid.appendChild(movieCard);
    });
}

loadMoreBtn.addEventListener("click", () => {
    currentPage++;
    fetchAllMovies(filterSelect.value, true);
});

let debounceTimer;
searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const query = searchInput.value.trim();
        const selectedFilter = filterSelect.value;
        if (query.length > 2) searchMovies(query, selectedFilter);
        else if (query.length === 0) fetchAllMovies(selectedFilter);
    }, 500);
});

filterSelect.addEventListener("change", () => {
    const selectedFilter = filterSelect.value;
    const query = searchInput.value.trim();
    if (query.length > 2) searchMovies(query, selectedFilter);
    else fetchAllMovies(selectedFilter);
});

fetchAllMovies(filterSelect.value);