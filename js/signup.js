document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signupForm");
  const googleBtn = document.querySelector(".google-btn");

  // Google Sign Up Button
  googleBtn.addEventListener("click", function () {
    alert("Google Sign-In is not connected yet.");
  });

  // Form Validation
  signupForm.addEventListener("submit", function (e) {
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // Full Name validation
    if (fullName.length < 2) {
      e.preventDefault();
      alert("Please enter a valid full name.");
      return;
    }

    // Email validation
    if (!email.includes("@") || !email.includes(".")) {
      e.preventDefault();
      alert("Please enter a valid email address.");
      return;
    }

    // Password validation
    if (password.length < 8) {
      e.preventDefault();
      alert("Password must be at least 8 characters long.");
      return;
    }

    // IMPORTANT:
    // Yahan preventDefault() nahi hai.
    // Form normally Flask ke /signup route par submit hoga.
  });
});