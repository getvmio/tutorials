import { parseArgs } from "@std/cli/parse-args";

const parsedArgs = parseArgs(Deno.args);

const resp = await fetch(Deno.env.get("DUMP_URL")!, {});
if (!resp.ok) {
  throw new Error(
    `Failed to upload tutorials: ${resp.status}, ${await resp.text()}`
  );
}

const { paths } = await resp.json();

const filename = parsedArgs.file || "temp.md";
Deno.writeTextFileSync(filename, "");

type Path = {
  name: string;
  description: string;
  url: string;
  authors: string[];
  category: string;
  tags: string[];
  recommend_template?: {
    alias: string;
    name: string;
  };
};

const pathMap = new Map<string, Path[]>();
paths.forEach((path: Path) => {
  const key = path.tags[0] || "";
  pathMap.set(key, [...(pathMap.get(key) || []), path]);
});

Array.from(pathMap.keys())
  .sort()
  .forEach((tag: string) => {
    appendContent(`### ${tag}${"\n"}`);
    const paths = pathMap.get(tag);
    paths?.forEach((path: Path) => {
      // url
      appendContent(`- [${path.name}](${path.url})`);
      // tags & authors
      const tags = [path.category, ...path.tags]
        .map((t: string) => `**${t}**`)
        .join(", ");
      const authors = path.authors.map((t: string) => `*${t}*`).join(", ");
      appendContent(`  - ${[tags, authors].filter((v) => v).join(", ")}`);
      // description
      path.description.split("\n\n").forEach((line: string) => {
        appendContent(`  - ${line}`);
      });
      // recommend template
      if (path.recommend_template) {
        appendContent(
          `  - [Practice on GetVM](${Deno.env.get("TEMPLATE_BASE_URL")}/${
            path.recommend_template.alias
          })`
        );
      }
      appendContent("");
    });
  });

function appendContent(line: string) {
  Deno.writeTextFileSync(filename, `${line}\n`, {
    append: true,
  });
}
