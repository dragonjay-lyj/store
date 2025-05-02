import { useState, useEffect } from 'react';

export default function ProductList({ products }) {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedTags, setSelectedTags] = useState(new Set(['全部']));

  // 提取唯一的标签，并添加“全部”选项
  const tags = ['全部', ...new Set(products.flatMap(product => product.data.tags))];

  useEffect(() => {
    // 初始时显示所有商品
    setFilteredProducts(products);
  }, [products]);

  const handleTagClick = (tag) => {
    let updatedTags;

    if (tag === '全部') {
      // 点击“全部”：仅选中“全部”，取消其他标签
      if (!selectedTags.has('全部')) {
        updatedTags = new Set(['全部']);
      } else {
        // 如果“全部”已选中，点击无效（保持选中）
        return;
      }
    } else {
      // 点击其他标签：取消“全部”选中状态，切换当前标签
      if (selectedTags.has('全部')) {
        updatedTags = new Set([tag]);
      } else {
        updatedTags = new Set(selectedTags);
        if (updatedTags.has(tag)) {
          updatedTags.delete(tag);
          // 如果取消选择后没有其他标签选中，默认选中“全部”
          if (updatedTags.size === 0) {
            updatedTags.add('全部');
          }
        } else {
          updatedTags.add(tag);
        }
      }
    }

    setSelectedTags(updatedTags);

    // 过滤商品列表
    let newFilteredProducts = products;
    if (!updatedTags.has('全部')) {
      newFilteredProducts = products.filter(product =>
        Array.from(updatedTags).every(selectedTag =>
          product.data.tags.includes(selectedTag)
        )
      );
    }
    setFilteredProducts(newFilteredProducts);
  };

  return (
    <div className="mb-10">
      {/* 标签筛选 */}
      <div className="tag-filter-container mb-6 overflow-x-auto whitespace-nowrap py-3 bg-gray-50 rounded-lg shadow-sm">
        <div className="inline-flex gap-3 min-w-max px-2 animate-fade-in">
          {tags.map((tag, index) => (
            <button
              key={tag}
              className={`tag-button px-4 py-2 rounded-full hover:bg-indigo-100 hover:text-indigo-600 transition-all duration-200 min-w-[80px] shadow-sm transform hover:scale-105 ${
                selectedTags.has(tag)
                  ? 'bg-indigo-200 text-indigo-700 font-bold border-2 border-indigo-400 shadow-md'
                  : 'bg-gray-200 text-gray-800 font-medium border border-gray-300'
              }`}
              onClick={() => handleTagClick(tag)}
              aria-pressed={selectedTags.has(tag)}
              aria-label={`筛选 ${tag} 商品`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span className="truncate">{tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 商品列表标题 */}
      <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2 animate-fade-in">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 md:w-8 md:h-8 text-indigo-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        商品列表
      </h2>

      {/* 商品列表 */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in-up">
          {filteredProducts.map((product, index) => (
            <div
              key={product.slug}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer relative group"
              onClick={() => window.location.href = `/products/${product.slug}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="relative w-full h-0 pb-[133.33%] bg-gray-200 overflow-hidden">
                <img
                  src={product.data.coverImages[0]}
                  alt={`${product.data.title} 封面`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                {product.data.ageRestricted || product.data.nsfw ? (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md animate-pulse">
                    {product.data.ageRestricted ? "18+" : ""} {product.data.nsfw ? "NSFW" : ""}
                  </div>
                ) : (
                  <div className="absolute top-2 right-2 bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    查看详情
                  </div>
                )}
              </div>
              <div className="p-4 text-gray-800 bg-gradient-to-b from-white to-gray-50 relative z-10">
                <h3 className="text-lg font-semibold mb-2 truncate" title={product.data.title}>
                  {product.data.title}
                </h3>
                <div className="flex items-center mb-2">
                  {product.data.sellerAvatar && (
                    <img
                      src={product.data.sellerAvatar}
                      alt={`${product.data.seller} 头像`}
                      className="w-6 h-6 rounded-full mr-2 border-2 border-indigo-200 shadow-sm transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                  )}
                  <span className="text-sm text-gray-600 truncate">{product.data.seller}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  {product.data.price && (
                    <p className="text-lg font-bold text-red-600 animate-fade-in">￥{product.data.price.toFixed(2)}</p>
                  )}
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-1">
                    详情 <span>&rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 animate-fade-in">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 text-gray-400 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-500 text-lg">暂无符合条件的商品</p>
        </div>
      )}
    </div>
  );
}