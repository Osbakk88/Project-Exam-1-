const API_BASE_URL = "https://v2.api.noroff.dev";

// API Endpoints
const API_ENDPOINTS = {
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
    createApiKey: `${API_BASE_URL}/auth/create-api-key`,
  },
  shop: {
    products: `${API_BASE_URL}/online-shop`,
    product: (id) => `${API_BASE_URL}/online-shop/${id}`,
  },
};

// Storage keys for localStorage
const STORAGE_KEYS = {
  accessToken: "accessToken",
  apiKey: "apiKey",
  user: "user",
  cart: "cart",
};

// Default API credentials
const DEFAULT_CREDENTIALS = {
  accessToken:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoib3NiYWtrODgiLCJlbWFpbCI6ImNocm9zYjAyMzk3QHN0dWQubm9yb2ZmLm5vIiwiaWF0IjoxNzYwMTg1NzgwfQ.w3ARZ4X-zyPnZFM0rrNJKuxUxf11p_rtapEGo0tbHfI",
  apiKey: "4a7c1acd-3cae-47ee-a661-1ef655293dea",
};

// Utility function to get stored auth data
function getAuthData() {
  return {
    accessToken: localStorage.getItem(STORAGE_KEYS.accessToken), // No fallback to default
    apiKey:
      localStorage.getItem(STORAGE_KEYS.apiKey) || DEFAULT_CREDENTIALS.apiKey,
  };
}

// Utility function to create headers with authentication
function createHeaders(includeAuth = true) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const { accessToken, apiKey } = getAuthData();
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    if (apiKey) {
      headers["X-Noroff-API-Key"] = apiKey;
    }
  }

  return headers;
}

// Generic API call function with error handling
async function apiCall(url, options = {}) {
  try {
    console.log("Making API call to:", url);
    console.log("With options:", options);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...createHeaders(options.includeAuth),
        ...options.headers,
      },
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    // Check if response is actually JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON response:", text);
      throw new Error(
        `Expected JSON response but got: ${contentType}. URL: ${url}. Response: ${text.substring(
          0,
          200
        )}...`
      );
    }

    const data = await response.json();
    console.log("Response data:", data);

    if (!response.ok) {
      // Create detailed error with API response information
      const error = new Error(
        data.message || `HTTP error! status: ${response.status}`
      );
      error.status = response.status;
      error.errors = data.errors || [];
      error.apiData = data;
      throw error;
    }

    return { data, success: true };
  } catch (error) {
    console.error("API call failed:", error);
    console.error("URL was:", url);
    return { error: error.message, success: false };
  }
}

