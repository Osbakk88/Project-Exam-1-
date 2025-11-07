// Cart page functionality - Designmodo Inspired
// ATTRIBUTION: Cart design based on Designmodo tutorial
// Adapted and modified for this e-commerce project with API integration

document.addEventListener("DOMContentLoaded", function () {
  // Update navigation based on login status
  updateNavigation();

  // Load cart items
  displayCart();

  // Update checkout area based on login status
  updateCheckoutArea();

  // Setup event listeners
  setupEventListeners();
});

function updateNavigation() {
  const authNav = document.getElementById("authNav");

  if (API.Auth.isLoggedIn()) {
    authNav.innerHTML = `
      <button class="btn btn-secondary ml-1" data-action="logout">Logout</button>
    `;
  } else {
    authNav.innerHTML = `
      <a href="account/login.html">Login</a>
    `;
  }

  // Update checkout area when navigation changes (login/logout)
  updateCheckoutArea();
}

function displayCart() {
  const cartItems = API.Cart.getCart();
  const cartItemsContainer = document.getElementById("cartItems");
  const cartSummary = document.getElementById("cartSummary");
  const emptyCart = document.getElementById("emptyCart");

  console.log("📦 Cart items:", cartItems);

  if (cartItems.length === 0) {
    showEmptyCart();
    return;
  }

  // Hide empty state and show cart items
  emptyCart.style.display = "none";
  cartSummary.style.display = "block";

  cartItemsContainer.innerHTML = "";

  cartItems.forEach((item, index) => {
    const cartItemElement = createDesignmodoCartItem(item, index === 0);
    cartItemsContainer.appendChild(cartItemElement);
  });

  updateCartSummary();
  updateCheckoutArea();
}

function showEmptyCart() {
  const cartItemsContainer = document.getElementById("cartItems");
  const cartSummary = document.getElementById("cartSummary");
  const emptyCart = document.getElementById("emptyCart");

  // Clear the cart items container
  cartItemsContainer.innerHTML = "";

  // Hide cart summary and show empty cart
  cartSummary.style.display = "none";
  emptyCart.style.display = "block";

  console.log("Showing empty cart state");
}

function createDesignmodoCartItem(item, isFirstItem = false) {
  const itemDiv = document.createElement("div");
  itemDiv.className = "item";
  itemDiv.setAttribute("data-item-id", item.id);

  // Add Shopping Bag text to first item only
  if (isFirstItem) {
    const shoppingBagText = document.createElement("div");
    shoppingBagText.className = "shopping-bag-text";
    shoppingBagText.textContent = "Shopping Bag";
    itemDiv.appendChild(shoppingBagText);

    // Checkout buttons section
    const checkoutButtons = document.createElement("div");
    checkoutButtons.className = "checkout-buttons-section";

    // Login to purchase button
    const loginToPurchaseBtn = document.createElement("button");
    loginToPurchaseBtn.className = "btn btn-primary login-to-purchase-btn";
    loginToPurchaseBtn.textContent = "Login to purchase";
    loginToPurchaseBtn.addEventListener("click", function (e) {
      e.preventDefault();
      // Set pending checkout state so user gets redirected to checkout after login
      localStorage.setItem("pendingCheckout", "true");
      localStorage.setItem("returnUrl", "../checkout.html");
      window.location.href = "account/login.html";
    });

    // Clear cart button
    const clearCartBtn = document.createElement("button");
    clearCartBtn.className = "btn btn-secondary clear-cart-btn";
    clearCartBtn.textContent = "Clear Cart";
    clearCartBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (confirm("Are you sure you want to clear your cart?")) {
        API.Cart.clearCart();
        showNotification("Cart cleared", "success");
        // Redirect to shop page after clearing cart
        setTimeout(() => {
          window.location.href = "shop.html";
        }, 1000);
      }
    });

    checkoutButtons.appendChild(loginToPurchaseBtn);
    checkoutButtons.appendChild(clearCartBtn);
    itemDiv.appendChild(checkoutButtons);
  }

  // Action buttons (delete, favorite)
  const buttonsDiv = document.createElement("div");
  buttonsDiv.className = "buttons";

  const deleteBtn = document.createElement("div");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "×"; // Simple X character
  deleteBtn.title = "Remove item"; // Accessibility tooltip
  deleteBtn.addEventListener("click", () => removeFromCart(item.id));

  buttonsDiv.appendChild(deleteBtn);

  // Product image
  const imageDiv = document.createElement("div");
  imageDiv.className = "image";

  const img = document.createElement("img");
  // Handle different image data structures from the API
  if (item.image && typeof item.image === "object" && item.image.url) {
    img.src = item.image.url;
    img.alt = item.image.alt || item.title;
  } else if (typeof item.image === "string") {
    img.src = item.image;
    img.alt = item.title;
  } else {
    // Fallback to a generic placeholder
    img.src = "https://via.placeholder.com/60x60?text=No+Image";
    img.alt = item.title;
  }

  img.onerror = function () {
    this.src = "https://via.placeholder.com/60x60?text=No+Image";
  };

  imageDiv.appendChild(img);

  // Product description
  const descriptionDiv = document.createElement("div");
  descriptionDiv.className = "description";

  const titleSpan = document.createElement("span");
  titleSpan.textContent = item.title;

  const priceSpan = document.createElement("span");
  // Handle price safely - check for discounted price first
  let displayPrice = item.discountedPrice || item.price;
  if (displayPrice && !isNaN(displayPrice)) {
    priceSpan.textContent = API.UI.formatPrice(displayPrice);
  } else {
    console.warn("Invalid price for item:", item);
    priceSpan.textContent = "Price not available";
  }

  descriptionDiv.appendChild(titleSpan);
  descriptionDiv.appendChild(priceSpan);

  // Quantity controls
  const quantityDiv = document.createElement("div");
  quantityDiv.className = "quantity";

  const minusBtn = document.createElement("button");
  minusBtn.className = "minus-btn";
  minusBtn.textContent = "-";
  minusBtn.addEventListener("click", () =>
    updateQuantity(item.id, item.quantity - 1)
  );

  const quantityInput = document.createElement("input");
  quantityInput.type = "number";
  quantityInput.value = item.quantity;
  quantityInput.min = "1";
  quantityInput.addEventListener("change", (e) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity > 0) {
      updateQuantity(item.id, newQuantity);
    }
  });

  const plusBtn = document.createElement("button");
  plusBtn.className = "plus-btn";
  plusBtn.textContent = "+";
  plusBtn.addEventListener("click", () =>
    updateQuantity(item.id, item.quantity + 1)
  );

  quantityDiv.appendChild(minusBtn);
  quantityDiv.appendChild(quantityInput);
  quantityDiv.appendChild(plusBtn);

  // Total price
  const totalPriceDiv = document.createElement("div");
  totalPriceDiv.className = "total-price";
  const itemTotal = displayPrice * item.quantity;
  totalPriceDiv.textContent = "Total: " + API.UI.formatPrice(itemTotal);

  // Assemble the item
  itemDiv.appendChild(buttonsDiv);
  itemDiv.appendChild(imageDiv);
  itemDiv.appendChild(descriptionDiv);
  itemDiv.appendChild(quantityDiv);
  itemDiv.appendChild(totalPriceDiv);

  return itemDiv;
}

