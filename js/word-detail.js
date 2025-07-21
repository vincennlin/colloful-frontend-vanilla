document.addEventListener("DOMContentLoaded", () => {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const wordId = params.get("id");

    if (wordId) {
        fetchWordDetail(wordId);
        setupEditButton(wordId);
    } else {
        document.getElementById("wordDetail").textContent =
            "No word ID provided.";
    }
});

document.getElementById("backBtn").addEventListener("click", () => {
    location.href = "dashboard.html";
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
            renderReviewProgress(data); // 👈 這會畫出 review 區塊
        })
        .catch((err) => {
            console.error("Error fetching word:", err);
            document.getElementById("wordDetail").textContent =
                "Error loading word.";
        });
}

function updateMark(wordId, field, value) {
    fetch(`${API_BASE}/words/${wordId}/mark`, {
        method: "PATCH",
        headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            [field]: value,
        }),
    })
        .then((res) => {
            if (!res.ok) throw new Error("更新標記失敗");
        })
        .catch((err) => {
            console.error("標記更新失敗：", err);
            alert("更新標記時發生錯誤");
        });
}

function renderWordDetail(word) {
    const container = document.getElementById("wordDetail");
    container.innerHTML = "";

    const wordDiv = document.createElement("div");
    wordDiv.classList.add("word-detail-card");

    const wordTitle = document.createElement("h3");
    wordTitle.textContent = word.name;

    const markContainer = document.createElement("div");
    markContainer.style.position = "absolute";
    markContainer.style.top = "10px";
    markContainer.style.right = "10px";
    markContainer.style.display = "flex";
    markContainer.style.gap = "12px";

    const emojiMap = {
        important: "⭐",
        mistaken: "🙈",
        review_today: "📅",
    };

    Object.entries(emojiMap).forEach(([key, emoji]) => {
        const label = document.createElement("label");
        label.style.display = "flex";
        label.style.flexDirection = "row";
        label.style.alignItems = "center";
        label.style.fontSize = "20px";
        label.style.cursor = "pointer";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = !!word[key];
        checkbox.style.width = "20px";
        checkbox.style.height = "20px";
        checkbox.style.marginRight = "6px";

        checkbox.addEventListener("click", (e) => {
            e.stopPropagation();
            updateMark(word.id, key, checkbox.checked);
        });

        label.appendChild(checkbox);
        label.append(emoji);
        markContainer.appendChild(label);
    });

    // ✅ 包裝 word title + 標記
    const wordHeader = document.createElement("div");
    wordHeader.style.position = "relative";
    wordHeader.appendChild(wordTitle);
    wordHeader.appendChild(markContainer);
    wordDiv.appendChild(wordHeader);

    word.definitions.forEach((def) => {
        const defContainer = document.createElement("div");
        defContainer.style.display = "flex";
        defContainer.style.alignItems = "center";
        defContainer.style.marginBottom = "8px";

        const defP = document.createElement("p");
        defP.textContent = `📖 ${def.meaning} (${def.part_of_speech})`;
        defP.style.flexGrow = "1";

        const genBtn = document.createElement("button");
        genBtn.textContent = "COLLOFUL!";
        genBtn.style.marginLeft = "12px";
        genBtn.type = "button";

        genBtn.addEventListener("click", async () => {
            try {
                const originalText = genBtn.textContent;
                genBtn.textContent = "COLLOFULING...";
                genBtn.disabled = true;

                const token = getToken();
                const res = await fetch(
                    `${API_BASE}/definitions/${def.id}/collocations/generate`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: token,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!res.ok) {
                    throw new Error(`生成失敗，狀態碼: ${res.status}`);
                }

                alert("COLLOFUL! 搭配詞生成成功！");
                location.reload();
            } catch (err) {
                console.error(err);
                alert("搭配詞生成失敗，請稍後再試");
            } finally {
                genBtn.textContent = "COLLOFUL!";
                genBtn.disabled = false;
            }
        });

        defContainer.appendChild(defP);
        defContainer.appendChild(genBtn);
        wordDiv.appendChild(defContainer);

        def.collocations.forEach((colloc) => {
            const collocP = document.createElement("p");
            collocP.textContent = `🔗 ${colloc.content} - ${
                colloc.meaning || ""
            }`;
            wordDiv.appendChild(collocP);

            colloc.sentences.forEach((sent) => {
                const sentP = document.createElement("p");
                sentP.style.marginLeft = "20px";
                sentP.textContent = `📝 ${sent.content}（${
                    sent.translation || ""
                }）`;
                wordDiv.appendChild(sentP);
            });
        });
    });

    container.appendChild(wordDiv);
    document.getElementById("wordName").value = word.name;
}

