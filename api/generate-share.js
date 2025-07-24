// generate-share.js (frontend)

// Function to type the message with animation
function typeMessage(text, containerId) {
  const container = document.getElementById(containerId);
  container.textContent = "";

  let index = 0;
  const total = text.length;

  function getDelay(i) {
    if (i < 20) return 100; // slow typing for first ~20 chars (~2s)
    return Math.max(10, 2000 / (total - 20)); // faster typing for remainder (~2s)
  }

  function typeChar() {
    if (index < total) {
      container.textContent += text.charAt(index);
      index++;
      setTimeout(typeChar, getDelay(index));
    }
  }

  typeChar();
}

// Function to fetch AI-generated message and display it
async function generateShareMessage() {
  const container = document.getElementById("message-container");
  if (!container) return;

  try {
    const restaurant = localStorage.getItem("restaurant") || "the restaurant";
    const server = localStorage.getItem("server") || "our server";
    const vibeScore = localStorage.getItem("vibeScore") || "a great vibe";

    const response = await fetch("/api/generate-share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurant, server, vibeScore })
    });

    const data = await response.json();

    if (!response.ok || !data.message) {
      throw new Error(data.error || "Unknown error from /api/generate-share");
    }

    const aiMessage = data.message;
    typeMessage(aiMessage, "message-container");

    // Attach copy functionality
    const copyButton = document.getElementById("copy-button");
    if (copyButton) {
      copyButton.onclick = () => {
        navigator.clipboard.writeText(aiMessage)
          .then(() => {
            copyButton.textContent = "Copied!";
            setTimeout(() => {
              copyButton.textContent = "Copy Message";
            }, 2000);
          })
          .catch(() => {
            alert("Failed to copy message.");
          });
      };
    }

    // Update share links
    const encodedMessage = encodeURIComponent(aiMessage);
    document.getElementById("share-facebook").href = `https://www.facebook.com/sharer/sharer.php?u=&quote=${encodedMessage}`;
    document.getElementById("share-twitter").href = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
    document.getElementById("share-email").href = `mailto:?subject=Good Vibes&body=${encodedMessage}`;

  } catch (error) {
    container.textContent = "Oops! Something went wrong while generating your message.";
    console.error("Error:", error);
  }
}

// Kick off message generation after page loads
window.addEventListener("DOMContentLoaded", generateShareMessage);
