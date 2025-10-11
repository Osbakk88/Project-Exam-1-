// Register Page JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // Redirect if already logged in
  if (API.Auth.isLoggedIn()) {
    window.location.href = "shop.html";
    return;
  }

  const registerForm = document.getElementById("registerForm");
  const messageDiv = document.getElementById("registerMessage");

  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Validate passwords match
    if (password !== confirmPassword) {
      messageDiv.innerHTML = "";
      const errorDiv = document.createElement("div");
      errorDiv.className = "error";
      errorDiv.textContent = "Passwords do not match.";
      messageDiv.appendChild(errorDiv);
      return;
    }

    // Show loading state
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Registering...";
    submitBtn.disabled = true;

    try {
      // Attempt registration
      const registerResult = await API.Auth.register({
        name,
        email,
        password,
      });

      if (registerResult.success) {
        messageDiv.innerHTML = "";
        const successDiv = document.createElement("div");
        successDiv.className = "notification success";
        successDiv.textContent =
          "Registration successful! You can now login with your credentials.";
        messageDiv.appendChild(successDiv);

        // Clear form
        registerForm.reset();

        // Redirect to login after a delay
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } else {
        messageDiv.innerHTML = "";
        const errorDiv = document.createElement("div");
        errorDiv.className = "error";
        errorDiv.textContent = `Registration failed: ${registerResult.error}`;
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

  // Real-time password validation
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  function validatePasswords() {
    if (
      confirmPasswordInput.value &&
      passwordInput.value !== confirmPasswordInput.value
    ) {
      confirmPasswordInput.setCustomValidity("Passwords do not match");
    } else {
      confirmPasswordInput.setCustomValidity("");
    }
  }

  passwordInput.addEventListener("input", validatePasswords);
  confirmPasswordInput.addEventListener("input", validatePasswords);
});
