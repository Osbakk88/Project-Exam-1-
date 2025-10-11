// Combined Login & Register Page JavaScript
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Login/Register page loaded");

  // Initialize cart display
  API.Cart.updateCartUI();

  // Check if already logged in - temporarily disabled for testing
  // if (API.Auth.isLoggedIn()) {
  //   window.location.href = 'shop.html';
  //   return;
  // }

  // Tab switching functionality
  const tabs = document.querySelectorAll(".auth-tab");
  const forms = document.querySelectorAll(".auth-form");

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const targetTab = this.dataset.tab;

      // Update tab appearance
      tabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      // Show correct form
      forms.forEach((form) => {
        form.classList.remove("active");
        if (form.id === targetTab + "Form") {
          form.classList.add("active");
        }
      });
    });
  });

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

// Pre-create demo accounts
async function initializeDemoAccounts() {
  console.log("🔧 Initializing demo accounts...");

  const demoAccounts = [
    {
      name: "AdminUser",
      email: "admin_user@stud.noroff.no",
      password: "admin123",
    },
    {
      name: "DemoUser",
      email: "demo_user@stud.noroff.no",
      password: "password123",
    },
  ];

  for (const account of demoAccounts) {
    try {
      await API.Auth.register(account);
      console.log(`✅ Demo account created: ${account.email}`);
    } catch (error) {
      console.log(`ℹ️ Demo account exists: ${account.email}`);
    }
  }
}

// Fill login credentials
function fillCredentials(email, password) {
  document.getElementById("loginEmail").value = email;
  document.getElementById("loginPassword").value = password;

  const message = document.getElementById("loginMessage");
  message.innerHTML = `
    <div class="notification success">
      <p>✅ Credentials filled! Click "Login" to sign in.</p>
    </div>
  `;
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
      <p>🔄 Creating new demo account...</p>
    </div>
  `;

  try {
    await API.Auth.register({ name, email, password });

    // Fill the credentials
    fillCredentials(email, password);

    message.innerHTML = `
      <div class="notification success">
        <p>✅ New account created and ready!<br>
        <strong>Email:</strong> ${email}<br>
        <strong>Password:</strong> ${password}<br>
        Click "Login" to sign in.</p>
      </div>
    `;
  } catch (error) {
    message.innerHTML = `
      <div class="notification error">
        <p>❌ Failed to create account: ${error.message}</p>
      </div>
    `;
  }
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const message = document.getElementById("loginMessage");
  const submitBtn = e.target.querySelector('button[type="submit"]');

  // Show loading state
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Logging in...";
  submitBtn.disabled = true;

  message.innerHTML = `
    <div class="notification info">
      <p>🔄 Signing you in...</p>
    </div>
  `;

  try {
    const result = await API.Auth.login({ email, password });

    if (result.success) {
      message.innerHTML = `
        <div class="notification success">
          <p>✅ Login successful! Redirecting...</p>
        </div>
      `;

      // Create API key and redirect
      try {
        await API.Auth.createApiKey();
      } catch (apiKeyError) {
        console.log("API key creation failed, but continuing...");
      }

      setTimeout(() => {
        window.location.href = "shop.html";
      }, 1500);
    } else {
      message.innerHTML = `
        <div class="notification error">
          <p>❌ Login failed: ${result.error}</p>
        </div>
      `;
    }
  } catch (error) {
    console.error("Login error:", error);
    message.innerHTML = `
      <div class="notification error">
        <p>❌ Login error: ${error.message}</p>
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

  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const message = document.getElementById("registerMessage");
  const submitBtn = e.target.querySelector('button[type="submit"]');

  // Validation
  if (!name.match(/^[a-zA-Z0-9_]+$/)) {
    message.innerHTML = `
      <div class="notification error">
        <p>❌ Name can only contain letters, numbers, and underscore (_)</p>
      </div>
    `;
    return;
  }

  if (!email.endsWith("@stud.noroff.no")) {
    message.innerHTML = `
      <div class="notification error">
        <p>❌ Email must be @stud.noroff.no</p>
      </div>
    `;
    return;
  }

  if (password !== confirmPassword) {
    message.innerHTML = `
      <div class="notification error">
        <p>❌ Passwords do not match</p>
      </div>
    `;
    return;
  }

  if (password.length < 8) {
    message.innerHTML = `
      <div class="notification error">
        <p>❌ Password must be at least 8 characters</p>
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
      <p>🔄 Creating your account...</p>
    </div>
  `;

  try {
    const result = await API.Auth.register({ name, email, password });

    if (result.success) {
      message.innerHTML = `
        <div class="notification success">
          <p>✅ Account created successfully!<br>
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
            <p>✅ Account created! Credentials filled. Click "Login" to sign in.</p>
          </div>
        `;
      }, 2000);
    } else {
      message.innerHTML = `
        <div class="notification error">
          <p>❌ Registration failed: ${result.error}</p>
        </div>
      `;
    }
  } catch (error) {
    console.error("Registration error:", error);
    let errorMsg = error.message;
    if (error.errors && Array.isArray(error.errors)) {
      errorMsg = error.errors.map((err) => err.message).join(", ");
    }

    message.innerHTML = `
      <div class="notification error">
        <p>❌ Registration error: ${errorMsg}</p>
      </div>
    `;
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}
