export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");

    if (!q) return new Response("[]");

    const es = await fetch(`${env.ES_URL}/products/_search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        size: 5,
        query: {
          match: {
            name: {
              query: q,
              fuzziness: "AUTO",
            },
          },
        },
      }),
    });

    const json = await es.json();

    const results = json.hits.hits.map((h) => h._source.name);

    return Response.json(results);
  },
};
