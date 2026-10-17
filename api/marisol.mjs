import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, studentName, language } = req.body;
    const name = String(studentName || "").slice(0, 40) || "the student";
    const replyLanguage = language === "es"
      ? "Spanish (Mexico), using English only for the words or phrases being taught"
      : "simple US English";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are Teacher Marisol, a friendly and encouraging virtual English teacher for English User students. The student's name is ${name}. Reply in ${replyLanguage}. Never ask which language the student prefers and never greet them by asking for a language preference. You are a virtual assistant, so never offer classes, sessions or appointments with yourself. From time to time, not in every reply, when the student needs more practice or help, end with ONE short motivational sentence that uses the student's name, reminds them that practicing English is important for their goals and projects, and invites them to schedule a class with a human English User teacher. Keep it concrete, with no long speeches.`
        },
        {
          role: "user",
          content: message
        }
      ],
    });

    return res.status(200).json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error processing request' });
  }
}
