document.addEventListener("DOMContentLoaded", () => {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const wordId = params.get("id");

    if (wordId) {
        fetchWordDetail(wordId);
    } else {
        document.getElementById("wordDetail").textContent =
            "No word ID provided.";
    }
});

function fetchWordDetail(id) {
    const token = getToken();

    fetch(`${API_BASE}/words/${id}`, {
        headers: {
            Authorization: token,
        },
    })
        .then((res) => {
            if (!res.ok) throw new Error("Word not found");
            return res.json();
        })
        .then((data) => {
            renderWordDetail(data);
        })
        .catch((err) => {
            console.error("Error fetching word:", err);
            document.getElementById("wordDetail").textContent =
                "Error loading word.";
        });
}

function renderWordDetail(word) {
    const container = document.getElementById("wordDetail");
    container.innerHTML = "";

    const wordDiv = document.createElement("div");
    wordDiv.classList.add("word-detail-card");

    // 單字標題
    const wordTitle = document.createElement("h3");
    wordTitle.textContent = word.name;
    wordDiv.appendChild(wordTitle);

    // 每個定義
    word.definitions.forEach((def) => {
        const defP = document.createElement("p");
        defP.textContent = `📖 ${def.meaning} (${def.part_of_speech})`;
        wordDiv.appendChild(defP);

        // 每個搭配詞
        def.collocations.forEach((colloc) => {
            const collocP = document.createElement("p");
            collocP.textContent = `🔗 ${colloc.content} - ${colloc.meaning}`;
            wordDiv.appendChild(collocP);

            // 每個例句
            colloc.sentences.forEach((sent) => {
                const sentP = document.createElement("p");
                sentP.style.marginLeft = "20px";
                sentP.textContent = `📝 ${sent.content}（${sent.translation}）`;
                wordDiv.appendChild(sentP);
            });
        });
    });

    container.appendChild(wordDiv);
}
