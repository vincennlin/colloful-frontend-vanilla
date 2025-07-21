// partOfSpeech 選項
const partOfSpeechOptions = [
    "N",
    "PRON",
    "VT",
    "VI",
    "ADV",
    "ADJ",
    "PREP",
    "CONJ",
    "DET",
    "INTERJ",
    "NUM",
    "PHR",
    "ABBR",
];

let definitionIndex = 0; // 用於唯一標識，可做進階用

// 創建 Definition 區塊
function createDefinitionBlock(def = {}, isNew = true, showAddCollocationBtn = true) {
    def = def || {};
    const defBlock = document.createElement("div");
    defBlock.classList.add("definition-block");

    if (!isNew && def.id) {
        defBlock.dataset.defId = def.id;
    }

    defBlock.setAttribute("data-def-index", definitionIndex++);

    defBlock.innerHTML = `<button type="button" class="remove-btn" onclick="removeDefinition(this)">❌</button>


        <label>Meaning</label><br />
        <input type="text" name="meaning" class="definition-meaning" value="${def.meaning || ""}" required /><br />

        <label>Part of Speech</label><br />
        <select name="part_of_speech" class="definition-pos" required>
            ${partOfSpeechOptions
                .map(
                    (pos) =>
                        `<option value="${pos}" ${
                            def.part_of_speech === pos ? "selected" : ""
                        }>${pos}</option>`
                )
                .join("")}
        </select><br />

        <div class="collocationsContainer">
            ${showAddCollocationBtn ? `<h4>Collocations</h4>` : ``}
        </div>

        ${showAddCollocationBtn ? `<button type="button" onclick="addCollocation(this)">＋ 新增搭配詞</button>` : ""}
    `;

    // 若有既有搭配詞資料，顯示
    if (def.collocations && def.collocations.length > 0) {
        const collocContainer = defBlock.querySelector(".collocationsContainer");
        def.collocations.forEach((colloc) => {
            const collocBlock = createCollocationBlock(colloc, false);
            collocContainer.appendChild(collocBlock);
        });
    }

    return defBlock;
}



// 創建 Collocation 區塊
function createCollocationBlock(colloc = {}, isNew = true) {
    const collocBlock = document.createElement("div");
    collocBlock.classList.add("collocation-block");
    if (!isNew && colloc.id) {
        collocBlock.dataset.collocId = colloc.id;
    }

    collocBlock.innerHTML = `<button type="button" class="remove-btn" onclick="removeCollocation(this)">❌</button>

        <label>Content</label><br />
        <input type="text" name="colloc_content" value="${
            colloc.content || ""
        }" required /><br />

        <label>Meaning</label><br />
        <input type="text" name="colloc_meaning" value="${
            colloc.meaning || ""
        }" /><br />

        <div class="sentencesContainer">
            <h5>Sentences</h5>
        </div>
        <button type="button" onclick="addSentence(this)">＋ 新增例句</button>
    `;

    // 如果有例句資料就加入
    if (colloc.sentences && colloc.sentences.length > 0) {
        const sentenceContainer = collocBlock.querySelector(
            ".sentencesContainer"
        );
        colloc.sentences.forEach((sent) => {
            const sentBlock = createSentenceBlock(sent, false);
            sentenceContainer.appendChild(sentBlock);
        });
    }

    return collocBlock;
}

// 創建 Sentence 區塊
function createSentenceBlock(sent = {}, isNew = true) {
    const sentBlock = document.createElement("div");
    sentBlock.classList.add("sentence-block");
    if (!isNew && sent.id) {
        sentBlock.dataset.sentenceId = sent.id;
    }

    sentBlock.innerHTML = `<button type="button" class="remove-btn" onclick="removeSentence(this)">❌</button>

        <label>Content</label><br />
        <input type="text" name="sentence_content" value="${
            sent.content || ""
        }" required /><br />

        <label>Translation</label><br />
        <input type="text" name="sentence_translation" value="${
            sent.translation || ""
        }" /><br />
    `;

    return sentBlock;
}

// 新增 Definition (會有刪除按鈕，無 id)
function addDefinition() {
    const container = document.getElementById("definitionsContainer");
    container.appendChild(createDefinitionBlock({}, true, true));
}

