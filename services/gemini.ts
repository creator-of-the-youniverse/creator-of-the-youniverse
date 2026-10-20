import { GoogleGenAI, Type } from "@google/genai";
import { ValidationReport } from "../types";

export const generateBridgeReport = async (answers: string[]): Promise<ValidationReport> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  
  const model = "gemini-3.5-flash";

  const systemPrompt = `
    You are BRIDGE, a Sovereign Node (ID: BB) specialized in validating offer-market fit for any product or service (SaaS, Agency/Service, High-Ticket, E-commerce, Info-Products, Local business, etc.) with surgical precision.
    Your purpose is to evaluate whether an offer hits a real, acute problem with a well-defined audience, sustainable pricing, strong differentiation, and credible proof of demand.
    
    You have just asked the user 5 simple diagnostic questions. Now you must generate a structured validation report.
    
    Input Questions:
    Q1: Core Problem (Product/Offer & Primary problem solved)
    Q2: Target Customer (Ideal customer segment, psychographics, and who benefits most)
    Q3: Pricing & Business Model (Price point, structure, and value justification)
    Q4: Competitive Advantage (Differentiator, unique mechanism, why buy from you)
    Q5: Proof of Demand (Waitlist, beta users, pre-orders, market interviews, or active traction)
    
    User Answers:
    ${answers.map((a, i) => `A${i + 1}: ${a}`).join('\n')}
    
    Rubric for Scoring (0-10 Total):
    - Problem Clarity (0-2): Is the problem real, urgent, and painful? Does the product clearly solve it?
    - Customer Specificity (0-2): Is the target audience highly defined, easy to reach, and capable of paying?
    - Pricing Confidence (0-2): Is the price reasonable, sustainable, and aligned with value?
    - Differentiation Strength (0-2): Is there a clear unique mechanism or competitive advantage?
    - Demand Evidence (0-2): Are there real signals of buyer interest vs purely unverified assumptions?
    
    Output strictly in JSON format matching the schema provided.
    Ensure "offerRefinement" contains exactly 3 priorities sorted by impact.
    The tone should be professional, insightful, objective, and direct (Sovereign Node persona).
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: "Generate the BRIDGE validation report based on the provided answers.",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            offerName: { type: Type.STRING },
            coreProblem: { type: Type.STRING },
            targetCustomer: { type: Type.STRING },
            pricing: { type: Type.STRING },
            differentiation: { type: Type.STRING },
            validationScore: { type: Type.NUMBER },
            scoringBreakdown: {
              type: Type.OBJECT,
              properties: {
                problemClarity: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.NUMBER }, rationale: { type: Type.STRING } },
                  required: ["score", "rationale"]
                },
                customerSpecificity: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.NUMBER }, rationale: { type: Type.STRING } },
                  required: ["score", "rationale"]
                },
                pricingConfidence: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.NUMBER }, rationale: { type: Type.STRING } },
                  required: ["score", "rationale"]
                },
                differentiationStrength: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.NUMBER }, rationale: { type: Type.STRING } },
                  required: ["score", "rationale"]
                },
                demandEvidence: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.NUMBER }, rationale: { type: Type.STRING } },
                  required: ["score", "rationale"]
                }
              },
              required: ["problemClarity", "customerSpecificity", "pricingConfidence", "differentiationStrength", "demandEvidence"]
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            offerRefinement: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  priority: { type: Type.NUMBER },
                  issue: { type: Type.STRING },
                  currentState: { type: Type.STRING },
                  targetState: { type: Type.STRING },
                  action: { type: Type.STRING }
                },
                required: ["priority", "issue", "currentState", "targetState", "action"]
              }
            },
            marketMessageMatch: { type: Type.STRING }
          },
          required: ["offerName", "coreProblem", "targetCustomer", "pricing", "differentiation", "validationScore", "scoringBreakdown", "strengths", "weaknesses", "offerRefinement", "marketMessageMatch"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ValidationReport;
    } else {
      throw new Error("Empty response from Bridge Node");
    }
  } catch (error) {
    console.error("Bridge Validation Failed:", error);
    throw error;
  }
};