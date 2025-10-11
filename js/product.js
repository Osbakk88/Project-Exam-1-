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
    const user = API.Auth.getCurrentUser();

    // Create elements instead of innerHTML to attach event listeners
    const welcomeSpan = document.createElement("span");
    welcomeSpan.textContent = `Welcome, ${user.name}!`;

    const logoutBtn = document.createElement("button");
    logoutBtn.className = "btn btn-secondary margin-left";
    logoutBtn.textContent = "Logout";
    logoutBtn.addEventListener("click", function () {
      API.Auth.logout();
    });

    authNav.innerHTML = "";
    authNav.appendChild(welcomeSpan);
    authNav.appendChild(logoutBtn);
  } else {
    authNav.innerHTML = `
      <a href="login.html">Login</a>
    `;
  }
}

async function loadProduct(productId) {
  const container = document.getElementById("productContainer");
  API.UI.showLoading(container);

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
  const container = document.getElementById("productContainer");
  const discountPrice =
    product.discountedPrice < product.price ? product.discountedPrice : null;
  const discount = discountPrice
    ? Math.round((1 - discountPrice / product.price) * 100)
    : 0;

  // Create product detail elements using DOM manipulation
  const productDetailDiv = document.createElement("div");
  productDetailDiv.className = "product-detail";

  const productImageDiv = document.createElement("div");
  productImageDiv.className = "product-detail-image";

  const productImg = document.createElement("img");
  productImg.src =
    product.image?.url ||
    product.image ||
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
  productImg.alt = product.image?.alt || product.title || "Product image";
  productImg.onerror = function () {
    this.src =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
  };
  productImageDiv.appendChild(productImg);

  if (discount > 0) {
    const discountBadge = document.createElement("span");
    discountBadge.className = "discount-badge";
    discountBadge.textContent = `${discount}% OFF`;
    productImageDiv.appendChild(discountBadge);
  }

  const productInfoDiv = document.createElement("div");
  productInfoDiv.className = "product-detail-info";

  const productTitle = document.createElement("h1");
  productTitle.textContent = product.title;
  productInfoDiv.appendChild(productTitle);

  // Price section
  const priceSection = document.createElement("div");
  priceSection.className = "product-price-section";

  if (discountPrice) {
    const discountedPriceSpan = document.createElement("span");
    discountedPriceSpan.className = "discounted-price";
    discountedPriceSpan.textContent = API.UI.formatPrice(discountPrice);
    priceSection.appendChild(discountedPriceSpan);

    const originalPriceSpan = document.createElement("span");
    originalPriceSpan.className = "original-price";
    originalPriceSpan.textContent = API.UI.formatPrice(product.price);
    priceSection.appendChild(originalPriceSpan);

    const savingsDiv = document.createElement("div");
    savingsDiv.className = "sale-price";
    savingsDiv.textContent = `You save ${API.UI.formatPrice(
      product.price - discountPrice
    )}!`;
    priceSection.appendChild(savingsDiv);
  } else {
    const priceSpan = document.createElement("span");
    priceSpan.className = "price";
    priceSpan.textContent = API.UI.formatPrice(product.price);
    priceSection.appendChild(priceSpan);
  }

  productInfoDiv.appendChild(priceSection);

  // Description
  const descriptionDiv = document.createElement("div");
  descriptionDiv.className = "product-description";
  descriptionDiv.textContent = product.description;
  productInfoDiv.appendChild(descriptionDiv);

  // Tags
  if (product.tags && product.tags.length > 0) {
    const tagsDiv = document.createElement("div");
    tagsDiv.className = "product-tags";

    const tagsLabel = document.createElement("strong");
    tagsLabel.textContent = "Tags:";
    tagsDiv.appendChild(tagsLabel);
    tagsDiv.appendChild(document.createElement("br"));

    product.tags.forEach((tag) => {
      const tagSpan = document.createElement("span");
      tagSpan.className = "tag";
      tagSpan.textContent = tag;
      tagsDiv.appendChild(tagSpan);
    });

    productInfoDiv.appendChild(tagsDiv);
  }

  // Actions
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "product-actions";

  const quantityDiv = document.createElement("div");
  quantityDiv.className = "quantity-selector";

  const quantityLabel = document.createElement("label");
  quantityLabel.htmlFor = "quantity";
  quantityLabel.textContent = "Quantity:";
  quantityDiv.appendChild(quantityLabel);

  const quantityInput = document.createElement("input");
  quantityInput.type = "number";
  quantityInput.id = "quantity";
  quantityInput.value = "1";
  quantityInput.min = "1";
  quantityInput.max = "10";
  quantityDiv.appendChild(quantityInput);

  actionsDiv.appendChild(quantityDiv);

  const addToCartBtn = document.createElement("button");
  addToCartBtn.className = "btn btn-primary btn-large add-to-cart-btn";
  addToCartBtn.textContent = "Add to Cart";
  // Attach event listener directly to button to avoid duplicates
  addToCartBtn.addEventListener("click", function () {
    console.log("Direct button click handler called");
    addToCart();
  });
  actionsDiv.appendChild(addToCartBtn);

  const backBtn = document.createElement("button");
  backBtn.className = "btn btn-secondary btn-full-width back-btn";
  backBtn.textContent = "Continue Shopping";
  backBtn.addEventListener("click", function () {
    window.history.back();
  });
  actionsDiv.appendChild(backBtn);

  productInfoDiv.appendChild(actionsDiv);

  productDetailDiv.appendChild(productImageDiv);
  productDetailDiv.appendChild(productInfoDiv);

  container.innerHTML = "";
  container.appendChild(productDetailDiv);

  // Add reviews if they exist
  if (product.reviews && product.reviews.length > 0) {
    const reviewsDiv = document.createElement("div");
    reviewsDiv.className = "reviews-section";

    const reviewsTitle = document.createElement("h3");
    reviewsTitle.textContent = "Customer Reviews";
    reviewsDiv.appendChild(reviewsTitle);

    const reviewsContainer = document.createElement("div");
    reviewsContainer.className = "margin-top";

    product.reviews.forEach((review) => {
      const reviewItem = document.createElement("div");
      reviewItem.className = "review-item";

      const reviewHeader = document.createElement("div");
      reviewHeader.className = "review-header";

      const reviewerName = document.createElement("strong");
      reviewerName.textContent = review.username;
      reviewHeader.appendChild(reviewerName);

      const ratingSpan = document.createElement("span");
      ratingSpan.className = "star-rating";
      ratingSpan.textContent =
        "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
      reviewHeader.appendChild(ratingSpan);

      reviewItem.appendChild(reviewHeader);

      const reviewText = document.createElement("p");
      reviewText.className = "review-text";
      reviewText.textContent = review.description;
      reviewItem.appendChild(reviewText);

      reviewsContainer.appendChild(reviewItem);
    });

    reviewsDiv.appendChild(reviewsContainer);
    container.appendChild(reviewsDiv);
  }
}

