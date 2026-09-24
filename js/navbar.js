fetch("navbar.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("navbar-placeholder").innerHTML = data;

    // Current page ko active karo
    const currentPage = window.location.pathname.split("/").pop();

    const navLinks = document.querySelectorAll(".nav-links a");

    navLinks.forEach((link) => {
      const linkPage = link.getAttribute("href");

      if (linkPage === currentPage) {
        link.classList.add("active");
      }
    });

    // Navbar load hone ke baad dropdown ka code chalega
    const profileToggle = document.getElementById("profileToggle");
    const dropdownMenu = document.getElementById("dropdownMenu");

    profileToggle.addEventListener("click", function (event) {
      event.stopPropagation();

      dropdownMenu.classList.toggle("show");
    });

    document.addEventListener("click", function () {
      dropdownMenu.classList.remove("show");
    });
  })
  .catch((error) => {
    console.error("Navbar load nahi hua:", error);
  });

// Profile button aur dropdown ko select karo
const profileToggle = document.getElementById("profileToggle");
const dropdownMenu = document.getElementById("dropdownMenu");

// User icon par click
profileToggle.addEventListener("click", function (event) {
  // Click ko document tak jane se roko
  event.stopPropagation();

  // Dropdown open / close
  dropdownMenu.classList.toggle("show");
});

// Dropdown ke bahar click karne par close
document.addEventListener("click", function () {
  dropdownMenu.classList.remove("show");
});

