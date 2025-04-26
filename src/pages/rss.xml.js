import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
const products = await getCollection('products');
  return rss({
    site: context.site,
    title: '二次元商品贩卖网站',
    description: '探索最新的二次元手办和周边商品。',
    items: products.map((product) => ({
        title: product.data.title,
        pubDate: product.data.publishDate,
        description: product.data.description,
        link: `/product/${product.id.replace(/\.mdx$/, '')}`,
      })),
  });
}