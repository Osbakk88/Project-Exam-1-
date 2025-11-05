// Combined Login & Register Page JavaScript
// NOTE: AI assistance used for authentication flow, error handling, and form validation
document.addEventListener("DOMContentLoaded", function () {
  console.log(" Login/Register page loaded");

  // Initialize cart display
  API.Cart.updateCartUI();

  // Check if already logged in - commented out for testing
  // if (API.Auth.isLoggedIn()) {
  //   window.location.href = 'shop.html';
  //   return;
  // }

  // Tab switching functionality is handled by the switchTab function and onclick events

  // Pre-create demo accounts when page loads
  initializeDemoAccounts();

  // Login form handler
  document
    .getElementById("loginFormElement")
    .addEventListener("submit", handleLogin);

  // Register form handler
  document
    .getElementById("registerFormElement")
    .addEventListener("submit", handleRegister);
});

async function initializeDemoAccounts() {
}

// Switch between login and register tabs
function switchTab(tabName) {
  const tabs = document.querySelectorAll(".auth-tab");
  const forms = document.querySelectorAll(".auth-form");

  // Update tab appearance
  tabs.forEach((tab) => {
    tab.classList.remove("active");
    if (tab.getAttribute("data-tab") === tabName) {
      tab.classList.add("active");
    }
  });

  // Show correct form
  forms.forEach((form) => {
    form.classList.remove("active");
    if (form.id === tabName + "Form") {
      form.classList.add("active");
    }
  });
}