function renderReviewProgress(word) {
    const reviewBox = document.createElement("div");
    reviewBox.style.marginTop = "20px";
    reviewBox.style.border = "1px solid #ccc";
    reviewBox.style.borderRadius = "8px";
    reviewBox.style.padding = "12px";
    reviewBox.style.backgroundColor = "#f9f9f9";

    const title = document.createElement("h3");
    title.textContent = "📅 複習進度";
    reviewBox.appendChild(title);

    const infoList = document.createElement("ul");
    infoList.style.listStyle = "none";
    infoList.style.padding = "0";

    const addInfoItem = (label, value) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${label}：</strong> ${value ?? "（尚未紀錄）"}`;
        infoList.appendChild(li);
    };

    addInfoItem("目前階段", word.review_level);
    addInfoItem("間隔天數", word.review_interval);
    addInfoItem(
        "上次複習",
        word.last_reviewed
            ? new Date(word.last_reviewed).toLocaleString()
            : null
    );
    addInfoItem(
        "下次複習",
        word.next_review ? new Date(word.next_review).toLocaleString() : null
    );

    reviewBox.appendChild(infoList);

    const container = document.getElementById("reviewCardContainer");
    container.innerHTML = ""; // 清空舊的內容
    container.appendChild(reviewBox); // 插入複習區塊

}

function setupEditButton(wordId) {
    const editBtn = document.getElementById("editWordBtn");
    if (editBtn) {
        editBtn.addEventListener("click", () => {
            window.location.href = `update-word.html?id=${wordId}`;
        });
    }

    const deleteBtn = document.getElementById("deleteWordBtn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            const confirmed = confirm(
                "確定要刪除這個單字嗎？這個動作無法復原。"
            );
            if (confirmed) {
                deleteWord(wordId);
            }
        });
    }
}

function deleteWord(wordId) {
    const token = getToken();

    fetch(`${API_BASE}/words/${wordId}`, {
        method: "DELETE",
        headers: {
            Authorization: token,
        },
    })
        .then((res) => {
            if (!res.ok) throw new Error("Failed to delete word");
            alert("刪除成功！");
            window.location.href = "dashboard.html";
        })
        .catch((err) => {
            console.error("Error deleting word:", err);
            alert("刪除失敗，請稍後再試！");
        });
}

function addDefinitionToDetail() {
    const container = document.getElementById("newDefinitionsContainer");
    const defBlock = createDefinitionBlock(null, true, false); // 沒新增搭配詞按鈕
    container.appendChild(defBlock);
    updateSubmitButtonVisibility();
}

// 事件代理監聽刪除按鈕
document
    .getElementById("newDefinitionsContainer")
    .addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-btn")) {
            e.target.closest(".definition-block").remove();
            updateSubmitButtonVisibility();
        }
    });

function updateSubmitButtonVisibility() {
    const container = document.getElementById("newDefinitionsContainer");
    const submitBtn = document.getElementById("submitNewDefinitionsBtn");
    const hasDefs = container.querySelectorAll(".definition-block").length > 0;
    submitBtn.style.display = hasDefs ? "inline-block" : "none";
}

function submitNewDefinitions() {
    const params = new URLSearchParams(window.location.search);
    const wordId = params.get("id");
    if (!wordId) return alert("找不到單字 ID");

    const wordName = document.getElementById("wordName").value;

    const container = document.getElementById("newDefinitionsContainer");
    const defBlocks = container.querySelectorAll(".definition-block");

    const newDefs = Array.from(defBlocks).map((defDiv) => {
        const meaning = defDiv.querySelector(".definition-meaning").value;
        const pos = defDiv.querySelector(".definition-pos").value;

        return {
            meaning,
            part_of_speech: pos,
            collocations: [], // 不包含搭配詞
        };
    });

    fetch(`${API_BASE}/words/${wordId}/details`, {
        method: "PUT",
        headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id: Number(wordId),
            name: wordName, // ✅ 加上這行！
            definitions: newDefs,
        }),
    })
        .then((res) => {
            if (!res.ok) throw new Error("更新失敗");
            return res.json();
        })
        .then(() => {
            alert("新增定義成功！");
            window.location.href = `word-detail.html?id=${wordId}`;
        })
        .catch((err) => {
            console.error(err);
            alert("新增定義失敗，請稍後再試！");
        });
}
