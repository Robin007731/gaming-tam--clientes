
import { GoogleGenAI } from "@google/genai";

export async function getGamerAdvice(query: string): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Actúa como un analista de eSports profesional y experto en gaming competitivo. El usuario pregunta: "${query}". Responde con un tono motivador, técnico y futurista cyberpunk. Limita tu respuesta a un párrafo corto de máximo 80 palabras.`,
      config: {
        temperature: 0.8,
        topP: 0.95,
      },
    });
    return response.text || "La conexión con la red neuronal se ha perdido. Reintentando enlace...";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error de enlace: El servidor de IA está fuera de línea o la clave de acceso es inválida.";
  }
}
