import slugify from "slugify";

export const createSlug = (title: string): string =>
  slugify(title, { lower: true, strict: true, trim: true });
