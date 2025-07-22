import "./word-list.js";

document.getElementById("searchForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const keyword = document.getElementById("searchInput").value.trim();
    if (keyword) {
        window.location.href = `search-word.html?name=${encodeURIComponent(
            keyword
        )}`;
    }
});
