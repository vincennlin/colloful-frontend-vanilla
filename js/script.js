function loadWord() {
    const wordId = document.getElementById("wordIdInput").value;
    const container = document.getElementById("wordContainer");
    container.innerHTML = "Loading...";

    const token = localStorage.getItem("jwtToken");
    if (!token) {
        container.innerHTML = "❌ You must login first.";
        return;
    }

    fetch(`${API_BASE}/words/${wordId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then((response) => {
            if (!response.ok) throw new Error("Unauthorized or not found");
            return response.json();
        })
        .then((data) => {
            renderWord(data);
        })
        .catch((error) => {
            container.innerHTML =
                "❌ Failed to load word.";
            console.error(error);
        });
}

function renderWord(word) {
    const container = document.getElementById("wordContainer");
    container.innerHTML = `
        <h2>${word.name}</h2>
        <p><strong>User ID:</strong> ${word.user_id}</p>
    `;

    word.definitions.forEach((def) => {
        const defElem = document.createElement("div");
        defElem.className = "definition";
        defElem.innerHTML = `
            <h3>Definition: ${def.meaning}</h3>
            <p>Part of Speech: ${def.part_of_speech}</p>
        `;

        def.collocations.forEach((col) => {
            const colElem = document.createElement("div");
            colElem.className = "collocation";
            colElem.innerHTML = `
                <p><strong>Collocation:</strong> ${col.content}</p>
                <p>${col.meaning}</p>
            `;

            col.sentences.forEach((sent) => {
                const sentElem = document.createElement("div");
                sentElem.className = "sentence";
                sentElem.innerHTML = `
                    <p>${sent.content}</p>
                    <p><em>${sent.translation}</em></p>
                `;
                colElem.appendChild(sentElem);
            });

            defElem.appendChild(colElem);
        });

        container.appendChild(defElem);
    });
}
