import { parseMessage, type Replacements } from "./parse";
import { createRawSnippet, mount, unmount, type Snippet } from "svelte";
import type { GetICUArgs } from "@schummar/icu-type-parser";
import type { GetICUTags } from "./types";
import RichMessage from "./RichMessage.svelte";
import { format } from "./format";

type GetICUArgsOptions = {
  ICUNumberArgument: number;
  ICUDateArgument: Date;
  ICUArgument: string;
};

export const makeI18n = (
  translations: Record<I18n.Locale, Record<string, string>>,
  defaultLocale: I18n.Locale
) => {
  let locale = $state(defaultLocale as I18n.Locale);

  const setLocale = (l: I18n.Locale) => {
    locale = l;
  };

  const t = <T extends I18n.TranslationKey>(
    key: T,
    args?: Required<GetICUArgs<I18n.AllTranslations[T], GetICUArgsOptions>>
  ) => {
    if (locale === "debug") return key;

    let message = translations[locale]?.[key] as string;
    if (!message) {
      console.warn(
        `Translation with key "${key}" not found in locale "${locale}", falling back to "${defaultLocale}"`
      );
      message = translations[defaultLocale][key];
      if (!message) {
        console.warn(
          `Translation with key "${key}" not found in default locale "${defaultLocale}", showing key instead`
        );
        message = key;
      }
    }
    return parseMessage(locale, message, args as Replacements);
  };

  t.rich = createRawSnippet((key: () => string, args: () => Replacements) => ({
    render: () => `<div></div>`,
    setup: (node) => {
      $effect(() => {
        const comp = mount(RichMessage, {
          target: node,
          props: {
            defaultLocale,
            locale,
            key: key(),
            replacements: args(),
            translations,
          },
        });
        return () => unmount(comp);
      });
    },
  })) as unknown as <T extends I18n.TranslationKey>(
    key: T,
    args?: Required<
      GetICUArgs<I18n.AllTranslations[T], GetICUArgsOptions> &
        GetICUTags<
          I18n.AllTranslations[T],
          (content: Snippet) => ReturnType<Snippet>
        >
    >
  ) => ReturnType<Snippet>;

  return {
    setLocale,
    locale: {
      get current() {
        return locale;
      },
      get list() {
        return Object.keys(translations);
      },
      get listWithDebug() {
        return Object.keys(translations).concat(["debug"]);
      },

      isValid(l: string): l is I18n.Locale {
        return this.listWithDebug.includes(l);
      },
    },
    t,
    format: {
      number: (n: number, options?: Intl.NumberFormatOptions) =>
        format.number(locale, n, options),
      dateTime: (dt: Date, options?: Intl.DateTimeFormatOptions) =>
        format.dateTime(locale, dt, options),
      relativeDateTime: (
        value: number,
        unit: Intl.RelativeTimeFormatUnit,
        options?: Intl.RelativeTimeFormatOptions
      ) => format.relativeDateTime(locale, value, unit, options),
    },
  };
};

export type GetLocaleType<T> = T extends {
  setLocale(l: infer L): void;
}
  ? L
  : never;
