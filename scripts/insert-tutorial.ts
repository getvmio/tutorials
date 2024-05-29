import { parseArgs } from "@std/cli/parse-args";
import { parseIssue } from "./parse-issue.ts";
import { parseTutorials } from './parse-tutorials.ts';
import { dumpTutorials } from './dump-tutorials.ts';

const parsedArgs = parseArgs(Deno.args);

const body = `### Title

Good first issue

### Url

https://goodfirstissue.dev

### Description of this tutorial

Good First Issue curates easy pickings from popular open-source projects, and helps you make your first contribution to open-source.
Hello.

Hello World

### Authors

DeepSource

### Category

Technical Tutorials

### Tags

Ubuntu, Github

### Recommend a Template

vnc-ubuntu:2204

### Terms

- [X] I agree`;

const tutorial = parseIssue(body);
console.log(tutorial);

const tutorials = await parseTutorials(parsedArgs.file);
tutorials.push(tutorial);

dumpTutorials(parsedArgs.file, tutorials);
