// generate-share.js

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

  // Fallback in case container is missing
  if (!container) return;

  try {
    // Pull data from localStorage
    const restaurant = localStorage.getItem("restaurant") || "the restaurant";
    const server = localStorage.getItem("server") || "our server";
    const vibeScore = localStorage.getItem("vibeScore") || "a great vibe";

    // Construct the prompt with AI rules
    const prompt = `Write a short, fun social media post in the first person to thank a server. The restaurant was called ${restaurant}, the server's name was ${server}, and the vibe was described as ${vibeScore}.

Guidelines:
- Total message must be 280 characters or fewer, including link and hashtag.
- Write in first person.
- Highlight the dining experience — especially if the vibe score was great.
- Always keep the tone positive. If the vibe was bad, use snark or sarcasm.
- Do NOT mention the bill amount or tip percentage.
- The message MUST mention the restaurant name and MAY mention the server name.
- The message MUST include the hashtag #VibeTips
- The message MUST include the website 'vibetips.ai' at the end, ideally in a short sentence saying how Vibe Tips made it fun or easy to calculate the tip.`;

    // Fetch AI-generated message from server (this assumes a backend API endpoint exists)
    const response = await fetch("/api/generate-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    const aiMessage = data.message || "Thanks for the great vibes!";

    // Animate the message using the typeMessage function
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

    // Optional: Update share links
    const encodedMessage = encodeURIComponent(aiMessage);
    document.getElementById("share-facebook").href = `https://www.facebook.com/sharer/sharer.php?u=&quote=${encodedMessage}`;
    document.getElementById("share-twitter").href = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
    document.getElementById("share-email").href = `mailto:?subject=Good Vibes&body=${encodedMessage}`;

  } catch (error) {
    container.textContent = "Oops! Something went wrong while generating your message.";
    console.error("Error generating message:", error);
  }
}

// Kick off message generation after page loads
window.addEventListener("DOMContentLoaded", generateShareMessage);
