import { expect, test } from "vitest";
import { parseMessage } from "./parse";

type Case = {
  locale: string;
  message: string;
  replacements?: Record<string, string | number>;
  result: string;
};

const cases: Case[] = [
  {
    locale: "en-us",
    message: "Hello {name}!",
    replacements: { name: "Martin" },
    result: "Hello Martin!",
  },
  {
    locale: "en-us",
    message:
      "You have {count, plural, =0 {no followers yet} =1 {one follower} other {# followers}}.",

    replacements: { count: 0 },
    result: "You have no followers yet.",
  },
  {
    locale: "en-us",
    message:
      "You have {count, plural, =0 {no followers yet} =1 {one follower} other {# followers}}.",

    replacements: { count: 1 },
    result: "You have one follower.",
  },
  {
    locale: "en-us",
    message:
      "You have {count, plural, =0 {no followers yet} =1 {one follower} other {# followers}}.",

    replacements: { count: 3580 },
    result: "You have 3,580 followers.",
  },
  {
    locale: "en-us",
    message:
      "It's your {year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} birthday!",
    replacements: { year: 1 },
    result: "It's your 1st birthday!",
  },
  {
    locale: "en-us",
    message:
      "It's your {year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} birthday!",
    replacements: { year: 2 },
    result: "It's your 2nd birthday!",
  },
  {
    locale: "en-us",
    message:
      "It's your {year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} birthday!",
    replacements: { year: 3 },
    result: "It's your 3rd birthday!",
  },
  {
    locale: "en-us",
    message:
      "It's your {year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} birthday!",
    replacements: { year: 16 },
    result: "It's your 16th birthday!",
  },
  {
    locale: "en-us",
    message:
      "It's your {year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} birthday!",
    replacements: { year: 122 },
    result: "It's your 122nd birthday!",
  },
  {
    locale: "en-us",
    message: "{gender, select, female {She} male {He} other {They}} is online.",
    replacements: { gender: "female" },
    result: "She is online.",
  },
  {
    locale: "en-us",
    message: "{gender, select, female {She} male {He} other {They}} is online.",
    replacements: { gender: "male" },
    result: "He is online.",
  },
  {
    locale: "en-us",
    message: "{gender, select, female {She} male {He} other {They}} is online.",
    replacements: { gender: "masfdale" },
    result: "They is online.",
  },
];

test("parse()", () => {
  for (const testcase of cases) {
    expect(
      parseMessage(testcase.locale, testcase.message, testcase.replacements)
    ).toBe(testcase.result);
  }
});
