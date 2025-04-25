export default {
  hello: "hello",
  select:
    "{name}, {gender, select, female {She} male {He} other {They}} is <link>online</link>.",
} as const;
