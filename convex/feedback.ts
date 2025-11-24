import { action } from "./_generated/server";
import { v } from "convex/values";

// Simple HTML escape function
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export const submitFeedback = action({
  args: {
    type: v.union(v.literal("bug"), v.literal("feature")),
    message: v.string(),
    userEmail: v.string(),
    userName: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.INBOUND_API_KEY;
    if (!apiKey) {
      throw new Error("INBOUND_API_KEY is not configured");
    }

    const subject = args.type === "bug" 
      ? `Bug Report from ${args.userName}` 
      : `Feature Suggestion from ${args.userName}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">
          ${args.type === "bug" ? "🐛 Bug Report" : "💡 Feature Suggestion"}
        </h2>
        <div style="margin-top: 20px;">
          <p><strong>User:</strong> ${escapeHtml(args.userName)} (${escapeHtml(args.userEmail)})</p>
          <p><strong>Type:</strong> ${args.type === "bug" ? "Bug Report" : "Feature Suggestion"}</p>
        </div>
        <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
          <h3 style="margin-top: 0; color: #555;">Message:</h3>
          <p style="white-space: pre-wrap; color: #333;">${escapeHtml(args.message)}</p>
        </div>
      </div>
    `;

    const textContent = `
${args.type === "bug" ? "Bug Report" : "Feature Suggestion"}

User: ${args.userName} (${args.userEmail})
Type: ${args.type === "bug" ? "Bug Report" : "Feature Suggestion"}

Message:
${args.message}
    `.trim();

    try {
      const response = await fetch("https://inbound.new/api/v2/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "bugs@superlearn.cc",
          to: "bugs@superlearn.cc",
          subject: subject,
          html: htmlContent,
          text: textContent,
          tags: [
            { name: "type", value: args.type },
            { name: "source", value: "dashboard" },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Inbound API error:", errorText);
        throw new Error(`Failed to send email: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return { success: true, id: data.id };
    } catch (error) {
      console.error("Error sending feedback email:", error);
      throw error;
    }
  },
});

