// src/components/react/FilterAndSearch.jsx
import { useContext, useCallback, useRef, useState, useEffect } from 'react';
import { FilterContext } from './FilterContext.jsx';

export default function FilterAndSearch({ products = [] }) {
  const { searchTerm, activeTag, setSearchTerm, setActiveTag } = useContext(FilterContext);
  const [isSearching, setIsSearching] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [maxVisibleTags, setMaxVisibleTags] = useState(window.innerWidth < 640 ? 3 : 5);
  const debounceTimer = useRef(null);
  const tagContainerRef = useRef(null);

  const uniqueTags = products && products.length > 0 
    ? [...new Set(products.flatMap(p => p.tags))] 
    : [];
  const visibleTags = showAllTags ? uniqueTags : uniqueTags.slice(0, maxVisibleTags);

  // 动态调整初始标签数量
  useEffect(() => {
    const handleResize = () => {
      setMaxVisibleTags(window.innerWidth < 640 ? 3 : 5);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const debouncedSearch = useCallback((term) => {
    setIsSearching(true);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setSearchTerm(term);
      setIsSearching(false);
    }, 300);
  }, [setSearchTerm]);

  const handleSearch = (e) => {
    const term = e.target.value;
    if (term.length <= 50) { // 限制输入长度
      debouncedSearch(term);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
  };

  const handleTagClick = (tag) => {
    setActiveTag(tag === activeTag ? '' : tag);
  };

  const toggleShowAllTags = () => {
    setShowAllTags(!showAllTags);
  };

  return (
    <div className="mb-8 w-full max-w-2xl mx-auto px-2 sm:px-0">
      {/* 搜索框区域 */}
      <div className="relative group">
        <input
          type="text"
          placeholder="搜索商品..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full py-3 px-4 rounded-xl border border-pink-300 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:shadow-xl transition-all duration-300 text-sm sm:text-base transform group-hover:scale-102 group-focus:scale-102 relative z-10 bg-gradient-to-r from-pink-50 to-purple-50"
        />
        {/* 搜索框聚焦光晕效果，优化性能 */}
        <div className="absolute inset-0 rounded-xl bg-purple-200 opacity-0 group-focus:opacity-20 transition-opacity duration-300 -z-10 supports-reduced-motion:opacity-0"></div>
        {isSearching ? (
          <div className="absolute right-10 top-3 flex items-center text-purple-500 text-xs sm:text-sm animate-spin">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 001.357-2m5.224 2H15"></path>
            </svg>
          </div>
        ) : searchTerm && (
          <button 
            onClick={handleClearSearch}
            className="absolute right-10 top-3 text-gray-500 hover:text-purple-500 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        )}
      </div>

      {/* 标签区域 */}
      {uniqueTags.length > 0 ? (
        <div 
          ref={tagContainerRef}
          className="flex gap-2 mt-4 overflow-x-auto pb-2 whitespace-nowrap max-w-full scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent relative"
        >
          {/* 滚动提示阴影 */}
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-gray-100 to-transparent pointer-events-none"></div>
          {visibleTags.map((tag, index) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 transform hover:scale-110 hover:shadow-xl relative z-10 ${
                activeTag === tag 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                  : 'bg-pink-100 text-pink-800 hover:bg-pink-200 hover:shadow-md'
              }`}
              style={{
                transformStyle: 'preserve-3d',
                animation: `tagFadeIn 0.3s ease-out ${index * 0.05}s`,
                opacity: showAllTags ? 1 : undefined,
              }}
            >
              {tag}
              {/* 标签悬停发光效果，优化性能 */}
              <div className={`absolute inset-0 rounded-full bg-purple-300 opacity-0 hover:opacity-20 transition-opacity duration-300 -z-10 ${activeTag === tag ? 'opacity-20' : ''} supports-reduced-motion:opacity-0`}></div>
            </button>
          ))}
          {uniqueTags.length > maxVisibleTags && (
            <button 
              onClick={toggleShowAllTags}
              className="text-gray-500 text-xs sm:text-sm flex items-center cursor-pointer hover:text-purple-500 transition-colors duration-200"
            >
              {showAllTags ? '收起' : '更多...'}
              <svg className={`w-3 h-3 ml-1 transform ${showAllTags ? 'rotate-180' : ''} transition-transform duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          )}
        </div>
      ) : (
        <p className="text-gray-500 text-xs sm:text-sm mt-4 text-center transition-opacity duration-500 opacity-70 hover:opacity-100">暂无标签数据</p>
      )}
    </div>
  );
}