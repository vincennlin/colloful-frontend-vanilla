document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const wordId = params.get("id");
    if (!wordId) {
        alert("無效的單字ID");
        return;
    }

    // 載入現有單字資料
    await loadWordDetails(wordId);

    // 綁定按鈕事件（注意id改成editWordForm）
    document
        .getElementById("editWordForm")
        .addEventListener("submit", (e) => {
            e.preventDefault();
            submitUpdate(wordId);
        });

    document
        .getElementById("addDefinitionBtn")
        .addEventListener("click", () => {
            addDefinition();
        });
});


async function loadWordDetails(wordId) {
    const res = await fetch(`http://localhost:8080/api/v1/words/${wordId}`, {
        headers: {
            Authorization: getToken(),
        },
    });
    if (!res.ok) {
        alert("載入失敗");
        return;
    }
    const word = await res.json();

    // 填入單字名稱
    document.getElementById("wordName").value = word.name;

    // 填入定義區塊
    const defContainer = document.getElementById("definitionsContainer");
    defContainer.innerHTML = "";
    word.definitions.forEach((def) => {
        const defBlock = createDefinitionBlock(def, false, true); // false表示已有id，不顯示刪除
        defContainer.appendChild(defBlock);
    });
}

function submitUpdate(wordId) {
    const wordName = document.getElementById("wordName").value;
    const definitions = getDefinitionsFromDOM();

    fetch(`http://localhost:8080/api/v1/words/${wordId}/details`, {
        method: "PUT",
        headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id: Number(wordId),
            name: wordName,
            definitions,
        }),
    })
        .then((res) => {
            if (!res.ok) throw new Error("更新失敗");
            return res.json();
        })
        .then((data) => {
            alert("更新成功！");
            window.location.href = `word-detail.html?id=${wordId}`;
        })
        .catch((err) => {
            console.error(err);
            alert("更新失敗，請稍後再試");
        });
}


// 從 DOM 取出所有 definitions 的資料（包含 id），回傳陣列
function getDefinitionsFromDOM() {
    const defBlocks = document.querySelectorAll(
        "#definitionsContainer > .definition-block"
    );
    const definitions = [];

    defBlocks.forEach((defBlock) => {
        const defObj = {};

        // id（存在就取，新增的可能沒）
        if (defBlock.dataset.defId) defObj.id = Number(defBlock.dataset.defId);

        defObj.meaning = defBlock
            .querySelector('input[name="meaning"]')
            .value.trim();
        defObj.part_of_speech = defBlock.querySelector(
            'select[name="part_of_speech"]'
        ).value;

        // 你可依需求改成你的後端欄位名稱：word_name
        defObj.word_name = document.getElementById("wordName").value;

        // 取搭配詞
        defObj.collocations = [];
        const collocBlocks = defBlock.querySelectorAll(".collocation-block");
        collocBlocks.forEach((collocBlock) => {
            const collocObj = {};
            if (collocBlock.dataset.collocId)
                collocObj.id = Number(collocBlock.dataset.collocId);

            collocObj.content = collocBlock
                .querySelector('input[name="colloc_content"]')
                .value.trim();
            collocObj.meaning = collocBlock
                .querySelector('input[name="colloc_meaning"]')
                .value.trim();

            // 取例句
            collocObj.sentences = [];
            const sentenceBlocks =
                collocBlock.querySelectorAll(".sentence-block");
            sentenceBlocks.forEach((sentenceBlock) => {
                const sentObj = {};
                if (sentenceBlock.dataset.sentenceId)
                    sentObj.id = Number(sentenceBlock.dataset.sentenceId);

                sentObj.content = sentenceBlock
                    .querySelector('input[name="sentence_content"]')
                    .value.trim();
                sentObj.translation = sentenceBlock
                    .querySelector('input[name="sentence_translation"]')
                    .value.trim();

                collocObj.sentences.push(sentObj);
            });

            defObj.collocations.push(collocObj);
        });

        definitions.push(defObj);
    });

    return definitions;
}