// Authentication functions
const Auth = {
  // Register new user
  async register(userData) {
    return await apiCall(API_ENDPOINTS.auth.register, {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Login user
  async login(credentials) {
    const result = await apiCall(API_ENDPOINTS.auth.login, {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (result.success) {
      localStorage.setItem(STORAGE_KEYS.accessToken, result.data.accessToken);
      localStorage.setItem("profileName", result.data.name); // Following teacher's guidance
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(result.data));
    }

    return result;
  },

  // Create API key (required for some operations)
  async createApiKey(keyName = "Online Shop Key") {
    const result = await apiCall(API_ENDPOINTS.auth.createApiKey, {
      method: "POST",
      includeAuth: true,
      body: JSON.stringify({ name: keyName }),
    });

    if (result.success && result.data.key) {
      localStorage.setItem(STORAGE_KEYS.apiKey, result.data.key);
    }

    return result;
  },

  // Logout user
  logout() {
    console.log("Logout function called");

    // Clear all authentication data
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem("profileName"); // Following teacher's guidance
    localStorage.removeItem(STORAGE_KEYS.apiKey);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.cart); // Also clear cart

    console.log("Authentication data cleared");

    // Force reload to ensure clean state
    setTimeout(() => {
      window.location.reload();
    }, 100);
  },

  // Check if user is logged in
  isLoggedIn() {
    return !!localStorage.getItem(STORAGE_KEYS.accessToken);
  },

  // Get current user
  getCurrentUser() {
    const userData = localStorage.getItem(STORAGE_KEYS.user);
    return userData ? JSON.parse(userData) : null;
  },
};

// Shop API functions
const Shop = {
  // Get all products
  async getProducts() {
    try {
      console.log("Calling API endpoint:", API_ENDPOINTS.shop.products);
      const result = await apiCall(API_ENDPOINTS.shop.products, {
        includeAuth: true,
      });

      console.log("Raw API result:", result);

      // Check if we got a successful response but with unexpected data structure
      if (result.success && result.data) {
        console.log("API data type:", typeof result.data);
        console.log("API data is array:", Array.isArray(result.data));
        console.log("API data structure:", result.data);
      }

      return result;
    } catch (error) {
      console.error("Shop.getProducts error:", error);
      return { success: false, error: error.message };
    }
  },

  // Get single product by ID
  async getProduct(id) {
    try {
      const result = await apiCall(API_ENDPOINTS.shop.product(id), {
        includeAuth: true,
      });
      return result;
    } catch (error) {
      console.error("Shop.getProduct error:", error);
      return { success: false, error: error.message };
    }
  },
};

// Cart management functions
const Cart = {
  // Get cart from localStorage
  getCart() {
    const cart = localStorage.getItem(STORAGE_KEYS.cart);
    return cart ? JSON.parse(cart) : [];
  },

  // Save cart to localStorage
  saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  },

  // Add item to cart
  addItem(product, quantity = 1) {
    console.log(
      "API.Cart.addItem called with product:",
      product.id,
      "quantity:",
      quantity
    );
    const cart = this.getCart();
    console.log("Current cart before adding:", cart);
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        discountedPrice: product.discountedPrice,
        image: product.image,
        quantity: quantity,
      });
    }

    this.saveCart(cart);
    this.updateCartUI();
    return cart;
  },

  // Remove item from cart
  removeItem(productId) {
    let cart = this.getCart();
    console.log("Removing item with ID:", productId, "Type:", typeof productId);
    console.log(
      "Cart items before filter:",
      cart.map((item) => ({
        id: item.id,
        type: typeof item.id,
        title: item.title,
      }))
    );

    // Try both string and number comparison to handle ID type mismatches
    cart = cart.filter((item) => item.id != productId && item.id !== productId);

    console.log(
      "Cart items after filter:",
      cart.map((item) => ({
        id: item.id,
        type: typeof item.id,
        title: item.title,
      }))
    );
    this.saveCart(cart);
    this.updateCartUI();
    return cart;
  },

  // Update item quantity
  updateQuantity(productId, quantity) {
    const cart = this.getCart();
    const item = cart.find((item) => item.id === productId);

    if (item) {
      if (quantity <= 0) {
        return this.removeItem(productId);
      }
      item.quantity = quantity;
      this.saveCart(cart);
      this.updateCartUI();
    }

    return cart;
  },

  // Get total items in cart
  getItemCount() {
    return this.getCart().reduce((total, item) => total + item.quantity, 0);
  },

  // Get total price
  getTotalPrice() {
    return this.getCart().reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  },

  // Clear entire cart
  clearCart() {
    console.log("Clearing entire cart");
    localStorage.removeItem(STORAGE_KEYS.cart);
    // Also try clearing any corrupted cart data
    localStorage.removeItem("cart"); // fallback key
    this.updateCartUI();
    console.log("Cart cleared, remaining items:", this.getCart());
  },

  // Update cart UI elements (cart count badge, etc.)
  updateCartUI() {
    const cartCount = this.getItemCount();
    const cartBadges = document.querySelectorAll(".cart-count");
    cartBadges.forEach((badge) => {
      badge.textContent = cartCount;
      badge.style.display = cartCount > 0 ? "inline" : "none";
    });

    // Trigger custom event for cart updates
    window.dispatchEvent(
      new CustomEvent("cartUpdated", { detail: { count: cartCount } })
    );
  },
};