function updateQuantity(productId, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  API.Cart.updateQuantity(productId, newQuantity);
  displayCart(); // Refresh the display
  showNotification("Quantity updated", "success");
}

function removeFromCart(productId) {
  API.Cart.removeItem(productId);
  displayCart(); // Refresh the display
  showNotification("Item removed from cart", "success");
}

function updateCartSummary() {
  const total = API.Cart.getTotalPrice();
  const totalElement = document.getElementById("cartTotal");
  totalElement.textContent = API.UI.formatPrice(total);
}

function updateCheckoutArea() {
  const checkoutArea = document.getElementById("checkoutArea");
  const clearCartBtn = document.getElementById("clearCartBtn");

  if (API.Auth.isLoggedIn()) {
    // User is logged in, show checkout button next to clear cart
    checkoutArea.innerHTML = `
      <a href="checkout.html" class="btn btn-primary">Proceed to Checkout</a>
    `;
    // Re-append the clear cart button to maintain it in the same container
    checkoutArea.appendChild(clearCartBtn);
  } else {
    // User not logged in, show login requirement and clear cart button
    checkoutArea.innerHTML = `
      <div class="login-prompt">
        <p>Please <a href="account/login.html">login</a> to proceed with checkout</p>
      </div>
    `;
    // Re-append the clear cart button
    checkoutArea.appendChild(clearCartBtn);
  }
}

function setupEventListeners() {
  // Clear cart button
  const clearCartBtn = document.getElementById("clearCartBtn");
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", function (e) {
      e.preventDefault(); // Prevent default anchor behavior
      if (confirm("Are you sure you want to clear your cart?")) {
        API.Cart.clearCart();
        displayCart();
        showNotification("Cart cleared", "success");
      }
    });
  }

  // Logout functionality
  document.addEventListener("click", function (e) {
    if (e.target.dataset.action === "logout") {
      API.Auth.logout();
      showNotification("Logged out successfully", "success");
      updateNavigation();
      updateCheckoutArea();
    }
  });
}

function showNotification(message, type = "success") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Add to page
  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Quantity buttons functionality
document.addEventListener("DOMContentLoaded", function () {
  // Minus button functionality
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("minus-btn")) {
      e.preventDefault();
      const button = e.target;
      const input = button.closest("div").querySelector("input");
      let value = parseInt(input.value);

      if (value > 1) {
        value = value - 1;
      } else {
        value = 0;
      }

      input.value = value;
    }
  });

  // Plus button functionality
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("plus-btn")) {
      e.preventDefault();
      const button = e.target;
      const input = button.closest("div").querySelector("input");
      let value = parseInt(input.value);

      if (value < 100) {
        value = value + 1;
      } else {
        value = 100;
      }

      input.value = value;
    }
  });
});
