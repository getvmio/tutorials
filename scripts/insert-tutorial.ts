import { parseArgs } from "@std/cli/parse-args";
import { parseIssue } from "./parse-issue.ts";
import { parseTutorials } from "./parse-tutorials.ts";
import { dumpTutorials } from "./dump-tutorials.ts";

const parsedArgs = parseArgs(Deno.args);

const tutorial = parseIssue(Deno.env.get("ISSUE_BODY")!);
console.log(tutorial);

const tutorials = await parseTutorials(parsedArgs.file);
tutorials.push(tutorial);

dumpTutorials(parsedArgs.file, tutorials);
