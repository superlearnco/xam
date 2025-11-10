import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  try {
    switch (eventType) {
      case "user.created":
      case "user.updated":
        await handleUserUpsert(evt);
        break;

      case "user.deleted":
        await handleUserDeleted(evt);
        break;

      case "organization.created":
      case "organization.updated":
        // Handle organization events if needed
        console.log("Organization event:", eventType);
        break;

      case "organizationMembership.created":
      case "organizationMembership.updated":
      case "organizationMembership.deleted":
        // Handle organization membership events if needed
        console.log("Organization membership event:", eventType);
        break;

      default:
        console.log("Unhandled event type:", eventType);
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Error processing webhook", { status: 500 });
  }
}

async function handleUserUpsert(evt: WebhookEvent) {
  if (evt.type !== "user.created" && evt.type !== "user.updated") {
    return;
  }

  const { id, email_addresses, first_name, last_name, image_url } = evt.data;

  const primaryEmail = email_addresses.find(
    (email) => email.id === evt.data.primary_email_address_id
  );

  if (!primaryEmail) {
    console.error("No primary email found for user:", id);
    return;
  }

  const email = primaryEmail.email_address;
  const emailVerified =
    primaryEmail.verification?.status === "verified" || false;

  const name = first_name && last_name
    ? `${first_name} ${last_name}`
    : first_name || last_name || email;

  try {
    await fetchMutation(api.users.syncUserFromClerk, {
      clerkUserId: id,
      email,
      name,
      avatar: image_url || undefined,
      emailVerified,
    });

    console.log("User synced to Convex:", id);
  } catch (error) {
    console.error("Error syncing user to Convex:", error);
    throw error;
  }
}

async function handleUserDeleted(evt: WebhookEvent) {
  if (evt.type !== "user.deleted") {
    return;
  }

  const { id } = evt.data;

  console.log("User deletion event received:", id);

  // TODO: Implement soft delete or account archival logic
  // This would involve:
  // 1. Finding the user in Convex by clerkUserId
  // 2. Updating their status to "deleted" or "inactive"
  // 3. Possibly anonymizing their data for GDPR compliance

  // For now, we just log the event
  // You can implement the actual deletion/archival logic as needed
}
