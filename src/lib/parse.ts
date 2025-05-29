import {
  parse,
  TYPE,
  type ArgumentElement,
  type DateElement,
  type LiteralElement,
  type MessageFormatElement,
  type NumberElement,
  type PluralElement,
  type PluralOrSelectOption,
  type SelectElement,
  type TimeElement,
} from "@formatjs/icu-messageformat-parser";
import { format } from "./format";
import { type Snippet, createRawSnippet } from "svelte";

export type Replacement = string | number | Date | Snippet<[Snippet]>;
export type Replacements = Record<string, Replacement>;

const isEmpty = (value: unknown) => {
  return value === undefined || value === null || value === "";
};
export const literal = (element: LiteralElement) => {
  return element.value;
};

export const argument = (
  element: ArgumentElement,
  replacement?: Replacement
) => {
  return replacement?.toString() ?? element.value;
};

export const number = (
  locale: string,
  element: NumberElement,
  replacement?: Replacement,
  parentValue?: Replacement
) => {
  const value = parentValue ?? replacement;
  if (isEmpty(value)) {
    return "";
  }
  if (typeof value !== "number") {
    console.warn(
      `Invalid type of replacement ${typeof value} for "${element.value}", expected number`
    );
    return element.value;
  }
  return format.number(locale, value);
};
export const date = (
  locale: string,
  element: DateElement,
  replacement?: Replacement,
  parentValue?: Replacement
) => {
  const value = parentValue ?? replacement;
  if (isEmpty(value)) {
    return "";
  }
  if (!(value instanceof Date)) {
    console.warn(
      `Invalid type of replacement ${typeof value} for "${element.value}", expected Date`
    );
    return element.value;
  }
  return format.dateTime(locale, value);
};

export const time = (
  locale: string,
  element: TimeElement,
  replacement?: Replacement,
  parentValue?: Replacement
) => {
  const value = parentValue ?? replacement;
  if (isEmpty(value)) {
    return "";
  }
  if (!(value instanceof Date)) {
    console.warn(
      `Invalid type of replacement ${typeof value} for "${element.value}", expected Date`
    );
    return element.value;
  }
  return format.dateTime(locale, value, { timeStyle: "short" });
};

export const select = (element: SelectElement, replacement?: Replacement) => {
  if (typeof replacement != "string") {
    console.warn(
      `Invalid type of replacement ${typeof replacement} for "${element.value}", expected string`
    );
    return element.options["other"];
  }
  return element.options[replacement || "other"] ?? element.options["other"];
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
    if (typeof replacement !== "number") {
      console.warn(
        `Invalid type of replacement ${typeof replacement} for "${element.value}", expected number`
      );
      return element.options["other"];
    }
    for (const rule of Object.keys(element.options)) {
      if (rule === "other") {
        option = element.options[rule];
        break;
      }
      const match = /(<|<=|>=|>|=|!=)(\d+)/.exec(rule);

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

    return element.options["other"];
  }
  if (!option) {
    throw `No option found`;
  }
  return option;
};

export const pound = (
  locale: string,
  replacement?: Replacement,
  parentValue?: Replacement
) => {
  const value = parentValue ?? replacement;
  if (typeof value === "number") {
    return format.number(locale, value);
  }
  if (value instanceof Date) {
    return format.dateTime(locale, value);
  }
  return value?.toString() ?? "";
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
      return number(locale, element, replacement, parentValue);
    }
    case TYPE.date: {
      return date(locale, element, replacement, parentValue);
    }
    case TYPE.time: {
      return time(locale, element, replacement, parentValue);
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
  try {
    const elements = parse(message);
    for (const element of elements) {
      result += executeElement(locale, element, replacements);
    }
    return result;
  } catch (error) {
    console.error(
      `Invalid format for message "${message}" in locale "${locale}": ${(error as Error).message}`
    );
    return "";
  }
};
