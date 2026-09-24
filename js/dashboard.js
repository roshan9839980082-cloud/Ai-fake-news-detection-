document.addEventListener("DOMContentLoaded", () => {
    loadDashboardData();
});

async function loadDashboardData() {
    try {
        const response = await fetch("/api/history");
        const data = await response.json();

        if (!data.success || !data.history) {
            console.error("Failed to load dashboard history");
            return;
        }

        const history = data.history;

        // 1. Calculate Stats Counters
        const total = history.length;
        let trueCount = 0;
        let falseCount = 0;
        let misleadingCount = 0;
        let unverifiedCount = 0;

        history.forEach(item => {
            const status = item.status ? item.status.toLowerCase().trim() : "";
            if (status === "true") trueCount++;
            else if (status === "false") falseCount++;
            else if (status === "misleading") misleadingCount++;
            else unverifiedCount++;
        });

        // Update DOM elements for stats
        document.getElementById("total-checks").textContent = total;
        document.getElementById("true-checks").textContent = trueCount;
        document.getElementById("false-checks").textContent = falseCount;
        document.getElementById("misleading-checks").textContent = misleadingCount;
        document.getElementById("unverified-checks").textContent = unverifiedCount;

        // 2. Render Recent Checks (Showing last 4 items)
        const recentContainer = document.getElementById("recent-checks-container");

        if (history.length === 0) {
            recentContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </div>
                    <p class="empty-text">No checks yet</p>
                    <a href="checknews.html" class="first-check-link">
                        Check your first news <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            `;
            return;
        }

        // Slice latest 4 items
        const recentItems = history.slice(0, 4);

        recentContainer.innerHTML = recentItems.map(item => `
            <div class="history-item" style="border: 1px solid #e5e7eb; padding: 16px; margin-bottom: 12px; border-radius: 8px; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span class="history-status ${item.status.toLowerCase()}" style="font-weight: 600; text-transform: uppercase; font-size: 12px; padding: 3px 8px; border-radius: 4px; background: #f3f4f6;">
                        ${item.status}
                    </span>
                    <span style="font-size: 11px; color: #6b7280;">${item.created_at}</span>
                </div>
                <p style="font-size: 14px; color: #1f2937; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    <strong>Article:</strong> ${escapeHtml(item.article)}
                </p>
            </div>
        `).join("");

    } catch (error) {
        console.error("Error loading dashboard data:", error);
    }
}

// Helper for security
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}