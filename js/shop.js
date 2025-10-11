// Shop page functionality
let allProducts = [];
let filteredProducts = [];

document.addEventListener("DOMContentLoaded", async function () {
  // Update navigation based on login status
  updateNavigation();

  // Load products
  await loadProducts();

  // Setup search and filter functionality
  setupFilters();
});

function updateNavigation() {
  const authNav = document.getElementById("authNav");

  if (API.Auth.isLoggedIn()) {
    const user = API.Auth.getCurrentUser();
    authNav.innerHTML = `
      <span>Welcome, ${user.name}!</span>
      <button class="btn btn-secondary ml-1" data-action="logout">Logout</button>
    `;
  } else {
    authNav.innerHTML = `
      <a href="login.html">Login</a>
    `;
  }
}

async function loadProducts() {
  const container = document.getElementById("productsContainer");
  API.UI.showLoading(container);

  try {
    console.log("Loading products...");
    const result = await API.Shop.getProducts();
    console.log("Products result:", result);

    if (result.success) {
      // Handle different API response structures
      let products = result.data;

      // Check if data is nested (common in APIs)
      if (
        products &&
        typeof products === "object" &&
        !Array.isArray(products)
      ) {
        // Try common nested structures
        if (products.data && Array.isArray(products.data)) {
          products = products.data;
        } else if (products.products && Array.isArray(products.products)) {
          products = products.products;
        } else if (products.items && Array.isArray(products.items)) {
          products = products.items;
        }
      }

      // Ensure we have an array
      if (!Array.isArray(products)) {
        console.error("API returned non-array data:", products);
        throw new Error(
          "Invalid API response format - expected array of products"
        );
      }

      allProducts = products;
      filteredProducts = [...allProducts];
      displayProducts(filteredProducts);
      console.log(`Successfully loaded ${allProducts.length} products`);
    } else {
      console.error("API returned error:", result.error);
      API.UI.showError(container, result.error);
    }
  } catch (error) {
    console.error("Error loading products:", error);
    API.UI.showError(container, `Failed to load products: ${error.message}`);
  }
}

function displayProducts(products) {
  const container = document.getElementById("productsContainer");

  // Ensure products is an array
  if (!Array.isArray(products)) {
    console.error("displayProducts received non-array:", products);
    API.UI.showError(container, "Invalid product data format");
    return;
  }

  if (products.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No products found</h3>
        <p>Try adjusting your search or filters.</p>
      </div>
    `;
    return;
  }

  // Clear container
  container.innerHTML = "";

  // Append each product card (now DOM elements, not HTML strings)
  products.forEach((product) => {
    const productCard = API.UI.createProductCard(product);
    container.appendChild(productCard);
  });
}

function setupFilters() {
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");

  // Search functionality
  searchInput.addEventListener("input", function (e) {
    const searchTerm = e.target.value.toLowerCase();

    // Ensure allProducts is an array before filtering
    if (!Array.isArray(allProducts)) {
      console.error("allProducts is not an array:", allProducts);
      return;
    }

    filteredProducts = allProducts.filter(
      (product) =>
        product.title?.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm)
    );
    applySorting();
    displayProducts(filteredProducts);
  });

  // Sort functionality
  sortSelect.addEventListener("change", function (e) {
    applySorting();
    displayProducts(filteredProducts);
  });
}

function applySorting() {
  const sortValue = document.getElementById("sortSelect").value;

  if (!sortValue) return;

  // Ensure filteredProducts is an array before sorting
  if (!Array.isArray(filteredProducts)) {
    console.error("filteredProducts is not an array:", filteredProducts);
    return;
  }

  const [field, direction] = sortValue.split("-");

  filteredProducts.sort((a, b) => {
    let aVal, bVal;

    if (field === "title") {
      aVal = a.title.toLowerCase();
      bVal = b.title.toLowerCase();
    } else if (field === "price") {
      aVal = a.discountedPrice || a.price;
      bVal = b.discountedPrice || b.price;
    }

    if (direction === "asc") {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });
}

// Handle logout button with document listener (only for navigation)
document.addEventListener("click", function (e) {
  if (e.target.getAttribute("data-action") === "logout") {
    API.Auth.logout();
    return;
  }
});

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 4000);
}

// Make showNotification available globally for API.js
window.showNotification = showNotification;
