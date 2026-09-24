const btn = document.querySelector(".profile-btn");
const menu = document.querySelector(".dropdown");

if (btn && menu) {
    btn.onclick = function() {
        if(menu.style.display == "block"){
            menu.style.display = "none";
        } else {
            menu.style.display = "block";
        }
    }
}

async function fetchRecentNews() {
    const container = document.getElementById('news-container');
    if (!container) return; 

    try {
        const response = await fetch('/api/recent-news');
        const data = await response.json();
        
        console.log("API Response:", data); // Ye console me check karne ke liye ki data kya aa raha hai

        if (data.articles && data.articles.length > 0) {
            container.innerHTML = ""; 

            data.articles.forEach(article => {
                const newsCard = document.createElement('div');
                newsCard.className = 'live-news-card';
                newsCard.style.cssText = "background: #fff; padding: 15px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);";

                newsCard.innerHTML = `
                    <h4 style="margin-bottom: 8px; font-size: 16px;"><a href="${article.url}" target="_blank" style="text-decoration: none; color: #1e293b;">${article.title}</a></h4>
                    <p style="font-size: 13px; color: #64748b; margin-bottom: 10px;">${article.description ? article.description.substring(0, 100) + '...' : ''}</p>
                    <span style="font-size: 11px; color: #2563eb; font-weight: 600;">Source: ${article.source.name}</span>
                `;

                container.appendChild(newsCard);
            });
        } else {
            container.innerHTML = "<p>No recent news available right now.</p>";
        }
    } catch (error) {
        console.error("Error fetching news:", error);
        container.innerHTML = "<p style='color: red;'>Failed to load live news.</p>";
    }
}

document.addEventListener("DOMContentLoaded", fetchRecentNews);