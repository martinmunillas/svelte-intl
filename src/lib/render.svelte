<script module lang="ts">
  import {
    parse,
    TYPE,
    type MessageFormatElement,
    type TagElement,
  } from "@formatjs/icu-messageformat-parser";
  import {
    argument,
    date,
    literal,
    number,
    plural,
    pound,
    type Replacement,
    type Replacements,
    select,
    time,
  } from "./parse";
  import type { Snippet } from "svelte";

  export { parseRichMessage };

  const getReplacementSnippet = (
    element: TagElement,
    replacement?: Replacement
  ): Snippet<[Snippet]> => {
    if (typeof replacement !== "function") {
      throw `Replacement for ${element.value} should be of type Snippet but got ${typeof replacement} instead`;
    }

    return replacement;
  };

  type Translations = Record<string, Record<string, string>>;

  const getMessage = (
    translations: Translations,
    defaultLocale: string,
    locale: string,
    key: string
  ) => {
    if (locale === "debug") return key;
    let message = translations[locale]?.[key] as string;
    if (!message) {
      console.warn(
        `Translation with key "${key}" not found in locale "${locale}", fallling back to "${defaultLocale}"`
      );
      message = translations[defaultLocale][key];
      if (!message) {
        console.warn(
          `Translation with key "${key}" not found in default locale "${defaultLocale}", showing key instead`
        );
        message = key;
      }
    }
    return message;
  };
</script>

{#snippet parseRichMessage(
  translations: Translations,
  defaultLocale: string,
  locale: string,
  key: string,
  replacements: Replacements
)}
  {@const message = getMessage(translations, defaultLocale, locale, key)}
  {@render executeManyRichElements(locale, parse(message), replacements)}
{/snippet}
{#snippet executeManyRichElements(
  locale: string,
  elements: MessageFormatElement[],
  replacements?: Replacements,
  parentValue?: Replacement
)}
  {#each elements as element}
    {@render executeRichElement(locale, element, replacements, parentValue)}
  {/each}
{/snippet}
{#snippet executeRichElement(
  locale: string,
  element: MessageFormatElement,
  replacements?: Replacements,
  parentValue?: Replacement
)}
  {@const replacement =
    // @ts-ignore
    replacements?.[element.value || ""]}

  {#if element.type === TYPE.literal}
    {literal(element)}
  {:else if element.type === TYPE.argument}
    {argument(element, replacement)}
  {:else if element.type === TYPE.number}
    {number(locale, replacement, parentValue)}
  {:else if element.type === TYPE.date}
    {date(locale, replacement, parentValue)}
  {:else if element.type === TYPE.time}
    {time(locale, replacement, parentValue)}
  {:else if element.type === TYPE.select}
    {@const option = select(element, replacement)}

    {@render executeManyRichElements(
      locale,
      option.value,
      replacements,
      replacements?.[element.value]
    )}
  {:else if element.type === TYPE.plural}
    {@const option = plural(locale, element, replacement)}

    {@render executeManyRichElements(
      locale,
      option.value,
      replacements,
      replacements?.[element.value]
    )}
  {:else if element.type === TYPE.pound}
    {pound(locale, replacement, parentValue)}
  {:else if element.type === TYPE.tag}
    {@const replacementSnippet = getReplacementSnippet(element, replacement)}
    {#snippet snippetChildren()}
      {@render executeManyRichElements(
        locale,
        element.children,
        replacements,
        replacements?.[element.value]
      )}
    {/snippet}
    {@render replacementSnippet(snippetChildren)}
  {/if}
{/snippet}
