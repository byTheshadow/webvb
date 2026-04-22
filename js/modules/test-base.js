/* ============================================================
 * 文件名: js/modules/test-base.js
 * 用途: 测试系统基类 - 提供共用逻辑
 * ============================================================ */

const TestBase = (function() {
  'use strict';

  /* ----------------------------------------------------------
   * 通用工具函数
   * ---------------------------------------------------------- */
  
  // 余弦相似度计算
  function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot  += vecA[i] * vecB[i];
      magA += vecA[i] * vecA[i];
      magB += vecB[i] * vecB[i];
    }
    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);

    if (magA === 0 || magB === 0) return 0;
    return dot / (magA * magB);
  }

  // 提取高频标签
  function getTopTags(tagCount, count = 8) {
    const entries = Object.entries(tagCount || {});
    entries.sort((a, b) => b[1] - a[1]);
    return entries.slice(0, count).map(e => e[0]);
  }

  // Clamp数值到范围
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  // 渲染进度条
  function renderProgress(current, total) {
    const progress = Math.round((current / total) * 100);
    return `
      <div class="test-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <span class="progress-text">${current} / ${total}</span>
      </div>
    `;
  }

  // 渲染题目选项
  function renderOptions(question, answers) {
    return question.options.map(opt => {
      const isSelected = answers[question.id] && answers[question.id].includes(opt.id);
      return `
        <label class="option-item ${question.multiple ? 'checkbox' : 'radio'}">
          <input 
            type="${question.multiple ? 'checkbox' : 'radio'}" 
            name="q${question.id}" 
            value="${opt.id}"
            ${isSelected ? 'checked' : ''}
          >
          <span class="option-text">${opt.text}</span>
        </label>
      `;
    }).join('');
  }

  // 渲染雷达图
  function renderRadarChart(radar, dimensions) {
    return dimensions.map(d => {
      const val = radar[d.key] || 0;
      return `
        <div class="radar-bar">
          <span class="radar-label">${d.label}</span>
          <div class="radar-track">
            <div class="radar-fill" style="width:${val}%; background:${d.color}"></div>
          </div>
          <span class="radar-value">${val}</span>
        </div>
      `;
    }).join('');
  }

  // 渲染角色卡
  function renderCharacterCards(characters) {
    if (!characters || characters.length === 0) {
      return '<p class="no-match">暂无匹配角色</p>';
    }

    return characters.map(char => `
      <div class="match-card" data-char-id="${char.id}">
        <div class="match-card-header">
          <h4>${char.name}</h4>
          <span class="match-score">${char.matchScore}%</span>
        </div>
        <p class="match-archetype">${char.archetype || ''}</p>
        <div class="match-tags">
          ${(char.coreXP || []).slice(0, 3).map(tag => 
            `<span class="tag">${tag}</span>`
          ).join('')}
        </div>
      </div>
    `).join('');
  }

  // 绑定角色卡点击事件
  function bindCharacterCardEvents(container) {
    container.querySelectorAll('.match-card').forEach(card => {
      card.addEventListener('click', () => {
        const charId = card.dataset.charId;
        if (window.CharacterDetail && charId) {
          CharacterDetail.show(charId);
        }
      });
    });
  }

  /* ----------------------------------------------------------
   * 导出
   * ---------------------------------------------------------- */
  return {
    cosineSimilarity,
    getTopTags,
    clamp,
    renderProgress,
    renderOptions,
    renderRadarChart,
    renderCharacterCards,
    bindCharacterCardEvents
  };

})();

window.TestBase = TestBase;
console.log('[TestBase] 基类加载完成 ✓');
