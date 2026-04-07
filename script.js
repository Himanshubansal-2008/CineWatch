const toggleBtn = document.getElementById("theme-img");
const movieGrid = document.getElementById("movie-grid");
const searchInput = document.getElementById("search-input");
const randomBtn = document.getElementById("random");
const watchlistBtn = document.getElementById("watchlist");
const filterSelect = document.getElementById("filter");
const sortSelect = document.getElementById("sort");
const loadMoreBtn = document.getElementById("load-more");


const API_KEY = "4ebbe81";
const API_URL = "https://www.omdbapi.com/";

let currentMovies = [];
let currentPage = 1;
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

function updateWatchlistCount() {
    watchlistBtn.textContent = `Watchlist ${watchlist.length}`;
}


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

        const fetchPromises = types.flatMap(type => {
            if (type === "episode") {
                return Array.from({ length: 5 }).map((_, i) => {
                    const term = encodeURIComponent(episodeKeywords[i]);
                    return fetch(`${API_URL}?apikey=${API_KEY}&t=${term}&Season=1&Episode=${currentPage}`)
                        .then(res => res.json())
                        .then(data => data.Response === "True" ? { Response: "True", Search: [data] } : { Response: "False" })
                        .catch(() => ({ Response: "False" }));
                });
            } else {
                const term = searchTerms[type] || "best";
                return Array.from({ length: 5 }).map((_, i) => {
                    const pageNum = (currentPage - 1) * 5 + i + 1;
                    return fetch(`${API_URL}?apikey=${API_KEY}&s=${term}&type=${type}&page=${pageNum}`)
                        .then(res => res.json())
                        .catch(() => ({ Response: "False" }));
                });
            }
        });

        const searchResults = await Promise.all(fetchPromises);
        const newMovies = searchResults
            .filter(data => data.Response === "True" && data.Search)
            .flatMap(data => data.Search);

        if (newMovies.length > 0) {
            const uniqueMovies = Array.from(new Map(newMovies.map(m => [m.imdbID, m])).values());
            if (!isLoadMore) {
                currentMovies = uniqueMovies;
                sortMovies();
            } else {
                currentMovies = currentMovies.concat(uniqueMovies);
                sortMovies();
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
            sortMovies();
        } else {
            if (filterType === "episode") {
                const fallbackUrl = `${API_URL}?apikey=${API_KEY}&t=${encodeURIComponent(query)}&Season=1&Episode=1`;
                try {
                    const fallbackRes = await fetch(fallbackUrl);
                    const fallbackData = await fallbackRes.json();
                    if (fallbackData.Response === "True") {
                        currentMovies = [fallbackData];
                        sortMovies();
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

        const isInWatchlist = watchlist.some(m => m.imdbID === movie.imdbID);

        movieCard.innerHTML = `
            <div class="poster-wrapper">
                ${posterHTML}
                <div class="movie-badge">${movie.Type}</div>
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.Title}</h3>
                <p class="movie-year">${movie.Year}</p>
                <button class="add-to-watchlist-btn" data-imdbid="${movie.imdbID}">
                    <span>${isInWatchlist ? "- Remove" : "+ Watchlist"}</span>
                </button>
            </div>
        `;
        const btn = movieCard.querySelector('.add-to-watchlist-btn');
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleWatchlist(movie);
        });

        movieCard.addEventListener('click', () => {
            openMovieModal(movie.imdbID);
        });

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

sortSelect.addEventListener("change", () => {
    sortMovies();
});

randomBtn.addEventListener("click", () => {
    if (watchlist.length === 0) {
        alert("Your watchlist is empty! Add some movies first.");
        return;
    }
    const randomIndex = Math.floor(Math.random() * watchlist.length);
    const randomMovie = watchlist[randomIndex];
    openMovieModal(randomMovie.imdbID);
});

function sortMovies() {
    const sortValue = sortSelect.value;
    if (sortValue === "newest") {
        currentMovies.sort((a, b) => {
            const yearA = parseInt(a.Year.substring(0, 4)) || 0;
            const yearB = parseInt(b.Year.substring(0, 4)) || 0;
            return yearB - yearA;
        });
    } else if (sortValue === "oldest") {
        currentMovies.sort((a, b) => {
            const yearA = parseInt(a.Year.substring(0, 4)) || 0;
            const yearB = parseInt(b.Year.substring(0, 4)) || 0;
            return yearA - yearB;
        });
    } else if (sortValue === "sort-by") {
        currentMovies.sort(() => 0.5 - Math.random());
    }
    displayMovies(currentMovies);
}

function updateMainGridButtons() {
    const buttons = document.querySelectorAll('.add-to-watchlist-btn');
    buttons.forEach(btn => {
        const imdbid = btn.getAttribute('data-imdbid');
        if (imdbid) {
            const isIn = watchlist.some(m => m.imdbID === imdbid);
            btn.querySelector('span').textContent = isIn ? "- Remove" : "+ Watchlist";
        }
    });
}

function toggleWatchlist(movie) {
    const index = watchlist.findIndex(m => m.imdbID === movie.imdbID);
    if (index !== -1) {
        watchlist.splice(index, 1);
    } else {
        watchlist.push(movie);
    }
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    updateWatchlistCount();
    updateMainGridButtons();

    if (watchlistSidebar && watchlistSidebar.classList.contains("active")) {
        renderSidebarWatchlist();
    }
}

const watchlistOverlay = document.getElementById("watchlist-overlay");
const watchlistSidebar = document.getElementById("watchlist-sidebar");
const closeSidebarBtn = document.getElementById("close-sidebar");
const sidebarContent = document.getElementById("sidebar-content");

function openSidebar() {
    watchlistOverlay.classList.add("active");
    watchlistSidebar.classList.add("active");
    renderSidebarWatchlist();
}

function closeSidebar() {
    watchlistOverlay.classList.remove("active");
    watchlistSidebar.classList.remove("active");
}

watchlistBtn.addEventListener('click', openSidebar);
closeSidebarBtn.addEventListener('click', closeSidebar);
watchlistOverlay.addEventListener('click', closeSidebar);

function renderSidebarWatchlist() {
    sidebarContent.innerHTML = "";
    if (watchlist.length === 0) {
        sidebarContent.innerHTML = '<p style="color: #888; text-align: center; margin-top: 20px;">Your watchlist is empty.</p>';
        return;
    }

    watchlist.forEach(movie => {
        const item = document.createElement("div");
        item.className = "watchlist-item";

        let posterHTML;
        if (movie.Poster && movie.Poster !== "N/A") {
            posterHTML = `<img src="${movie.Poster}" alt="${movie.Title}" onerror="this.outerHTML='<div class=\\'no-cover sidebar-no-cover\\'><span>No Cover</span></div>';">`;
        } else {
            posterHTML = `<div class="no-cover sidebar-no-cover"><span>No Cover</span></div>`;
        }

        item.innerHTML = `
            <div class="sidebar-poster-wrapper">${posterHTML}</div>
            <div class="item-info">
                <h4>${movie.Title}</h4>
                <span>${movie.Year}</span>
            </div>
            <button class="remove-item">🗑️</button>
        `;

        const removeBtn = item.querySelector('.remove-item');
        removeBtn.addEventListener('click', () => {
            toggleWatchlist(movie);
        });
        sidebarContent.appendChild(item);
    });
}

const movieModalOverlay = document.getElementById("movie-modal-overlay");
const closeModalBtn = document.getElementById("close-modal");
const modalContent = document.getElementById("modal-content");

async function openMovieModal(imdbID) {
    movieModalOverlay.classList.add("active");
    modalContent.innerHTML = '<div class="loading" style="margin: auto;">Loading details...</div>';

    try {
        const response = await fetch(`${API_URL}?apikey=${API_KEY}&i=${imdbID}&plot=short`);
        const data = await response.json();

        if (data.Response === "True") {
            let posterHTML;
            if (data.Poster && data.Poster !== "N/A") {
                posterHTML = `<img src="${data.Poster}" alt="${data.Title}" class="modal-poster" onerror="this.outerHTML='<div class=\\'no-cover\\'><span>No Cover</span></div>';">`;
            } else {
                posterHTML = `<div class="no-cover"><span>No Cover</span></div>`;
            }

            const isInWatchlist = watchlist.some(m => m.imdbID === data.imdbID);

            modalContent.innerHTML = `
                <div class="modal-poster-wrapper">
                    ${posterHTML}
                </div>
                <div class="modal-details" style="position: relative;">
                    <h2 class="modal-title">${data.Title}</h2>
                    <div class="modal-badges">
                        <span class="badge">${data.Year}</span>
                        ${data.Rated && data.Rated !== 'N/A' ? `<span class="badge">${data.Rated}</span>` : ''}
                        ${data.Runtime && data.Runtime !== 'N/A' ? `<span class="badge">${data.Runtime}</span>` : ''}
                    </div>
                    <div class="modal-text">
                        <p><strong>Genre:</strong> ${data.Genre}</p>
                        <p><strong>Director:</strong> ${data.Director}</p>
                        <p><strong>Actors:</strong> ${data.Actors}</p>
                        <p><strong>IMDb Rating:</strong> ⭐ ${data.imdbRating}</p>
                    </div>
                    <p class="modal-plot">${data.Plot === 'N/A' ? 'No synopsis available.' : data.Plot}</p>
                    
                    <button class="add-to-watchlist-btn modal-watchlist-btn" style="margin-top: 20px; max-width: 250px;">
                        <span>${isInWatchlist ? "- Remove" : "+ Watchlist"}</span>
                    </button>
                </div>
            `;

            const modalWatchlistBtn = modalContent.querySelector('.modal-watchlist-btn');
            modalWatchlistBtn.addEventListener('click', () => {
                const movieToToggle = {
                    Title: data.Title,
                    Year: data.Year,
                    imdbID: data.imdbID,
                    Type: data.Type,
                    Poster: data.Poster
                };
                toggleWatchlist(movieToToggle);

                const isNowIn = watchlist.some(m => m.imdbID === data.imdbID);
                modalWatchlistBtn.querySelector('span').textContent = isNowIn ? "- Remove" : "+ Watchlist";
            });
        } else {
            modalContent.innerHTML = '<p class="error">Failed to load movie details.</p>';
        }
    } catch (err) {
        modalContent.innerHTML = '<p class="error">Something went wrong.</p>';
    }
}

closeModalBtn.addEventListener('click', () => {
    movieModalOverlay.classList.remove("active");
});
movieModalOverlay.addEventListener('click', (e) => {
    if (e.target === movieModalOverlay) {
        movieModalOverlay.classList.remove("active");
    }
});

updateWatchlistCount();
fetchAllMovies(filterSelect.value);