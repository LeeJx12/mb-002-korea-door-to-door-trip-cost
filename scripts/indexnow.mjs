const key = "8c8f3fba09134a62b0f63d8a82197d5c";
const base = "https://leejx12.github.io/mb-002-korea-door-to-door-trip-cost/";
const urls = [base, `${base}seoul-busan/`, `${base}seoul-gangneung/`, `${base}seoul-jeonju/`];
const payload = {
  host: "leejx12.github.io",
  key,
  keyLocation: `${base}${key}.txt`,
  urlList: urls
};

if (!process.argv.includes("--submit")) {
  console.log(JSON.stringify({ mode: "preview", endpoint: "https://api.indexnow.org/indexnow", payload }, null, 2));
  process.exit(0);
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload)
});
const evidence = {
  submitted_at: new Date().toISOString(),
  endpoint: "https://api.indexnow.org/indexnow",
  status: response.status,
  accepted: response.status === 200 || response.status === 202,
  url_count: urls.length,
  urls
};
console.log(JSON.stringify(evidence, null, 2));
if (!evidence.accepted) process.exitCode = 1;
