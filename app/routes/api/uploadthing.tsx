import { createRouteHandler } from "uploadthing/server";
import type { Route } from "./+types/uploadthing";
import { ourFileRouter } from "~/lib/uploadthing";

// Create route handler for UploadThing
// The server version returns a single function that handles both GET and POST
const handler = createRouteHandler({
  router: ourFileRouter,
});

export async function loader({ request }: Route.LoaderArgs) {
  return handler(request);
}

export async function action({ request }: Route.ActionArgs) {
  return handler(request);
}

