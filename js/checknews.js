// lucide.createIcons();

// let activeTabType = "text";

// function switchTab(tabType) {
//   activeTabType = tabType;

//   // Update tab buttons UI
//   const buttons = document.querySelectorAll(".tab-btn");
//   buttons.forEach((btn, index) => {
//     if (
//       (tabType === "text" && index === 0) ||
//       (tabType === "image" && index === 1) ||
//       (tabType === "url" && index === 2)
//     ) {
//       btn.classList.add("active");
//     } else {
//       btn.classList.remove("active");
//     }
//   });

//   // Show/Hide input fields
//   document.getElementById("text-tab").classList.remove("active");
//   document.getElementById("image-tab").classList.remove("active");
//   document.getElementById("url-tab").classList.remove("active");

//   document.getElementById(tabType + "-tab").classList.add("active");
// }

// // Yahan function me 'async' add kiya gaya hai
// async function analyzeNews() {
//   let inputValue = "";
//   if (activeTabType === "text") {
//     inputValue = document.getElementById("article-text").value;
//   } else if (activeTabType === "image") {
//     inputValue = document.getElementById("image-url").value;
//   } else if (activeTabType === "url") {
//     inputValue = document.getElementById("article-url").value;
//   }

//   if (!inputValue.trim()) {
//     alert("Please enter some content or URL to analyze.");
//     return;
//   }

//   // === YAHAN SE API KA CODE ADD KIYA HAI === //
//   const resultBox = document.getElementById("resultBox");
//   if (resultBox) {
//     resultBox.style.display = "block";
//     resultBox.innerHTML = '<span style="color: #2563eb; font-weight: bold;">Analyzing with Google Gemini AI... Please wait... ⏳</span>';
//   }

//   try {
//     const response = await fetch('/check-news', {
//         method: 'POST',
//         headers: { 
//             'Content-Type': 'application/json' 
//         },
//         body: JSON.stringify({ query: inputValue })
//     });

//     const data = await response.json();

//     if (resultBox) {
//         if (data.success) {
//             const formattedResult = data.result.replace(/\n/g, '<br>');
//             resultBox.innerHTML = `<strong>Analysis Complete:</strong><br><br>${formattedResult}`;
//         } else {
//             resultBox.innerHTML = `<span style="color: #dc2626; font-weight: bold;">Error:</span> ${data.error}`;
            
//         }
//     }
//   } catch (error) {
//     if (resultBox) {
//         resultBox.innerHTML = `<span style="color: #dc2626; font-weight: bold;">Connection Error:</span> Backend server theek se run nahi ho raha hai.`;
//     }
//     console.error("API Error:", error);
//   }
//   // === API CODE YAHAN KHATAM HOTA HAI === //
// }

// lucide.createIcons();

lucide.createIcons();

let activeTabType = "text";

function switchTab(tabType) {
  activeTabType = tabType;

  // Update tab buttons UI
  const buttons = document.querySelectorAll(".tab-btn");
  buttons.forEach((btn, index) => {
    if (
      (tabType === "text" && index === 0) ||
      (tabType === "image" && index === 1) ||
      (tabType === "url" && index === 2)
    ) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Show/Hide input fields
  document.getElementById("text-tab").classList.remove("active");
  document.getElementById("image-tab").classList.remove("active");
  document.getElementById("url-tab").classList.remove("active");

  document.getElementById(tabType + "-tab").classList.add("active");
}

async function analyzeNews() {
  let inputValue = "";
  if (activeTabType === "text") {
    inputValue = document.getElementById("article-text").value;
  } else if (activeTabType === "image") {
    inputValue = document.getElementById("image-url").value;
  } else if (activeTabType === "url") {
    inputValue = document.getElementById("article-url").value;
  }

  if (!inputValue.trim()) {
    alert("Please enter some content or URL to analyze.");
    return;
  }

  const resultBox = document.getElementById("resultBox");
  if (resultBox) {
    resultBox.style.display = "block";
    resultBox.innerHTML = '<span style="color: #2563eb; font-weight: bold;">Analyzing with Google Gemini AI... Please wait... ⏳</span>';
  }

  try {
    const response = await fetch('/check-news', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ query: inputValue })
    });

    const data = await response.json();

    if (resultBox) {
        if (data.success) {
            const formattedResult = data.result.replace(/\n/g, '<br>');
            
            // Yahan result ke sath Save Article button add kiya gaya hai
            resultBox.innerHTML = `
                <div>
                    <strong>Analysis Complete:</strong><br><br>${formattedResult}
                </div>
                <button id="saveArticleBtn" style="margin-top: 15px; background-color: #2563eb; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
                    💾 Save Article
                </button>
            `;

            // Save button par click event listener
            document.getElementById('saveArticleBtn').addEventListener('click', async () => {
                const saveBtn = document.getElementById('saveArticleBtn');
                saveBtn.innerText = "Saving...";
                saveBtn.disabled = true;

                try {
                    const saveResponse = await fetch('/api/save-article', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            text: inputValue,
                            status: data.status,
                            explanation: data.result
                        })
                    });

                    const saveResult = await saveResponse.json();

                    if (saveResult.success) {
                        saveBtn.innerText = "✅ Saved Successfully!";
                        saveBtn.style.backgroundColor = "#16a34a";
                    } else {
                        alert(saveResult.error || "Failed to save article.");
                        saveBtn.innerText = "💾 Save Article";
                        saveBtn.disabled = false;
                    }
                } catch (err) {
                    console.error("Save Error:", err);
                    alert("Connection error while saving!");
                    saveBtn.innerText = "💾 Save Article";
                    saveBtn.disabled = false;
                }
            });

        } else {
            resultBox.innerHTML = `<span style="color: #dc2626; font-weight: bold;">Error:</span> ${data.error}`;
        }
    }
  } catch (error) {
    if (resultBox) {
        resultBox.innerHTML = `<span style="color: #dc2626; font-weight: bold;">Connection Error:</span> Backend server theek se run nahi ho raha hai.`;
    }
    console.error("API Error:", error);
  }
}

lucide.createIcons();

// Home page ke cards se aane wale URL parameter ko handle karne ke liye
document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');

    if (tabParam && (tabParam === 'text' || tabParam === 'image' || tabParam === 'url')) {
        switchTab(tabParam);
    }
});