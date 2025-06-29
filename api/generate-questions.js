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
for a restaurant tipping app called Vibe Tips. Your job is to return exactly 7 short, unique questions that assess
the customer's experience, especially focusing on the level of service provided by the server.

Guidelines:
- Generate 7 questions in total.
- 4 to 5 questions must focus on the service the server directly controls (attentiveness, friendliness, accuracy, refills, etc).
- At least 2 to 3 questions should focus on the overall vibe, including atmosphere, food quality, and overall mood.
- Tip calculation will weight the service-related questions more heavily.

Required questions (in some form):
- Ask about the quality of the food.
- Ask if drinks were refilled promptly, but only if the restaurant type suggests sit-down service.

Important restrictions:
- NEVER generate questions that begin with or reference "on a scale of..." or "on a scale from..."
- Do NOT include questions about music, since not all restaurants play music.
- Questions should be adapted based on the type of restaurant provided (e.g., fast food vs fine dining).
- Do NOT mention specific food types; instead, use general mentions of food.

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
