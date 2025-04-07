export const format = {
  number: (locale: string, n: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(locale, options).format(n);
  },
  dateTime: (
    locale: string,
    dt: Date,
    options?: Intl.DateTimeFormatOptions
  ) => {
    return new Intl.DateTimeFormat(locale, options).format(dt);
  },
  relativeDateTime: (
    locale: string,
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    options?: Intl.RelativeTimeFormatOptions
  ) => {
    return new Intl.RelativeTimeFormat(locale, options).format(value, unit);
  },
};
