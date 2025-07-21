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
        document.getElementById("wordDetail").textContent = "No word ID provided.";
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
        })
        .catch((err) => {
            console.error("Error fetching word:", err);
            document.getElementById("wordDetail").textContent = "Error loading word.";
        });
}

function renderWordDetail(word) {
    const container = document.getElementById("wordDetail");
    container.innerHTML = "";

    const wordDiv = document.createElement("div");
    wordDiv.classList.add("word-detail-card");

    const wordTitle = document.createElement("h3");
    wordTitle.textContent = word.name;
    wordDiv.appendChild(wordTitle);

    word.definitions.forEach((def) => {
        const defP = document.createElement("p");
        defP.textContent = `📖 ${def.meaning} (${def.part_of_speech})`;
        wordDiv.appendChild(defP);

        def.collocations.forEach((colloc) => {
            const collocP = document.createElement("p");
            collocP.textContent = `🔗 ${colloc.content} - ${colloc.meaning || ""}`;
            wordDiv.appendChild(collocP);

            colloc.sentences.forEach((sent) => {
                const sentP = document.createElement("p");
                sentP.style.marginLeft = "20px";
                sentP.textContent = `📝 ${sent.content}（${sent.translation || ""}）`;
                wordDiv.appendChild(sentP);
            });
        });
    });

    container.appendChild(wordDiv);
    document.getElementById("wordName").value = word.name;
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
            const confirmed = confirm("確定要刪除這個單字嗎？這個動作無法復原。");
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
  document.getElementById("newDefinitionsContainer").addEventListener("click", (e) => {
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
            collocations: [] // 不包含搭配詞
        };
    });

    fetch(`http://localhost:8080/api/v1/words/${wordId}/details`, {
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
