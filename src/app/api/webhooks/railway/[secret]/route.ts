import * as fs from "fs";
import * as path from "path";
import { env } from "@/lib/env";
import Cloudflare from "cloudflare";

const batchSize = 30;
const client = new Cloudflare();

export async function POST(request: Request) {
  if (!env.DEPLOY_WEBHOOK_SECRET) {
    return new Response("Set DEPLOY_WEBHOOK_SECRET for this webhook to work", {
      status: 400,
    });
  }
  if (
    !env.CLOUDFLARE_ZONE_ID ||
    !env.CLOUDFLARE_API_KEY ||
    !env.CLOUDFLARE_EMAIL
  ) {
    return new Response(
      "Set CLOUDFLARE_ZONE_ID, CLOUDFLARE_API_KEY, CLOUDFLARE_EMAIL for this webhook to work",
      {
        status: 400,
      }
    );
  }

  const secret = request.url.split("/").pop();
  if (secret !== env.DEPLOY_WEBHOOK_SECRET) {
    return new Response("Invalid secret", { status: 403 });
  }

  const body: TRailwayDeployBody = await request.json();

  if (
    !body.project?.id ||
    !process.env.RAILWAY_PROJECT_ID ||
    body.project?.id !== process.env.RAILWAY_PROJECT_ID ||
    body.type !== "DEPLOY" ||
    body.status !== "REMOVING"
  ) {
    return new Response("Skipping execution for this webhook", { status: 200 });
  }

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

    const urlChunks = chunkArray(urls, batchSize);

    for (const chunk of urlChunks) {
      const response = await client.cache.purge({
        zone_id: env.CLOUDFLARE_ZONE_ID,
        files: chunk,
      });
      console.log("Cache purge batch:", response, chunk);
    }
  } catch (error) {
    console.error("Failed to get static routes:", error);
    return new Response("Failed to get static routes", { status: 500 });
  }

  return new Response("ok");
}

type TRailwayDeployBody = {
  type?: string;
  project?: {
    id?: string;
  };
  status?: string;
};

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}
