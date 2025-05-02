import React, { useState, useEffect } from 'react';

export default function TagFilter({ products, onFilterChange }) {
  // 提取唯一的标签，并添加“全部”选项
  const tags = ['全部', ...new Set(products.flatMap(product => product.data.tags))];
  const [selectedTags, setSelectedTags] = useState(new Set(['全部']));

  useEffect(() => {
    // 初始时将所有商品传递给父组件
    onFilterChange(products);
  }, [products, onFilterChange]);

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

    // 过滤商品列表并通知父组件
    let filteredProducts = products;
    if (!updatedTags.has('全部')) {
      filteredProducts = products.filter(product =>
        Array.from(updatedTags).every(selectedTag =>
          product.data.tags.includes(selectedTag)
        )
      );
    }
    onFilterChange(filteredProducts);
  };

  return (
    <div className="tag-filter-container mb-6 overflow-x-auto whitespace-nowrap py-3 bg-gray-50 rounded-lg shadow-sm animate-fade-in">
      <div className="inline-flex gap-3 min-w-max px-2">
        {tags.map((tag, index) => (
          <button
            key={tag}
            className={`tag-button px-4 py-2 rounded-full hover:bg-indigo-100 hover:text-indigo-600 transition-all duration-200 min-w-[80px] shadow-sm transform hover:scale-105 border ${
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
  );
}