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

  const pwd = process.env.PWD;
  const configureServer = (server: { watcher: FSWatcher }) => {
    server.watcher.add(options.localesDir);

    const localeFiles = readdirSync(options.localesDir, "utf-8");
    for (const localeFile of localeFiles) {
      server.watcher.add(path.join(options.localesDir, localeFile));
    }
    server.watcher.on("change", (changedPath) => {
      if (changedPath === path.resolve(options.localesDir)) {
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
`;
  const localesTypes: string[] = [];
  const localesTags: string[] = [];
  try {
    const locales = readdirSync(path.join(options.localesDir), "utf-8");
    for (const filename of locales) {
      const localeTag = filename.split(".")[0];
      localesTags.push(localeTag);
      const locale = pascalCase(localeTag);
      const content = readFileSync(
        path.join(pwd, options.localesDir, filename),
        "utf-8"
      );
      localesTypes.push(pascalCase(locale));
      generated += `  export type ${locale} = ${content}
      `;
    }
    const typeUnion = localesTypes.join(" | ");
    generated += `
    
export type AllTranslations = ${localesTypes.join("|")}
export type LocaleTranslations = {
  ${localesTags.map((t, i) => `"${t}": ${localesTypes[i]}`).join("\n")}
}
export type Locale = ${localesTags.map((t) => `"${t}"`).join(" | ")}
export type TranslationKey = Exclude<keyof (${typeUnion}), "$schema">;
export type Translation = (${typeUnion})[TranslationKey];

import { makeI18n } from './i18n.svelte'
${localesTags.map((t) => `import ${snake(t)} from "${path.join("../../", options.localesDir, `${t}.json`)}"`).join("\n")}

const { t, format, locale, setLocale } = makeI18n({
  ${localesTags.map((t) => `"${t}": ${snake(t)}`).join(",\n")}
}, "${options.defaultLocale}");
export { t, format, locale, setLocale };
`;
    const outputDir = path.join(
      pwd,
      "node_modules",
      "@svelte-intl/svelte-intl/dist"
    );

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    try {
      unlinkSync(path.join(outputDir, "translations.d.ts"));
      unlinkSync(path.join(outputDir, "translations.js"));
    } catch (error) {}
    writeFileSync(path.join(outputDir, "translations.ts"), generated);
  } catch (error) {
    console.error("Error generating types:", error);
  }
}

function snake(str: string) {
  str = str.trim();
  str = str.replace(/[\s\.-]+/g, "_");
  str = str.toLowerCase();
  return str;
}

function pascalCase(str: string): string {
  return str
    .split(/[\s_-]/)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join("");
}
