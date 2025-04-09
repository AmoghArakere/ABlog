import { defineCollection, z } from 'astro:content';

// Define the schema for the blog collection
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    heroImage: z.string().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Amogh'),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

// Define the schema for the author collection
const authorCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    title: z.string().optional(),
    avatar: z.string().optional(),
    bio: z.string().optional(),
    social: z.object({
      github: z.string().optional(),
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
      website: z.string().optional(),
    }).optional(),
  }),
});

// Export the collections
export const collections = {
  'blog': blogCollection,
  'authors': authorCollection,
};
