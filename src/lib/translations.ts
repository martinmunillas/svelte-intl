import { makeI18n } from "./i18n.svelte";

export type Translations = Record<string, string>;
export type AllTranslations = Record<string, string>;
export type Locale = string;
export type LocaleTranslations = Record<Locale, Translations>;
export type TranslationKey = Exclude<string, "$schema">;
export type Translation = string;

const { t, format, locale, setLocale } = makeI18n({}, "");
export { t, format, locale, setLocale };
