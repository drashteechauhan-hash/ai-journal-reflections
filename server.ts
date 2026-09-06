import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Reflection conversation endpoint
app.post("/api/gemini/reflect", async (req, res) => {
  try {
    const { prompt, history = [], mode = "reflection" } = req.body;

    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "A valid prompt string is required." });
      return;
    }

    const ai = getGeminiClient();

    let systemInstruction = `You are a thoughtful, empathetic, and insightful journaling companion and reflection partner.
Your role is to help the user unpack their thoughts, feelings, plans, and experiences with clarity and warmth.
- Be supportive, articulate, and non-judgmental.
- Offer constructive perspectives, gentle reframing, or creative brainstorming as appropriate.
- Keep your tone authentic, encouraging, and clear. Format key points with markdown bullet points where helpful.
- End with an introspective question or encouraging prompt to deepen their reflection if relevant.`;

    if (mode === "brainstorm") {
      systemInstruction += `\nFOCUS MODE: Brainstorming Ideas. Prioritize generating imaginative possibilities, creative solutions, novel angles, and structured lists of actionable ideas.`;
    } else if (mode === "advice") {
      systemInstruction += `\nFOCUS MODE: Gentle Guidance & Action Steps. Provide pragmatic frameworks, grounded advice, stress-reduction techniques, or prioritized steps.`;
    } else {
      systemInstruction += `\nFOCUS MODE: Deep Reflection. Focus on emotional intelligence, reframing assumptions, uncovering underlying motivations, and mindful inquiry.`;
    }

    // Format chat history for multi-turn exchange
    const contents: any[] = [];
    for (const msg of history) {
      if (msg && msg.text) {
        contents.push({
          role: msg.role === "model" ? "model" : "user",
          parts: [{ text: msg.text }],
        });
      }
    }
    // Append current prompt
    contents.push({
      role: "user",
      parts: [{ text: prompt }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I listened carefully to your reflection. Could you tell me a little more about what this means to you?";
    res.json({ text: replyText });
  } catch (error: any) {
    console.error("Gemini Reflect Error:", error);
    res.status(500).json({ error: error?.message || "Failed to generate reflection from Gemini." });
  }
});

// Summarization endpoint
app.post("/api/gemini/summarize", async (req, res) => {
  try {
    const { title, messages = [] } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Messages array is required." });
      return;
    }

    const conversationTranscript = messages
      .map((m: any) => `${m.role === "model" ? "Gemini" : "User"}: ${m.text}`)
      .join("\n\n");

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Please synthesize the following journal entry transcript into a concise summary.\nEntry Title: ${title || "Untitled Reflection"}\n\nTranscript:\n${conversationTranscript}`,
      config: {
        systemInstruction: `You are an expert personal growth synthesizer.
Create a structured, elegant summary of the journal reflection with:
1. **Core Insight / Central Theme**: A 1-2 sentence distillation of what this entry is about.
2. **Key Emotions & Perspectives**: The feelings or mindsets explored.
3. **Actionable Takeaways / Gentle Takeaway**: 2-3 bullet points on lessons or next steps.
Keep the output concise, uplifting, and beautifully structured in Markdown.`,
      },
    });

    res.json({ summary: response.text || "Summary generated." });
  } catch (error: any) {
    console.error("Gemini Summarize Error:", error);
    res.status(500).json({ error: error?.message || "Failed to generate summary." });
  }
});

// Start server with Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
