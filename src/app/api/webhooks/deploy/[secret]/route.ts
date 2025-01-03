import { env } from "@/lib/env";

export async function POST(request: Request) {
  if (!env.DEPLOY_WEBHOOK_SECRET) {
    return new Response("Set DEPLOY_WEBHOOK_SECRET for this webhook to work", {
      status: 400,
    });
  }
  const secret = request.url.split("/").pop();
  if (secret !== env.DEPLOY_WEBHOOK_SECRET) {
    return new Response("Invalid secret", { status: 403 });
  }
  const body = await request.json();
  console.log("WEBHOOK BODY:", body);
  return new Response("ok");
}
