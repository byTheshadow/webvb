// js/modules/ambient-sound.js

/**
 * 白噪音管理系统
 * 使用真实 MP3 文件播放各种环境音效
 */
class AmbientSoundManager {
    constructor() {
        this.audioContext = null;
        this.currentSource = null;
        this.gainNode = null;
        this.currentType = null;
        this.targetVolume = 0.5;
        this.isPlaying = false;
        this.fadeInterval = null;

        // MP3 音频 URL 映射
        this.audioUrls = {
            forest: 'https://github.com/byTheshadow/song/raw/refs/heads/main/064.%E6%A3%AE%E6%9E%97%E9%87%8C%E7%99%BE%E7%81%B5%E9%B8%9F%E9%B8%A3%E5%8F%AB_min.mp3',
            temple: 'https://github.com/byTheshadow/song/raw/refs/heads/main/059.%E5%B9%BD%E9%9D%99%E5%AF%BA%E9%99%A2%E7%9A%84%E9%92%9F%E5%A3%B0_min.mp3',
            ocean:  'https://github.com/byTheshadow/song/raw/refs/heads/main/068.%20%E5%A4%9C%E6%99%9A%E6%B5%B7%E6%B5%AA%E7%9A%84%E4%B8%96%E7%95%8C_min.mp3',
            river:  'https://github.com/byTheshadow/song/raw/refs/heads/main/030.%E6%B2%B3%E8%BE%B9%E7%82%B9%E7%87%83%E7%AF%9D%E7%81%AB%E3%80%81%E6%B0%B4%E5%A3%B0%E5%92%8C%E6%B8%85%E8%84%86%E7%9A%84%E9%B8%9F%E9%B8%A303_min.mp3',
        };

        // 解码后的 AudioBuffer 缓存，避免重复网络请求
        this.bufferCache = {};

        this.init();
    }

    init() {
        const savedType   = localStorage.getItem('ambient_sound_type') || '';
        const savedVolume = parseFloat(localStorage.getItem('ambient_sound_volume')) || 50;

        this.targetVolume = savedVolume / 100;
        this.updateUI(savedType, savedVolume);

        if (savedType) {
            this.play(savedType);
        }

        this.bindEvents();
    }

    bindEvents() {
        const audioSelect  = document.getElementById('audio-select');
        const volumeSlider = document.getElementById('volume-slider');

        if (audioSelect) {
            audioSelect.addEventListener('change', (e) => {
                const type = e.target.value;
                if (type) {
                    this.play(type);
                } else {
                    this.stop();
                }
                localStorage.setItem('ambient_sound_type', type);
            });
        }

        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const volume = parseInt(e.target.value);
                this.setVolume(volume);
                const volumeValue = document.getElementById('volume-value');
                if (volumeValue) volumeValue.textContent = volume + '%';
                localStorage.setItem('ambient_sound_volume', volume);
            });
        }
    }

    updateUI(type, volume) {
        const audioSelect  = document.getElementById('audio-select');
        const volumeSlider = document.getElementById('volume-slider');
        const volumeValue  = document.getElementById('volume-value');

        if (audioSelect)  audioSelect.value        = type;
        if (volumeSlider) volumeSlider.value        = volume;
        if (volumeValue)  volumeValue.textContent   = volume + '%';
    }

    // 懒初始化 AudioContext
    ensureAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = 0;
        }
        // 部分浏览器在用户手势前会挂起 AudioContext
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // 获取 AudioBuffer（优先读缓存，否则 fetch 解码）
    async fetchBuffer(type) {
        if (this.bufferCache[type]) {
            return this.bufferCache[type];
        }

        const url = this.audioUrls[type];
        if (!url) throw new Error(`未知音频类型: ${type}`);

        const response = await fetch(url);
        if (!response.ok) throw new Error(`加载音频失败: ${response.status}`);

        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

        this.bufferCache[type] = audioBuffer;
        return audioBuffer;
    }

    // 播放指定类型的音频
    async play(type) {
        if (this.currentType === type && this.isPlaying) return;

        // 先淡出并停止当前播放
        if (this.isPlaying) {
            this.stopImmediate();
        }

        this.currentType = type;
        this.ensureAudioContext();

        try {
            const buffer = await this.fetchBuffer(type);

            // 切换期间用户可能已选择其它类型，防止竞态
            if (this.currentType !== type) return;

            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.loop   = true;
            source.connect(this.gainNode);
            source.start(0);

            this.currentSource = source;
            this.isPlaying     = true;

            this.fadeIn();
        } catch (err) {
            console.error('[AmbientSound] 播放失败:', err);
            this.currentType = null;
            this.isPlaying   = false;
        }
    }

    // 停止播放（默认淡出）
    stop(immediate = false) {
        if (!this.isPlaying) return;
        immediate ? this.stopImmediate() : this.fadeOut();
    }

    stopImmediate() {
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
        }
        if (this.currentSource) {
            try { this.currentSource.stop(); } catch (_) {}
            this.currentSource = null;
        }
        if (this.gainNode) {
            this.gainNode.gain.value = 0;
        }
        this.isPlaying   = false;
        this.currentType = null;
    }

    // 淡入
    fadeIn() {
        if (!this.gainNode) return;

        const duration  = 2000;
        const steps     = 50;
        const stepTime  = duration / steps;
        const volStep   = this.targetVolume / steps;
        let   step      = 0;

        if (this.fadeInterval) clearInterval(this.fadeInterval);
        this.gainNode.gain.value = 0;

        this.fadeInterval = setInterval(() => {
            step++;
            if (this.gainNode) {
                this.gainNode.gain.value = Math.min(volStep * step, this.targetVolume);
            }
            if (step >= steps) {
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;
            }
        }, stepTime);
    }

    // 淡出
    fadeOut() {
        if (!this.gainNode) return;

        const duration     = 1500;
        const steps        = 50;
        const stepTime     = duration / steps;
        const startVolume  = this.gainNode.gain.value;
        const volStep      = startVolume / steps;
        let   step         = 0;

        if (this.fadeInterval) clearInterval(this.fadeInterval);

        this.fadeInterval = setInterval(() => {
            step++;
            if (this.gainNode) {
                this.gainNode.gain.value = Math.max(startVolume - volStep * step, 0);
            }
            if (step >= steps) {
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;
                this.stopImmediate();
            }
        }, stepTime);
    }

    // 设置音量
    setVolume(volume) {
        this.targetVolume = volume / 100;
        if (this.gainNode && this.isPlaying) {
            this.gainNode.gain.linearRampToValueAtTime(
                this.targetVolume,
                this.audioContext.currentTime + 0.3
            );
        }
    }

    // 获取当前状态
    getState() {
        return {
            type:      this.currentType,
            volume:    this.targetVolume * 100,
            isPlaying: this.isPlaying,
        };
    }
}

// 创建全局实例
window.AmbientSound = new AmbientSoundManager();
