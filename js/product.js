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

  // Removed discount badge for simpler student-appropriate code

  const productInfoDiv = document.createElement("div");
  productInfoDiv.className = "product-detail-info";

  const productTitle = document.createElement("h1");
  productTitle.textContent = product.title;
  productInfoDiv.appendChild(productTitle);

  // Add product rating and share section
  const topSection = document.createElement("div");
  topSection.className = "product-top-section";

  const reviewCount = product.reviews ? product.reviews.length : null;
  const ratingElement = API.UI.createStarRating(product.rating, reviewCount);
  topSection.appendChild(ratingElement);

  // Add share button
  const shareBtn = document.createElement("button");
  shareBtn.className = "btn btn-outline share-btn";
  shareBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92S19.61 16.08 18 16.08z"/>
    </svg>
    Share
  `;
  shareBtn.setAttribute("title", "Share this product");
  shareBtn.addEventListener("click", function () {
    shareProduct(product);
  });
  topSection.appendChild(shareBtn);

  productInfoDiv.appendChild(topSection);

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

  // Only show Add to Cart for logged-in users
  if (API.Auth.isLoggedIn()) {
    const addToCartBtn = document.createElement("button");
    addToCartBtn.className = "btn btn-primary btn-large add-to-cart-btn";
    addToCartBtn.textContent = "Add to Cart";
    addToCartBtn.addEventListener("click", function () {
      console.log("Direct button click handler called");
      addToCart();
    });
    actionsDiv.appendChild(addToCartBtn);
  } else {
    const loginPrompt = document.createElement("div");
    loginPrompt.className = "login-prompt";
    loginPrompt.innerHTML = `
      <p>Please <a href="login.html">log in</a> to add items to your cart.</p>
    `;
    actionsDiv.appendChild(loginPrompt);
  }

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

function shareProduct(product) {
  const currentUrl = window.location.href;
  const shareUrl = `${window.location.origin}${window.location.pathname}?id=${product.id}`;

  // Try to use the Web Share API if available (mobile devices)
  if (navigator.share) {
    navigator
      .share({
        title: product.title,
        text: `Check out this product: ${product.title}`,
        url: shareUrl,
      })
      .catch((err) => {
        console.log("Error sharing:", err);
        fallbackShare(shareUrl);
      });
  } else {
    // Fallback to clipboard copy
    fallbackShare(shareUrl);
  }
}

function fallbackShare(url) {
  // Copy URL to clipboard
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        showNotification("Product URL copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy URL:", err);
        showShareDialog(url);
      });
  } else {
    // Fallback for older browsers
    showShareDialog(url);
  }
}

function showShareDialog(url) {
  // Create a simple dialog with the URL
  const dialog = document.createElement("div");
  dialog.className = "share-dialog";
  dialog.innerHTML = `
    <div class="share-dialog-content">
      <h4>Share this product</h4>
      <input type="text" value="${url}" readonly>
      <div class="share-dialog-actions">
        <button class="btn btn-primary" onclick="this.previousElementSibling.previousElementSibling.select(); document.execCommand('copy'); this.parentElement.parentElement.parentElement.remove(); showNotification('URL copied!');">Copy URL</button>
        <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove();">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);
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
