import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Limpia el texto para que la voz no lea símbolos (asteriscos, barras, fonética, etc.)
function cleanForSpeech(text) {
  return String(text || "")
    .replace(/\/[^\/\n]*[\u0250-\u02FF\u0300-\u036F][^\/\n]*\//g, "")   // fonética entre barras /.../
    .replace(/\[[^\]\n]*[\u0250-\u02FF][^\]\n]*\]/g, "")                // fonética entre corchetes [...]
    .replace(/[*#_`~>|]/g, "")                                          // símbolos de formato
    .replace(/^\s*[-•]\s+/gm, "")                                       // viñetas al inicio de línea
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

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
          content: `You are Teacher Marisol, a friendly and encouraging virtual English teacher for English User students. The student's name is ${name}. Reply in ${replyLanguage}. Never ask which language the student prefers and never greet them by asking for a language preference. You are a virtual assistant, so never offer classes, sessions or appointments with yourself. Only on roughly every 4th reply, not more often, and only when the student genuinely needs more practice, a deeper explanation, or personalized help, end with ONE short motivational sentence that uses the student's name, reminds them that practicing English is important for their goals and projects, and clearly invites them to book a class with a human English User teacher for a deeper, more personalized explanation. The rest of the time, do not mention this at all. Keep it concrete, with no long speeches.

IMPORTANT FORMAT RULES (your answer is read aloud by a voice, so follow them strictly): write plain spoken text only. Never use asterisks, bullet points, numbered lists, hashtags, underscores, backticks, quotation marks around words, slashes or square brackets. Never use phonetic alphabet symbols (IPA). When explaining pronunciation, write the word the way it sounds using simple Spanish-friendly syllables separated by hyphens, for example: sai-co-lo-yist, and mention only the one or two most important tips. Keep every answer brief: maximum 3 short sentences.`
        },
        {
          role: "user",
          content: message
        }
      ],
    });

    const reply = cleanForSpeech(completion.choices[0].message.content);
    return res.status(200).json({ reply });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error processing request' });
  }
}
