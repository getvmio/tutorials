import { parseArgs } from "@std/cli/parse-args";
import { parseTutorials } from "./parse-tutorials.ts";

const parsedArgs = parseArgs(Deno.args);

const tutorials = await parseTutorials(parsedArgs.file);
console.log("tutorials count:", tutorials.length);

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
