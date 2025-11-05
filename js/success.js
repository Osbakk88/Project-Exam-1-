// Simple Success page functionality
document.addEventListener("DOMContentLoaded", function () {
  // Update navigation based on login status
  updateNavigation();

  // Setup logout button
  setupLogoutButton();

  // Update cart UI (should show 0 items)
  API.Cart.updateCartUI();

  // Clear the cart after successful order
  API.Cart.clearCart();
});

function updateNavigation() {
  const authNav = document.getElementById("authNav");

  if (API.Auth.isLoggedIn()) {
    authNav.innerHTML = `
      <button class="btn btn-secondary ml-1" data-action="logout">Logout</button>
    `;
  } else {
    authNav.innerHTML = `
      <a href="login.html">Login</a>
    `;
  }
}

function setupLogoutButton() {
  const logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      API.Auth.logout();
      // Redirect to home page after logout
      window.location.href = "index.html";
    });
  }
}

// Navigation logout handler
document.addEventListener("click", function (e) {
  if (e.target.getAttribute("data-action") === "logout") {
    API.Auth.logout();
    updateNavigation();
  }
});
