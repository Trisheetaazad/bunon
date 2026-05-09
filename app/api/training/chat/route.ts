import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // 1. Fetch the API Key from environment variables
    const apiKey = process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("Environment variable GEMINI_API_KEY is missing (or NEXT_PUBLIC_GEMINI_API_KEY as fallback)");
      return Response.json({ error: "Server configuration error." }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const { message, module, language } = body as {
      message?: string;
      module?: string;
      language?: "en" | "bn";
    };

    // 2. Basic Validation
    if (!message || !module) {
      return Response.json({ error: "Missing message or module." }, { status: 400 });
    }

    // 3. Initialize Gemini SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Using gemini-1.5-flash: it's faster and has a larger free tier limit
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are a friendly training assistant for Bunon, a platform that helps women in Bangladesh find remote work.
You are helping a worker learn about the module: ${module}.
${language === "bn" ? "Answer primarily in simple Bengali (বাংলা)." : "Answer in simple English."}
Keep your tone encouraging, patient, and use simple terms.
If the worker is confused, provide an example.`,
    });

    // 4. Generate Content
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }],
    });
    const response = result.response;
    const firstCandidate = response.candidates?.[0];
    const reply = firstCandidate?.content?.parts
      ?.map((part) => (typeof part.text === "string" ? part.text : ""))
      .join("")
      .trim();

    if (!reply) {
      const blockReason = response.promptFeedback?.blockReason;
      const reason = blockReason ? ` (${blockReason})` : "";
      return Response.json(
        { error: `No response generated${reason}.` },
        { status: 422 }
      );
    }

    // 5. Return the AI's reply
    return Response.json({ reply });

  } catch (error: any) {
    const status = typeof error?.status === "number" ? error.status : 500;
    const details = Array.isArray(error?.errorDetails)
      ? error.errorDetails.map((detail: any) => detail?.message).filter(Boolean).join("; ")
      : "";
    const rawMessage = typeof error?.message === "string" ? error.message : "Unknown error";
    console.error("Gemini API Error:", { status, rawMessage, details });

    if (status === 401 || status === 403) {
      return Response.json(
        { error: "Gemini API key is invalid or blocked." },
        { status }
      );
    }

    if (status === 429) {
      return Response.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    if (status === 400 && details) {
      return Response.json(
        { error: `Invalid request: ${details}` },
        { status: 400 }
      );
    }

    return Response.json(
      { error: "Thinking failed... please try again." },
      { status: 500 }
    );
  }
}
