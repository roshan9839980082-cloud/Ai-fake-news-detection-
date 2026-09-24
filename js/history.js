const filterButtons = document.querySelectorAll(".filter-btn");
const historyContent = document.getElementById("history-content");

let historyData = [];

// ===============================
// LOAD HISTORY FROM BACKEND
// ===============================

async function loadHistory() {
    try {
        const response = await fetch("/api/history");
        const data = await response.json();

        if (!data.success) {
            console.error(data.error);
            return;
        }

        historyData = data.history;
        displayHistory("all");

    } catch (error) {
        console.error("History loading error:", error);
    }
}

// ===============================
// DISPLAY HISTORY
// ===============================

function displayHistory(category) {
    let filteredData = historyData;

    // Filter
    if (category !== "all") {
        filteredData = historyData.filter(item =>
            item.status.toLowerCase() === category.toLowerCase()
        );
    }

    // ===============================
    // NO HISTORY
    // ===============================

    if (filteredData.length === 0) {
        let message = "No checks found";

        if (category !== "all") {
            message = `No ${category} checks found`;
        }

        historyContent.innerHTML = `
            <div class="empty-state">
                <div class="clock-icon-box">
                    <i class="fa-regular fa-clock"></i>
                </div>
                <p class="empty-title">
                    ${message}
                </p>
                <a href="/index.html" class="check-news-link">
                    Check news
                    <i class="fa-solid fa-arrow-right"></i>
                </a>
            </div>
        `;
        return;
    }

    // ===============================
    // SHOW HISTORY WITH ID-BASED SAVE
    // ===============================

    historyContent.innerHTML = filteredData.map(item => {
        return `
            <div class="history-item" id="history-card-${item.id}" style="position: relative; padding-bottom: 35px;">
                
                <!-- Top Row: Status & Action Buttons -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span class="history-status ${item.status.toLowerCase()}">
                        ${item.status}
                    </span>
                    
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <!-- Save Button (Passing only item.id and element reference) -->
                        <button onclick="saveHistoryArticle('${item.id}', this)" title="Save Article" style="background: #f3f4f6; color: #4b5563; border: none; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; transition: all 0.2s;">
                            <i class="fa-regular fa-bookmark"></i>
                        </button>

                        <!-- Delete Button -->
                        <button onclick="deleteHistoryItem('${item.id}')" title="Delete History" style="background: #fee2e2; color: #dc2626; border: none; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    </div>
                </div>

                <div class="history-article">
                    ${escapeHtml(item.article)}
                </div>

                <div class="history-result">
                    ${escapeHtml(item.result)}
                </div>

                <!-- Bottom Right Date/Time -->
                <span class="history-date" style="position: absolute; bottom: 10px; right: 15px; font-size: 11px; color: #6b7280;">
                    ${item.created_at}
                </span>

            </div>
        `;
    }).join("");
}

// ===============================
// SAVE ARTICLE USING ID & FILL COLOR
// ===============================

async function saveHistoryArticle(itemId, btnElement) {
    const item = historyData.find(h => h.id === itemId);
    if (!item) {
        alert("Article data not found!");
        return;
    }

    try {
        const response = await fetch('/api/save-article', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                text: item.article, 
                status: item.status, 
                explanation: item.result 
            })
        });

        const result = await response.json();

        if (result.success) {
            // Button color and icon fill on success
            btnElement.style.background = "#e0e7ff";
            btnElement.style.color = "#4f46e5";
            btnElement.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
            btnElement.title = "Saved";
        } else {
            alert(result.error || "Failed to save article.");
        }
    } catch (err) {
        console.error("Save Error:", err);
        alert("Connection error while saving article!");
    }
}

// ===============================
// DELETE HISTORY ITEM FUNCTION
// ===============================

async function deleteHistoryItem(itemId) {
    if (!confirm("Are you sure you want to delete this history item?")) return;

    try {
        const response = await fetch(`/api/history/${itemId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            historyData = historyData.filter(item => item.id !== itemId);
            
            const cardElement = document.getElementById(`history-card-${itemId}`);
            if (cardElement) {
                cardElement.remove();
            }

            const activeCategoryBtn = document.querySelector(".filter-btn.active");
            const currentCategory = activeCategoryBtn ? activeCategoryBtn.getAttribute("data-category") : "all";
            displayHistory(currentCategory);

        } else {
            alert(result.error || "Failed to delete item.");
        }
    } catch (error) {
        console.error("Delete Error:", error);
        alert("Connection error while deleting history!");
    }
}

// ===============================
// FILTER BUTTONS
// ===============================

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");
        const category = button.getAttribute("data-category");
        displayHistory(category);
    });
});

// ===============================
// HTML SECURITY
// ===============================

escapeHtml = function(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ===============================
// START
// ===============================

loadHistory();