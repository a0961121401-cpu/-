import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    throw new Error("API Key is missing. Please check your configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

export const sendMessageToGemini = async (
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are an expert Mechanical Engineer specializing in Gear Geometry and Manufacturing. 
        User is using a tool called "GearMaster Pro" for calculating gear dimensions and Profile Shift Coefficients (轉位係數).
        
        The tool has two modes:
        1. Standard Calculation: Input Module (m), Teeth (z), Shift (x) -> Output Diameters.
        2. Reverse Calculation: Input Measured Tip Diameter (da), Module, Teeth -> Output Shift Coefficient (x).

        Primary Tasks:
        - Explain how Profile Shift (x) affects gear diameter and strength.
        - Help interpret "Over-Pin Measurements" if asked (M value).
        - Explain terminology: Pitch Diameter (節圓), Tip Diameter (齒頂圓), Root Diameter (齒根圓), Base Diameter (基圓).
        - Use standard metric gear formulas (ISO/JIS).
        - Standard Tip Diameter formula used by the app: da = m * (z + 2 + 2x).
        
        Keep answers concise, professional, and use Traditional Chinese (繁體中文).`,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result: GenerateContentResponse = await chat.sendMessage({
      message: newMessage
    });

    return result.text || "No response generated.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to communicate with AI.");
  }
};
