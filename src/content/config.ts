// src/content/config.ts
import { defineCollection, z } from 'astro:content';

export const collections = {
  products: defineCollection({
    schema: z.object({
      title: z.string().min(1, "标题不能为空").or(
        z.object({ // 支持多语言标题
          en: z.string().min(1, "英文标题不能为空"),
          zh: z.string().min(1, "中文标题不能为空"),
          ja: z.string().optional(),
        })
      ),
      description: z.string().min(10, "描述至少需要10个字符").or(
        z.object({ // 支持多语言描述
          en: z.string().min(10, "英文描述至少需要10个字符"),
          zh: z.string().min(10, "中文描述至少需要10个字符"),
          ja: z.string().optional(),
        })
      ),
      coverImage: z.string().url({ message: "封面图片必须是有效URL" }).or(z.string().min(1, "封面图片路径不能为空")),
      images: z.array(z.string().url({ message: "图片必须是有效URL" }).or(z.string().min(1, "图片路径不能为空"))).optional(),
      price: z.number().min(0, "价格不能为负数"),
      tags: z.array(z.string().min(1, "标签不能为空")).min(1, "至少需要一个标签"),
      isNSFW: z.boolean().default(false),
      sellerName: z.string().min(1, "卖家名称不能为空"),
      sellerAvatar: z.string().url({ message: "卖家头像必须是有效URL" }).or(z.string().min(1, "卖家头像路径不能为空")).optional(),
      checkoutUrl: z.string().url({ message: "结账链接必须是有效URL" }),
      stock: z.number().min(0, "库存不能为负数").optional(), // 未来扩展字段
      publishDate: z.date().optional(), // 未来扩展字段
    }),
  }),
};