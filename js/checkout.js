// Checkout page functionality
document.addEventListener("DOMContentLoaded", function () {
  // Update navigation based on login status
  updateNavigation();

  // Check if user is logged in (required for checkout)
  if (!API.Auth.isLoggedIn()) {
    window.location.href = "account/login.html";
    return;
  }

  // Load cart items for order summary
  loadOrderSummary();

  // Setup form functionality
  setupPaymentMethods();
  setupFormValidation();
  setupPlaceOrder();
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

function loadOrderSummary() {
  const cartItems = API.Cart.getCart();
  const checkoutItemsContainer = document.getElementById("checkoutItems");
  const subtotalElement = document.getElementById("subtotal");
  const taxElement = document.getElementById("tax");
  const finalTotalElement = document.getElementById("finalTotal");

  if (cartItems.length === 0) {
    window.location.href = "cart.html";
    return;
  }

  // Display cart items
  checkoutItemsContainer.innerHTML = "";
  let subtotal = 0;

  cartItems.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "checkout-item";

    const price =
      item.discountedPrice && item.discountedPrice < item.price
        ? item.discountedPrice
        : item.price;

    const itemTotal = price * item.quantity;
    subtotal += itemTotal;

    itemDiv.innerHTML = `
      <div class="checkout-item-info">
        <img src="${item.image?.url || item.image || "/api/placeholder/60/60"}" 
             alt="${item.title}" class="checkout-item-image" />
        <div class="checkout-item-details">
          <h4>${item.title}</h4>
          <p>Quantity: ${item.quantity}</p>
          <p class="checkout-item-price">${API.UI.formatPrice(itemTotal)}</p>
        </div>
      </div>
    `;

    checkoutItemsContainer.appendChild(itemDiv);
  });

  // Calculate totals
  const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  // Update display
  subtotalElement.textContent = API.UI.formatPrice(subtotal);
  document.getElementById("shipping").textContent =
    API.UI.formatPrice(shipping);
  taxElement.textContent = API.UI.formatPrice(tax);
  finalTotalElement.textContent = API.UI.formatPrice(total);

  // Update cart count
  API.Cart.updateCartUI();
}

function setupPaymentMethods() {
  const paymentMethods = document.querySelectorAll(
    'input[name="paymentMethod"]'
  );
  const creditCardDetails = document.getElementById("creditCardDetails");

  paymentMethods.forEach((method) => {
    method.addEventListener("change", function () {
      if (this.value === "creditCard") {
        creditCardDetails.style.display = "block";
        // Make credit card fields required
        document.getElementById("cardNumber").required = true;
        document.getElementById("expiryDate").required = true;
        document.getElementById("cvv").required = true;
        document.getElementById("cardName").required = true;
      } else {
        creditCardDetails.style.display = "none";
        // Remove required from credit card fields
        document.getElementById("cardNumber").required = false;
        document.getElementById("expiryDate").required = false;
        document.getElementById("cvv").required = false;
        document.getElementById("cardName").required = false;
      }
    });
  });
}

function setupFormValidation() {
  // Card number formatting
  const cardNumberInput = document.getElementById("cardNumber");
  if (cardNumberInput) {
    cardNumberInput.addEventListener("input", function (e) {
      let value = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
      let matches = value.match(/\d{4,16}/g);
      let match = (matches && matches[0]) || "";
      let parts = [];

      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }

      if (parts.length) {
        e.target.value = parts.join(" ");
      } else {
        e.target.value = value;
      }
    });
  }

  // Expiry date formatting
  const expiryInput = document.getElementById("expiryDate");
  if (expiryInput) {
    expiryInput.addEventListener("input", function (e) {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length >= 2) {
        value = value.substring(0, 2) + "/" + value.substring(2, 4);
      }
      e.target.value = value;
    });
  }

  // CVV validation
  const cvvInput = document.getElementById("cvv");
  if (cvvInput) {
    cvvInput.addEventListener("input", function (e) {
      e.target.value = e.target.value.replace(/\D/g, "");
    });
  }
}

function setupPlaceOrder() {
  const placeOrderBtn = document.getElementById("placeOrderBtn");

  placeOrderBtn.addEventListener("click", function (e) {
    e.preventDefault();

    if (validateForms()) {
      processOrder();
    }
  });
}

function validateForms() {
  const deliveryForm = document.getElementById("deliveryForm");
  const paymentForm = document.getElementById("paymentForm");

  let isValid = true;

  // Check delivery form
  const requiredDeliveryFields = deliveryForm.querySelectorAll("[required]");
  requiredDeliveryFields.forEach((field) => {
    if (!field.value.trim()) {
      field.classList.add("error");
      isValid = false;
    } else {
      field.classList.remove("error");
    }
  });

  // Check payment form if credit card is selected
  const selectedPayment = document.querySelector(
    'input[name="paymentMethod"]:checked'
  );
  if (selectedPayment && selectedPayment.value === "creditCard") {
    const requiredPaymentFields = document
      .getElementById("creditCardDetails")
      .querySelectorAll("[required]");
    requiredPaymentFields.forEach((field) => {
      if (!field.value.trim()) {
        field.classList.add("error");
        isValid = false;
      } else {
        field.classList.remove("error");
      }
    });
  }

  if (!isValid) {
    showNotification("Please fill in all required fields", "error");
  }

  return isValid;
}

function processOrder() {
  const placeOrderBtn = document.getElementById("placeOrderBtn");

  // Show loading state
  placeOrderBtn.textContent = "Processing Order...";
  placeOrderBtn.disabled = true;

  // Collect order data
  const orderData = {
    items: API.Cart.getCart(),
    delivery: getDeliveryData(),
    payment: getPaymentData(),
    timestamp: new Date().toISOString(),
    orderNumber: generateOrderNumber(),
  };

  // Store order data for success page
  localStorage.setItem("lastOrder", JSON.stringify(orderData));

  // Simulate processing delay
  setTimeout(() => {
    // Clear cart
    API.Cart.clearCart();

    // Redirect to success page
    window.location.href = "success.html";
  }, 2000);
}

function getDeliveryData() {
  return {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    address: document.getElementById("address").value,
    city: document.getElementById("city").value,
    zipCode: document.getElementById("zipCode").value,
    country: document.getElementById("country").value,
    notes: document.getElementById("deliveryNotes").value,
  };
}

function getPaymentData() {
  const selectedMethod = document.querySelector(
    'input[name="paymentMethod"]:checked'
  );
  const paymentData = {
    method: selectedMethod.value,
  };

  if (selectedMethod.value === "creditCard") {
    paymentData.cardNumber =
      "**** **** **** " + document.getElementById("cardNumber").value.slice(-4);
    paymentData.cardName = document.getElementById("cardName").value;
  }

  return paymentData;
}

function generateOrderNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `ORD-${year}${month}${day}-${random}`;
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
