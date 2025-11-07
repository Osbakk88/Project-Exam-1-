// Product Page JavaScript
let currentProduct = null;

document.addEventListener("DOMContentLoaded", async function () {
  // Update navigation based on login status
  updateNavigation();

  // Get product ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (productId) {
    await loadProduct(productId);
  } else {
    showError("No product ID specified");
  }

  // Note: Event listeners are now attached directly to buttons in displayProduct()
});

// Removed setupEventListeners() - now using direct button listeners

function updateNavigation() {
  const authNav = document.getElementById("authNav");

  if (API.Auth.isLoggedIn()) {
    const logoutBtn = document.createElement("button");
    logoutBtn.className = "btn btn-secondary margin-left";
    logoutBtn.textContent = "Logout";
    logoutBtn.addEventListener("click", function () {
      API.Auth.logout();
    });

    authNav.innerHTML = "";
    authNav.appendChild(logoutBtn);
  } else {
    authNav.innerHTML = `
      <a href="account/login.html">Login</a>
    `;
  }
}

async function loadProduct(productId) {
  try {
    const result = await API.Shop.getProduct(productId);

    if (result.success) {
      // The API returns {data: productObject, meta: {...}}, so we need result.data.data
      currentProduct = result.data.data || result.data;
      displayProduct(currentProduct);

      // Update page title
      document.title = `${currentProduct.title} - Online Shop`;
    } else {
      showError(result.error);
    }
  } catch (error) {
    showError("Failed to load product details");
    console.error("Error loading product:", error);
  }
}

function displayProduct(product) {
  // Update product image
  const productImage = document.getElementById("productImage");
  if (productImage) {
    productImage.src =
      product.image?.url || product.image || "/api/placeholder/400/400";
    productImage.alt = product.title || "Product image";
    productImage.onerror = function () {
      this.src = "/api/placeholder/400/400";
    };
  }

  // Update product title
  const productTitle = document.getElementById("productTitle");
  if (productTitle) {
    productTitle.textContent = product.title || "Product Name";
  }

  // Update product price
  const productPrice = document.getElementById("productPrice");
  if (productPrice) {
    const price =
      product.discountedPrice && product.discountedPrice < product.price
        ? product.discountedPrice
        : product.price;
    productPrice.textContent = API.UI.formatPrice(price);
  }

  // Update product description
  const productDescription = document.getElementById("productDescription");
  if (productDescription) {
    productDescription.textContent =
      product.description || "Product description not available.";
  }

  // Update product category
  const productCategory = document.getElementById("productCategory");
  if (productCategory) {
    productCategory.textContent = product.tags?.[0] || "Category";
  }

  // Update star rating
  updateStarRating(product.rating || 0);

  // Setup event listeners for the new structure
  setupProductEventListeners(product);
}

function updateStarRating(rating) {
  const starsContainer = document.getElementById("productStars");
  const ratingText = document.getElementById("ratingText");

  if (starsContainer) {
    const stars = starsContainer.querySelectorAll(".star");
    const fullStars = Math.floor(rating);

    stars.forEach((star, index) => {
      if (index < fullStars) {
        star.textContent = "★";
        star.classList.remove("empty");
      } else {
        star.textContent = "☆";
        star.classList.add("empty");
      }
    });
  }

  if (ratingText) {
    ratingText.textContent = `(${rating}/5)`;
  }
}

function setupProductEventListeners(product) {
  // Quantity controls
  const decreaseBtn = document.getElementById("decreaseBtn");
  const increaseBtn = document.getElementById("increaseBtn");
  const quantityInput = document.getElementById("quantity");

  if (decreaseBtn) {
    decreaseBtn.addEventListener("click", function () {
      const currentQty = parseInt(quantityInput.value);
      if (currentQty > 1) {
        quantityInput.value = currentQty - 1;
      }
    });
  }

  if (increaseBtn) {
    increaseBtn.addEventListener("click", function () {
      const currentQty = parseInt(quantityInput.value);
      quantityInput.value = currentQty + 1;
    });
  }

  // Share button
  const shareBtn = document.querySelector(".share-btn");
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      shareProduct(product);
    });
  }

  // Action buttons
  const loginBtn = document.getElementById("loginToPurchaseBtn");
  const clearCartBtn = document.getElementById("clearCartBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", function () {
      if (API.Auth.isLoggedIn()) {
        // Add to cart logic
        addToCart(product);
      } else {
        window.location.href = "account/login.html";
      }
    });
  }

  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", function () {
      API.Cart.clearCart();
      showNotification("Cart cleared successfully");
    });
  }
}

function addToCart(product) {
  const quantity = parseInt(document.getElementById("quantity").value);
  const success = API.Cart.addItem(product, quantity);

  if (success) {
    showNotification(`Added ${quantity} item(s) to cart`);
    API.Cart.updateCartUI();
  } else {
    showNotification("Failed to add item to cart", "error");
  }
}

function shareProduct(product) {
  if (navigator.share) {
    navigator.share({
      title: product.title,
      text: product.description,
      url: window.location.href,
    });
  } else {
    // Fallback - copy URL to clipboard
    navigator.clipboard.writeText(window.location.href).then(() => {
      showNotification("Product URL copied to clipboard");
    });
  }
}

function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error error-center";
  errorDiv.style.textAlign = "center";
  errorDiv.style.padding = "2rem";

  errorDiv.innerHTML = `
    <h3>Error Loading Product</h3>
    <p>${message}</p>
    <a href="shop.html" class="btn btn-primary">Back to Shop</a>
  `;

  document.body.appendChild(errorDiv);
}
