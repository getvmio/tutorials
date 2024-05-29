import { marked } from "marked";
import { Tutorial } from "./types.ts";

const tutorialsStart = "<!-- tutorials start -->";
const tutorialsEnd = "<!-- tutorials end -->";

function openMarkdownFile(output: string) {
  enum State {
    BeforeMainPart,
    InMainPart,
    AfterMainPart,
  }
  const oldContent = Deno.readTextFileSync(output);
  const tokens = marked.lexer(oldContent, marked.defaults);
  let content = "",
    prefix = "",
    suffix = "",
    state = State.BeforeMainPart;

  tokens.forEach((token) => {
    if (token.type === "html") {
      if (token.raw.startsWith(tutorialsStart)) {
        state = State.InMainPart;
        prefix += token.raw;
        return;
      } else if (token.raw.startsWith(tutorialsEnd)) {
        state = State.AfterMainPart;
        suffix += token.raw;
        return;
      }
    }
    if (state === State.BeforeMainPart) {
      prefix += token.raw;
    } else if (state === State.AfterMainPart) {
      suffix += token.raw;
    }
  });
  return {
    append: (line: string) => {
      content += `${line}\n`;
    },
    dump: () => {
      Deno.writeTextFileSync(output, `${prefix}${content}${suffix}`);
    },
  };
}

export function dumpTutorials(output: string, tutorials: Tutorial[]) {
  const file = openMarkdownFile(output);

  const tutorialMap = new Map<string, Tutorial[]>();
  tutorials.forEach((tutorial: Tutorial) => {
    const key = tutorial.tags[0] || "";
    tutorialMap.set(key, [...(tutorialMap.get(key) || []), tutorial]);
  });

  Array.from(tutorialMap.keys())
    .sort()
    .forEach((tag: string) => {
      file.append(`### ${tag}${"\n"}`);
      const tutorials = tutorialMap.get(tag);
      tutorials?.forEach((t: Tutorial) => {
        // url
        file.append(`- [${t.title}](${t.url})`);
        // tags & authors
        const tags = [t.category, ...t.tags]
          .map((t: string) => `**${t}**`)
          .join(", ");
        const authors = t.authors.map((t: string) => `*${t}*`).join(", ");
        file.append(`  - ${[tags, authors].filter((v) => v).join(", ")}`);
        // description
        t.description.split("\n\n").forEach((line: string) => {
          file.append(`  - ${line}`);
        });
        // recommend template
        if (t.recommend_template) {
          file.append(
            `  - [Practice on GetVM](${Deno.env.get("TEMPLATE_BASE_URL")}/${
              t.recommend_template
            })`
          );
        }
        file.append("");
      });
    });

  file.dump();
}
