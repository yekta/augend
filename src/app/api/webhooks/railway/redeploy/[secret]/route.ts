import { env } from "@/lib/env";

const railwayGraphqlApi = "https://backboard.railway.app/graphql/v2";

export async function POST(request: Request) {
  console.log("Redeploying Railway service");

  if (
    !env.RAILWAY_WEBHOOK_SECRET ||
    !env.RAILWAY_API_KEY ||
    !env.RAILWAY_ENVIRONMENT_ID ||
    !env.RAILWAY_SERVICE_ID
  ) {
    console.error(
      "Set RAILWAY_WEBHOOK_SECRET, RAILWAY_API_KEY, RAILWAY_ENVIRONMENT_ID, and RAILWAY_SERVICE_ID for this webhook to work."
    );
    return new Response(
      "Set RAILWAY_WEBHOOK_SECRET, RAILWAY_API_KEY, RAILWAY_ENVIRONMENT_ID, and RAILWAY_SERVICE_ID for this webhook to work.",
      { status: 500 }
    );
  }

  const secret = request.url.split("/").pop();
  if (secret !== env.RAILWAY_WEBHOOK_SECRET) {
    console.error("RAILWAY_WEBHOOK_SECRET not matching");
    return new Response("RAILWAY_WEBHOOK_SECRET not matching", { status: 403 });
  }

  try {
    const mutation = `
      mutation serviceInstanceRedeploy($environmentId: String!, $serviceId: String!) {
        serviceInstanceRedeploy(environmentId: $environmentId, serviceId: $serviceId)
      }
    `;
    const res = await fetch(railwayGraphqlApi, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RAILWAY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          environmentId: env.RAILWAY_ENVIRONMENT_ID,
          serviceId: env.RAILWAY_SERVICE_ID,
        },
      }),
    });
    const data = await res.json();
    if (data.errors) {
      console.error("Failed to redeploy:", data.errors);
      return new Response("Failed to redeploy:", { status: 500 });
    }
    console.log("Redeploy request succeeded:", data);
    return new Response("ok");
  } catch (error) {
    console.error("Failed to redeploy:", error);
    return new Response("Failed to redeploy", { status: 500 });
  }
}
