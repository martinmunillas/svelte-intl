import { parseMessage, type Replacements } from "./parse";
import { parseRichMessage } from "./render.svelte";
import type { Snippet } from "svelte";
import { browser } from "$app/environment";
import type { GetICUArgs } from "@schummar/icu-type-parser";
import type { GetICUTags } from "./types";

export type Format = {
  number: (n: number, options?: Intl.NumberFormatOptions) => string;
  dateTime: (dt: Date, options?: Intl.NumberFormatOptions) => string;
  relativeDateTime: (
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    options?: Intl.RelativeTimeFormatOptions
  ) => string;
};

type GetICUArgsOptions = {
  ICUNumberArgument: number;
  ICUDateArgument: Date;
  ICUArgument: string;
};

export const makeI18n = <
  Locale extends string,
  DefaultLocale extends Locale,
  Translations extends Record<string, string>
>(
  translations: Record<Locale, Translations>,
  defaultLocale: DefaultLocale
) => {
  let locale = $state(defaultLocale as Locale);

  const setLocale = (l: Locale) => {
    locale = l;
  };

  type TranslationKey = Translations extends Record<infer S, string>
    ? S
    : string;

  const t = <T extends TranslationKey>(
    key: TranslationKey,
    args?: GetICUArgs<Translations[T], GetICUArgsOptions>
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
    return parseMessage(locale, message, args as Replacements);
  };

  t.rich = ((internal: unknown, key: string, args: Replacements) => {
    return parseRichMessage(
      internal,
      browser ? () => translations : translations,
      browser ? () => defaultLocale : defaultLocale,
      browser ? () => locale : locale,
      key,
      // @ts-ignore
      args
    );
  }) as unknown as <T extends TranslationKey>(
    key: TranslationKey,
    args?: GetICUArgs<Translations[T], GetICUArgsOptions> &
      GetICUTags<Translations[T], Snippet<[Snippet]>>
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
    },
    t,
  };
};

export type GetLocaleType<T> = T extends {
  setLocale(l: infer L): void;
}
  ? L
  : never;
