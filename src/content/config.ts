import { z, defineCollection } from 'astro:content'; // eslint-disable-line import/no-unresolved

const postsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),
    published: z.boolean(),
  }),
});

const snippetsCollection = defineCollection({});

export const collections = {
  posts: postsCollection,
  snippets: snippetsCollection,
};
