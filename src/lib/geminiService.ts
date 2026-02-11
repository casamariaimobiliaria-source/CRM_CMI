
import { GoogleGenAI, Type } from "@google/genai";

export const analyzeLeadHistory = async (history: string) => {
  if (!import.meta.env.VITE_API_KEY || !history) return null;

  try {
    // Inicialização segura dentro da função para garantir que pega a API_KEY atualizada
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Analise o seguinte histórico de atendimento de um lead imobiliário e retorne um JSON com um resumo curto (máximo 15 palavras) e uma sugestão de temperatura (Frio, Morno, Quente):
      
      Histórico: "${history}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resumo: {
              type: Type.STRING,
              description: "Um resumo muito curto da situação do lead."
            },
            temperaturaSugestao: {
              type: Type.STRING,
              description: "Deve ser exatamente um destes: Frio, Morno ou Quente"
            }
          },
          required: ["resumo", "temperaturaSugestao"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Erro ao analisar histórico com Gemini:", error);
    return null;
  }
};
