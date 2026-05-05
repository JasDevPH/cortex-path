import { createGroq } from "@ai-sdk/groq";

export const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY, // Get this from console.groq.com
});

export const cortexModel = groq("llama-3.3-70b-versatile");
