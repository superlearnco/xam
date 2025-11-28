import { httpRouter } from "convex/server";
import { paymentWebhook } from "./subscriptions";
import { httpAction } from "./_generated/server";
import { generateText } from "ai";
import { api } from "./_generated/api";

const INPUT_CREDITS_PER_TOKEN = 0.00005;
const OUTPUT_CREDITS_PER_TOKEN = 0.00015;

/**
 * Fixes common LaTeX errors in AI-generated content.
 * Replaces common mistakes like "imes" with "\times" and ensures proper LaTeX syntax.
 */
function fixLatexContent(content: string): string {
  if (!content || typeof content !== "string") {
    return content;
  }

  // Fix common LaTeX command mistakes (missing backslashes)
  const fixes: Array<[RegExp, string]> = [
    // Multiplication
    [/\bimes\b/g, "\\times"],
    // Division
    [/\bdiv(?![i])\b/g, "\\div"],
    // Plus/minus
    [/\bpm(?![a-z])\b/g, "\\pm"],
    [/\bmp(?![a-z])\b/g, "\\mp"],
    // Fractions
    [/\bfrac\{/g, "\\frac{"],
    // Square root
    [/\bsqrt\{/g, "\\sqrt{"],
    [/\bsqrt\[/g, "\\sqrt["],
    // Operators
    [/\bsum(?![a-z])\b/g, "\\sum"],
    [/\bprod(?![a-z])\b/g, "\\prod"],
    [/\bint(?![a-z])\b/g, "\\int"],
    // Relations
    [/\bleq(?![a-z])\b/g, "\\leq"],
    [/\bgeq(?![a-z])\b/g, "\\geq"],
    [/\bneq(?![a-z])\b/g, "\\neq"],
    [/\bapprox(?![a-z])\b/g, "\\approx"],
    // Greek letters (common ones)
    [/\balpha(?![a-z])\b/g, "\\alpha"],
    [/\bbeta(?![a-z])\b/g, "\\beta"],
    [/\bgamma(?![a-z])\b/g, "\\gamma"],
    [/\bdelta(?![a-z])\b/g, "\\delta"],
    [/\bepsilon(?![a-z])\b/g, "\\epsilon"],
    [/\btheta(?![a-z])\b/g, "\\theta"],
    [/\blambda(?![a-z])\b/g, "\\lambda"],
    [/\bmu(?![a-z])\b/g, "\\mu"],
    [/\bpi(?![a-z])\b/g, "\\pi"],
    [/\bsigma(?![a-z])\b/g, "\\sigma"],
    [/\bomega(?![a-z])\b/g, "\\omega"],
    // Sets
    [/\bin(?![a-z])\b(?=\s*\{)/g, "\\in"],
    [/\bsubset(?![a-z])\b/g, "\\subset"],
    [/\bsupset(?![a-z])\b/g, "\\supset"],
    // Arrows
    [/\brightarrow(?![a-z])\b/g, "\\rightarrow"],
    [/\bleftarrow(?![a-z])\b/g, "\\leftarrow"],
    [/\bleftrightarrow(?![a-z])\b/g, "\\leftrightarrow"],
  ];

  let fixed = content;
  for (const [pattern, replacement] of fixes) {
    fixed = fixed.replace(pattern, replacement);
  }

  return fixed;
}

/**
 * Removes $$ delimiters from labels and moves display math to latexContent
 */
function cleanLabelAndMoveLatex(field: any): any {
  if (!field || typeof field !== "object") {
    return field;
  }

  const cleaned = { ...field };

  // Handle label field - remove $$ delimiters and extract display math
  if (cleaned.label && typeof cleaned.label === "string") {
    let label = cleaned.label;

    // Find all $$...$$ patterns
    const displayMathPattern = /\$\$([^$]+?)\$\$/g;
    const displayMathBlocks: string[] = [];
    let match;

    // Extract all $$...$$ blocks
    while ((match = displayMathPattern.exec(label)) !== null) {
      displayMathBlocks.push(match[1].trim());
    }

    // Remove all $$...$$ from label
    label = label.replace(displayMathPattern, "").trim();

    // If we found display math blocks and latexContent doesn't exist or is empty
    if (displayMathBlocks.length > 0) {
      // Combine multiple display math blocks or use the first one
      const combinedMath = displayMathBlocks.join(" \\\\ "); // Join with line breaks
      
      // Only set latexContent if it's empty or doesn't exist
      if (!cleaned.latexContent || cleaned.latexContent.trim() === "") {
        cleaned.latexContent = combinedMath;
      }
    }

    // Clean up the label - remove extra spaces and fix LaTeX commands
    label = label.replace(/\s+/g, " ").trim();
    cleaned.label = fixLatexContent(label);

    // Also clean latexContent if it exists
    if (cleaned.latexContent && typeof cleaned.latexContent === "string") {
      // Remove $$ delimiters from latexContent if present
      cleaned.latexContent = cleaned.latexContent.replace(/^\$\$|\$\$$/g, "").trim();
      cleaned.latexContent = fixLatexContent(cleaned.latexContent);
    }
  }

  return cleaned;
}

/**
 * Recursively cleans LaTeX content in a test object (fields, labels, options, etc.)
 */
function cleanLatexInTestData(data: any): any {
  if (typeof data === "string") {
    // Remove $$ delimiters from strings (shouldn't have them in JSON values)
    let cleaned = data.replace(/^\$\$|\$\$$/g, "").trim();
    return fixLatexContent(cleaned);
  }
  
  if (Array.isArray(data)) {
    return data.map(cleanLatexInTestData);
  }
  
  if (data && typeof data === "object") {
    // Check if this is a test object with fields array
    if (data.fields && Array.isArray(data.fields)) {
      const cleaned = { ...data };
      // Clean each field specially to handle label -> latexContent migration
      cleaned.fields = data.fields.map((field: any) => {
        const cleanedField = cleanLabelAndMoveLatex(field);
        // Also clean options if they exist
        if (cleanedField.options && Array.isArray(cleanedField.options)) {
          cleanedField.options = cleanedField.options.map((opt: any) => {
            if (typeof opt === "string") {
              // Remove $$ delimiters from options (should use $...$ for inline math)
              let cleanedOpt = opt.replace(/\$\$/g, "$");
              return fixLatexContent(cleanedOpt);
            }
            return cleanLatexInTestData(opt);
          });
        }
        return cleanedField;
      });
      return cleaned;
    }

    // For other objects, clean recursively
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      cleaned[key] = cleanLatexInTestData(value);
    }
    return cleaned;
  }
  
  return data;
}

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
          "placeholder": "Optional placeholder",
          "latexContent": "Optional LaTeX math formula for questions - USE THIS FIELD for math equations/formulas (NO $$ delimiters needed, e.g., \"x = \\\\frac{-b \\\\pm \\\\sqrt{b^2-4ac}}{2a}\")"
        }
      ]
    }
    Ensure the JSON is valid and fields follow this schema.
    For 'id', generate a unique string like 'field-{timestamp}'.
    Default to 'test' type if not specified.
    
    CRITICAL - LaTeX Support and JSON Escaping:
    When writing LaTeX in JSON strings, you MUST escape backslashes by doubling them (\\). 
    After JSON parsing, \\ becomes \ which is correct LaTeX syntax.
    
    Examples of CORRECT LaTeX in JSON:
    - latexContent: "x = \\\\frac{-b \\\\pm \\\\sqrt{b^2-4ac}}{2a}" (NO $$ delimiters - added automatically during rendering)
    - label: "Multiply the following:" (plain text in label, math goes in latexContent)
    - options: ["$\\\\sqrt{16}$", "$4^2$"] (becomes ["$\\sqrt{16}$", "$4^2$"] after parsing - use single $ for inline math)
    
    Common LaTeX commands that need double backslashes in JSON:
    - \\times for multiplication (×)
    - \\div for division (÷)
    - \\pm for plus/minus (±)
    - \\frac{a}{b} for fractions
    - \\sqrt{x} for square root
    - \\leq, \\geq, \\neq for inequalities
    - Greek letters: \\alpha, \\beta, \\pi, \\theta, etc.
    
    - For math formulas/equations in QUESTIONS: ALWAYS use the latexContent field (WITHOUT $$ delimiters)
      * Example: latexContent: "x = \\\\frac{-b \\\\pm \\\\sqrt{b^2-4ac}}{2a}"
      * Keep the label text simple (e.g., "Solve for x:") and put the formula in latexContent
      * DO NOT put $$ delimiters in latexContent - they are added automatically during rendering
    - For inline math within question labels: Use $...$ format in the label text itself (single $ delimiters)
      * Example: "What is the value of $x$ when $y = 3$?"
      * DO NOT use $$ in labels - use latexContent field for display math instead
    - For math in answer options: Use $...$ inline format in options
      * Example: ["$x = 5$", "$x = -5$", "$x = 0$"] 
      * Example: ["$\\\\sqrt{16} = 4$", "$4^2 = 16$"] (double backslashes for commands)
    - When creating math questions: Use latexContent field for formulas/equations, $...$ for small inline expressions
    
    REMEMBER: In JSON, every single backslash must be doubled. \\times in JSON becomes \times in LaTeX.
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

  // Parse, clean, and return the JSON response
  try {
    let data = JSON.parse(text);
    // Clean LaTeX content to fix common AI-generated errors
    data = cleanLatexInTestData(data);
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        ...getCorsHeaders(req),
      },
    });
  } catch (error) {
    // If parsing fails, try to extract JSON from the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      let data = JSON.parse(jsonMatch[0]);
      // Clean LaTeX content to fix common AI-generated errors
      data = cleanLatexInTestData(data);
      return new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(req),
        },
      });
    }
    // If all parsing fails, return the original text
    return new Response(text, {
      headers: {
        "Content-Type": "application/json",
        ...getCorsHeaders(req),
      },
    });
  }
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
