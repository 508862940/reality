/**
 * Reality游戏百科 - 文章缓存管理器
 * 功能：懒加载、预加载、LRU缓存
 * 版本：1.0
 * 日期：2025-10-03
 */

class WikiCacheManager {
    constructor() {
        this.cache = new Map(); // 文章内容缓存
        this.maxCacheSize = 50; // 最多缓存50篇文章
        this.accessOrder = []; // LRU访问顺序
        this.preloadQueue = []; // 预加载队列
    }

    /**
     * 获取文章（带缓存）
     * @param {string} articleId - 文章ID
     * @returns {Object|null} 文章对象
     */
    getArticle(articleId) {
        // 尝试从缓存读取
        if (this.cache.has(articleId)) {
            this.updateAccessOrder(articleId);
            return this.cache.get(articleId);
        }

        // 从原始数据加载
        const article = this.loadArticleFromData(articleId);
        if (article) {
            this.cacheArticle(articleId, article);
        }
        return article;
    }

    /**
     * 从game-wiki.js数据加载文章
     * @param {string} articleId - 文章ID
     * @returns {Object|null}
     */
    loadArticleFromData(articleId) {
        if (!window.gameWikiData || !window.gameWikiData.articles) {
            return null;
        }

        // articles 是对象，直接通过 key 访问
        return window.gameWikiData.articles[articleId] || null;
    }

    /**
     * 缓存文章
     * @param {string} articleId - 文章ID
     * @param {Object} article - 文章对象
     */
    cacheArticle(articleId, article) {
        // LRU淘汰策略
        if (this.cache.size >= this.maxCacheSize) {
            const leastUsed = this.accessOrder.shift();
            this.cache.delete(leastUsed);
        }

        this.cache.set(articleId, article);
        this.updateAccessOrder(articleId);
    }

    /**
     * 更新LRU访问顺序
     * @param {string} articleId - 文章ID
     */
    updateAccessOrder(articleId) {
        const index = this.accessOrder.indexOf(articleId);
        if (index > -1) {
            this.accessOrder.splice(index, 1);
        }
        this.accessOrder.push(articleId);
    }

    /**
     * 预加载文章（用于"下一篇"功能）
     * @param {string} articleId - 文章ID
     */
    preloadArticle(articleId) {
        if (!this.cache.has(articleId) && !this.preloadQueue.includes(articleId)) {
            this.preloadQueue.push(articleId);
            this.processPreloadQueue();
        }
    }

    /**
     * 处理预加载队列（requestIdleCallback优化）
     */
    processPreloadQueue() {
        if (this.preloadQueue.length === 0) return;

        const loadNext = () => {
            if (this.preloadQueue.length === 0) return;

            const articleId = this.preloadQueue.shift();
            this.getArticle(articleId); // 触发缓存

            // 使用requestIdleCallback继续加载
            if (window.requestIdleCallback) {
                requestIdleCallback(loadNext);
            } else {
                setTimeout(loadNext, 100);
            }
        };

        if (window.requestIdleCallback) {
            requestIdleCallback(loadNext);
        } else {
            setTimeout(loadNext, 100);
        }
    }

    /**
     * 清空缓存
     */
    clearCache() {
        this.cache.clear();
        this.accessOrder = [];
        this.preloadQueue = [];
    }

    /**
     * 获取缓存统计
     * @returns {Object}
     */
    getStats() {
        return {
            cacheSize: this.cache.size,
            maxSize: this.maxCacheSize,
            preloadQueueLength: this.preloadQueue.length,
            hitRate: this.calculateHitRate()
        };
    }

    /**
     * 计算缓存命中率（简化版）
     * @returns {number}
     */
    calculateHitRate() {
        // 这里可以扩展为完整的统计系统
        return this.cache.size / this.maxCacheSize;
    }
}

// 全局单例
window.wikiCache = new WikiCacheManager();