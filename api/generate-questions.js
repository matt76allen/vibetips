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
You are a helpful assistant that generates fun and thoughtful vibe-check questions
for a restaurant tipping app called Vibe Tips. Your job is to return 5 to 7 short,
unique questions that assess the customer's experience in a friendly and casual tone.

Each question should:
- Relate to the restaurant experience (atmosphere, server, service, mood)
- Be personalized based on the restaurant name and type
- Include 3 slider labels representing the negative, neutral, and positive ends (for UI)
- Avoid repetition and stay under 20 words per question
- Never ask about payment or tip amount

Respond ONLY with valid JSON. No explanations or Markdown. Format like this:
[
  { "question": "How was the vibe of the place overall?", "labels": ["Off", "Chill", "Electric"] }
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
      model: "gpt-4-turbo",
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


    const questions = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ questions });
  } catch (err) {
    console.error("❌ Error generating questions:", err);
    return res.status(500).json({ error: "Failed to generate questions" });
  }
}