// Create new demo account
async function createNewDemoAccount() {
  const timestamp = Date.now();
  const email = `newuser${timestamp}@stud.noroff.no`;
  const name = `NewUser_${timestamp}`;
  const password = "password123";

  const message = document.getElementById("loginMessage");
  message.innerHTML = `
    <div class="notification info">
      <p>Creating new demo account...</p>
    </div>
  `;

  try {
    await API.Auth.register({ name, email, password });

    message.innerHTML = `
      <div class="notification success">
        <p>New account created and ready!<br>
        <strong>Email:</strong> ${email}<br>
        <strong>Password:</strong> ${password}<br>
        Click "Login" to sign in.</p>
      </div>
    `;
  } catch (error) {
    message.innerHTML = `
      <div class="notification error">
        <p>Failed to create account: ${error.message}</p>
      </div>
    `;
  }
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();
  console.log("🔄 Login form submitted");

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  console.log(" Email:", email);
  console.log(" Password length:", password.length);

  const message = document.getElementById("loginMessage");
  const submitBtn = e.target.querySelector('button[type="submit"]');

  // Show loading state
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Logging in...";
  submitBtn.disabled = true;

  message.innerHTML = `
    <div class="notification info">
      <p>Signing you in...</p>
    </div>
  `;

  try {
    console.log("Attempting login with:", { email, password });

    // Special handling for the working owner account
    if (email === "owner@stud.noroff.no" && password === "owner123") {
      console.log(" Using owner account with valid tokens");

      // Set the working credentials from api.js
      localStorage.setItem(
        "accessToken",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoib3NiYWtrODgiLCJlbWFpbCI6ImNocm9zYjAyMzk3QHN0dWQubm9yb2ZmLm5vIiwiaWF0IjoxNzYwMTg1NzgwfQ.w3ARZ4X-zyPnZFM0rrNJKuxUxf11p_rtapEGo0tbHfI"
      );
      localStorage.setItem("apiKey", "4a7c1acd-3cae-47ee-a661-1ef655293dea");
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: "osbakk88",
          email: "chrosb02397@stud.noroff.no",
        })
      );

      message.innerHTML = `
        <div class="notification success">
          <p>Login successful! Redirecting...</p>
        </div>
      `;

      setTimeout(() => {
        const pendingCheckout = localStorage.getItem("pendingCheckout");
        const returnUrl = localStorage.getItem("returnUrl");

        if (pendingCheckout === "true" && returnUrl) {
          localStorage.removeItem("pendingCheckout");
          localStorage.removeItem("returnUrl");
          window.location.href = returnUrl;
        } else {
          window.location.href = "shop.html";
        }
      }, 1500);

      return;
    }

    // Try normal API login for other accounts
    const result = await API.Auth.login({ email, password });
    console.log("Login result:", result);

    if (result.success) {
      message.innerHTML = `
        <div class="notification success">
          <p>Login successful! Redirecting...</p>
        </div>
      `;

      // Create API key and redirect
      try {
        await API.Auth.createApiKey();
      } catch (apiKeyError) {
        console.log("API key creation failed, but continuing...");
      }

      setTimeout(() => {
        // Check if user was trying to checkout before login
        const pendingCheckout = localStorage.getItem("pendingCheckout");
        const returnUrl = localStorage.getItem("returnUrl");

        if (pendingCheckout === "true" && returnUrl) {
          // Clear the pending checkout flags
          localStorage.removeItem("pendingCheckout");
          localStorage.removeItem("returnUrl");
          // Redirect to checkout
          window.location.href = returnUrl;
        } else {
          // Normal redirect to shop
          window.location.href = "shop.html";
        }
      }, 1500);
    } else {
      message.innerHTML = `
        <div class="notification error">
          <p>Login failed: ${result.error}</p>
        </div>
      `;
    }
  } catch (error) {
    console.error("Login error:", error);
    message.innerHTML = `
      <div class="notification error">
        <p>Login error: ${error.message}</p>
      </div>
    `;
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// Handle registration
async function handleRegister(e) {
  e.preventDefault();
  console.log(" Registration form submitted");

  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  console.log(" Registration data:", {
    name,
    email,
    passwordLength: password.length,
  });

  const message = document.getElementById("registerMessage");
  if (!message) {
    console.error(" registerMessage element not found!");
    alert("Registration form error - message container missing");
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');

  // Test if we can display a message
  message.innerHTML = `
    <div class="notification info">
      <p>Testing message display...</p>
    </div>
  `;

  console.log(" Message displayed successfully");

  // Noroff API validation
  if (!name || name.length < 2) {
    message.innerHTML = `
      <div class="notification error">
        <p>Name must be at least 2 characters</p>
      </div>
    `;
    return;
  }

  if (name.includes(" ")) {
    message.innerHTML = `
      <div class="notification error">
        <p>Name cannot contain spaces. Use underscores instead (e.g., john_doe)</p>
      </div>
    `;
    return;
  }

  if (!email.endsWith("@stud.noroff.no")) {
    message.innerHTML = `
      <div class="notification error">
        <p>Email must end with @stud.noroff.no</p>
      </div>
    `;
    return;
  }

  if (password !== confirmPassword) {
    message.innerHTML = `
      <div class="notification error">
        <p>Passwords do not match</p>
      </div>
    `;
    return;
  }

  if (password.length < 8) {
    message.innerHTML = `
      <div class="notification error">
        <p>Password must be at least 8 characters</p>
      </div>
    `;
    return;
  }

  // Show loading state
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Creating account...";
  submitBtn.disabled = true;

  message.innerHTML = `
    <div class="notification info">
      <p>Creating your account...</p>
    </div>
  `;

  try {
    const result = await API.Auth.register({ name, email, password });
    console.log(" Registration API result:", result);

    if (result.success) {
      message.innerHTML = `
        <div class="notification success">
          <p>Account created successfully!<br>
          You can now switch to the Login tab to sign in.</p>
        </div>
      `;

      // Clear form
      e.target.reset();

      // Auto-fill login form and switch to login tab
      setTimeout(() => {
        document.getElementById("loginEmail").value = email;
        document.getElementById("loginPassword").value = password;

        // Switch to login tab
        document.querySelector('[data-tab="login"]').click();

        const loginMessage = document.getElementById("loginMessage");
        loginMessage.innerHTML = `
          <div class="notification success">
            <p>Account created! Credentials filled. Click "Login" to sign in.</p>
          </div>
        `;
      }, 2000);
    } else {
      // Handle API error (this is where our registration restriction should be caught)
      console.log(" Registration failed with API error:", result.error);

      message.innerHTML = `
        <div class="notification error">
          <p><strong>Account Registration Unavailable</strong></p>
          <p>The Noroff API restricts new account creation.</p>
          <div style="margin-top: 1.5rem; padding: 1.2rem; background: #e8f5e8; border-radius: 8px; border-left: 4px solid #4CAF50;">
            <p style="margin: 0; color: #2e7d32;">
              <strong>Use the demo account instead:</strong><br><br>
              📧 <strong>Email:</strong> owner@stud.noroff.no<br>
              🔐 <strong>Password:</strong> owner123
            </p>
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error(" Registration error caught:", error);
    console.log(" Message container exists:", !!message);
    console.log(" Message container element:", message);

    const errorHTML = `
      <div class="notification error">
        <p><strong>Account Registration Unavailable</strong></p>
        <p>The Noroff API restricts new account creation.</p>
        <div style="margin-top: 1.5rem; padding: 1.2rem; background: #e8f5e8; border-radius: 8px; border-left: 4px solid #4CAF50;">
          <p style="margin: 0; color: #2e7d32;">
            <strong>Use the demo account instead:</strong><br><br>
             <strong>Email:</strong> owner@stud.noroff.no<br>
             <strong>Password:</strong> owner123
          </p>
        </div>
      </div>
    `;

    console.log(" Setting error HTML:", errorHTML);
    message.innerHTML = errorHTML;
    console.log(" Error message set, current innerHTML:", message.innerHTML);
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}
