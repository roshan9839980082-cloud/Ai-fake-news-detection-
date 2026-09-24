lucide.createIcons();

const profileForm = document.getElementById("profile-form");
const fullnameInput = document.getElementById("fullname-input");
const displayName = document.getElementById("display-name");
const signOutBtn = document.getElementById("sign-out-btn");
const toast = document.getElementById("toast");

// Function to show Toast Notification
function showNotification(message) {
  toast.innerText = message;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

// Working Save Changes Button logic (Flask Backend Integrated)
profileForm.addEventListener("submit", async function (e) {
  e.preventDefault(); // Page refresh hone se roke
  const newName = fullnameInput.value.trim();
  const bioInput = document.getElementById("bio-input").value;
  const emailInput = document.getElementById("email") ? document.getElementById("email").value : "";

  if (newName !== "") {
    try {
      const response = await fetch('/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          fullName: newName, 
          email: emailInput, 
          bio: bioInput 
        })
      });

      const result = await response.json();

      if (response.ok) {
        if (displayName) {
          displayName.innerText = newName; // Top card ka name update hoga
        }
        showNotification(result.message || "Profile details updated successfully!");
      } else {
        showNotification('Error: ' + (result.error || 'Failed to update'));
      }
    } catch (error) {
      console.error('Network Error:', error);
      showNotification('Server connection failed!');
    }
  }
});

// Working Sign Out Button logic
signOutBtn.addEventListener("click", function () {
  const confirmLogout = confirm("Are you sure you want to sign out?");
  if (confirmLogout) {
    showNotification("Signing out...");
    window.location.href = '/logout';
  }
});


