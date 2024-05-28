import { parseTutorials } from "./parse-tutorials.ts";

const tutorials = await parseTutorials("./README.md");
tutorials.forEach((t) => console.log(t));

const resp = await fetch(Deno.env.get('UPLOAD_URL')!, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${Deno.env.get("API_SECRET")}`,
  },
  body: JSON.stringify({
    tutorials,
    hide_others: true,
  }),
});

console.log(resp.status, await resp.text());
if (!resp.ok) {
  throw new Error(`Failed to upload tutorials: ${resp.status}`);
}
