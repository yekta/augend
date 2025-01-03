import * as fs from "fs";
import * as path from "path";
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

  try {
    const prerenderManifestPath = path.join(
      process.cwd(),
      ".next",
      "prerender-manifest.json"
    );
    const data = fs.readFileSync(prerenderManifestPath, "utf-8");
    const manifest = JSON.parse(data);

    const relativeRoutes = Object.keys(manifest.routes);
    const urls = relativeRoutes.map(
      (route) => `${env.NEXT_PUBLIC_SITE_URL}${route}`
    );
    console.log("All fully static URLs:", urls);
  } catch (error) {
    console.error("Failed to get static routes:", error);
    return new Response("Failed to get static routes", { status: 500 });
  }
  return new Response("ok");
}
