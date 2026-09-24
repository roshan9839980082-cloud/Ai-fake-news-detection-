async function loadSavedArticles() {
    try {
        const response = await fetch('/api/get-saved-articles');
        const data = await response.json();
        
        const container = document.getElementById('articlesListContainer'); 
        if (!container) return;

        if (!data.success || data.articles.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="bookmark-icon-box">
                        <i class="fa-regular fa-bookmark" style="font-size: 28px;"></i>
                    </div>
                    <p class="empty-title">No saved articles yet</p>
                    <a href="checknews.html" class="check-news-link">
                        Check news and save articles
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            `;
            return;
        }

        // Clean single button layout for saved articles
        container.innerHTML = data.articles.map(art => `
            <div class="article-card" id="card-${art.id}" style="border: 1px solid #e5e7eb; padding: 20px; margin-bottom: 15px; border-radius: 8px; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); position: relative; padding-bottom: 35px;">
                
                <!-- Top Right Single Unsave/Delete Button -->
                <div style="position: absolute; top: 20px; right: 20px;">
                    <button onclick="unsaveArticle('${art.id}')" title="Remove from saved" style="background: #fee2e2; color: #dc2626; border: none; width: 34px; height: 34px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 15px; transition: all 0.2s;">
                        <i class="fa-solid fa-bookmark"></i>
                    </button>
                </div>

                <div style="padding-right: 50px;">
                    <p style="margin-bottom: 8px;"><strong>Article:</strong> ${art.text}</p>
                    <p style="margin-bottom: 8px;"><strong>Status:</strong> <span style="color: #2563eb; font-weight: 600;">${art.status}</span></p>
                    <p style="margin-bottom: 8px;"><strong>Explanation:</strong> ${art.explanation}</p>
                </div>

                <!-- Bottom Right Date -->
                <span style="position: absolute; bottom: 10px; right: 20px; font-size: 11px; color: #6b7280;">
                    Saved on: ${art.saved_at}
                </span>
            </div>
        `).join('');

    } catch (err) {
        console.error("Failed to load saved articles:", err);
    }
}

// Unsave action handle karne ka function
async function unsaveArticle(articleId) {
    if (!confirm("Are you sure you want to remove this article from saved items?")) return;

    try {
        const response = await fetch(`/api/delete-article/${articleId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            const cardElement = document.getElementById(`card-${articleId}`);
            if (cardElement) {
                cardElement.remove();
            }

            const container = document.getElementById('articlesListContainer');
            if (container && container.querySelectorAll('.article-card').length === 0) {
                loadSavedArticles(); 
            }
        } else {
            alert(result.error || "Failed to delete article.");
        }
    } catch (err) {
        console.error("Delete Error:", err);
        alert("Connection error while deleting!");
    }
}

// Page load hote hi run hoga
window.onload = loadSavedArticles;