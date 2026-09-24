document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const tabBtns = document.querySelectorAll(".tab-btn");
  const faqItems = document.querySelectorAll(".faq-item");

  // AI response container create karna agar HTML mein nahi hai
  let aiBox = document.getElementById("aiFaqResponse");
  if (!aiBox) {
    aiBox = document.createElement("div");
    aiBox.id = "aiFaqResponse";
    aiBox.style.cssText = "margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; display: none; text-align: left;";
    searchInput.closest(".search-box").after(aiBox);
  }

  // 1. Search input par typing event (Existing local filter logic)
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();

    faqItems.forEach((item) => {
      const questionText = item.querySelector(".faq-question").textContent.toLowerCase();
      if (questionText.includes(query) || query === "") {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
  });

  // 3. Gemini API Call on pressing 'Enter'
  // 3. Gemini API Call on pressing 'Enter'
  searchInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (!query) return;

      aiBox.style.display = "block";
      aiBox.innerHTML = `
        <div class="ai-faq-header">
          <i class="fa-solid fa-robot"></i>
          <span>NewsGuard AI Assistant</span>
        </div>
        <div class="ai-faq-content" style="color: #94a3b8; font-style: italic;">
          Thinking and analyzing your query...
        </div>
      `;

      try {
        const response = await fetch('/api/faq-ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: query })
        });

        const data = await response.json();

        if (data.success) {
          aiBox.innerHTML = `
            <div class="ai-faq-header">
              <i class="fa-solid fa-robot"></i>
              <span>NewsGuard AI Assistant</span>
            </div>
            <div class="ai-faq-content">
              ${data.answer}
            </div>
          `;
        } else {
          aiBox.innerHTML = `
            <div class="ai-faq-header">
              <i class="fa-solid fa-triangle-exclamation" style="color: #e11d48;"></i>
              <span>NewsGuard AI Assistant</span>
            </div>
            <div class="ai-faq-content" style="color: #e11d48;">
              ${data.error || 'Something went wrong.'}
            </div>
          `;
        }
      } catch (error) {
        console.error("Error:", error);
        aiBox.innerHTML = `
          <div class="ai-faq-header">
            <i class="fa-solid fa-triangle-exclamation" style="color: #e11d48;"></i>
            <span>NewsGuard AI Assistant</span>
          </div>
          <div class="ai-faq-content" style="color: #e11d48;">
            Failed to connect to server. Please check your connection.
          </div>
        `;
      }
    }
  });

  

  // 4. Accordion Toggle Logic (Click to Open/Close)
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");

      // Close all other open accordion items
      faqItems.forEach((i) => i.classList.remove("active"));

      // If it was not open before, open it
      if (!isOpen) {
        item.classList.add("active");
      }
    });
  });

  // 5. Category Filter Logic
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Switch active tab styling
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const selectedCategory = btn.getAttribute("data-category");

      // Filter FAQ items by category
      faqItems.forEach((item) => {
        const itemCategory = item.getAttribute("data-category");

        if (selectedCategory === "all" || itemCategory === selectedCategory) {
          item.classList.remove("hidden");
          item.style.display = "block";
        } else {
          item.classList.add("hidden");
          item.style.display = "none";
          item.classList.remove("active"); // Close hidden tabs
        }
      });
    });
  });
});

