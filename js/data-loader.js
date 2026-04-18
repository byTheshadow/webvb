/* ================================
   文件名：data-loader.js
   功能：数据加载器，负责从JSON文件加载数据
   依赖：无
   
   主要功能：
   - 加载JSON数据文件
   - 缓存已加载的数据
   - 错误处理
   
   最后更新：2026-04-18
   ================================ */

// ========== 区块A：数据加载器对象 开始 ==========
// 用途：统一管理所有数据加载
const DataLoader = {
    // ========== 区块A1：缓存对象 开始 ==========
    // 用途：存储已加载的数据，避免重复请求
    cache: {},
    // ========== 区块A1：缓存对象 结束 ==========

    // ========== 区块A2：加载JSON文件 开始 ==========
    // 用途：通用的JSON文件加载方法
    async loadJSON(path) {
        console.log('[DataLoader] 加载数据:', path);
        
        // 检查缓存
        if (this.cache[path]) {
            console.log('[DataLoader] 使用缓存数据:', path);
            return this.cache[path];
        }
        
        try {
            const response = await fetch(path);
            
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 存入缓存
            this.cache[path] = data;
            
            console.log('[DataLoader] 数据加载成功:', path);
            return data;
            
        } catch (error) {
            console.error('[DataLoader] 加载失败:', path, error);
            throw error;
        }
    },
    // ========== 区块A2：加载JSON文件 结束 ==========
       // ========== 区块A2.5：通用加载方法（兼容性） 开始 ==========
    // 用途：提供 load(path, cacheKey) 接口，供模块使用
    async load(path, cacheKey) {
        // cacheKey 参数用于兼容，实际使用 path 作为缓存键
        console.log('[DataLoader] load() 调用, path:', path, 'cacheKey:', cacheKey);
        return await this.loadJSON(path);
    },
    // ========== 区块A2.5：通用加载方法（兼容性） 结束 ==========


    // ========== 区块A3：具体数据加载方法 开始 ==========
    // 用途：为各个模块提供便捷的数据加载接口
    
    // 加载完整题库
    async loadFullQuestions() {
        return await this.loadJSON('data/questions/full.json');
    },

    // 加载简短题库
    async loadShortQuestions() {
        return await this.loadJSON('data/questions/short.json');
    },

    // 加载过去题库
    async loadPastQuestions() {
        return await this.loadJSON('data/questions/past.json');
    },

    // 加载角色卡列表
    async loadCharacters() {
        return await this.loadJSON('data/characters/list.json');
    },

    // 加载雷诺曼卡牌
    async loadLenormandCards() {
        return await this.loadJSON('data/lenormand/cards.json');
    },

    // 加载基酒数据
    async loadDrinkBase() {
        return await this.loadJSON('data/drinks/base.json');
    },

    // 加载配料数据
    async loadDrinkMixers() {
        return await this.loadJSON('data/drinks/mixers.json');
    },

    // 加载香调数据
    async loadPerfumeNotes() {
        return await this.loadJSON('data/perfumes/notes.json');
    },

    // 加载诗歌词库
    async loadPoemWords() {
        return await this.loadJSON('data/poems/words.json');
    },

    // 加载诗歌模板
    async loadPoemTemplates() {
        return await this.loadJSON('data/poems/templates.json');
    },

    // 加载CP模板
    async loadCPTemplates() {
        return await this.loadJSON('data/cp-templates/templates.json');
    },
    // ========== 区块A3：具体数据加载方法 结束 ==========

    // ========== 区块A4：缓存管理 开始 ==========
    // 用途：管理缓存数据
    
    // 清除指定缓存
    clearCache(path) {
        if (path) {
            delete this.cache[path];
            console.log('[DataLoader] 清除缓存:', path);
        } else {
            this.cache = {};
            console.log('[DataLoader] 清除所有缓存');
        }
    },

    // 获取缓存状态
    getCacheInfo() {
        const keys = Object.keys(this.cache);
        console.log('[DataLoader] 缓存数量:', keys.length);
        console.log('[DataLoader] 缓存列表:', keys);
        return {
            count: keys.length,
            keys: keys
        };
    },

    // 预加载数据
    async preload(paths) {
        console.log('[DataLoader] 开始预加载数据...');
        const promises = paths.map(path => this.loadJSON(path));
        
        try {
            await Promise.all(promises);
            console.log('[DataLoader] 预加载完成');
        } catch (error) {
            console.error('[DataLoader] 预加载失败:', error);
        }
    }
    // ========== 区块A4：缓存管理 结束 ==========
};
// ========== 区块A：数据加载器对象 结束 ==========

// ========== 区块B：导出到全局 开始 ==========
// 用途：让其他模块可以访问DataLoader对象
window.DataLoader = DataLoader;
// ========== 区块B：导出到全局 结束 ==========
