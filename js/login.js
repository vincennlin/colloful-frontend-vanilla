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

            saveToken(token);
            loginStatus.textContent = "✅ Login successful! Redirecting...";
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        })
        .catch((error) => {
            console.error(error);
            loginStatus.textContent = "❌ Login failed!";
        });
}
