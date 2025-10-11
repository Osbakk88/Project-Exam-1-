// Cart page functionality
document.addEventListener("DOMContentLoaded", function () {
  // Update navigation based on login status
  updateNavigation();

  // Load cart items
  displayCart();

  // Setup event listeners
  setupEventListeners();
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
      <a href="account/login.html">Login</a>
    `;
  }
}

function displayCart() {
  const cartItems = API.Cart.getCart();
  const cartItemsContainer = document.getElementById("cartItems");
  const cartSummary = document.getElementById("cartSummary");

  if (cartItems.length === 0) {
    showEmptyCart(cartItemsContainer);
    cartSummary.classList.add("hidden");
    return;
  }

  populateCartItems(cartItemsContainer, cartItems);
  updateCartSummary();
  cartSummary.classList.remove("hidden");
}

function showEmptyCart(container) {
  // Clear container
  container.innerHTML = "";

  // Create elements
  const emptyDiv = document.createElement("div");
  emptyDiv.className = "empty-state";

  const heading = document.createElement("h3");
  heading.textContent = "Your cart is empty";

  const paragraph = document.createElement("p");
  paragraph.textContent = "Browse our products and add items to your cart.";

  const link = document.createElement("a");
  link.href = "shop.html";
  link.className = "btn btn-primary";
  link.textContent = "Continue Shopping";

  // Append elements
  emptyDiv.appendChild(heading);
  emptyDiv.appendChild(paragraph);
  emptyDiv.appendChild(link);
  container.appendChild(emptyDiv);
}

function populateCartItems(container, cartItems) {
  // Clear container
  container.innerHTML = "";

  cartItems.forEach((item) => {
    const cartItemElement = createCartItemElement(item);
    container.appendChild(cartItemElement);
  });
}

function createCartItemElement(item) {
  // Create main cart item div
  const cartItem = document.createElement("div");
  cartItem.className = "cart-item";
  cartItem.setAttribute("data-item-id", item.id);

  // Create image section
  const imageDiv = document.createElement("div");
  imageDiv.className = "cart-item-image";

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
    img.src = "https://via.placeholder.com/150x150?text=No+Image";
    img.alt = item.title;
  }

  img.onerror = function () {
    this.src = "https://via.placeholder.com/150x150?text=No+Image";
  };

  imageDiv.appendChild(img);

  // Create info section
  const infoDiv = document.createElement("div");
  infoDiv.className = "cart-item-info";

  const title = document.createElement("h3");
  title.className = "cart-item-title";
  title.textContent = item.title;

  const price = document.createElement("div");
  price.className = "cart-item-price";

  // Handle price safely - check for discounted price first
  let displayPrice = item.discountedPrice || item.price;

  // Ensure price is a number
  if (displayPrice && !isNaN(displayPrice)) {
    price.textContent = API.UI.formatPrice(displayPrice);
  } else {
    console.warn("Invalid price for item:", item);
    price.textContent = "Price not available";
  }

  infoDiv.appendChild(title);
  infoDiv.appendChild(price);

  // Create controls section
  const controlsDiv = document.createElement("div");
  controlsDiv.className = "cart-item-controls";

  // Quantity controls
  const quantityDiv = document.createElement("div");
  quantityDiv.className = "quantity-controls";

  const decreaseBtn = document.createElement("button");
  decreaseBtn.className = "quantity-btn decrease-qty";
  decreaseBtn.setAttribute("data-item-id", item.id);
  decreaseBtn.textContent = "-";

  const quantityInput = document.createElement("input");
  quantityInput.type = "number";
  quantityInput.className = "quantity-input";
  quantityInput.value = item.quantity;
  quantityInput.min = "1";
  quantityInput.setAttribute("data-item-id", item.id);

  const increaseBtn = document.createElement("button");
  increaseBtn.className = "quantity-btn increase-qty";
  increaseBtn.setAttribute("data-item-id", item.id);
  increaseBtn.textContent = "+";

  quantityDiv.appendChild(decreaseBtn);
  quantityDiv.appendChild(quantityInput);
  quantityDiv.appendChild(increaseBtn);

  // Remove button
  const removeBtn = document.createElement("button");
  removeBtn.className = "btn btn-danger remove-item";
  removeBtn.setAttribute("data-item-id", item.id);
  removeBtn.textContent = "Remove";

  controlsDiv.appendChild(quantityDiv);
  controlsDiv.appendChild(removeBtn);

  // Assemble cart item
  cartItem.appendChild(imageDiv);
  cartItem.appendChild(infoDiv);
  cartItem.appendChild(controlsDiv);

  return cartItem;
}

function updateCartSummary() {
  const total = API.Cart.getTotalPrice();
  const totalElement = document.getElementById("cartTotal");
  totalElement.textContent = API.UI.formatPrice(total);
}

function setupEventListeners() {
  // Handle logout button
  document.addEventListener("click", function (e) {
    if (e.target.getAttribute("data-action") === "logout") {
      API.Auth.logout();
      return;
    }
  });

  // Handle quantity input changes
  document.addEventListener("input", function (e) {
    if (e.target.classList.contains("quantity-input")) {
      const itemId = e.target.getAttribute("data-item-id");
      const newQuantity = parseInt(e.target.value);
      if (newQuantity > 0) {
        API.Cart.updateQuantity(itemId, newQuantity);
        updateCartSummary();
      }
    }
  });

  // Handle quantity changes and item removal
  document.addEventListener("click", function (e) {
    const itemId = e.target.getAttribute("data-item-id");
    if (e.target.classList.contains("increase-qty")) {
      const currentQty = parseInt(
        document.querySelector(`input[data-item-id="${itemId}"]`).value
      );
      API.Cart.updateQuantity(itemId, currentQty + 1);
      displayCart();
    }

    if (e.target.classList.contains("decrease-qty")) {
      const currentQty = parseInt(
        document.querySelector(`input[data-item-id="${itemId}"]`).value
      );
      if (currentQty > 1) {
        API.Cart.updateQuantity(itemId, currentQty - 1);
        displayCart();
      }
    }

    if (e.target.classList.contains("remove-item")) {
      API.Cart.removeItem(itemId);
      displayCart();
      showNotification("Item removed from cart");
    }
  });

  // Handle quantity input changes
  document.addEventListener("change", function (e) {
    if (e.target.classList.contains("quantity-input")) {
      const itemId = e.target.getAttribute("data-item-id");
      const newQuantity = parseInt(e.target.value);
      if (newQuantity > 0) {
        API.Cart.updateQuantity(itemId, newQuantity);
        updateCartSummary();
      }
    }
  });

  // Clear cart button
  document
    .getElementById("clearCartBtn")
    .addEventListener("click", function () {
      if (confirm("Are you sure you want to clear your entire cart?")) {
        API.Cart.clearCart();
        displayCart();
        showNotification("Cart cleared");
      }
    });

  // Checkout button
  document.getElementById("checkoutBtn").addEventListener("click", function () {
    if (!API.Auth.isLoggedIn()) {
      if (
        confirm(
          "You need to be logged in to checkout. Would you like to login now?"
        )
      ) {
        window.location.href = "account/login.html";
      }
      return;
    }

    // Redirect to checkout page
    window.location.href = "checkout.html";
  });

  // Listen for cart updates from other pages
  window.addEventListener("cartUpdated", function () {
    displayCart();
  });
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
