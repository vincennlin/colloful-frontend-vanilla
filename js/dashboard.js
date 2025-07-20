document.addEventListener("DOMContentLoaded", () => {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    fetchWords();
});

let currentPage = 1;
const pageSize = 9;
let totalPages = 1;

function fetchWords(page = 1) {
    const token = localStorage.getItem("jwtToken");
    fetch(`${API_BASE}/words?pageNo=${page - 1}&pageSize=${pageSize}`, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + token,
        },
    })
        .then((res) => res.json())
        .then((data) => {
            currentPage = data.pageNo + 1;
            totalPages = data.totalPages;
            displayWords(data.content);
            updatePaginationControls();
        })
        .catch((err) => {
            console.error("Failed to fetch words:", err);
        });
}

function displayWords(words) {
    const container = document.getElementById("wordList");
    container.innerHTML = "";

    words.forEach((word) => {
        const wordDiv = document.createElement("div");
        wordDiv.classList.add("word-card");

        wordDiv.addEventListener("click", () => {
            window.location.href = `word-detail.html?id=${word.id}`;
        });

        const wordTitle = document.createElement("h3");
        wordTitle.textContent = word.name;
        wordDiv.appendChild(wordTitle);

        word.definitions.forEach((def) => {
            const posP = document.createElement("p");
            posP.textContent = `📖 (${def.part_of_speech})`;
            wordDiv.appendChild(posP);

            def.collocations.forEach((colloc) => {
                const collocP = document.createElement("p");
                collocP.textContent = `🔗 ${colloc.content}`;
                wordDiv.appendChild(collocP);
            });
        });

        container.appendChild(wordDiv);
    });
}

function updatePaginationControls() {
    document.getElementById(
        "pageInfo"
    ).textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById("prevPageBtn").disabled = currentPage === 1;
    document.getElementById("nextPageBtn").disabled =
        currentPage === totalPages;
}

document.getElementById("prevPageBtn").addEventListener("click", () => {
    if (currentPage > 1) {
        fetchWords(currentPage - 1);
    }
});

document.getElementById("nextPageBtn").addEventListener("click", () => {
    if (currentPage < totalPages) {
        fetchWords(currentPage + 1);
    }
});

fetchWords();