function addToCart() {
  console.log("addToCart function called");

  if (!currentProduct) return;

  const quantity = parseInt(document.getElementById("quantity").value);
  console.log("Adding quantity:", quantity);

  if (quantity < 1) {
    showNotification("Please select a valid quantity", "error");
    return;
  }

  // Add the product with the specified quantity
  console.log(
    "Calling API.Cart.addItem with:",
    currentProduct.id,
    "quantity:",
    quantity
  );
  API.Cart.addItem(currentProduct, quantity);

  showNotification(`Added ${quantity} item(s) to cart!`);

  // Update the button temporarily to show feedback
  const button = document.querySelector(".add-to-cart-btn");
  const originalText = button.textContent;
  button.textContent = "Added to Cart!";
  button.disabled = true;
  button.style.background = "#27ae60";

  setTimeout(() => {
    button.textContent = originalText;
    button.disabled = false;
    button.style.background = "";
  }, 2000);
}

function showError(message) {
  const container = document.getElementById("productContainer");
  const errorDiv = document.createElement("div");
  errorDiv.className = "error error-center";

  const errorTitle = document.createElement("h3");
  errorTitle.textContent = "Error Loading Product";
  errorDiv.appendChild(errorTitle);

  const errorMessage = document.createElement("p");
  errorMessage.textContent = message;
  errorDiv.appendChild(errorMessage);

  const backLink = document.createElement("a");
  backLink.href = "shop.html";
  backLink.className = "btn btn-primary";
  backLink.textContent = "Back to Shop";
  errorDiv.appendChild(backLink);

  container.innerHTML = "";
  container.appendChild(errorDiv);
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}
