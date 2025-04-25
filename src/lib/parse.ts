import {
  parse,
  TYPE,
  type ArgumentElement,
  type LiteralElement,
  type MessageFormatElement,
  type PluralElement,
  type PluralOrSelectOption,
  type SelectElement,
} from "@formatjs/icu-messageformat-parser";
import { format } from "./format";
import { type Snippet, createRawSnippet } from "svelte";

export type Replacement = string | number | Date | Snippet<[Snippet]>;
export type Replacements = Record<string, Replacement>;

export const literal = (element: LiteralElement) => {
  return element.value;
};

export const argument = (
  element: ArgumentElement,
  replacement?: Replacement
) => {
  return replacement?.toString() || element.value;
};

export const number = (
  locale: string,
  replacement?: Replacement,
  parentValue?: Replacement
) => {
  const value = parentValue || replacement;
  if (!(typeof value === "number")) {
    throw "";
  }
  return format.number(locale, value);
};
export const date = (
  locale: string,
  replacement?: Replacement,
  parentValue?: Replacement
) => {
  const value = parentValue || replacement;
  if (!(value instanceof Date)) {
    throw "";
  }
  return format.dateTime(locale, value);
};

export const time = (
  locale: string,
  replacement?: Replacement,
  parentValue?: Replacement
) => {
  const value = parentValue || replacement;
  if (!(value instanceof Date)) {
    throw "";
  }
  return format.dateTime(locale, value, { timeStyle: "short" });
};

export const select = (element: SelectElement, replacement?: Replacement) => {
  if (typeof replacement != "string") {
    throw "";
  }
  return element.options[replacement || "other"] || element.options["other"];
};

export const plural = (
  locale: string,
  element: PluralElement,
  replacement?: Replacement
) => {
  let option: PluralOrSelectOption | undefined;
  if (element.pluralType === "ordinal") {
    const rule =
      typeof replacement === "number"
        ? new Intl.PluralRules(locale, {
            type: element.pluralType,
          }).select(replacement)
        : "other";
    option = element.options[rule];
  } else {
    for (const rule of Object.keys(element.options)) {
      if (rule === "other") {
        option = element.options[rule];
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
        option = element.options[rule];
        break;
      }
    }
  }
  if (!option) {
    throw "";
  }
  return option;
};

export const pound = (
  locale: string,
  replacement?: Replacement,
  parentValue?: Replacement
) => {
  const value = parentValue || replacement;
  if (typeof value === "number") {
    return format.number(locale, value);
  }
  if (value instanceof Date) {
    return format.dateTime(locale, value);
  }
  return value?.toString() || "";
};

const executeMany = (
  locale: string,
  elements: MessageFormatElement[],
  replacements?: Replacements,
  parentValue?: Replacement
): string => {
  let result = "";
  for (const element of elements) {
    result += executeElement(locale, element, replacements, parentValue);
  }
  return result;
};

function executeElement(
  locale: string,
  element: MessageFormatElement,
  replacements?: Replacements,
  parentValue?: Replacement
): string {
  // @ts-ignore
  const replacement = replacements?.[element.value || ""];
  switch (element.type) {
    case TYPE.literal: {
      return literal(element);
    }
    case TYPE.argument: {
      return argument(element, replacement);
    }
    case TYPE.number: {
      return number(locale, replacement, parentValue);
    }
    case TYPE.date: {
      return date(locale, replacement, parentValue);
    }
    case TYPE.time: {
      return time(locale, replacement, parentValue);
    }
    case TYPE.select: {
      const option = select(element, replacement);
      return executeMany(
        locale,
        option.value,
        replacements,
        replacements?.[element.value]
      );
    }
    case TYPE.plural: {
      const option = plural(locale, element, replacement);

      return executeMany(
        locale,
        option.value,
        replacements,
        replacements?.[element.value]
      );
    }
    case TYPE.pound: {
      return pound(locale, replacement, parentValue);
    }
    case TYPE.tag: {
      return executeMany(
        locale,
        element.children,
        replacements,
        replacements?.[element.value]
      );
    }
  }
}

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
