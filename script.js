const API_BASE = "http://localhost:8080/api/v1";

function login() {
    const username_or_email = document.getElementById("usernameOrEmail").value;
    const password = document.getElementById("password").value;
    const loginStatus = document.getElementById("loginStatus");

    fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username_or_email, password }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Login failed");
            }

            const token = response.headers.get("Access-Token");
            if (!token) {
                throw new Error("No token found in response header");
            }

            localStorage.setItem("jwtToken", token);
            loginStatus.textContent = "✅ Login successful!";
        })
        .catch((error) => {
            console.error(error);
            loginStatus.textContent = "❌ Login failed!";
        });
}

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
                "❌ Failed to load word. (Maybe not logged in?)";
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
