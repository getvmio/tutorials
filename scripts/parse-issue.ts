import { marked } from "marked";
// @deno-types="npm:@types/js-yaml@^4.0.0"
import * as YAML from "js-yaml";
import { Tutorial } from "./types.ts";

const issueFields: Record<string, string> = {};

async function parseIssueTemplate() {
  const tplText = await Deno.readTextFile(
    ".github/ISSUE_TEMPLATE/1-new-tutorial.yaml"
  );
  const { body } = YAML.load(tplText) as {
    body: {
      id: string;
      attributes: {
        label: string;
      };
    }[];
  };
  body.forEach((field) => {
    issueFields[field.attributes.label] = field.id;
  });
}

await parseIssueTemplate();

export function parseIssue(body: string) {
  const tutorial: Tutorial = {
    title: "",
    description: "",
    url: "",
    authors: [],
    category: "",
    tags: [],
  };

  function setField(field: string, value: string) {
    switch (issueFields[field]) {
      case "title":
        tutorial.title = value;
        break;
      case "url":
        tutorial.url = value;
        break;
      case "description":
        if (tutorial.description != "") {
          tutorial.description += "\n\n";
        }
        tutorial.description += value;
        break;
      case "authors":
        tutorial.authors = value
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v);
        break;
      case "category":
        tutorial.category = value;
        break;
      case "tags":
        tutorial.tags = value
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v);
        break;
      case "recommend_template":
        tutorial.recommend_template = value;
        break;
    }
  }

  const tokens = marked.lexer(body, marked.defaults);

  let heading = "";
  tokens.forEach((token) => {
    if (token.type === "heading") {
      heading = token.text;
      return;
    }
    if (token.type === "space") {
      return;
    }
    if (token.type === "paragraph") {
      setField(heading, token.text);
      return;
    }
    if (heading === "Terms" && token.type === "list") {
      // must agree to terms
      if (token.items[0].checked === false) {
        throw new Error("Must agree to terms");
      }
      return;
    }
    console.log(`unhandled field '${heading}':`, token);
  });

  return tutorial;
}
