import { httpRouter } from "convex/server";
import { paymentWebhook } from "./subscriptions";
import { httpAction } from "./_generated/server";
import { generateText } from "ai";
import { api } from "./_generated/api";

const INPUT_CREDITS_PER_TOKEN = 0.00005;
const OUTPUT_CREDITS_PER_TOKEN = 0.00015;

// Helper function to get the allowed origin for CORS
// Returns the request origin if it's in the allowed list, otherwise returns a default
function getAllowedOrigin(request: Request): string {
  const requestOrigin = request.headers.get("Origin");
  const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url.length > 0);
  
  // If request has an origin and it's in the allowed list, return it
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }
  
  // Otherwise, return the first allowed origin (or default)
  return allowedOrigins[0] || "http://localhost:5173";
}

// Helper function to create CORS headers
function getCorsHeaders(request: Request): HeadersInit {
  const origin = getAllowedOrigin(request);
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

export const generateTest = httpAction(async (ctx, req) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return new Response(
      JSON.stringify({ error: "Not authenticated" }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(req),
        },
      }
    );
  }

  const { prompt } = await req.json();

  // Check user's current credits
  const creditCheck = await ctx.runQuery(api.credits.checkCredits, {
    amount: 0, // Just to get current credits
  });

  // Do not allow users with 0 credits
  if (creditCheck.credits <= 0) {
    return new Response(
      JSON.stringify({ 
        error: "Insufficient credits", 
        credits: creditCheck.credits,
        message: "You need at least 1 credit to generate tests. Please purchase credits to continue."
      }),
      {
        status: 402,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(req),
        },
      }
    );
  }

  // Estimate credits needed (rough estimate before generation)
  // We'll do a more accurate check after generation
  const estimatedInputTokens = Math.ceil((prompt.length || 0) / 4); // Rough estimate: 4 chars per token
  const estimatedOutputTokens = 2000; // Estimate for a typical test generation
  const estimatedCreditsRaw = (estimatedInputTokens * INPUT_CREDITS_PER_TOKEN) + 
                              (estimatedOutputTokens * OUTPUT_CREDITS_PER_TOKEN);
  const estimatedCredits = Math.ceil(estimatedCreditsRaw); // Round up to nearest credit

  // Check if user has enough credits (with buffer)
  if (creditCheck.credits < estimatedCredits * 1.5) { // 50% buffer for safety
    return new Response(
      JSON.stringify({ 
        error: "Insufficient credits", 
        credits: creditCheck.credits,
        required: estimatedCredits 
      }),
      {
        status: 402,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(req),
        },
      }
    );
  }

  const systemPrompt = `You are an expert exam creator. Create a test based on the user's prompt.
    Return a JSON object with the following structure:
    {
      "name": "Test Name",
      "description": "Test Description",
      "type": "test" | "survey" | "essay",
      "fields": [
        {
          "id": "unique_string_id",
          "type": "shortInput" | "longInput" | "multipleChoice" | "checkboxes" | "dropdown" | "imageChoice" | "pageBreak" | "infoBlock",
          "label": "Question text",
          "required": boolean (optional),
          "options": ["Option 1", "Option 2"] (optional, for multipleChoice, checkboxes, dropdown, imageChoice),
          "correctAnswers": [0] (optional, indices of correct options for auto-grading),
          "marks": number (optional, default 1),
          "helpText": "Optional hint",
          "placeholder": "Optional placeholder"
        }
      ]
    }
    Ensure the JSON is valid and fields follow this schema.
    For 'id', generate a unique string like 'field-{timestamp}'.
    Default to 'test' type if not specified.
    `;

  const { text, usage } = await generateText({
    model: 'xai/grok-4-fast-reasoning', // AI Gateway format: provider/model-name
    system: systemPrompt,
    prompt,
  });

  // Calculate actual credits used
  // Usage object structure: { promptTokens: number, completionTokens: number }
  const inputTokens = (usage as any)?.promptTokens ?? 0;
  const outputTokens = (usage as any)?.completionTokens ?? 0;
  const creditsUsedRaw = (inputTokens * INPUT_CREDITS_PER_TOKEN) + 
                         (outputTokens * OUTPUT_CREDITS_PER_TOKEN);
  const creditsUsed = Math.ceil(creditsUsedRaw); // Round up to nearest credit

  // Deduct credits
  try {
    await ctx.runMutation(api.credits.deductCredits, {
      userId: identity.subject,
      amount: creditsUsed,
      description: `AI test generation (${inputTokens} input + ${outputTokens} output tokens)`,
    });
  } catch (error) {
    // If credit deduction fails, still return the result but log the error
    console.error("Failed to deduct credits:", error);
    // In production, you might want to handle this differently
  }

  return new Response(text, {
    headers: {
      "Content-Type": "application/json",
      ...getCorsHeaders(req),
    },
  });
});

const http = httpRouter();

http.route({
  path: "/api/auth/webhook",
  method: "POST",
  handler: httpAction(async (_, request) => {
    // Make sure the necessary headers are present
    // for this to be a valid pre-flight request
    const headers = request.headers;
    if (
      headers.get("Origin") !== null &&
      headers.get("Access-Control-Request-Method") !== null &&
      headers.get("Access-Control-Request-Headers") !== null
    ) {
      return new Response(null, {
        headers: new Headers({
          ...getCorsHeaders(request),
          "Access-Control-Max-Age": "86400",
        }),
      });
    } else {
      return new Response();
    }
  }),
});

http.route({
  path: "/api/generate-test",
  method: "POST",
  handler: generateTest,
});

http.route({
  path: "/api/generate-test",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => {
    const headers = request.headers;
    if (
      headers.get("Origin") !== null &&
      headers.get("Access-Control-Request-Method") !== null &&
      headers.get("Access-Control-Request-Headers") !== null
    ) {
      return new Response(null, {
        headers: new Headers({
          ...getCorsHeaders(request),
          "Access-Control-Max-Age": "86400",
        }),
      });
    } else {
      return new Response();
    }
  }),
});

http.route({
  path: "/payments/webhook",
  method: "POST",
  handler: paymentWebhook,
});

// HTTP routes configured

// Convex expects the router to be the default export of `convex/http.js`.
export default http;
