const form = document.getElementById("quiz");
const result = document.getElementById("result");

const API_KEY = "2267ce9f2af5f6c356d683313b8a9e1d";
let genreMap = {};

async function fetchGenres(type) {
  const res = await fetch(`https://api.themoviedb.org/3/genre/${type}/list?api_key=${API_KEY}`);
  const json = await res.json();
  genreMap = {};
  json.genres.forEach(g => genreMap[g.id] = g.name);
}
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const genre = data.get("vibe");
  const type = data.get("type");
  const rating = data.get("rating") || 0;
  const yearFrom = data.get("yearFrom");
  const yearTo = data.get("yearTo");
  const lang = data.get("lang");
  await fetchGenres(type);
  let url = `https://api.themoviedb.org/3/discover/${type}?api_key=${API_KEY}&with_genres=${genre}&vote_average.gte=${rating}&with_original_language=${lang}&sort_by=popularity.desc`;

  if (yearFrom) {
    const key = type === "movie" ? "primary_release_date.gte" : "first_air_date.gte";
    url += `&${key}=${yearFrom}-01-01`;
  }
  if (yearTo) {
    const key = type === "movie" ? "primary_release_date.lte" : "first_air_date.lte";
    url += `&${key}=${yearTo}-12-31`;
  }
  try {
    const res = await fetch(url);
    const json = await res.json();
    if (!json.results.length) {
      result.textContent = "No matches found. Try changing the filters.";
      return;
    }
    result.innerHTML = `<h2>Your Matches</h2>`;

    json.results.slice(0, 20).forEach(item => {
      const title = type === "movie" ? item.title : item.name;
      const img = item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : '';
      const overview = item.overview || "No description available.";
      const rating = item.vote_average?.toFixed(1) || "N/A";
      const year = (type === "movie" ? item.release_date : item.first_air_date || "").split("-")[0] || "Unknown";
      const lang = item.original_language?.toUpperCase() || "N/A";
      const genres = (item.genre_ids || []).map(id => genreMap[id]).join(", ") || "Unknown";
      const div = document.createElement("div");

      div.className = "movie";
      div.innerHTML = `
        <div class="info">
          <h3>${title} (${year})</h3>
          <p>${overview}</p>
          <div class="details">
           Rating: ${rating}  |  Genre: ${genres}  |  Language: ${lang}
        </div>
      </div>
      ${img ? `<img src="${img}" alt="${title}" />` : ''}
    `;
      result.appendChild(div);
    });
  } catch (err) {
  }
});
