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

let definitionIndex = 0;

function addDefinition() {
    const container = document.getElementById("definitionsContainer");
    const defId = `definition-${definitionIndex}`;

    const defBlock = document.createElement("div");
    defBlock.classList.add("definition-block");
    defBlock.setAttribute("data-def-index", definitionIndex);

    defBlock.innerHTML = `
<button type="button" class="remove-btn" onclick="removeDefinition(this)">❌</button>
<label>Meaning</label><br />
<input type="text" name="meaning" required /><br />

<label>Part of Speech</label><br />
<select name="part_of_speech" required>
${partOfSpeechOptions
    .map((pos) => `<option value="${pos}">${pos}</option>`)
    .join("")}
</select><br />

<div class="collocationsContainer">
<h4>Collocations</h4>
</div>
<button type="button" onclick="addCollocation(this)">＋ 新增搭配詞</button>
`;

    container.appendChild(defBlock);
    definitionIndex++;
}

function addCollocation(button) {
    const defBlock = button.closest(".definition-block");
    const collocationsContainer = defBlock.querySelector(
        ".collocationsContainer"
    );

    const collocBlock = document.createElement("div");
    collocBlock.classList.add("collocation-block");

    collocBlock.innerHTML = `
<button type="button" class="remove-btn" onclick="removeCollocation(this)">❌</button>
<label>Content</label><br />
<input type="text" name="colloc_content" required /><br />

<label>Meaning</label><br />
<input type="text" name="colloc_meaning" /><br />

<div class="sentencesContainer">
<h5>Sentences</h5>
</div>
<button type="button" onclick="addSentence(this)">＋ 新增例句</button>
`;

    collocationsContainer.appendChild(collocBlock);
}

function addSentence(button) {
    const collocBlock = button.closest(".collocation-block");
    const sentencesContainer = collocBlock.querySelector(".sentencesContainer");

    const sentenceBlock = document.createElement("div");
    sentenceBlock.classList.add("sentence-block");

    sentenceBlock.innerHTML = `
      <button type="button" class="remove-btn" onclick="removeSentence(this)">❌</button>
      <label>Content</label><br />
      <input type="text" name="sentence_content" required /><br />

      <label>Translation</label><br />
      <input type="text" name="sentence_translation" /><br />
    `;

    sentencesContainer.appendChild(sentenceBlock);
}

function removeDefinition(button) {
    const block = button.closest(".definition-block");
    block.remove();
}

function removeCollocation(button) {
    const block = button.closest(".collocation-block");
    block.remove();
}

function removeSentence(button) {
    const block = button.closest(".sentence-block");
    block.remove();
}

document
    .getElementById("createWordForm")
    .addEventListener("submit", function (e) {
        e.preventDefault();

        const token = localStorage.getItem("jwtToken");
        const wordName = document.getElementById("wordName").value;

        const definitions = [];
        document.querySelectorAll(".definition-block").forEach((defBlock) => {
            const meaning = defBlock.querySelector(
                'input[name="meaning"]'
            ).value;
            const partOfSpeech = defBlock.querySelector(
                'select[name="part_of_speech"]'
            ).value;

            const collocations = [];
            defBlock
                .querySelectorAll(".collocation-block")
                .forEach((collocBlock) => {
                    const content = collocBlock.querySelector(
                        'input[name="colloc_content"]'
                    ).value;
                    const collocMeaning = collocBlock.querySelector(
                        'input[name="colloc_meaning"]'
                    ).value;

                    const sentences = [];
                    collocBlock
                        .querySelectorAll(".sentence-block")
                        .forEach((sentenceBlock) => {
                            const sentenceContent = sentenceBlock.querySelector(
                                'input[name="sentence_content"]'
                            ).value;
                            const sentenceTranslation =
                                sentenceBlock.querySelector(
                                    'input[name="sentence_translation"]'
                                ).value;
                            sentences.push({
                                content: sentenceContent,
                                translation: sentenceTranslation,
                            });
                        });

                    collocations.push({
                        content,
                        meaning: collocMeaning,
                        sentences,
                    });
                });

            definitions.push({
                meaning,
                part_of_speech: partOfSpeech,
                collocations,
            });
        });

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
            .then((data) => {
                document.getElementById("message").textContent =
                    "✅ 單字新增成功！";
                document.getElementById("message").style.color = "green";
                document.getElementById("createWordForm").reset();
                document.getElementById("definitionsContainer").innerHTML = "";
                definitionIndex = 0;
            })
            .catch((err) => {
                console.error(err);
                document.getElementById("message").textContent =
                    "❌ 新增失敗，請檢查輸入內容或權限。";
                document.getElementById("message").style.color = "red";
            });
    });
