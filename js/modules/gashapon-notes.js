/**
 * 扭蛋机命运小纸条系统
 * 投币 -> 扭蛋掉落 -> 打开扭蛋 -> 显示文字
 */
class GashaponNotes {
    constructor() {
        this.notes = [];
        this.currentNote = null;
        this.drawnToday = false;
        this.isAnimating = false;
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
            this.notes = [
                "今天的你，比昨天更勇敢一点",
                "慢慢来，比较快",
                "你值得被温柔以待"
            ];
        }
    }

    checkDailyStatus() {
        const today = new Date().toDateString();
        const lastDrawDate = localStorage.getItem('gashapon_note_date');
        const savedNote = localStorage.getItem('gashapon_note_content');

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

        const today = new Date().toDateString();
        localStorage.setItem('gashapon_note_date', today);
        localStorage.setItem('gashapon_note_content', this.currentNote);
        this.drawnToday = true;

        return this.currentNote;
    }

    render() {
        return `
            <div class="gashapon-container">
                <div class="gashapon-header">
                    <h2 class="gashapon-title">命运扭蛋机</h2>
                    <p class="gashapon-subtitle">投入硬币，获得今日的温暖话语</p>
                </div>

                <div class="gashapon-machine">
                    <!-- 扭蛋机顶部玻璃罩 -->
                    <div class="machine-dome">
                        <div class="dome-shine"></div>
                        <div class="capsules-container">
                            ${this.renderCapsules()}
                        </div>
                    </div>

                    <!-- 扭蛋机中部 -->
                    <div class="machine-body">
                        <div class="coin-slot">
                            <div class="slot-icon">🪙</div>
                        </div>
                        <div class="machine-display">
                            <span class="display-text">${this.drawnToday ? '明日再来' : '投币抽取'}</span>
                        </div>
                    </div>

                    <!-- 扭蛋出口 -->
                    <div class="machine-outlet">
                        <div class="outlet-door"></div>
                        <div class="capsule-drop" id="capsule-drop"></div>
                    </div>

                    <!-- 扭蛋机底座 -->
                    <div class="machine-base">
                        <div class="base-label">Soul Gashapon</div>
                    </div>
                </div>

                <!-- 投币按钮 -->
                <button class="insert-coin-btn ${this.drawnToday ? 'disabled' : ''}" 
                        id="insert-coin-btn"
                        ${this.drawnToday ? 'disabled' : ''}>
                    <span class="btn-icon">🪙</span>
                    <span class="btn-text">${this.drawnToday ? '今日已抽取' : '投入硬币'}</span>
                </button>

                <!-- 扭蛋弹窗 -->
                <div class="capsule-modal" id="capsule-modal">
                    <div class="modal-overlay"></div>
                    <div class="capsule-wrapper">
                        <div class="capsule-egg" id="capsule-egg">
                            <div class="egg-top"></div>
                            <div class="egg-bottom"></div>
                            <div class="egg-shine"></div>
                        </div>
                        <div class="capsule-note" id="capsule-note">
                            <div class="note-paper">
                                <p class="note-text"></p>
                            </div>
                        </div>
                        <p class="tap-hint">点击扭蛋打开</p>
                    </div>
                </div>

                ${this.drawnToday && this.currentNote ? `
                    <div class="today-note">
                        <p class="today-label">今日话语</p>
                        <p class="today-text">${this.currentNote}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderCapsules() {
        const colors = ['#FF6B9D', '#C44569', '#FFA07A', '#98D8C8', '#6C5CE7', '#A29BFE'];
        let capsulesHTML = '';
        
        for (let i = 0; i < 12; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const left = 10 + (i % 4) * 25;
            const top = 10 + Math.floor(i / 4) * 30;
            const rotation = Math.random() * 360;
            
            capsulesHTML += `
                <div class="capsule-mini" style="
                    left: ${left}%;
                    top: ${top}%;
                    transform: rotate(${rotation}deg);
                    background: linear-gradient(135deg, ${color}, ${color}dd);
                "></div>
            `;
        }
        
        return capsulesHTML;
    }

    bindEvents() {
        const insertBtn = document.getElementById('insert-coin-btn');
        if (insertBtn && !this.drawnToday) {
            insertBtn.addEventListener('click', () => this.handleInsertCoin());
        }

        const capsuleEgg = document.getElementById('capsule-egg');
        if (capsuleEgg) {
            capsuleEgg.addEventListener('click', () => this.handleOpenCapsule());
        }
    }

    async handleInsertCoin() {
        if (this.isAnimating || this.drawnToday) return;
        
        this.isAnimating = true;
        const note = this.drawNote();
        if (!note) return;

        // 1. 硬币投入动画
        await this.animateCoinInsert();

        // 2. 扭蛋掉落动画
        await this.animateCapsuleDrop();

        // 3. 显示扭蛋弹窗
        this.showCapsuleModal(note);

        this.isAnimating = false;
    }

    animateCoinInsert() {
        return new Promise(resolve => {
            const coinSlot = document.querySelector('.coin-slot');
            coinSlot.classList.add('coin-inserting');
            
            setTimeout(() => {
                coinSlot.classList.remove('coin-inserting');
                resolve();
            }, 800);
        });
    }

    animateCapsuleDrop() {
        return new Promise(resolve => {
            const capsuleDrop = document.getElementById('capsule-drop');
            const colors = ['#FF6B9D', '#C44569', '#FFA07A', '#98D8C8', '#6C5CE7', '#A29BFE'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            capsuleDrop.style.background = `linear-gradient(135deg, ${randomColor}, ${randomColor}dd)`;
            capsuleDrop.classList.add('dropping');
            
            setTimeout(() => {
                capsuleDrop.classList.remove('dropping');
                resolve();
            }, 1500);
        });
    }

    showCapsuleModal(note) {
        const modal = document.getElementById('capsule-modal');
        const noteText = modal.querySelector('.note-text');
        const capsuleEgg = document.getElementById('capsule-egg');
        
        noteText.textContent = note;
        modal.classList.add('show');
        
        // 扭蛋晃动提示
        setTimeout(() => {
            capsuleEgg.classList.add('shake');
        }, 500);
    }

    handleOpenCapsule() {
        const capsuleEgg = document.getElementById('capsule-egg');
        const capsuleNote = document.getElementById('capsule-note');
        const tapHint = document.querySelector('.tap-hint');
        
        capsuleEgg.classList.remove('shake');
        capsuleEgg.classList.add('opening');
        
        setTimeout(() => {
            capsuleNote.classList.add('show');
            tapHint.style.display = 'none';
            
            // 5秒后自动关闭
            setTimeout(() => {
                this.closeCapsuleModal();
            }, 5000);
        }, 600);
    }

    closeCapsuleModal() {
        const modal = document.getElementById('capsule-modal');
        const capsuleEgg = document.getElementById('capsule-egg');
        const capsuleNote = document.getElementById('capsule-note');
        const tapHint = document.querySelector('.tap-hint');
        
        modal.classList.remove('show');
        
        setTimeout(() => {
            capsuleEgg.classList.remove('opening');
            capsuleNote.classList.remove('show');
            tapHint.style.display = 'block';
            
            // 更新按钮状态
            const insertBtn = document.getElementById('insert-coin-btn');
            if (insertBtn) {
                insertBtn.disabled = true;
                insertBtn.classList.add('disabled');
                insertBtn.querySelector('.btn-text').textContent = '今日已抽取';
            }
            
            // 刷新页面显示今日话语
            location.reload();
        }, 300);
    }
}

// 导出类和实例
window.GashaponNotesClass = GashaponNotes;
window.GashaponNotes = new GashaponNotes();

// 不要在这里自动初始化，等路由调用时再初始化
