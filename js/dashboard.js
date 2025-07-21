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
        wordDiv.style.position = "relative"; // 為右上角標記定位

        // 點擊跳轉 detail 頁面（避免點到 checkbox 也觸發）
        wordDiv.addEventListener("click", (e) => {
            if (e.target.type !== "checkbox") {
                window.location.href = `word-detail.html?id=${word.id}`;
            }
        });

        // 👉 標記區塊：important, mistaken, review_today
        const markContainer = document.createElement("div");
        markContainer.style.position = "absolute";
        markContainer.style.top = "10px";
        markContainer.style.right = "10px";
        markContainer.style.display = "flex";
        markContainer.style.gap = "4px";

        const marks = [
            { key: "important", label: "⭐" },
            { key: "mistaken", label: "❗" },
            { key: "review_today", label: "🔁" }
        ];

        marks.forEach(({ key, label }) => {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.title = key;
            checkbox.checked = word[key];

            checkbox.addEventListener("change", async () => {
                try {
                    const res = await fetch(`${API_BASE}/words/${word.id}/mark`, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: getToken(),
                        },
                        body: JSON.stringify({
                            [key]: checkbox.checked,
                        }),
                    });

                    if (!res.ok) throw new Error("更新失敗");
                } catch (err) {
                    alert(`更新 ${key} 失敗：${err.message}`);
                    checkbox.checked = !checkbox.checked; // 還原
                }
            });

            const labelEl = document.createElement("label");
            labelEl.appendChild(checkbox);
            labelEl.appendChild(document.createTextNode(label));
            labelEl.style.cursor = "pointer";
            labelEl.style.fontSize = "14px";

            markContainer.appendChild(labelEl);
        });

        wordDiv.appendChild(markContainer);

        // 單字名稱
        const wordTitle = document.createElement("h3");
        wordTitle.textContent = word.name;
        wordDiv.appendChild(wordTitle);

        // 定義 + 搭配詞
        word.definitions.forEach((def) => {
            const posP = document.createElement("p");
            const baseText = `📖 (${def.part_of_speech})`;
            const fullText = `${baseText} ${def.meaning}`;

            posP.textContent = baseText;
            posP.dataset.base = baseText;
            posP.dataset.full = fullText;

            wordDiv.addEventListener("mouseenter", () => {
                posP.textContent = posP.dataset.full;
            });
            wordDiv.addEventListener("mouseleave", () => {
                posP.textContent = posP.dataset.base;
            });

            wordDiv.appendChild(posP);

            def.collocations.forEach((colloc) => {
                const collocP = document.createElement("p");
                collocP.textContent = `🔗 ${colloc.content}`;
                collocP.classList.add("collocation-text");
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
