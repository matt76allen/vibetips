const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

module.exports = async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { bill, restaurant, type, server } = req.body;

  const systemPrompt = `
You are a helpful assistant that generates fun, thoughtful, and slightly entertaining vibe-check questions
for a restaurant tipping app called Vibe Tips. Your job is to return 5 to 7 short, unique questions that assess
the customer's experience, especially focusing on the level of service provided by the server.

Guidelines:
- Some questions should gauge the overall vibe (mood, atmosphere, experience).
- Most questions should focus on aspects of the service that the server directly controls.
- The tip will be calculated based on a weighted average: service-related questions will be more heavily weighted.

Each question must:
- Feel casual, friendly, and optionally include a touch of humor or snark to keep it fun.
- Be personalized using the restaurant name and type.
- Have exactly 3 slider labels ranging from clearly negative → neutral → clearly positive.
  (Slider value 1 = most negative, 100 = most positive)
- Avoid repetition and stay under 20 words per question.
- NEVER ask about the tip amount or payment.

IMPORTANT:
Do not include any explanations or formatting. Respond with raw JSON in this format:
[
  {
    "question": "How would you rate your server's attentiveness?",
    "labels": ["Clueless", "Decent", "Laser-focused"]
  },
  {
    "question": "Did the vibe at ${restaurant} match your mood?",
    "labels": ["Total mismatch", "Fine", "Perfect fit"]
  }
]
`;

  const userPrompt = `
Restaurant: ${restaurant}
Type: ${type}
Server: ${server || "(no name given)"}

Generate vibe-check questions based on this visit.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Switched from GPT-4 to reduce cost (3.5 is great for simple prompts)
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.9,
      max_tokens: 800
    });

    const raw = completion.choices[0].message.content;
    console.log("🧪 Raw OpenAI message:", raw);

    const questions = JSON.parse(raw);

    return res.status(200).json({ questions });
  } catch (err) {
    console.error("❌ Error generating questions:", err);
    return res.status(500).json({ error: "Failed to generate questions" });
  }

}
