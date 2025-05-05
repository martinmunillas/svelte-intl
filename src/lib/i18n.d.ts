export {};

declare global {
  namespace I18n {
    export type Translations = Record<string, string>;
    export type AllTranslations = Record<string, string>;
    export type Locale = string;
    export type LocaleTranslations = Record<Locale, Translations>;
    export type TranslationKey = Exclude<string, "$schema">;
    export type Translation = string;
  }
}
