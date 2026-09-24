// const searchInput = document.getElementById("searchInput");

// // Live search event listener
// searchInput.addEventListener("input", function (e) {
//   const query = e.target.value.trim();

//   // Aap yahan apni filtering ya API search ka logic likh sakte hain
//   console.log("Searching for:", query);
// });

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card-btn");
  const searchInput = document.getElementById("searchInput");

  // 2. Search Filter Functionality
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();

    cards.forEach((card) => {
      const titleText = card
        .querySelector(".card-title")
        .innerText.toLowerCase();
      const descText = card
        .querySelector(".card-description")
        .innerText.toLowerCase();
      const tagsText = card
        .querySelector(".tags-container")
        .innerText.toLowerCase();

      if (
        titleText.includes(query) ||
        descText.includes(query) ||
        tagsText.includes(query)
      ) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
  });
});
