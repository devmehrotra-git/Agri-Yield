import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

const getAIClient = () => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateAgriAdvice = async (
  prompt: string, 
  language: Language
): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI Service Unavailable (Missing Key)";

  try {
    const langName = {
      [Language.ENGLISH]: 'English',
      [Language.HINDI]: 'Hindi',
      [Language.MARATHI]: 'Marathi',
      [Language.TELUGU]: 'Telugu',
      [Language.TAMIL]: 'Tamil',
      [Language.GUJARATI]: 'Gujarati',
      [Language.BANGLA]: 'Bengali',
      [Language.URDU]: 'Urdu'
    }[language];

    const systemPrompt = `You are 'Kisan Mitra' (Farmer's Friend), a world-class AI agricultural scientist and economic advisor. 
    
    CRITICAL PROTOCOLS:
    1. **Expert Identity**: Provide highly technical yet accessible farming advice. Use a tone of a trusted, wise elder.
    2. **Language Output**: You MUST respond ONLY in ${langName}.
    3. **Actionable Intelligence**: 
       - If asked about pests, suggest specific active ingredients (e.g., "Imidacloprid") and their organic alternatives (e.g., "Neem Oil concentrate").
       - Provide precise dosages per hectare.
       - Include weather-specific warnings if applicable.
    4. **Formatting**: 
       - Use **bold text** for ALL key terms (chemicals, crop names, quantities, currency values).
       - Use bullet points for clarity.
    5. **Financial Awareness**: Mention estimated market prices in ₹ (INR) and suggest cost-reduction strategies.
    6. **Constraints**: Keep responses between 80-120 words. No unnecessary introductory fluff.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.6,
        topP: 0.9,
      }
    });

    return response.text || "I apologize, but I couldn't process that. Please try rephrasing your farming query.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The assistant is currently resting. Please check your connection or try again in a moment.";
  }
};

export const translateText = async (text: string, targetLang: Language): Promise<string> => {
    if (targetLang === Language.ENGLISH) return text;
    
    const ai = getAIClient();
    if (!ai) return text;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Translate to ${targetLang}. Only return translated text: "${text}"`,
        });
        return response.text || text;
    } catch (e) {
        return text;
    }
}