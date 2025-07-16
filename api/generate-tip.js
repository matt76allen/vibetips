export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { vibeScore, billAmount, server, restaurant, vibeAnswers } = req.body;

  if (
    typeof vibeScore !== 'number' ||
    typeof billAmount !== 'number' ||
    !Array.isArray(vibeAnswers)
  ) {
    return res.status(400).json({ error: 'Missing or invalid data' });
  }

  const prompt = `
You are a helpful assistant designed to generate restaurant tip suggestions based on the vibe of the dining experience.

Use the following logic:
- If vibeScore ≥ 90 → recommend 25–30% and praise the experience
- If vibeScore < 90 → suggest 20–23% and be positive
- If vibeScore < 70 → suggest 15–18% and be neutral
- If vibeScore < 50 → suggest 10–15% and keep it gentle
- If vibeScore < 20 → suggest 8–12% and try to be nice while also being negative
- If vibeScore < 10 → suggest 0–5% and be harsh

Always use the server’s name and include 1–2 highlights based on the vibe answers.
Never mention the vibe score in the message
Feel free to be humorous or snarky in the message
Do not write the message to the server. It is meant to be a recap of the vibe answers for the user.

Here is the data:
- Vibe Score: ${vibeScore}
- Bill Amount: $${billAmount.toFixed(2)}
- Server Name: ${server}
- Restaurant: ${restaurant}
- Vibe Answers:
${vibeAnswers.map((q, i) => `  ${i + 1}. ${q.label}: ${q.value}/100`).join('\n')}

Return the result in the following JSON format:
{
  "tipPercent": number,
  "recap": string
}
`;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
      }),
    });

    const data = await openaiRes.json();

    const reply = data.choices?.[0]?.message?.content || '';
    const match = reply.match(/\"?tipPercent\"?\s*:\s*(\d+)/i);
    const tipPercent = match ? parseInt(match[1]) : 20;

    const recapMatch = reply.match(/\"?recap\"?\s*:\s*\"([\s\S]+?)\"[\s}]/i);
    const recap = recapMatch ? recapMatch[1] : 'We think this tip suits the experience.';

    res.status(200).json({ tipPercent, recap });
  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ error: 'Failed to generate tip and recap' });
  }
}
