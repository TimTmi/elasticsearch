export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/search") {
      return search(request, env);
    }

    if (url.pathname === "/api/suggest") {
      return suggest(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function suggest(request, env) {
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
      size: 1,
      query: {
        match: {
          "name.edge": {
            query: q
          }
        }
      }
    }),
  });

  const json = await es.json();

  return Response.json(
    json.hits.hits.map(h => ({
      name: h._source.name
    }))
  );
}

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
        multi_match: {
          query: q,
          fields: ["name^2", "genre"]
        }
      }
    }),
  });

  const json = await es.json();
  return Response.json(json.hits.hits.map(h => h._source));
}
