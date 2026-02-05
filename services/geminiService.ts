import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResultData } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert Botanical AI Assistant. 
Analyze the plant image to identify the species and diagnose its health.
Return the response in strict JSON format.
Ensure the 'diagnosis' is friendly and easy to understand for a beginner gardener.
If the plant is healthy, provide maintenance tips in the 'treatment' array.
`;

/**
 * Converts a File object to a Base64 string required by Gemini API.
 */
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzePlantImage = async (file: File): Promise<AnalysisResultData> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const base64Data = await fileToGenerativePart(file);
    const mimeType = file.type || 'image/png';

    // Using gemini-flash-lite-latest for low-latency responses as requested
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          {
            text: "Analyze this plant. Return JSON."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plant_name: { type: Type.STRING, description: "Common name of the plant" },
            is_healthy: { type: Type.BOOLEAN, description: "True if healthy, false if sick/pests" },
            disease_name: { type: Type.STRING, description: "Name of disease/pest OR 'None' if healthy" },
            diagnosis: { type: Type.STRING, description: "Friendly explanation of condition" },
            treatment: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "List of treatment steps OR care tips if healthy" 
            },
            preventative_measures: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "Pro tips for prevention and long-term care" 
            }
          },
          required: ["plant_name", "is_healthy", "disease_name", "diagnosis", "treatment", "preventative_measures"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No analysis result received from Gemini.");
    }

    const json = JSON.parse(text);

    return {
      plantName: json.plant_name,
      isHealthy: json.is_healthy,
      diseaseName: json.disease_name,
      diagnosis: json.diagnosis,
      treatment: json.treatment || [],
      preventativeMeasures: json.preventative_measures || []
    };

  } catch (error: any) {
    console.error("Gemini Analysis Failed:", error);
    if (error.message?.includes('API key')) {
        throw new Error("Invalid or missing API Key.");
    }
    throw new Error("Failed to analyze the image. Please try again.");
  }
};

export const generatePlantVideo = async (file: File): Promise<string> => {
    if (!process.env.API_KEY) {
      throw new Error("API Key is missing.");
    }
  
    try {
      // Re-initialize to ensure we use the latest key (handling key selection flow)
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = await fileToGenerativePart(file);
      const mimeType = file.type || 'image/png';
  
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        image: {
          imageBytes: base64Data,
          mimeType: mimeType,
        },
        prompt: "A cinematic slow-motion video of this plant in a magical, sunlit garden environment with gentle movement.",
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });
  
      // Polling loop
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
        operation = await ai.operations.getVideosOperation({operation: operation});
      }
  
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) {
        throw new Error("Video generation completed but no link was returned.");
      }
  
      // Fetch the video content using the download link and API key
      const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      if (!videoResponse.ok) {
        throw new Error(`Failed to download video: ${videoResponse.statusText}`);
      }
  
      const videoBlob = await videoResponse.blob();
      return URL.createObjectURL(videoBlob);
  
    } catch (error: any) {
      console.error("Veo Video Generation Failed:", error);
      throw error;
    }
  };