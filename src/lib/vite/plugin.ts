import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import path from "path";
import type { FSWatcher, Plugin } from "vite";

interface SvelteIntlPluginOptions {
  localesDir: string;
  defaultLocale: string;
}

export function svelteIntl(options: SvelteIntlPluginOptions) {
  if (!process.env.PWD) {
    throw `Unable to locate working directory, process.env.PWD with a value of "${process.env.PWD}"`;
  }
  const pwd = process.env.PWD!;

  const configureServer = (server: { watcher: FSWatcher }) => {
    const dir = path.join(pwd, options.localesDir);
    server.watcher.add(dir);

    const localeFiles = readdirSync(options.localesDir, "utf-8");
    for (const localeFile of localeFiles) {
      server.watcher.add(path.join(dir, localeFile));
    }
    server.watcher.on("change", (changedPath) => {
      if (changedPath.startsWith(dir)) {
        console.log("changedPath :>> ", changedPath);
        generateTypes(options, pwd);
      }
    });
  };
  configureServer satisfies Plugin["configureServer"];
  return [
    {
      name: "vite-plugin-svelte-intl",
      buildStart: () => {
        generateTypes(options, pwd);
      },
      configureServer,
    },
  ];
}

function generateTypes(options: SvelteIntlPluginOptions, pwd: string) {
  let generated = `// Auto-generated from ${options.localesDir}
export {}

declare global {
  namespace I18n {
`;
  const localesTags: string[] = [];
  try {
    const locales = readdirSync(path.join(options.localesDir), "utf-8");
    for (const filename of locales) {
      const localeTag = filename.split(".")[0];
      localesTags.push(localeTag);

      const content = readFileSync(
        path.join(pwd, options.localesDir, filename),
        "utf-8"
      );
      generated += `type ${pascalCase(localeTag)} = ${JSON.stringify(JSON.parse(content), null, 2)};\n`;
    }
    const localesTypes = localesTags.map((t) => pascalCase(t));
    const typeUnion = localesTypes.join(" | ");
    generated += `
    
    export type AllTranslations = ${localesTypes.join("|")}
    export type LocaleTranslations = {
      ${localesTags.map((t, i) => `"${t}": ${localesTypes[i]}`).join("\n")}
    }
    export type Locale = ${localesTags.map((t) => `"${t}"`).join(" | ")}
    export type TranslationKey = Exclude<keyof (${pascalCase(options.defaultLocale)}), "$schema">;
    export type Translation = (${typeUnion})[TranslationKey];
  }
}
`;
    const outputDir = path.join(pwd, ".svelte-kit/svelte-intl");

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    writeFileSync(path.join(outputDir, "i18n.d.ts"), generated);
  } catch (error) {
    console.error("Error generating types:", error);
  }
}

function pascalCase(str: string): string {
  return str
    .split(/[\s_-]/)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join("");
}
