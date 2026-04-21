/**
 * 命运小纸条系统
 * 随机抽取鼓励的话语
 */
class FortuneNotesManager {
    constructor() {
        this.notes = [];
        this.currentNote = null;
        this.drawnToday = false;
        this.init();
    }

    async init() {
        await this.loadNotes();
        this.checkDailyStatus();
    }

    async loadNotes() {
        try {
            const response = await fetch('data/fortune-notes.json');
            const data = await response.json();
            this.notes = data.notes;
        } catch (error) {
            console.error('加载命运小纸条失败:', error);
            // 备用数据
            this.notes = [
                "今天的你，比昨天更勇敢一点",
                "慢慢来，比较快",
                "你值得被温柔以待"
            ];
        }
    }

    checkDailyStatus() {
        const today = new Date().toDateString();
        const lastDrawDate = localStorage.getItem('fortune_note_date');
        const savedNote = localStorage.getItem('fortune_note_content');

        if (lastDrawDate === today && savedNote) {
            this.drawnToday = true;
            this.currentNote = savedNote;
        } else {
            this.drawnToday = false;
            this.currentNote = null;
        }
    }

    drawNote() {
        if (this.notes.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * this.notes.length);
        this.currentNote = this.notes[randomIndex];

        // 保存到 localStorage
        const today = new Date().toDateString();
        localStorage.setItem('fortune_note_date', today);
        localStorage.setItem('fortune_note_content', this.currentNote);
        this.drawnToday = true;

        return this.currentNote;
    }

    render() {
        return `
            <div class="fortune-notes-container">
                <div class="fortune-notes-header">
                    <h2 class="section-title">命运小纸条</h2>
                    <p class="section-subtitle">每天一句温暖的话</p>
                </div>

                <div class="fortune-notes-content">
                    <div class="note-jar">
                        <div class="jar-body">
                            <div class="notes-stack">
                                ${this.renderNoteStack()}
                            </div>
                        </div>
                        <div class="jar-label">Soul Notes</div>
                    </div>

                    <div class="note-display ${this.currentNote ? 'show' : ''}">
                        <div class="note-paper">
                            <div class="note-content">
                                ${this.currentNote || '点击抽取今日的话语'}
                            </div>
                        </div>
                    </div>

                    <button class="draw-note-btn ${this.drawnToday ? 'disabled' : ''}" 
                            id="draw-note-btn"
                            ${this.drawnToday ? 'disabled' : ''}>
                        <span class="btn-icon">✨</span>
                        <span class="btn-text">${this.drawnToday ? '明天再来吧' : '抽取纸条'}</span>
                    </button>

                    ${this.drawnToday ? '<p class="note-hint">每天只能抽取一次哦</p>' : ''}
                </div>
            </div>
        `;
    }

    renderNoteStack() {
        // 渲染罐子里的纸条堆叠效果
        let stack = '';
        for (let i = 0; i < 8; i++) {
            const rotation = (Math.random() - 0.5) * 30;
            const offset = Math.random() * 10;
            stack += `<div class="note-piece" style="transform: rotate(${rotation}deg) translateX(${offset}px)"></div>`;
        }
        return stack;
    }

    bindEvents() {
        const drawBtn = document.getElementById('draw-note-btn');
        if (drawBtn && !this.drawnToday) {
            drawBtn.addEventListener('click', () => this.handleDraw());
        }
    }

    handleDraw() {
        const note = this.drawNote();
        if (!note) return;

        // 添加抽取动画
        const noteDisplay = document.querySelector('.note-display');
        const noteContent = document.querySelector('.note-content');
        const drawBtn = document.getElementById('draw-note-btn');

        // 动画效果
        noteDisplay.classList.add('drawing');
        
        setTimeout(() => {
            noteContent.textContent = note;
            noteDisplay.classList.remove('drawing');
            noteDisplay.classList.add('show');
            
            // 更新按钮状态
            drawBtn.disabled = true;
            drawBtn.classList.add('disabled');
            drawBtn.querySelector('.btn-text').textContent = '明天再来吧';
            
            // 添加提示
            const hint = document.createElement('p');
            hint.className = 'note-hint';
            hint.textContent = '每天只能抽取一次哦';
            drawBtn.parentElement.appendChild(hint);
        }, 800);
    }
}

// 创建全局实例
window.FortuneNotes = new FortuneNotesManager();
