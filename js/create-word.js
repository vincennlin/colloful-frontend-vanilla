document.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("createWordForm")
        .addEventListener("submit", handleCreateSubmit);

    const addDefinitionBtn = document.getElementById("addDefinitionBtn");
    if (addDefinitionBtn) {
        addDefinitionBtn.addEventListener("click", () => {
            addDefinition(); // 這裡呼叫 definition-form.js 裡的 addDefinition 函式
        });
    }
});

function handleCreateSubmit(e) {
    e.preventDefault();

    const wordName = document.getElementById("wordName").value;
    const definitions = getAllDefinitions(false); // false 表示不包含 id

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
