import { marked, Tokens } from "marked";
import { Tutorial } from "./types.ts";

const categories = [
  "Technical Tutorials",
  "University Courses",
  "Video Courses",
];

function parseItemAuthors(tokens: Tokens.Text["tokens"]) {
  return tokens
    ?.filter((t) => t.type === "em")
    .map((t) => (t as Tokens.Em).tokens.find((t) => t.type === "text"))
    .map((t) => (t as Tokens.Text).raw)
    .filter((v) => v);
}

function parseItemTags(tokens: Tokens.Text["tokens"]) {
  return tokens
    ?.filter((t) => t.type === "strong")
    .map((t) => (t as Tokens.Em).tokens.find((t) => t.type === "text"))
    .map((t) => (t as Tokens.Text).raw)
    .filter((v) => v);
}

function parseRecommendTemplate(tokens: Tokens.Text["tokens"]) {
  return tokens
    ?.filter(
      (t) => t.type === "link" && (t as Tokens.Link).raw === "Practice on GetVM"
    )
    .map((t) => (t as Tokens.Link).href.split("/").pop())[0];
}

function parseItem(item: TutorialItem) {
  const link = item.tokens[0].tokens?.[0] as Tokens.Link;
  const tutorial: Tutorial = {
    title: link.text,
    description: "",
    url: link.href,
    authors: [],
    category: "",
    tags: [],
  };

  const details = item.tokens[1] as Tokens.List;
  details.items.forEach((item) => {
    if (item.tokens[0]?.type === "text") {
      const text = item.tokens[0] as Tokens.Text;
      if (text.tokens?.[0].type === "text") {
        // description
        if (tutorial.description) {
          tutorial.description += "\n\n";
        }
        tutorial.description += text.tokens
          .map((t) => (t as Tokens.Text).raw || "")
          .join("");
      } else {
        tutorial.tags.push(...(parseItemTags(text.tokens) ?? []));
        tutorial.authors.push(...(parseItemAuthors(text.tokens) ?? []));
        tutorial.recommend_template ??= parseRecommendTemplate(text.tokens);
      }
    }
  });

  categories.forEach((category) => {
    if (tutorial.tags.includes(category)) {
      tutorial.category = category;
      tutorial.tags = tutorial.tags.filter((tag) => tag !== category);
    }
  });
  return tutorial;
}

type TutorialItem = Omit<Tokens.ListItem, "tokens"> & {
  tokens: [Tokens.Text, Tokens.List];
};

function isItem(item: Tokens.ListItem): item is TutorialItem {
  return (
    item.tokens.length === 2 &&
    item.tokens[0].type === "text" &&
    (item.tokens[0] as Tokens.Text).tokens?.[0].type === "link" &&
    item.tokens[1].type === "list"
  );
}

export async function parseTutorials(filename: string) {
  const text = await Deno.readTextFile(filename);
  const tokens = marked.lexer(text, marked.defaults);
  const tutorials: Tutorial[] = [];
  tokens.forEach((token) => {
    if (token.type === "list") {
      const list = token as Tokens.List;
      list.items.forEach((item) => {
        if (isItem(item)) {
          tutorials.push(parseItem(item));
        }
      });
    }
  });
  return tutorials;
}
