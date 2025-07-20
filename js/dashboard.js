document.addEventListener("DOMContentLoaded", () => {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    fetchWords();
});

let currentWordList = [];
let currentPage = 1;
const pageSize = 9;

function fetchWords() {
    const token = localStorage.getItem("jwtToken");
    fetch(`${API_BASE}/words`, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + token,
        },
    })
        .then((res) => res.json())
        .then((data) => {
            currentWordList = data.content;
            currentPage = 1;
            displayWords(currentWordList, currentPage);
        })
        .catch((err) => {
            console.error("Failed to fetch words:", err);
        });
}

function displayWords(words, page = 1) {
    const container = document.getElementById("wordList");
    container.innerHTML = "";

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageWords = words.slice(startIndex, endIndex);

    pageWords.forEach((word) => {
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

    updatePaginationControls(words.length);
}

function updatePaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / pageSize);

    document.getElementById(
        "pageInfo"
    ).textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById("prevPageBtn").disabled = currentPage === 1;
    document.getElementById("nextPageBtn").disabled =
        currentPage === totalPages;
}

document.getElementById("prevPageBtn").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        displayWords(currentWordList, currentPage);
    }
});

document.getElementById("nextPageBtn").addEventListener("click", () => {
    const totalPages = Math.ceil(currentWordList.length / pageSize);
    if (currentPage < totalPages) {
        currentPage++;
        displayWords(currentWordList, currentPage);
    }
});
