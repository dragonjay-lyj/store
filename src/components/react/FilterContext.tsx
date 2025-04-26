// src/components/react/FilterContext.jsx
import { createContext, useState, useEffect, useCallback, useContext } from 'react';

// 定义上下文类型，增强类型安全
interface FilterContextType {
  searchTerm: string;
  activeTag: string;
  setSearchTerm: (term: string) => void;
  setActiveTag: (tag: string) => void;
  resetFilters: () => void;
  isMobile: boolean;
}

/**
 * FilterContext 提供搜索和标签过滤的状态管理
 * 可用于驱动搜索框和标签 UI 组件，支持未来的美化（如 Tailwind CSS 样式）和动效（如加载动画）
 * 状态持久化到本地存储，支持页面刷新后恢复，并限制存储大小和过期时间
 * 提供自定义钩子 useFilter 简化集成
 * 未来可扩展更多过滤条件（如排序、分类）或调试工具
 */
export const FilterContext = createContext<FilterContextType>({
  searchTerm: '',
  activeTag: '',
  setSearchTerm: () => {},
  setActiveTag: () => {},
  resetFilters: () => {},
  isMobile: false,
});

// 自定义钩子，简化上下文使用
export function useFilter() {
  return useContext(FilterContext);
}

// 状态持久化配置
const STORAGE_KEY_SEARCH = 'searchTerm';
const STORAGE_KEY_TAG = 'activeTag';
const STORAGE_EXPIRY_DAYS = 7; // 存储过期时间，7天
const STORAGE_SIZE_LIMIT = 1024; // 存储大小限制，单位字节

// 检查存储大小
const checkStorageSize = (key: string, value: string): boolean => {
  const size = new Blob([key, value]).size;
  return size <= STORAGE_SIZE_LIMIT;
};

// 设置存储项并添加时间戳
const setStorageWithExpiry = (key: string, value: string) => {
  if (checkStorageSize(key, value)) {
    const now = new Date();
    const expiry = new Date(now.getTime() + STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    const data = { value, expiry: expiry.getTime() };
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// 获取存储项并检查是否过期
const getStorageWithExpiry = (key: string): string => {
  const item = localStorage.getItem(key);
  if (!item) return '';
  try {
    const { value, expiry } = JSON.parse(item);
    const now = new Date().getTime();
    if (now > expiry) {
      localStorage.removeItem(key);
      return '';
    }
    return value;
  } catch {
    localStorage.removeItem(key);
    return '';
  }
};

export default function FilterProvider({ children }: { children: React.ReactNode }) {
  // 从本地存储恢复初始状态
  const initialSearchTerm = getStorageWithExpiry(STORAGE_KEY_SEARCH) || '';
  const initialActiveTag = getStorageWithExpiry(STORAGE_KEY_TAG) || '';
  
  const [searchTerm, setSearchTermState] = useState(initialSearchTerm);
  const [activeTag, setActiveTagState] = useState(initialActiveTag);
  const [isMobile, setIsMobile] = useState(false);

  // 状态持久化到本地存储
  useEffect(() => {
    setStorageWithExpiry(STORAGE_KEY_SEARCH, searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    setStorageWithExpiry(STORAGE_KEY_TAG, activeTag);
  }, [activeTag]);

  // 检测屏幕尺寸和用户代理，适配移动端
  useEffect(() => {
    const handleResize = () => {
      const widthMobile = window.innerWidth < 640; // Tailwind 的 sm 断点
      const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(widthMobile || userAgentMobile);
    };
    handleResize(); // 初始检测
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 状态变化调试日志（开发环境）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('FilterContext State:', { searchTerm, activeTag, isMobile });
    }
  }, [searchTerm, activeTag, isMobile]);

  // 重置过滤条件
  const resetFilters = () => {
    setSearchTermState('');
    setActiveTagState('');
    localStorage.removeItem(STORAGE_KEY_SEARCH);
    localStorage.removeItem(STORAGE_KEY_TAG);
  };

  // 封装状态更新函数，支持未来扩展（如节流）
  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
  }, []);

  const setActiveTag = useCallback((tag: string) => {
    setActiveTagState(tag);
  }, []);

  return (
    <FilterContext.Provider value={{ searchTerm, activeTag, setSearchTerm, setActiveTag, resetFilters, isMobile }}>
      {children}
    </FilterContext.Provider>
  );
}