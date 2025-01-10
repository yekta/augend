import { env } from "@/lib/env";
import GhostContentAPI from "@tryghost/content-api";

export const ghostUrl = env.GHOST_API_URL ? new URL(env.GHOST_API_URL) : null;
export const ghostApi =
  env.GHOST_API_URL && env.GHOST_CONTENT_API_KEY
    ? new GhostContentAPI({
        url: env.GHOST_API_URL,
        key: env.GHOST_CONTENT_API_KEY,
        version: "v5.0",
        makeRequest: async ({ url, method, params, headers }) => {
          const apiUrl = new URL(url);

          Object.keys(params).map((key) =>
            apiUrl.searchParams.set(key, encodeURIComponent(params[key]))
          );

          try {
            const response = await fetch(apiUrl.toString(), {
              method,
              headers,
            });
            const data = await response.json();
            return { data };
          } catch (error) {
            console.error(error);
          }
        },
      })
    : null;
