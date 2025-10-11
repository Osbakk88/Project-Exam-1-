// Success page functionality
document.addEventListener("DOMContentLoaded", function () {
  // Update navigation based on login status
  updateNavigation();

  // Load order details
  loadOrderDetails();

  // Setup event listeners
  setupEventListeners();

  // Update cart UI (should show 0 items)
  API.Cart.updateCartUI();
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

function loadOrderDetails() {
  const lastOrderData = localStorage.getItem("lastOrder");

  if (!lastOrderData) {
    // If no order data, redirect to shop
    showErrorAndRedirect();
    return;
  }

  try {
    const order = JSON.parse(lastOrderData);
    displayOrderDetails(order);
  } catch (error) {
    console.error("Error parsing order data:", error);
    showErrorAndRedirect();
  }
}

function showErrorAndRedirect() {
  document.querySelector(".success-content").innerHTML = `
    <div class="error-state">
      <h2>No Order Found</h2>
      <p>We couldn't find your order details. Please check your email for confirmation or contact support.</p>
      <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
    </div>
  `;
}

function displayOrderDetails(order) {
  // Update order information
  document.getElementById("orderNumber").textContent =
    order.orderNumber || "#ORD-2025-001";

  const orderDate = new Date(order.timestamp);
  document.getElementById("orderDate").textContent =
    orderDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // Calculate estimated delivery (3-7 days from order)
  const deliveryStart = new Date(orderDate);
  deliveryStart.setDate(deliveryStart.getDate() + 3);
  const deliveryEnd = new Date(orderDate);
  deliveryEnd.setDate(deliveryEnd.getDate() + 7);

  const deliveryText = `${deliveryStart.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  })}-${deliveryEnd.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`;

  document.getElementById("deliveryDate").textContent = deliveryText;

  // Calculate and display total
  const total = calculateOrderTotal(order.items);
  document.getElementById("totalAmount").textContent =
    API.UI.formatPrice(total);

  // Display delivery address
  displayDeliveryAddress(order.delivery);

  // Display payment method
  displayPaymentMethod(order.payment);

  // Display ordered items
  displayOrderedItems(order.items);
}

function calculateOrderTotal(items) {
  let subtotal = 0;

  items.forEach((item) => {
    const price =
      item.discountedPrice && item.discountedPrice < item.price
        ? item.discountedPrice
        : item.price;
    subtotal += price * item.quantity;
  });

  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;

  return subtotal + shipping + tax;
}

function displayDeliveryAddress(delivery) {
  const addressContainer = document.getElementById("deliveryAddress");

  addressContainer.innerHTML = `
    <div class="address-line">${delivery.firstName} ${delivery.lastName}</div>
    <div class="address-line">${delivery.address}</div>
    <div class="address-line">${delivery.city}, ${delivery.zipCode}</div>
    <div class="address-line">${delivery.country}</div>
    ${
      delivery.phone
        ? `<div class="address-line">Phone: ${delivery.phone}</div>`
        : ""
    }
    ${
      delivery.notes
        ? `<div class="address-notes">Notes: ${delivery.notes}</div>`
        : ""
    }
  `;
}

function displayPaymentMethod(payment) {
  const paymentContainer = document.getElementById("paymentMethod");

  let paymentIcon = "";
  let paymentText = "";

  switch (payment.method) {
    case "creditCard":
      paymentIcon = "💳";
      paymentText = `Credit/Debit Card ending in ${payment.cardNumber.slice(
        -4
      )}`;
      break;
    case "paypal":
      paymentIcon = "🅿️";
      paymentText = "PayPal";
      break;
    case "applePay":
      paymentIcon = "📱";
      paymentText = "Apple Pay";
      break;
    case "bankTransfer":
      paymentIcon = "🏦";
      paymentText = "Bank Transfer";
      break;
    default:
      paymentIcon = "💳";
      paymentText = "Credit/Debit Card";
  }

  paymentContainer.innerHTML = `
    <div class="payment-method-display">
      <span class="payment-icon">${paymentIcon}</span>
      <span class="payment-text">${paymentText}</span>
    </div>
  `;
}

function displayOrderedItems(items) {
  const itemsContainer = document.getElementById("orderedItems");

  itemsContainer.innerHTML = "";

  items.forEach((item) => {
    const price =
      item.discountedPrice && item.discountedPrice < item.price
        ? item.discountedPrice
        : item.price;

    const itemTotal = price * item.quantity;

    const itemDiv = document.createElement("div");
    itemDiv.className = "order-item";

    itemDiv.innerHTML = `
      <div class="order-item-image">
        <img src="${item.image?.url || item.image || "/api/placeholder/80/80"}" 
             alt="${item.title}" />
      </div>
      <div class="order-item-details">
        <h4 class="order-item-title">${item.title}</h4>
        <div class="order-item-info">
          <span class="quantity">Qty: ${item.quantity}</span>
          <span class="price">${API.UI.formatPrice(price)} each</span>
          <span class="total">${API.UI.formatPrice(itemTotal)}</span>
        </div>
      </div>
    `;

    itemsContainer.appendChild(itemDiv);
  });
}

function setupEventListeners() {
  // Print order button
  const printBtn = document.getElementById("printOrderBtn");
  if (printBtn) {
    printBtn.addEventListener("click", function () {
      window.print();
    });
  }

  // Social sharing buttons
  const socialBtns = document.querySelectorAll(".social-btn");
  socialBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const platform = this.classList.contains("facebook")
        ? "Facebook"
        : this.classList.contains("twitter")
        ? "Twitter"
        : "Instagram";

      showNotification(`Sharing on ${platform} - Feature coming soon!`);
    });
  });

  // Logout handler
  document.addEventListener("click", function (e) {
    if (e.target.getAttribute("data-action") === "logout") {
      API.Auth.logout();
      return;
    }
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
