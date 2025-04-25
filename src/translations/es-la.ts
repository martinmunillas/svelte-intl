export default {
  hello: "hola",
  select:
    "{name}, {gender, select, female {Ella} male {El} other {El}} esta <link>en <bold>linea</bold></link>.",
} as const;
