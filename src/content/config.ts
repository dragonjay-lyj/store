import { defineCollection, z } from 'astro:content';

export const collections = {
  products: defineCollection({
    schema: z.object({
      title: z.string(),
      description: z.string(),
      coverImages: z.array(z.string()),
      tags: z.array(z.string()),
      price: z.number(),
      seller: z.string(),
      sellerAvatar: z.string().optional(),
      ageRestricted: z.boolean().default(false),
      nsfw: z.boolean().default(false),
      checkoutUrl: z.string().optional(),
    }),
  }),
};