import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiSearch, FiX, FiChevronDown } from 'react-icons/fi';

export default function SearchBar({ products }) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // 搜索类型选项
  const searchTypes = [
    { value: 'id', label: 'ID' },
    { value: 'title', label: '标题' },
    { value: 'tag', label: '标签' },
    { value: 'seller', label: '卖家' },
  ];

  // 实时搜索逻辑（使用 useEffect 优化）
  useEffect(() => {
    if (query.trim() === '') {
      setSearchResults([]);
      setSelectedResultIndex(-1);
      return;
    }

    const filteredResults = products.filter(product => {
      const q = query.toLowerCase();
      switch (searchType) {
        case 'id':
          return product.slug.toLowerCase().includes(q);
        case 'title':
          return product.data.title.toLowerCase().includes(q);
        case 'tag':
          return product.data.tags.some(tag => tag.toLowerCase().includes(q));
        case 'seller':
          return product.data.seller.toLowerCase().includes(q);
        default:
          return false;
      }
    });

    setSearchResults(filteredResults.slice(0, 5)); // 限制结果数量为 5 个
    setSelectedResultIndex(-1);
  }, [query, searchType, products]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 键盘导航搜索结果
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (searchResults.length === 0) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedResultIndex(prev => {
          const newIndex = Math.min(prev + 1, searchResults.length - 1);
          scrollToResult(newIndex);
          return newIndex;
        });
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedResultIndex(prev => {
          const newIndex = Math.max(prev - 1, 0);
          scrollToResult(newIndex);
          return newIndex;
        });
      } else if (event.key === 'Enter' && selectedResultIndex >= 0) {
        event.preventDefault();
        const selectedProduct = searchResults[selectedResultIndex];
        window.location.href = `/products/${selectedProduct.slug}`;
      }
    };

    const scrollToResult = (index) => {
      if (resultsRef.current) {
        const resultElement = resultsRef.current.children[index];
        if (resultElement) {
          resultElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchResults, selectedResultIndex]);

  // 处理搜索提交
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      const firstResult = searchResults[0];
      window.location.href = `/products/${firstResult.slug}`;
    } else {
      // 实际项目中可显示“无结果”页面或提示
      // 暂时不使用 console.log，改为无声处理
    }
  }, [searchResults]);

  // 清空搜索
  const handleClear = useCallback(() => {
    setQuery('');
    setSearchResults([]);
    setSelectedResultIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // 切换下拉菜单
  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  return (
    <div className="mb-8 w-full sticky top-4 z-10 bg-gray-50 rounded-xl shadow-sm p-3 animate-fade-in">
      <form onSubmit={handleSearch} className="relative w-full">
        {/* 搜索框和类型选择 */}
        <div className="flex flex-col md:flex-row items-center w-full gap-3 md:gap-3 animate-slide-in-right">
          {/* 搜索类型下拉菜单 */}
          <div className="relative w-full md:w-auto" ref={dropdownRef}>
            <button
              type="button"
              className="flex items-center justify-between w-full md:w-32 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-gray-200 to-gray-100"
              onClick={toggleDropdown}
              aria-expanded={isDropdownOpen}
              aria-label="选择搜索类型"
            >
              <span className="truncate font-medium">{searchTypes.find(t => t.value === searchType)?.label}</span>
              <FiChevronDown
                className={`w-5 h-5 transform transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isDropdownOpen && (
              <ul className="absolute w-full md:w-32 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto transform transition-all duration-200 origin-top scale-y-95 animate-dropdown-in">
                {searchTypes.map(type => (
                  <li
                    key={type.value}
                    className={`px-4 py-2 cursor-pointer hover:bg-indigo-100 hover:text-indigo-600 transition-all duration-200 transform hover:translate-x-1 ${
                      searchType === type.value ? 'bg-indigo-50 text-indigo-600 font-medium border-l-4 border-indigo-500' : 'text-gray-800'
                    }`}
                    onClick={() => {
                      setSearchType(type.value);
                      setIsDropdownOpen(false);
                    }}
                    role="option"
                    aria-selected={searchType === type.value}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSearchType(type.value);
                        setIsDropdownOpen(false);
                      }
                    }}
                  >
                    {type.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* 搜索输入框 */}
          <div className="relative w-full flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`输入${searchTypes.find(t => t.value === searchType)?.label}...`}
              className="w-full px-4 py-3 rounded-lg shadow-sm border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 hover:shadow-md transition-all duration-200 transform focus:scale-101 bg-gradient-to-r from-white to-gray-50"
              aria-label="搜索输入框"
              autoFocus
            />
            {query && (
              <button
                type="button"
                className="absolute right-10 p-2 text-gray-500 hover:text-gray-700 focus:outline-none transition-all duration-200 transform hover:scale-110 hover:rotate-180"
                onClick={handleClear}
                aria-label="清空搜索"
              >
                <FiX size={20} />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-3 p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-110 bg-gradient-to-r from-indigo-500 to-purple-500"
              aria-label="执行搜索"
            >
              <FiSearch size={20} />
            </button>
          </div>
        </div>
        {/* 搜索结果悬浮列表（实时搜索） */}
        {query.trim() !== '' && (
          <div
            className="absolute w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-xl max-h-64 overflow-y-auto z-20 transform transition-all duration-300 origin-top scale-y-95 animate-dropdown-in bg-gradient-to-b from-white to-gray-50"
            ref={resultsRef}
          >
            {searchResults.length > 0 ? (
              <>
                <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50 border-b border-gray-200 sticky top-0 z-10 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                    />
                  </svg>
                  找到 {searchResults.length} 个结果
                </div>
                {searchResults.map((product, index) => (
                  <div
                    key={product.slug}
                    className={`px-4 py-3 hover:bg-gray-100 cursor-pointer transition-all duration-200 text-gray-800 border-b border-gray-200 last:border-b-0 transform hover:scale-101 ${
                      index === selectedResultIndex ? 'bg-gray-100 text-indigo-600 border-l-4 border-indigo-500' : ''
                    }`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        window.location.href = `/products/${product.slug}`;
                      }
                    }}
                    onClick={() => {
                      window.location.href = `/products/${product.slug}`;
                    }}
                  >
                    {/* 高亮匹配内容（简化实现） */}
                    <div className="font-medium text-indigo-600 text-base md:text-lg truncate">{product.data.title}</div>
                    <div className="text-sm text-gray-600 truncate">{product.data.description}</div>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                      {product.data.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-200 rounded-full">
                          {tag}
                        </span>
                      ))}
                      {product.data.tags.length > 3 && <span className="px-2 py-0.5 bg-gray-200 rounded-full">+{product.data.tags.length - 3}</span>}
                      {product.data.ageRestricted && (
                        <span className="px-2 py-0.5 bg-red-500 text-white rounded-full">18+</span>
                      )}
                      {product.data.nsfw && (
                        <span className="px-2 py-0.5 bg-red-500 text-white rounded-full">NSFW</span>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="px-4 py-4 text-gray-500 text-center flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-gray-400"
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
                未找到匹配结果
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}