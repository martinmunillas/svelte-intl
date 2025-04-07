export default {
  hello: "hello",
  select:
    "{name}, {gender, select, female {She} male {He} other {They}} is online.",
} as const;
