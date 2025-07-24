// /api/generate-share.js (backend)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { restaurant, server, vibeScore } = req.body;

  const prompt = `Write a short, fun social media post in the first person to thank a server. The restaurant was called ${restaurant}, the server's name was ${server}, and the vibe was described as ${vibeScore}.

Guidelines:
- Total message must be 280 characters or fewer, including link and hashtag.
- Write in first person.
- Highlight the dining experience — especially if the vibe score was great.
- Always keep the tone positive. If the vibe was bad, use snark or sarcasm.
- Do NOT mention the bill amount or tip percentage.
- The message MUST mention the restaurant name and MAY mention the server name.
- The message MUST include the hashtag #VibeTips
- The message MUST include the website 'vibetips.ai' at the very end, after the last sentence which is ideally a short sentence saying how Vibe Tips made it fun or easy to calculate the tip.
- Do NOT use an @ mention in the message
- Do NOT reference or imply any time of day (e.g., morning, brunch, lunch, dinner, night, or phrases like "night out" or "evening vibes").`;

  
  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 300
      })
    });

    const data = await openaiRes.json();

    const message = data.choices?.[0]?.message?.content?.trim() || "Thanks for the great vibes!";
    res.status(200).json({ message });
  } catch (err) {
    console.error("❌ Error generating share message:", err);
    res.status(500).json({ error: "Failed to generate share message" });
  }
}
