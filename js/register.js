document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registerFormElement");
  const messageDiv = document.getElementById("registerMessage");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    const userData = {
      name: name,
      email: email,
      password: password,
      bio: "This is my NightNode bio",
      avatar: {
        url: "https://i.postimg.cc/L6m0d8vW/Night-Node-6.webp",
        alt: "Placeholder NightNode avatar",
      },
      banner: {
        url: "https://i.postimg.cc/26QyZws2/Night-Node-3.webp",
        alt: "Placeholder NightNode banner",
      },
      venueManager: false,
    };

    try {
      const response = await fetch("https://v2.api.noroff.dev/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        messageDiv.innerHTML = `
          <div class="notification success">
            <p>Registration successful! Redirecting to login...</p>
          </div>
        `;
        setTimeout(() => {
          window.location.href = `login.html?email=${encodeURIComponent(
            email
          )}&password=${encodeURIComponent(password)}`;
        }, 1500);
      } else {
        console.log("Raw error response:", data);
        messageDiv.innerHTML = `
          <div class="notification error">
            <p>Registration failed: ${
              data.errors?.[0]?.message || "Check console for details."
            }</p>
          </div>
        `;
      }
    } catch (error) {
      console.error("Registration error:", error);
      messageDiv.innerHTML =
        '<p style="color: red;">Something went wrong. Please try again later.</p>';
    }
  });
});
