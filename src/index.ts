import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";
const app = express();
const PORT = 3000;
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! });

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:8081"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to resume builder project with React+Express!");
});

app.post("/response", async (req: Request, res: Response) => {
  const { describe } = req.body;

  const prompt = `
  You are a professional resume writer assistant.
  
  Based on the following user-provided information, write a compelling and concise **professional summary** suitable for the top of a resume.
  
  **Guidelines:**
  - Keep it between 80–120 words.
  - Focus on strengths, skills, accomplishments, and areas of expertise.
  - Write in the third person without using names.
  - Keep the tone professional and impactful.
  - Do not include the phrase "This is about me" or any extra commentary.
  
  **User Input:**
  ${describe}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const summary = response.text;
    console.log("Generated Summary:", summary);

    res.status(200).json({ summary });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ error: "Failed to generate summary." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
