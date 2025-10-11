// Login Page JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // Update cart count display
  API.Cart.updateCartUI();

  // Redirect if already logged in
  if (API.Auth.isLoggedIn()) {
    const shopUrl = window.location.pathname.includes("/account/")
      ? "../shop.html"
      : "shop.html";
    window.location.href = shopUrl;
    return;
  }

  const loginForm = document.getElementById("loginForm");
  const messageDiv = document.getElementById("loginMessage");

  // Add input validation and styling
  setupFormValidation();

  // Setup forgot password link
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", function (e) {
      e.preventDefault();
      showForgotPassword();
    });
  }

  // Setup demo credentials button
  const fillDemoBtn = document.getElementById("fillDemoBtn");
  if (fillDemoBtn) {
    fillDemoBtn.addEventListener("click", function () {
      // Generate a new test account email
      const timestamp = Date.now();
      const testEmail = `testuser${timestamp}@stud.noroff.no`;

      document.getElementById("email").value = testEmail;
      document.getElementById("password").value = "password123";

      const messageDiv = document.getElementById("loginMessage");
      messageDiv.innerHTML = `
        <div class="notification info">
          <p><strong>Demo Account Created!</strong><br>
          Email: ${testEmail}<br>
          Password: password123<br><br>
          <em>This account was just created for testing. You can now click Login.</em></p>
        </div>
      `;

      // Auto-register this demo account
      registerDemoAccount(testEmail, "TestUser_" + timestamp, "password123");
    });
  }

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Show loading state
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Logging in...";
    submitBtn.disabled = true;

    try {
      // Clear any existing messages
      messageDiv.innerHTML = "";

      // Show debug info
      console.log("Attempting login with:", {
        email,
        password: password.substring(0, 3) + "***",
      });

      // Attempt login
      const loginResult = await API.Auth.login({ email, password });
      console.log("Login result:", loginResult);

      if (loginResult.success) {
        messageDiv.innerHTML = "";
        const successDiv = document.createElement("div");
        successDiv.className = "notification success";
        successDiv.textContent = "Login successful! Creating API key...";
        messageDiv.appendChild(successDiv);

        // Create API key for authenticated requests
        const apiKeyResult = await API.Auth.createApiKey();

        if (apiKeyResult.success) {
          messageDiv.innerHTML = "";
          const completeDiv = document.createElement("div");
          completeDiv.className = "notification success";
          completeDiv.textContent = "Login complete! Redirecting...";
          messageDiv.appendChild(completeDiv);
          setTimeout(() => {
            const shopUrl = window.location.pathname.includes("/account/")
              ? "../shop.html"
              : "shop.html";
            window.location.href = shopUrl;
          }, 1500);
        } else {
          // Login successful but API key creation failed
          messageDiv.innerHTML = "";
          const warningDiv = document.createElement("div");
          warningDiv.className = "notification error";
          warningDiv.textContent =
            "Login successful but failed to create API key. Some features may not work.";
          messageDiv.appendChild(warningDiv);
          setTimeout(() => {
            const shopUrl = window.location.pathname.includes("/account/")
              ? "../shop.html"
              : "shop.html";
            window.location.href = shopUrl;
          }, 2000);
        }
      } else {
        messageDiv.innerHTML = "";
        const errorDiv = document.createElement("div");
        errorDiv.className = "error";
        errorDiv.textContent = `Login failed: ${loginResult.error}`;
        messageDiv.appendChild(errorDiv);
      }
    } catch (error) {
      messageDiv.innerHTML = "";
      const errorDiv = document.createElement("div");
      errorDiv.className = "error";
      errorDiv.textContent = `An error occurred: ${error.message}`;
      messageDiv.appendChild(errorDiv);
    } finally {
      // Reset button state
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
});

function setupFormValidation() {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const submitBtn = document.querySelector('button[type="submit"]');

  // Email validation
  emailInput.addEventListener("blur", function () {
    validateEmail(this);
  });

  emailInput.addEventListener("input", function () {
    if (this.classList.contains("error")) {
      validateEmail(this);
    }
  });

  // Password validation
  passwordInput.addEventListener("blur", function () {
    validatePassword(this);
  });

  passwordInput.addEventListener("input", function () {
    if (this.classList.contains("error")) {
      validatePassword(this);
    }
    // Update submit button state
    updateSubmitButton();
  });

  // Email input changes
  emailInput.addEventListener("input", updateSubmitButton);

  function updateSubmitButton() {
    const isEmailValid = emailInput.value && isValidEmail(emailInput.value);
    const isPasswordValid =
      passwordInput.value && passwordInput.value.length >= 1;

    if (isEmailValid && isPasswordValid) {
      submitBtn.disabled = false;
      submitBtn.classList.remove("btn-disabled");
    } else {
      submitBtn.disabled = true;
      submitBtn.classList.add("btn-disabled");
    }
  }

  // Initial button state - don't disable initially
  // updateSubmitButton();
}

function validateEmail(emailInput) {
  const email = emailInput.value.trim();

  if (!email) {
    showFieldError(emailInput, "Email is required");
    return false;
  }

  if (!isValidEmail(email)) {
    showFieldError(emailInput, "Please enter a valid email address");
    return false;
  }

  clearFieldError(emailInput);
  return true;
}

function validatePassword(passwordInput) {
  const password = passwordInput.value;

  if (!password) {
    showFieldError(passwordInput, "Password is required");
    return false;
  }

  clearFieldError(passwordInput);
  return true;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showFieldError(input, message) {
  input.classList.add("error");

  // Remove existing error message
  const existingError = input.parentNode.querySelector(".field-error");
  if (existingError) {
    existingError.remove();
  }

  // Add new error message
  const errorDiv = document.createElement("div");
  errorDiv.className = "field-error";
  errorDiv.textContent = message;
  input.parentNode.appendChild(errorDiv);
}

function clearFieldError(input) {
  input.classList.remove("error");

  const existingError = input.parentNode.querySelector(".field-error");
  if (existingError) {
    existingError.remove();
  }
}

function showForgotPassword() {
  const messageDiv = document.getElementById("loginMessage");
  messageDiv.innerHTML = `
    <div class="notification info">
      <p>Password recovery feature coming soon! Please contact support for assistance.</p>
    </div>
  `;
}

// Add some demo accounts for testing
function showDemoAccounts() {
  const messageDiv = document.getElementById("loginMessage");
  messageDiv.innerHTML = `
    <div class="notification info">
      <h4>Demo Accounts Available:</h4>
      <p><strong>Email:</strong> demo@example.com</p>
      <p><strong>Password:</strong> password123</p>
      <small>Note: Use these credentials for testing purposes.</small>
    </div>
  `;
}

async function registerDemoAccount(email, name, password) {
  try {
    console.log("Auto-registering demo account:", { email, name });

    const result = await API.Auth.register({
      name,
      email,
      password,
    });

    if (result.success) {
      console.log("Demo account registered successfully");
      const messageDiv = document.getElementById("loginMessage");
      messageDiv.innerHTML = `
        <div class="notification success">
          <p><strong>Demo Account Ready!</strong><br>
          The test account has been created and is ready to use.<br>
          Click the Login button to sign in.</p>
        </div>
      `;
    } else {
      console.log("Demo account registration failed:", result.error);
    }
  } catch (error) {
    console.log("Demo account registration error:", error);
    // Don't show error to user - account might already exist, which is fine
  }
}
