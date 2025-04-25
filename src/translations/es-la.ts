export default {
  hello: "hola",
  select:
    "{name}, {gender, select, female {Ella} male {El} other {El}} esta <link>en linea</link>.",
} as const;
