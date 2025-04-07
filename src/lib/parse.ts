import {
  parse,
  TYPE,
  type MessageFormatElement,
} from "@formatjs/icu-messageformat-parser";
import { format } from "./format";

export type Replacements = Record<string, string | number | Date>;

const executeElement = (
  locale: string,
  element: MessageFormatElement,
  replacements?: Replacements,
  parentValue?: number | string | Date
): string => {
  // @ts-ignore
  const replacement = replacements?.[element.value || ""];
  switch (element.type) {
    case TYPE.literal: {
      return element.value;
    }
    case TYPE.argument: {
      return replacement?.toString() || element.value;
    }
    case TYPE.number: {
      const value = parentValue || replacement;
      if (!(typeof value === "number")) {
        throw "";
      }
      return format.number(locale, value);
    }
    case TYPE.date: {
      const value = parentValue || replacement;
      if (!(value instanceof Date)) {
        throw "";
      }
      return format.dateTime(locale, value);
    }
    case TYPE.time: {
      const value = parentValue || replacement;
      if (!(value instanceof Date)) {
        throw "";
      }
      return format.dateTime(locale, value, { timeStyle: "short" });
    }
    case TYPE.select: {
      if (typeof replacement != "string") {
        throw "";
      }
      let option = element.options[replacement || "other"];
      if (!option) {
        option = element.options["other"];
      }
      let result = "";
      for (const child of option.value) {
        result += executeElement(
          locale,
          child,
          replacements,
          replacements?.[element.value]
        );
      }
      return result;
    }
    case TYPE.plural: {
      let option: MessageFormatElement[] = [];
      if (element.pluralType === "ordinal") {
        const rule =
          typeof replacement === "number"
            ? new Intl.PluralRules(locale, {
                type: element.pluralType,
              }).select(replacement)
            : "other";
        option = element.options[rule].value;
      } else {
        for (const rule of Object.keys(element.options)) {
          if (rule === "other") {
            option = element.options[rule].value;
            break;
          }
          const match = /(<|<=|>=|>|=|!=)(\d+)/.exec(rule);
          if (typeof replacement !== "number") {
            throw "";
          }
          if (!match) {
            continue;
          }
          const operation = {
            "=": replacement === Number(match[2]),
            "<=": replacement <= Number(match[2]),
            "<": replacement < Number(match[2]),
            ">=": replacement >= Number(match[2]),
            ">": replacement > Number(match[2]),
            "!=": replacement != Number(match[2]),
          };
          if (operation[match[1] as keyof typeof operation]) {
            option = element.options[rule].value;
            break;
          }
        }
      }
      let result = "";
      for (const child of option) {
        result += executeElement(
          locale,
          child,
          replacements,
          replacements?.[element.value]
        );
      }
      return result;
    }
    case TYPE.pound: {
      const value = parentValue || replacement;
      if (typeof value === "number") {
        return format.number(locale, value);
      }
      if (value instanceof Date) {
        return format.dateTime(locale, value);
      }
      return value || "";
    }
    case TYPE.tag: {
      return "";
    }
  }
};

export const parseMessage = (
  locale: string,
  message: string,
  replacements?: Replacements
) => {
  let result = "";
  const elements = parse(message);
  for (const element of elements) {
    result += executeElement(locale, element, replacements);
  }
  return result;
};
