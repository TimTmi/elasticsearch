import fs from "fs";

const ES_URL = process.env.ES_URL;
const ES_USER = process.env.ES_USER;
const ES_PASS = process.env.ES_PASS;

const auth = Buffer.from(`${ES_USER}:${ES_PASS}`).toString("base64");

const headers = {
  "Content-Type": "application/json",
  Authorization: `Basic ${auth}`,
};

const games = JSON.parse(fs.readFileSync("./games.json"));

async function deleteIndex() {
  await fetch(`${ES_URL}/games?ignore_unavailable=true`, {
    method: "DELETE",
    headers,
  });
}

async function createIndex() {
  await fetch(`${ES_URL}/games`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      settings: {
        analysis: {
          filter: {
            edge_ngram_filter: {
              type: "edge_ngram",
              min_gram: 1,
              max_gram: 20
            }
          },
          analyzer: {
            edge_ngram_analyzer: {
              type: "custom",
              tokenizer: "standard",
              filter: ["lowercase", "edge_ngram_filter"]
            }
          }
        }
      },
      mappings: {
        properties: {
          name: {
            type: "text",
            fields: {
              edge: {
                type: "text",
                analyzer: "edge_ngram_analyzer",
                search_analyzer: "standard"
              },
              keyword: {
                type: "keyword",
                ignore_above: 256
              }
            }
          },
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
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-ndjson",
    },
    body,
  });
}

async function run() {
  await deleteIndex();
  await createIndex();
  await bulkInsert();
  console.log("seed complete");
}

run();
