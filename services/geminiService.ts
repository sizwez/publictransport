
import { GoogleGenAI, Type } from "@google/genai";
import { TransportType, RouteOption } from "../types";

export const getRouteSuggestions = async (from: string, to: string): Promise<RouteOption[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `Find 3 realistic public transport routes between "${from}" and "${to}" in South Africa. 
  Current Date/Time: ${new Date().toLocaleString('en-ZA')}.
  Check for: 
  1. Real-time traffic and Golden Arrow/MyCiTi/Rea Vaya schedules.
  2. Any active minibus taxi strikes or protests in these areas.
  3. Load shedding impact on traffic lights in these zones.
  Return only JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Supports both search and maps
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: Object.values(TransportType) },
              provider: { type: Type.STRING },
              departureTime: { type: Type.STRING },
              duration: { type: Type.STRING },
              price: { type: Type.NUMBER },
              stops: { type: Type.ARRAY, items: { type: Type.STRING } },
              reliability: { type: Type.NUMBER },
              isSponsored: { type: Type.BOOLEAN }
            },
            required: ["id", "type", "provider", "departureTime", "duration", "price", "stops", "reliability"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("AI Routing Error:", e);
    return [];
  }
};

export const getTaxiAdvice = async (location: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const prompt = `Expert advice for a commuter at ${location}, South Africa. 
  Identify the nearest formal and informal taxi ranks. 
  Explain the specific hand sign (finger up, flat hand, etc.) for common destinations from this rank. 
  Add a brief "Local Wisdom" safety tip.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] }
  });

  return response.text || "Scanning for local ranks...";
};
