import en_us from "../translations/en-us";
import es_la from "../translations/es-la";
import { makeI18n, type GetLocaleType } from "./i18n.svelte";

const i18n = makeI18n(
  {
    "en-us": en_us,
    "es-la": es_la,
  },
  "en-us"
);

export type Locale = GetLocaleType<typeof i18n>;

const { t, setLocale, locale } = i18n;

export { t, setLocale, locale };
