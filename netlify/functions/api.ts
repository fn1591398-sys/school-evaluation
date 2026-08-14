const upstreamOrigin = "https://ibn-jauzi-hqj5hfez.manus.space";

type NetlifyEvent = {
  body: string | null;
  headers: Record<string, string | undefined>;
  httpMethod: string;
  isBase64Encoded: boolean;
  path: string;
  rawQuery: string;
};

/**
 * Keeps the Netlify copy free of private storage credentials. All dynamic
 * operations are forwarded to the primary Manus service, which is already
 * connected to the shared Supabase data and evidence storage.
 */
export async function handler(event: NetlifyEvent) {
  const apiPath = event.path.replace(/^\/.netlify\/functions\/api/, "");
  const upstreamUrl = new URL(apiPath || "/", upstreamOrigin);
  upstreamUrl.search = event.rawQuery;

  const response = await fetch(upstreamUrl, {
    method: event.httpMethod,
    headers: {
      accept: event.headers.accept ?? "application/json",
      "content-type": event.headers["content-type"] ?? "application/json",
      cookie: event.headers.cookie ?? "",
    },
    body:
      event.body && !["GET", "HEAD"].includes(event.httpMethod)
        ? event.isBase64Encoded
          ? Buffer.from(event.body, "base64")
          : event.body
        : undefined,
  });

  return {
    statusCode: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
    },
    body: await response.text(),
  };
}
