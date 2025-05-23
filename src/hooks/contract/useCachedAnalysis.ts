
import { useState, useRef, useCallback } from 'react';

interface AnalysisCache {
  [key: string]: {
    data: any;
    timestamp: number;
    expiry: number;
  };
}

interface CachedAnalysisOptions {
  cacheTimeout?: number; // in milliseconds
  maxCacheSize?: number;
}

export const useCachedAnalysis = (options: CachedAnalysisOptions = {}) => {
  const { cacheTimeout = 300000, maxCacheSize = 50 } = options; // 5 minutes default
  const cacheRef = useRef<AnalysisCache>({});
  const [cacheStats, setCacheStats] = useState({ hits: 0, misses: 0 });

  const generateCacheKey = useCallback((contractId: string, analysisType: string, params?: any) => {
    const baseKey = `${contractId}_${analysisType}`;
    if (params) {
      const paramString = JSON.stringify(params);
      return `${baseKey}_${btoa(paramString)}`;
    }
    return baseKey;
  }, []);

  const isExpired = useCallback((timestamp: number, expiry: number) => {
    return Date.now() - timestamp > expiry;
  }, []);

  const cleanupCache = useCallback(() => {
    const now = Date.now();
    const cache = cacheRef.current;
    const keys = Object.keys(cache);
    
    // Remove expired entries
    keys.forEach(key => {
      if (isExpired(cache[key].timestamp, cache[key].expiry)) {
        delete cache[key];
      }
    });

    // If still over limit, remove oldest entries
    const remainingKeys = Object.keys(cache);
    if (remainingKeys.length > maxCacheSize) {
      const sortedByAge = remainingKeys
        .map(key => ({ key, timestamp: cache[key].timestamp }))
        .sort((a, b) => a.timestamp - b.timestamp);
      
      const toRemove = sortedByAge.slice(0, remainingKeys.length - maxCacheSize);
      toRemove.forEach(({ key }) => delete cache[key]);
    }
  }, [maxCacheSize, isExpired]);

  const getCachedResult = useCallback((contractId: string, analysisType: string, params?: any) => {
    const key = generateCacheKey(contractId, analysisType, params);
    const cached = cacheRef.current[key];
    
    if (cached && !isExpired(cached.timestamp, cached.expiry)) {
      setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
      return cached.data;
    }
    
    setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
    return null;
  }, [generateCacheKey, isExpired]);

  const setCachedResult = useCallback((
    contractId: string, 
    analysisType: string, 
    data: any, 
    params?: any,
    customTimeout?: number
  ) => {
    const key = generateCacheKey(contractId, analysisType, params);
    const expiry = customTimeout || cacheTimeout;
    
    cacheRef.current[key] = {
      data,
      timestamp: Date.now(),
      expiry
    };

    // Cleanup if needed
    if (Object.keys(cacheRef.current).length > maxCacheSize) {
      cleanupCache();
    }
  }, [generateCacheKey, cacheTimeout, maxCacheSize, cleanupCache]);

  const invalidateCache = useCallback((contractId?: string, analysisType?: string) => {
    if (!contractId) {
      // Clear all cache
      cacheRef.current = {};
      return;
    }

    if (!analysisType) {
      // Clear all cache for this contract
      const keys = Object.keys(cacheRef.current);
      keys.forEach(key => {
        if (key.startsWith(contractId)) {
          delete cacheRef.current[key];
        }
      });
      return;
    }

    // Clear specific analysis type for contract
    const key = generateCacheKey(contractId, analysisType);
    delete cacheRef.current[key];
  }, [generateCacheKey]);

  const getCacheInfo = useCallback(() => {
    const cache = cacheRef.current;
    const keys = Object.keys(cache);
    const now = Date.now();
    
    const active = keys.filter(key => !isExpired(cache[key].timestamp, cache[key].expiry));
    const expired = keys.length - active.length;
    
    return {
      total: keys.length,
      active: active.length,
      expired,
      stats: cacheStats,
      hitRate: cacheStats.hits + cacheStats.misses > 0 
        ? (cacheStats.hits / (cacheStats.hits + cacheStats.misses) * 100).toFixed(2) + '%'
        : '0%'
    };
  }, [cacheStats, isExpired]);

  return {
    getCachedResult,
    setCachedResult,
    invalidateCache,
    getCacheInfo,
    cleanupCache
  };
};
