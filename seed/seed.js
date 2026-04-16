import fs from "fs";

const ES_URL = process.env.ES_URL;

const games = JSON.parse(fs.readFileSync("./games.json"));

async function createIndex() {
  await fetch(`${ES_URL}/games`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mappings: {
        properties: {
          name: { type: "search_as_you_type" },
          genre: { type: "keyword" },
          year: { type: "integer" },
        },
      },
    }),
  });
}

async function bulkInsert() {
  const lines = [];

  for (const g of games) {
    lines.push(JSON.stringify({ index: { _index: "games" } }));
    lines.push(JSON.stringify(g));
  }

  const body = lines.join("\n") + "\n";

  await fetch(`${ES_URL}/_bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/x-ndjson" },
    body,
  });
}

async function run() {
  await createIndex();
  await bulkInsert();
  console.log("seed complete");
}

run();
