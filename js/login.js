// Login Page JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // Redirect if already logged in
  if (API.Auth.isLoggedIn()) {
    window.location.href = "shop.html";
    return;
  }

  const loginForm = document.getElementById("loginForm");
  const messageDiv = document.getElementById("loginMessage");

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
      // Attempt login
      const loginResult = await API.Auth.login({ email, password });

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
            window.location.href = "shop.html";
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
            window.location.href = "shop.html";
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
