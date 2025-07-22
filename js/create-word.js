document.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("createWordForm")
        .addEventListener("submit", handleCreateSubmit);

    const addDefinitionBtn = document.getElementById("addDefinitionBtn");
    if (addDefinitionBtn) {
        addDefinitionBtn.addEventListener("click", () => {
            addDefinition();
        });
    }

    const collofulBtn = document.getElementById("collofulBtn");
    if (collofulBtn) {
        collofulBtn.addEventListener("click", handleCollofulSubmit);
    }
});

function handleCreateSubmit(e) {
    e.preventDefault();

    const wordName = document.getElementById("wordName").value;
    const definitions = getAllDefinitions(false);

    fetch(API_BASE + "/words/details", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: getToken(),
        },
        body: JSON.stringify({ name: wordName, definitions }),
    })
        .then((res) => {
            if (!res.ok) throw new Error("Failed to create word");
            return res.json();
        })
        .then(() => {
            document.getElementById("message").textContent =
                "✅ 單字新增成功！";
            document.getElementById("message").style.color = "green";
            document.getElementById("createWordForm").reset();
            document.getElementById("definitionsContainer").innerHTML = "";
        })
        .catch((err) => {
            console.error(err);
            document.getElementById("message").textContent =
                "❌ 新增失敗，請檢查輸入內容或權限。";
            document.getElementById("message").style.color = "red";
        });
}

function handleCollofulSubmit() {
    const button = document.getElementById("collofulBtn");
    const textarea = document.getElementById("collofulInput");
    const content = textarea.value.trim();

    if (!content) {
        alert("請先貼上內容！");
        return;
    }

    // 禁用按鈕並加上 loading 樣式
    button.disabled = true;
    button.textContent = "COLLOFUL...";
    button.style.backgroundColor = "#9ca3af"; // 灰色
    button.style.cursor = "not-allowed";

    fetch("http://localhost:8080/api/v1/words/details/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: getToken(),
        },
        body: JSON.stringify({ content }),
    })
        .then((res) => {
            if (!res.ok) throw new Error("COLLOFUL 產生失敗");
            return res.json();
        })
        .then((word) => {
            window.location.href = `word-detail.html?id=${word.id}`;
        })
        .catch((err) => {
            console.error(err);
            alert("❌ COLLOFUL 產生失敗，請稍後再試");

            // 回復按鈕狀態
            button.disabled = false;
            button.textContent = "COLLOFUL!";
            button.style.backgroundColor = ""; // 回復原樣
            button.style.cursor = "";
        });
}

