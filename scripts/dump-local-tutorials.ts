import { parseArgs } from "@std/cli/parse-args";
import { dumpTutorials } from "./dump-tutorials.ts";
import { parseTutorials } from "./parse-tutorials.ts";

const parsedArgs = parseArgs(Deno.args);

const tutorials = await parseTutorials(parsedArgs.file);

console.log('tutorials count:', tutorials.length);

dumpTutorials(parsedArgs.file, tutorials);
