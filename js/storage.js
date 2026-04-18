/* ================================
   文件名：storage.js
   功能：本地存储管理，使用localStorage
   依赖：无
   
   主要功能：
   - 保存用户数据
   - 读取用户数据
   - 删除数据
   - 数据加密（可选）
   
   最后更新：2026-04-18
   ================================ */

// ========== 区块A：存储管理器对象 开始 ==========
// 用途：统一管理本地存储操作
const Storage = {
    // ========== 区块A1：存储键名前缀 开始 ==========
    // 用途：避免与其他网站的localStorage冲突
    prefix: 'webvb_',
    // ========== 区块A1：存储键名前缀 结束 ==========

    // ========== 区块A2：基础存储方法 开始 ==========
    // 用途：保存、读取、删除数据
    
    // 保存数据
    set(key, value) {
        try {
            const fullKey = this.prefix + key;
            const jsonValue = JSON.stringify(value);
            localStorage.setItem(fullKey, jsonValue);
            console.log('[Storage] 保存数据:', key);
            return true;
        } catch (error) {
            console.error('[Storage] 保存失败:', key, error);
            return false;
        }
    },

    // 读取数据
    get(key, defaultValue = null) {
        try {
            const fullKey = this.prefix + key;
            const jsonValue = localStorage.getItem(fullKey);
            
            if (jsonValue === null) {
                return defaultValue;
            }
            
            return JSON.parse(jsonValue);
        } catch (error) {
            console.error('[Storage] 读取失败:', key, error);
            return defaultValue;
        }
    },

    // 删除数据
    remove(key) {
        try {
            const fullKey = this.prefix + key;
            localStorage.removeItem(fullKey);
            console.log('[Storage] 删除数据:', key);
            return true;
        } catch (error) {
            console.error('[Storage] 删除失败:', key, error);
            return false;
        }
    },

    // 清除所有数据
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            console.log('[Storage] 清除所有数据');
            return true;
        } catch (error) {
            console.error('[Storage] 清除失败:', error);
            return false;
        }
    },

    // 检查键是否存在
    has(key) {
        const fullKey = this.prefix + key;
        return localStorage.getItem(fullKey) !== null;
    },
    // ========== 区块A2：基础存储方法 结束 ==========

    // ========== 区块A3：特定数据存储方法 开始 ==========
    // 用途：为常用数据提供便捷接口
    
    // 保存主题设置
    saveTheme(theme) {
        return this.set('theme', theme);
    },

    // 获取主题设置
    getTheme() {
        return this.get('theme', 'starry');
    },

    // 保存自定义背景
    saveCustomBackground(imageData) {
        return this.set('customBackground', imageData);
    },

    // 获取自定义背景
    getCustomBackground() {
        return this.get('customBackground');
    },

    // 保存音频设置
    saveAudioSettings(settings) {
        return this.set('audioSettings', settings);
    },

    // 获取音频设置
    getAudioSettings() {
        return this.get('audioSettings', {
            currentSound: '',
            volume: 50
        });
    },

    // 保存测试结果
    saveTestResult(result) {
        const history = this.getTestHistory();
        history.push({
            ...result,
            timestamp: Date.now()
        });
        return this.set('testHistory', history);
    },

    // 获取测试历史
    getTestHistory() {
        return this.get('testHistory', []);
    },

    // 保存收藏的角色卡
    saveFavoriteCharacter(characterId) {
        const favorites = this.getFavoriteCharacters();
        if (!favorites.includes(characterId)) {
            favorites.push(characterId);
            return this.set('favoriteCharacters', favorites);
        }
        return true;
    },

    // 移除收藏的角色卡
    removeFavoriteCharacter(characterId) {
        const favorites = this.getFavoriteCharacters();
        const index = favorites.indexOf(characterId);
        if (index > -1) {
            favorites.splice(index, 1);
            return this.set('favoriteCharacters', favorites);
        }
        return true;
    },

    // 获取收藏的角色卡列表
    getFavoriteCharacters() {
        return this.get('favoriteCharacters', []);
    },

    // 检查角色卡是否已收藏
    isFavoriteCharacter(characterId) {
        const favorites = this.getFavoriteCharacters();
        return favorites.includes(characterId);
    },

    // 保存占卜历史
    saveDivinationResult(result) {
        const history = this.getDivinationHistory();
        history.push({
            ...result,
            timestamp: Date.now()
        });
        // 只保留最近50条
        if (history.length > 50) {
            history.shift();
        }
        return this.set('divinationHistory', history);
    },

    // 获取占卜历史
    getDivinationHistory() {
        return this.get('divinationHistory', []);
    },
    // ========== 区块A3：特定数据存储方法 结束 ==========

    // ========== 区块A4：工具方法 开始 ==========
    // 用途：存储空间管理和调试
    
    // 获取存储使用情况
    getStorageInfo() {
        let totalSize = 0;
        const items = [];
        
        for (let key in localStorage) {
            if (key.startsWith(this.prefix)) {
                const value = localStorage.getItem(key);
                const size = new Blob([value]).size;
                totalSize += size;
                items.push({
                    key: key.replace(this.prefix, ''),
                    size: size
                });
            }
        }
        
        return {
            totalSize: totalSize,
            totalSizeKB: (totalSize / 1024).toFixed(2),
            items: items,
            itemCount: items.length
        };
    },

    // 导出所有数据（用于备份）
    exportData() {
        const data = {};
        for (let key in localStorage) {
            if (key.startsWith(this.prefix)) {
                const shortKey = key.replace(this.prefix, '');
                data[shortKey] = this.get(shortKey);
            }
        }
        return data;
    },

    // 导入数据（用于恢复）
    importData(data) {
        try {
            for (let key in data) {
                this.set(key, data[key]);
            }
            console.log('[Storage] 数据导入成功');
            return true;
        } catch (error) {
            console.error('[Storage] 数据导入失败:', error);
            return false;
        }
    },

    // 检查localStorage是否可用
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.error('[Storage] localStorage不可用:', error);
            return false;
        }
    }
    // ========== 区块A4：工具方法 结束 ==========
};
// ========== 区块A：存储管理器对象 结束 ==========

// ========== 区块B：初始化检查 开始 ==========
// 用途：启动时检查localStorage是否可用
if (!Storage.isAvailable()) {
    console.warn('[Storage] 警告：localStorage不可用，数据将无法保存');
}
// ========== 区块B：初始化检查 结束 ==========

// ========== 区块C：导出到全局 开始 ==========
// 用途：让其他模块可以访问Storage对象
window.Storage = Storage;
// ========== 区块C：导出到全局 结束 ==========
