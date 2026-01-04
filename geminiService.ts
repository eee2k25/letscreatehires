
import { GoogleGenAI } from "@google/genai";
import { Telemetry } from "../types";

export const analyzeSystemEfficiency = async (telemetry: Telemetry): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    As an expert Renewable Energy Management AI, analyze the following real-time telemetry from a Hybrid Renewable Energy Management System (HREMS):
    
    Current State:
    - Solar Generation: ${telemetry.solar.p}W (Irradiance: ${telemetry.solar.irr}W/m², Temp: ${telemetry.solar.temp}°C)
    - Wind Generation: ${telemetry.wind.p}W (Wind Speed: ${telemetry.wind.speed}m/s)
    - Battery Storage: ${telemetry.battery.soc}% (Voltage: ${telemetry.battery.v}V, Status: ${telemetry.battery.status})
    - Active Load Demand: ${telemetry.load.active}W (Priority: ${telemetry.load.priority})
    - Inverter Efficiency: ${telemetry.inverter.eff}%

    Please provide a concise (2-3 sentence) technical assessment and optimization recommendation. 
    Focus on whether to prioritize battery charging or load shedding based on current generation vs demand.
    Keep the tone professional and industrial.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });
    return response.text || "System metrics nominal. No immediate adjustments required.";
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "Analysis unavailable. Connection to AI advisor lost.";
  }
};
