// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem("token") !== null;
}

// Save token to localStorage
function saveToken(token, username) {
  localStorage.setItem("token", token);
  localStorage.setItem("username", username);
}

// Remove token from localStorage
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.href = "index.html";
}

// Add token to fetch requests
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// Handle login form submission
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      saveToken(data.token, data.user.username);
      window.location.href = "view-all-shopping-lists.html";
    } else {
      alert(data.error || "Login failed");
    }
  } catch (error) {
    alert("An error occurred during login");
  }
});

// Handle registration form submission
document
  .getElementById("registerForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;

    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        saveToken(data.token, data.user.username);
        window.location.href = "view-all-shopping-lists.html";
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (error) {
      alert("An error occurred during registration");
    }
  });

// Update navigation based on authentication status
function updateNavigation() {
  const nav = document.querySelector("nav .container");
  if (!nav) return;

  const currentPage = window.location.pathname.split("/").pop();
  const username = localStorage.getItem("username");

  if (isLoggedIn()) {
    nav.innerHTML = `
      <a class="navbar-brand" href="view-all-shopping-lists.html">Groceries</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <a class="nav-link" href="view-all-shopping-lists.html">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="add-shopping-list.html">Add Shopping List</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="add-grocery-item.html">Add Grocery Item</a>
          </li>
        </ul>
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" href="settings.html">
              <img src="imgs/profile-user.svg" alt="Profile" style="width: 20px; height: 20px; margin-right: 5px;">
              ${username}
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" onclick="logout()">Logout</a>
          </li>
        </ul>
      </div>
    `;
  } else {
    // For login and register pages, show appropriate navigation
    if (currentPage === "login.html") {
      nav.innerHTML = `
        <a class="navbar-brand" href="index.html">Groceries</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link active" href="login.html">Login</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="register.html">Register</a>
            </li>
          </ul>
        </div>
      `;
    } else if (currentPage === "register.html") {
      nav.innerHTML = `
        <a class="navbar-brand" href="index.html">Groceries</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link" href="login.html">Login</a>
            </li>
            <li class="nav-item">
              <a class="nav-link active" href="register.html">Register</a>
            </li>
          </ul>
        </div>
      `;
    } else {
      nav.innerHTML = `
        <a class="navbar-brand" href="index.html">Groceries</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link" href="login.html">Login</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="register.html">Register</a>
            </li>
          </ul>
        </div>
      `;
    }
  }
}

// Update navigation when page loads
document.addEventListener("DOMContentLoaded", updateNavigation);
