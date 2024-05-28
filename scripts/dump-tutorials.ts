const resp = await fetch(Deno.env.get("DUMP_URL")!, {});
if (!resp.ok) {
  throw new Error(
    `Failed to upload tutorials: ${resp.status}, ${await resp.text()}`
  );
}

const { paths } = await resp.json();

const filename = "temp.md";
Deno.writeTextFileSync(filename, "");

type Path = {
  name: string;
  description: string;
  url: string;
  authors: string[];
  category: string;
  tags: string[];
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
      appendContent(`- [${path.name}](${path.url})`);
      const tags = [path.category, ...path.tags];
      appendContent(`  - ${tags.map((t: string) => `**${t}**`).join(", ")}`);
      if (path.authors.length) {
        appendContent(
          `  - ${path.authors.map((t: string) => `*${t}*`).join(", ")}`
        );
      }
      path.description.split("\n\n").forEach((line: string) => {
        appendContent(`  - ${line}`);
      });
      appendContent("");
    });
  });

function appendContent(line: string) {
  Deno.writeTextFileSync(filename, `${line}\n`, {
    append: true,
  });
}
