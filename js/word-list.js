document.addEventListener("DOMContentLoaded", () => {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    const urlPath = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const searchName = urlParams.get("name");
    const isReviewPage = urlPath.includes("review.html");
    const isSearchPage = urlPath.includes("search-word.html");

    const pageSize = 9;
    let currentPage = 1;
    let totalPages = 1;

    const fetchFn = (pageNo) => {
        let url;
        if (isReviewPage) {
            url = `${API_BASE}/words/review?pageNo=${
                pageNo - 1
            }&pageSize=${pageSize}`;
        } else if (isSearchPage && searchName) {
            url = `${API_BASE}/words/search?name=${encodeURIComponent(
                searchName
            )}&pageNo=${pageNo - 1}&pageSize=${pageSize}`;
        } else {
            url = `${API_BASE}/words?pageNo=${pageNo - 1}&pageSize=${pageSize}`;
        }

        return fetch(url, {
            headers: {
                Authorization: getToken(),
            },
        }).then((res) => res.json());
    };

    fetchAndDisplay(currentPage);

    function fetchAndDisplay(pageNo) {
        fetchFn(pageNo)
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

            wordDiv.addEventListener("click", (e) => {
                if (
                    !["input", "button"].includes(
                        e.target.tagName.toLowerCase()
                    )
                ) {
                    window.location.href = `word-detail.html?id=${word.id}`;
                }
            });

            const wordTitle = document.createElement("h3");
            wordTitle.textContent = word.name;
            wordDiv.appendChild(wordTitle);

            // checkbox mark container
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
                checkbox.style.margin = "0";

                checkbox.addEventListener("click", async (e) => {
                    e.stopPropagation();
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

            let hasHoveredInside = false;

            word.definitions.forEach((def) => {
                const posP = document.createElement("p");

                const baseText = `📖 (${def.part_of_speech})`;
                posP.textContent = baseText;

                const fullText = `${baseText} ${def.meaning}`;
                posP.dataset.base = baseText;
                posP.dataset.full = fullText;

                // 每個 definition 的文字都 append 到 wordDiv
                wordDiv.appendChild(posP);

                def.collocations.forEach((colloc) => {
                    const collocP = document.createElement("p");
                    collocP.textContent = `🔗 ${colloc.content}`;
                    collocP.classList.add("collocation-text");
                    wordDiv.appendChild(collocP);
                });
            });

            // 為整個 wordDiv 加上事件監聽
            wordDiv.addEventListener("mousemove", () => {
                hasHoveredInside = true;
                wordDiv.querySelectorAll("p").forEach((p) => {
                    if (p.dataset.full) {
                        p.textContent = p.dataset.full;
                    }
                });
            });

            wordDiv.addEventListener("mouseleave", () => {
                if (hasHoveredInside) {
                    wordDiv.querySelectorAll("p").forEach((p) => {
                        if (p.dataset.base) {
                            p.textContent = p.dataset.base;
                        }
                    });
                }
            });


            // Review buttons
            const reviewSection = document.createElement("div");
            reviewSection.classList.add("review-buttons");
            reviewSection.style.display = isReviewPage ? "flex" : "none";

            ["AGAIN", "HARD", "GOOD", "EASY"].forEach((option) => {
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

                        if (isReviewPage) wordDiv.remove();
                    } catch (err) {
                        alert("送出複習結果失敗：" + err.message);
                    }
                });

                reviewSection.appendChild(btn);
            });

            wordDiv.appendChild(reviewSection);

            if (!isReviewPage) {
                wordDiv.addEventListener("mouseenter", () => {
                    reviewSection.style.display = "flex";
                });
                wordDiv.addEventListener("mouseleave", () => {
                    reviewSection.style.display = "none";
                });
            }

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

        document.getElementById("prevPageBtn").onclick = () => {
            if (currentPage > 1) fetchAndDisplay(currentPage - 1);
        };
        document.getElementById("nextPageBtn").onclick = () => {
            if (currentPage < totalPages) fetchAndDisplay(currentPage + 1);
        };
    }
});
