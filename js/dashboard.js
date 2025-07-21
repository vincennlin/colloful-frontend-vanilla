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
            Authorization: getToken(),
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

        // 點擊跳轉
        wordDiv.addEventListener("click", (e) => {
            if (e.target.tagName.toLowerCase() !== "input") {
                window.location.href = `word-detail.html?id=${word.id}`;
            }
        });

        // Title
        const wordTitle = document.createElement("h3");
        wordTitle.textContent = word.name;
        wordDiv.appendChild(wordTitle);

        // checkbox group container
        const markContainer = document.createElement("div");
        markContainer.classList.add("mark-container");

        ["important", "mistaken", "review_today"].forEach((key) => {
            const label = document.createElement("label");
            label.classList.add("checkbox-label");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = !!word[key];
            checkbox.style.width = "20px";
            checkbox.style.height = "20px";
            checkbox.style.margin = "0"; // margin 清除，改用 CSS gap 控制間距
            checkbox.style.transform = ""; // 不要用 scale

            checkbox.addEventListener("click", async (e) => {
                e.stopPropagation(); // 不觸發整卡片的跳轉
                const updated = { [key]: checkbox.checked };

                try {
                    const res = await fetch(
                        `${API_BASE}/words/${word.id}/mark`,
                        {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: getToken(),
                            },
                            body: JSON.stringify(updated),
                        }
                    );
                    if (!res.ok) throw new Error("Update failed");
                } catch (err) {
                    alert("Failed to update word mark: " + err.message);
                }
            });

            const niceLabel = {
                important: "⭐",
                mistaken: "🙈",
                review_today: "📅",
            }[key];

            label.appendChild(checkbox);
            label.append(niceLabel);
            markContainer.appendChild(label);
        });

        wordDiv.appendChild(markContainer);

        // 定義與搭配詞
        word.definitions.forEach((def) => {
            const posP = document.createElement("p");

            const baseText = `📖 (${def.part_of_speech})`;
            posP.textContent = baseText;

            const fullText = `${baseText} ${def.meaning}`;
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

        // 複習按鈕區塊
        const reviewSection = document.createElement("div");
        reviewSection.classList.add("review-buttons");
        reviewSection.style.display = "none"; // ← 一開始先隱藏

        const reviewOptions = ["AGAIN", "HARD", "GOOD", "EASY"];
        reviewOptions.forEach((option) => {
            const btn = document.createElement("button");
            btn.textContent = option;
            btn.classList.add("review-btn");

            btn.addEventListener("click", async (e) => {
                e.stopPropagation();

                try {
                    const res = await fetch(
                        `${API_BASE}/words/${word.id}/review`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: getToken(),
                            },
                            body: JSON.stringify({ review_option: option }),
                        }
                    );

                    if (!res.ok) throw new Error("Review failed");
                } catch (err) {
                    alert("送出複習結果失敗：" + err.message);
                }
            });

            reviewSection.appendChild(btn);
        });

        wordDiv.appendChild(reviewSection);

        wordDiv.addEventListener("mouseenter", () => {
            reviewSection.style.display = "flex"; // 或 "block"
        });
        wordDiv.addEventListener("mouseleave", () => {
            reviewSection.style.display = "none";
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
