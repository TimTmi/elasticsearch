export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/search") {
      return search(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function search(request, env) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");

  if (!q || q.length < 2) return Response.json([]);

  const auth = btoa(`${env.ES_USER}:${env.ES_PASS}`);

  const es = await fetch(`${env.ES_URL}/games/_search`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      size: 5,
      query: {
        bool: {
          should: [
            {
              multi_match: {
                query: q,
                type: "bool_prefix",
                fields: ["name", "name._2gram", "name._3gram"],
              },
            },
            {
              match: {
                name: {
                  query: q,
                  fuzziness: "AUTO",
                },
              },
            },
          ],
        },
      },
    }),
  });

  const json = await es.json();
  const results = json.hits.hits.map((h) => h._source.name);

  return Response.json(results);
}
