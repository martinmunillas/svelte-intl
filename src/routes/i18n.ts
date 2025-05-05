import { makeI18n } from "$lib";
import esLa from "../translations/es-la";
import enUs from "../translations/en-us";

const { t, setLocale, format, locale } = makeI18n(
  {
    "en-us": enUs,
    "es-la": esLa,
  },
  "en-us"
);

export { t, setLocale, format, locale };
