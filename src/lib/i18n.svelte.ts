import type { GetICUArgs } from "@schummar/icu-type-parser";
import { parseMessage, type Replacements } from "./parse";

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
