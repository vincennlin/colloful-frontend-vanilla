const API_BASE = "http://localhost:8080/api/v1";

function saveToken(token) {
    localStorage.setItem("jwtToken", token);
}

function getToken() {
    return "Bearer " + localStorage.getItem("jwtToken");
}

function logout() {
    localStorage.removeItem("jwtToken");
    window.location.href = "login.html";
}

function isLoggedIn() {
    return !!getToken();
}
