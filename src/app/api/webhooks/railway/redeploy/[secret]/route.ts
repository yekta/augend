import { env } from "@/lib/env";

const railwayGraphqlApi = "https://backboard.railway.app/graphql/v2";

export async function POST(request: Request) {
  console.log("Redeploying Railway service");

  if (!env.RAILWAY_WEBHOOK_SECRET) {
    console.error("Set RAILWAY_WEBHOOK_SECRET for this webhook to work");
    return new Response("Set RAILWAY_WEBHOOK_SECRET for this webhook to work", {
      status: 400,
    });
  }

  if (!env.RAILWAY_SERVICE_ID) {
    console.error("Set RAILWAY_SERVICE_ID for this webhook to work");
    return new Response("Set RAILWAY_SERVICE_ID for this webhook to work", {
      status: 400,
    });
  }

  const secret = request.url.split("/").pop();
  if (secret !== env.RAILWAY_WEBHOOK_SECRET) {
    console.error("RAILWAY_WEBHOOK_SECRET not matching");
    return new Response("RAILWAY_WEBHOOK_SECRET not matching", { status: 403 });
  }

  try {
    const serviceQuery = `
      query service($id: String!) {
        service(id: $id) {
          id
          name
          projectId
          updatedAt
          deployments {
              edges {
                  node {
                      id
                  }
              }
          }
        }
      }
    `;
    const res = await fetch(railwayGraphqlApi, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RAILWAY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: serviceQuery,
        variables: { id: env.RAILWAY_SERVICE_ID },
      }),
    });
    const data = await res.json();
    if (data.errors) {
      console.error("Failed to fetch service:", data.errors);
      return new Response("Failed to fetch service", { status: 500 });
    }
    const lastDeploymentId = data?.data?.service?.deployments?.edges?.[0].node
      .id as string;
    if (!lastDeploymentId) {
      return new Response("No deployment found", { status: 404 });
    }

    const redeployMutation = `
      mutation deploymentRedeploy($id: String!, $usePreviousImageTag: Boolean) {
        deploymentRedeploy(id: $id, usePreviousImageTag: $usePreviousImageTag) {
          createdAt
          environmentId
          id
          projectId
          serviceId
          snapshotId
          staticUrl
          url
        }
    }`;
    const res2 = await fetch(railwayGraphqlApi, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RAILWAY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: redeployMutation,
        variables: { id: lastDeploymentId, usePreviousImageTag: true },
      }),
    });
    const data2 = await res2.json();
    if (data2.errors) {
      console.error("Failed to redeploy:", data2.errors);
      return new Response("Failed to redeploy", { status: 500 });
    }
    console.log("Redeployed:", data2?.data?.deploymentRedeploy);
    return new Response("ok");
  } catch (error) {
    console.error("Failed to redeploy:", error);
    return new Response("Failed to redeploy", { status: 500 });
  }
}