// Utility functions for UI
const UI = {
  // Show loading spinner
  showLoading(element) {
    if (element) {
      element.innerHTML = "";
      const loadingDiv = document.createElement("div");
      loadingDiv.className = "loading";
      loadingDiv.textContent = "Loading...";
      element.appendChild(loadingDiv);
    }
  },

  // Show error message
  showError(element, message) {
    if (element) {
      element.innerHTML = "";
      const errorDiv = document.createElement("div");
      errorDiv.className = "error";
      errorDiv.textContent = `Error: ${message}`;
      element.appendChild(errorDiv);
    }
  },

  // Format price for display
  formatPrice(price) {
    // Simple price validation
    if (!price || price <= 0) {
      return "Price not available";
    }

    // Simple Norwegian currency format
    return `kr ${price}`;
  },

  // Create star rating display
  createStarRating: function (rating, reviewCount) {
    const ratingDiv = document.createElement("div");
    ratingDiv.className = "product-rating";

    const starsSpan = document.createElement("span");
    starsSpan.className = "star-rating";

    // Ensure rating is a valid number between 0 and 5
    const validRating = Math.max(0, Math.min(5, rating || 0));
    const fullStars = Math.floor(validRating);
    const hasHalfStar = validRating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    // Create star display
    let starDisplay = "★".repeat(fullStars);
    if (hasHalfStar) starDisplay += "☆";
    starDisplay += "☆".repeat(emptyStars);

    starsSpan.textContent = starDisplay;
    starsSpan.setAttribute("aria-label", validRating + " out of 5 stars");
    ratingDiv.appendChild(starsSpan);

    // Add rating text
    const ratingText = document.createElement("span");
    ratingText.className = "rating-text";
    ratingText.textContent = " (" + validRating + "/5)";
    if (reviewCount && reviewCount > 0) {
      ratingText.textContent +=
        " • " + reviewCount + " review" + (reviewCount !== 1 ? "s" : "");
    }
    ratingDiv.appendChild(ratingText);

    return ratingDiv;
  },

  // Create star rating HTML string for template literals
  createStarRatingHTML: function (rating, reviewCount) {
    const validRating = Math.max(0, Math.min(5, rating || 0));
    const fullStars = Math.floor(validRating);
    const hasHalfStar = validRating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starDisplay = "★".repeat(fullStars);
    if (hasHalfStar) starDisplay += "☆";
    starDisplay += "☆".repeat(emptyStars);

    let reviewText = "";
    if (reviewCount && reviewCount > 0) {
      reviewText =
        " • " + reviewCount + " review" + (reviewCount !== 1 ? "s" : "");
    }

    return `<span class="star-rating" aria-label="${validRating} out of 5 stars">${starDisplay}</span><span class="rating-text"> (${validRating}/5)${reviewText}</span>`;
  },

  createProductCard(product) {
    const discountPrice =
      product.discountedPrice < product.price ? product.discountedPrice : null;

    // Create main product card
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.setAttribute("data-product-id", product.id);

    // Create image section
    const imageDiv = document.createElement("div");
    imageDiv.className = "product-image";

    const img = document.createElement("img");
    img.src =
      product.image?.url ||
      product.image ||
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
    img.alt = product.image?.alt || product.title || "Product image";
    img.loading = "lazy";
    img.onerror = function () {
      this.src =
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
    };
    imageDiv.appendChild(img);

    // Removed discount badge for simpler student-appropriate code

    // Create product info section
    const infoDiv = document.createElement("div");
    infoDiv.className = "product-info";

    const title = document.createElement("h3");
    title.className = "product-title";
    title.textContent = product.title;
    infoDiv.appendChild(title);

    // Create price section
    const priceDiv = document.createElement("div");
    priceDiv.className = "product-price";

    if (discountPrice) {
      const discountedSpan = document.createElement("span");
      discountedSpan.className = "discounted-price";
      discountedSpan.textContent = this.formatPrice(discountPrice);
      priceDiv.appendChild(discountedSpan);

      const originalSpan = document.createElement("span");
      originalSpan.className = "original-price";
      originalSpan.textContent = this.formatPrice(product.price);
      priceDiv.appendChild(originalSpan);
    } else {
      const priceSpan = document.createElement("span");
      priceSpan.className = "price";
      priceSpan.textContent = this.formatPrice(product.price);
      priceDiv.appendChild(priceSpan);
    }
    infoDiv.appendChild(priceDiv);

    const description = document.createElement("p");
    description.className = "product-description";
    description.textContent = product.description;
    infoDiv.appendChild(description);

    // Add rating display (show for all products, including 0 rating)
    const reviewCount = product.reviews ? product.reviews.length : null;
    const ratingElement = this.createStarRating(product.rating, reviewCount);
    infoDiv.appendChild(ratingElement);

    // Create action buttons with direct event listeners
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "product-actions";

    const addToCartBtn = document.createElement("button");
    addToCartBtn.className = "btn btn-primary";
    addToCartBtn.textContent = "Add to Cart";
    addToCartBtn.addEventListener("click", function () {
      console.log("Direct add to cart clicked for product:", product.id);
      Cart.addItem(product);

      // Use global showNotification if available, otherwise create one
      if (typeof window.showNotification === "function") {
        window.showNotification("Product added to cart!");
      }

      // Button feedback
      const originalText = addToCartBtn.textContent;
      addToCartBtn.textContent = "Added!";
      addToCartBtn.disabled = true;

      setTimeout(() => {
        addToCartBtn.textContent = originalText;
        addToCartBtn.disabled = false;
      }, 1000);
    });
    actionsDiv.appendChild(addToCartBtn);

    const viewBtn = document.createElement("button");
    viewBtn.className = "btn btn-secondary";
    viewBtn.textContent = "View Details";
    viewBtn.addEventListener("click", function () {
      window.location.href = `product.html?id=${product.id}`;
    });
    actionsDiv.appendChild(viewBtn);

    infoDiv.appendChild(actionsDiv);

    // Assemble the card
    productCard.appendChild(imageDiv);
    productCard.appendChild(infoDiv);

    return productCard;
  },
};

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Only set default API key if not already stored (for API calls)
  if (!localStorage.getItem(STORAGE_KEYS.apiKey)) {
    localStorage.setItem(STORAGE_KEYS.apiKey, DEFAULT_CREDENTIALS.apiKey);
  }

  // NOTE: Removed auto-login behavior - users must manually log in
  // No longer automatically setting accessToken or user data

  // Update cart UI on page load
  Cart.updateCartUI();

  // Add event listeners for common actions
  document.addEventListener("click", function (e) {
    // Handle add to cart buttons
    if (e.target.classList.contains("add-to-cart")) {
      const productId = e.target.getAttribute("data-product-id");
      handleAddToCart(productId);
    }

    // Handle view product buttons
    if (e.target.classList.contains("view-product")) {
      const productId = e.target.getAttribute("data-product-id");
      handleViewProduct(productId);
    }
  });
});

// Event handlers
async function handleAddToCart(productId) {
  try {
    const result = await Shop.getProduct(productId);
    if (result.success) {
      Cart.addItem(result.data);
      showNotification("Product added to cart!");
    } else {
      showNotification("Failed to add product to cart", "error");
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    showNotification("Failed to add product to cart", "error");
  }
}

function handleViewProduct(productId) {
  // Navigate to product detail page or show modal
  window.location.href = `product.html?id=${productId}`;
}

function showNotification(message, type = "success") {
  // Create and show notification
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Export for use in other files
window.API = {
  Auth,
  Shop,
  Cart,
  UI,
  API_ENDPOINTS,
  STORAGE_KEYS,
};
