
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { MindMapNode } from "./types";

// Always use named parameter for apiKey and obtain it directly from process.env.API_KEY
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMindMap = async (prompt: string): Promise<Record<string, MindMapNode>> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a structured mind map to study: "${prompt}". 
               Focus on deep educational concepts. 
               Output JSON mapping node IDs to node objects.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nodes: {
            type: Type.OBJECT,
            additionalProperties: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                description: { type: Type.STRING },
                children: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["id", "label", "description", "children"]
            }
          }
        },
        required: ["nodes"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  const rawNodes = data.nodes || {};
  const processedNodes: Record<string, MindMapNode> = {};
  const nodeIds = Object.keys(rawNodes);
  
  nodeIds.forEach((id, index) => {
    const angle = (index / nodeIds.length) * 2 * Math.PI;
    const radius = index === 0 ? 0 : 350;
    processedNodes[id] = {
      ...rawNodes[id],
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      assets: []
    };
  });

  return processedNodes;
};

export const generateNodeContent = async (topic: string, description: string): Promise<{ notes: string, script: string }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate comprehensive study notes and a short educational video script for the topic: "${topic}". Description: ${description}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          notes: { type: Type.STRING, description: "Markdown study notes" },
          script: { type: Type.STRING, description: "Educational video script" }
        },
        required: ["notes", "script"]
      }
    }
  });
  return JSON.parse(response.text || '{"notes":"","script":""}');
};

export const generateNodeImage = async (topic: string, description: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `High-quality educational diagram about: ${topic}. Description: ${description}.` }]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return '';
};

export const generateNodeVideo = async (topic: string, description: string): Promise<string> => {
  const ai = getAI();
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `Educational animation for ${topic}: ${description}. Professional motion graphics.`,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
      const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await videoResponse.blob();
      return URL.createObjectURL(blob);
    }
  } catch (error) {
    console.error("Video generation failed", error);
  }
  return '';
};
