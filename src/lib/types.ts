export type GetICUTags<
  MessageString extends string,
  TagsFn
> = MessageString extends `${infer Prefix}<${infer TagName}>${infer Content}</${string}>${infer Tail}`
  ? Record<TagName, TagsFn> & GetICUTags<`${Prefix}${Content}${Tail}`, TagsFn>
  : {};
