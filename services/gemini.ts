import { GoogleGenAI, Type } from "@google/genai";
import { ValidationReport, MarketPulseData, GroundingSource, TrendingKeyword } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Check your settings.");
  }

  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

/**
 * Fetches real-time market pulse using Gemini 3.8 Flash with Google Search Grounding.
 */
export const fetchMarketPulse = async (industry: string): Promise<MarketPulseData> => {
  const ai = getAiClient();
  const cleanIndustry = industry.trim() || "Technology & Modern Business";

  const searchPrompt = `
    Use Google Search to analyze current live search trends, breakout queries, and customer buying sentiment in the "${cleanIndustry}" target industry.
    Find out what real prospective buyers and businesses are actually searching for on Google right now, including:
    1. Surging problem-aware search terms and pain points.
    2. High-intent purchase/solution keywords.
    3. Breakout keywords and emerging trends.
    4. Saturated clichés/angles that have become commoditized.
    5. The most acute underserved opportunity gap.

    Format your output strictly inside a \`\`\`json markdown code block with the following schema:
    {
      "summary": "2-sentence executive summary of the current market momentum and what searchers want right now.",
      "keywords": [
        {
          "keyword": "Exact trending phrase or search query",
          "intent": "Problem / Pain" | "Solution / Buy" | "Breakout Trend" | "Competitor Comparison",
          "momentum": "e.g., +210% breakout, High Buyer Intent, Surging 2026",
          "context": "Why users search this and what buying friction it represents."
        }
      ],
      "emergingDemands": [
        "Acute emerging demand or requirement #1",
        "Acute emerging demand or requirement #2",
        "Acute emerging demand or requirement #3"
      ],
      "saturatedAngles": [
        "Tired cliché angle to avoid #1",
        "Overdone marketing pitch to avoid #2"
      ],
      "opportunityGap": "The single most lucrative whitespace or unique positioning angle for an offer entering this space."
    }

    Include 6 to 8 highly relevant, high-signal trending keywords.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: searchPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const rawText = response.text || "";

    // Extract Google Search Grounding Chunks & Sources
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = [];
    const seenUrls = new Set<string>();

    for (const chunk of rawChunks) {
      if (chunk.web?.uri && chunk.web?.title && !seenUrls.has(chunk.web.uri)) {
        seenUrls.add(chunk.web.uri);
        sources.push({
          title: chunk.web.title,
          url: chunk.web.uri,
        });
      }
    }

    const webSearchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

    // Parse JSON from model response text
    let parsedData: Partial<MarketPulseData> = {};
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[1] ? jsonMatch[1] : jsonMatch[0];
        parsedData = JSON.parse(jsonStr);
      } catch (parseErr) {
        console.warn("Failed to parse JSON directly from search grounding response:", parseErr);
      }
    }

    // Fallback normalization in case of missing keys
    const fallbackKeywords: TrendingKeyword[] = [
      {
        keyword: `${cleanIndustry} automation`,
        intent: "Solution / Buy",
        momentum: "High Intent",
        context: "Businesses actively seeking done-for-you systems and workflow automation."
      },
      {
        keyword: `best ${cleanIndustry} for ROI`,
        intent: "Problem / Pain",
        momentum: "Surging",
        context: "Buyers are resisting vanity metrics and looking for hard verifiable revenue/cost savings."
      },
      {
        keyword: `alternative to legacy ${cleanIndustry}`,
        intent: "Competitor Comparison",
        momentum: "+120% YoY",
        context: "Customers seeking faster, modern, modular solutions over bloated incumbents."
      }
    ];

    const finalKeywords: TrendingKeyword[] = (parsedData.keywords && Array.isArray(parsedData.keywords) && parsedData.keywords.length > 0)
      ? parsedData.keywords.map(k => ({
          keyword: String(k.keyword || "Keyword"),
          intent: (["Problem / Pain", "Solution / Buy", "Breakout Trend", "Competitor Comparison"].includes(k.intent as string)
            ? k.intent
            : "Solution / Buy") as TrendingKeyword['intent'],
          momentum: String(k.momentum || "High Growth"),
          context: String(k.context || "Active market query"),
        }))
      : fallbackKeywords;

    return {
      industry: cleanIndustry,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      summary: parsedData.summary || `Live search activity indicates rising buyer demand for tangible outcomes, reduced operational drag, and clear ROI in ${cleanIndustry}.`,
      keywords: finalKeywords,
      emergingDemands: (parsedData.emergingDemands && parsedData.emergingDemands.length > 0)
        ? parsedData.emergingDemands
        : ["Proof of rapid execution", "Transparent, non-retainer lock-in pricing", "Integrated AI-augmented delivery"],
      saturatedAngles: (parsedData.saturatedAngles && parsedData.saturatedAngles.length > 0)
        ? parsedData.saturatedAngles
        : ["Vague promises of 'scaling effortlessly'", "Generic 'all-in-one' buzzword claims without proof"],
      opportunityGap: parsedData.opportunityGap || `Guaranteed implementation with clear risk-reversal and transparent operational metrics.`,
      sources: sources.slice(0, 8),
      searchQueries: webSearchQueries,
    };
  } catch (error) {
    console.error("Market Pulse fetch error:", error);
    throw error;
  }
};

/**
 * Generates the validation report, optionally incorporating the live Market Pulse context.
 */
export const generateBridgeReport = async (
  answers: string[],
  marketPulse?: MarketPulseData | null
): Promise<ValidationReport> => {
  const ai = getAiClient();
  const model = "gemini-3.8-flash";

  let marketPulseContext = "";
  if (marketPulse) {
    marketPulseContext = `
    LIVE MARKET PULSE CONTEXT (Grounded via Google Search):
    Industry: ${marketPulse.industry}
    Summary: ${marketPulse.summary}
    Trending Keywords: ${marketPulse.keywords.map(k => `"${k.keyword}" (${k.intent}, ${k.momentum})`).join(', ')}
    Emerging Demands: ${marketPulse.emergingDemands.join('; ')}
    Saturated Angles to Avoid: ${marketPulse.saturatedAngles.join('; ')}
    Lucrative Opportunity Gap: ${marketPulse.opportunityGap}

    Take this live search grounding into account when assessing Customer Specificity, Pricing Confidence, Differentiation Strength, and Market-Message Match!
    `;
  }

  const systemPrompt = `
    You are BRIDGE, a Sovereign Node (ID: BB) specialized in validating offer-market fit for any product or service (SaaS, Agency/Service, High-Ticket, E-commerce, Info-Products, Local business, etc.) with surgical precision.
    Your purpose is to evaluate whether an offer hits a real, acute problem with a well-defined audience, sustainable pricing, strong differentiation, and credible proof of demand.
    
    You have just asked the user 5 simple diagnostic questions. Now you must generate a structured validation report.
    ${marketPulseContext}

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

    if (!response.text) {
      throw new Error("Empty response from AI Sovereign Node.");
    }

    const report: ValidationReport = JSON.parse(response.text);
    return report;
  } catch (error) {
    console.error("Error generating validation report:", error);
    throw error;
  }
};