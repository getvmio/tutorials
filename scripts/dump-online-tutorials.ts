import { parseArgs } from "@std/cli/parse-args";
import { dumpTutorials } from "./dump-tutorials.ts";

const parsedArgs = parseArgs(Deno.args);

type Path = {
  name: string;
  description: string;
  url: string;
  authors: string[];
  category: string;
  tags: string[];
  recommend_template?: {
    alias: string;
  };
};

const resp = await fetch(Deno.env.get("DUMP_URL")!, {});
if (!resp.ok) {
  throw new Error(
    `Failed to upload tutorials: ${resp.status}, ${await resp.text()}`
  );
}

const { paths } = await resp.json();
console.log('tutorials count:', paths.length);

dumpTutorials(
  parsedArgs.output,
  (paths as Path[]).map((path) => ({
    ...path,
    title: path.name,
    recommend_template: path.recommend_template?.alias,
  }))
);