// 新增 Collocation (會有刪除按鈕，無 id)
function addCollocation(button) {
    const defBlock = button.closest(".definition-block");
    const collocContainer = defBlock.querySelector(".collocationsContainer");
    collocContainer.appendChild(createCollocationBlock({}, true));
}

// 新增 Sentence (會有刪除按鈕，無 id)
function addSentence(button) {
    const collocBlock = button.closest(".collocation-block");
    const sentenceContainer = collocBlock.querySelector(".sentencesContainer");
    sentenceContainer.appendChild(createSentenceBlock({}, true));
}

function removeDefinition(button) {
    const defBlock = button.closest(".definition-block");
    const defId = defBlock.dataset.defId;

    if (defId) {
        if (!confirm("確認刪除這個定義？")) return;
        fetch(`http://localhost:8080/api/v1/definitions/${defId}`, {
            method: "DELETE",
            headers: {
                Authorization: getToken(),
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("刪除失敗");
                defBlock.remove();
            })
            .catch((err) => {
                console.error(err);
                alert("刪除失敗，請稍後再試");
            });
    } else {
        defBlock.remove();
    }
}

function removeCollocation(button) {
    const collocBlock = button.closest(".collocation-block");
    const collocId = collocBlock.dataset.collocId;

    if (collocId) {
        if (!confirm("確認刪除這個搭配詞？")) return;
        fetch(`http://localhost:8080/api/v1/collocations/${collocId}`, {
            method: "DELETE",
            headers: {
                Authorization: getToken(),
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("刪除失敗");
                collocBlock.remove();
            })
            .catch((err) => {
                console.error(err);
                alert("刪除失敗，請稍後再試");
            });
    } else {
        collocBlock.remove();
    }
}

function removeSentence(button) {
    const sentBlock = button.closest(".sentence-block");
    const sentenceId = sentBlock.dataset.sentenceId;

    if (sentenceId) {
        if (!confirm("確認刪除這個例句？")) return;
        fetch(`http://localhost:8080/api/v1/sentences/${sentenceId}`, {
            method: "DELETE",
            headers: {
                Authorization: getToken(),
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("刪除失敗");
                sentBlock.remove();
            })
            .catch((err) => {
                console.error(err);
                alert("刪除失敗，請稍後再試");
            });
    } else {
        sentBlock.remove();
    }
}


// 取得所有定義資料（含巢狀搭配詞與例句）
function getAllDefinitions() {
    const definitionBlocks = document.querySelectorAll(".definition-block");
    const definitions = [];

    definitionBlocks.forEach((defBlock) => {
        const defId = defBlock.dataset.defId ? parseInt(defBlock.dataset.defId) : null;
        const meaning = defBlock.querySelector(".definition-meaning").value.trim();
        const partOfSpeech = defBlock.querySelector(".definition-pos").value;

        const collocationBlocks = defBlock.querySelectorAll(".collocation-block");
        const collocations = [];

        collocationBlocks.forEach((collocBlock) => {
            const collocId = collocBlock.dataset.collocId ? parseInt(collocBlock.dataset.collocId) : null;
            const content = collocBlock.querySelector("input[name='colloc_content']").value.trim();
            const meaning = collocBlock.querySelector("input[name='colloc_meaning']").value.trim();

            const sentenceBlocks = collocBlock.querySelectorAll(".sentence-block");
            const sentences = [];

            sentenceBlocks.forEach((sentBlock) => {
                const sentenceId = sentBlock.dataset.sentenceId ? parseInt(sentBlock.dataset.sentenceId) : null;
                const content = sentBlock.querySelector("input[name='sentence_content']").value.trim();
                const translation = sentBlock.querySelector("input[name='sentence_translation']").value.trim();

                sentences.push({
                    id: sentenceId,
                    content,
                    translation,
                });
            });

            collocations.push({
                id: collocId,
                content,
                meaning,
                sentences,
            });
        });

        definitions.push({
            id: defId,
            meaning,
            part_of_speech: partOfSpeech,
            collocations,
        });
    });

    return definitions;
}

