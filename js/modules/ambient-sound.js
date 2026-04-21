// js/modules/ambient-sound.js

/**
 * 白噪音管理系统
 * 使用 Web Audio API 生成各种环境音效
 */
class AmbientSoundManager {
    constructor() {
        this.audioContext = null;
        this.currentSource = null;
        this.gainNode = null;
        this.filterNode = null;
        this.currentType = null;
        this.targetVolume = 0.5;
        this.isPlaying = false;
        this.fadeInterval = null;
        
        // 初始化
        this.init();
    }

    init() {
        // 从 localStorage 加载设置
        const savedType = localStorage.getItem('ambient_sound_type') || '';
        const savedVolume = parseFloat(localStorage.getItem('ambient_sound_volume')) || 50;
        
        this.targetVolume = savedVolume / 100;
        
        // 更新 UI
        this.updateUI(savedType, savedVolume);
        
        // 如果有保存的音频类型，自动播放
        if (savedType) {
            this.play(savedType);
        }
        
        // 绑定事件
        this.bindEvents();
    }

    bindEvents() {
        const audioSelect = document.getElementById('audio-select');
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
                document.getElementById('volume-value').textContent = volume + '%';
                localStorage.setItem('ambient_sound_volume', volume);
            });
        }
    }

    updateUI(type, volume) {
        const audioSelect = document.getElementById('audio-select');
        const volumeSlider = document.getElementById('volume-slider');
        const volumeValue = document.getElementById('volume-value');
        
        if (audioSelect) audioSelect.value = type;
        if (volumeSlider) volumeSlider.value = volume;
        if (volumeValue) volumeValue.textContent = volume + '%';
    }

    createAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = 0; // 从0开始，用于淡入
        }
    }

    // 生成白噪音
    generateWhiteNoise() {
        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        return noiseBuffer;
    }

    // 生成粉红噪音（更柔和）
    generatePinkNoise() {
        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11;
            b6 = white * 0.115926;
        }
        
        return noiseBuffer;
    }

    // 生成褐色噪音（更深沉）
    generateBrownNoise() {
        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        let lastOut = 0;
        
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
        }
        
        return noiseBuffer;
    }

    // 雨声效果
    createRainSound() {
        this.createAudioContext();
        
        const source = this.audioContext.createBufferSource();
        source.buffer = this.generatePinkNoise();
        source.loop = true;
        
        // 低通滤波器模拟雨声
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        filter.Q.value = 0.5;
        
        source.connect(filter);
        filter.connect(this.gainNode);
        
        return source;
    }

    // 咖啡厅效果
    createCafeSound() {
        this.createAudioContext();
        
        const source = this.audioContext.createBufferSource();
        source.buffer = this.generatePinkNoise();
        source.loop = true;
        
        // 带通滤波器模拟人声嘈杂
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 1.5;
        
        source.connect(filter);
        filter.connect(this.gainNode);
        
        return source;
    }

    // 森林效果
    createForestSound() {
        this.createAudioContext();
        
        const source = this.audioContext.createBufferSource();
        source.buffer = this.generatePinkNoise();
        source.loop = true;
        
        // 高通滤波器模拟风声和鸟鸣
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 500;
        filter.Q.value = 0.3;
        
        source.connect(filter);
        filter.connect(this.gainNode);
        
        return source;
    }

    // 海浪效果
    createOceanSound() {
        this.createAudioContext();
        
        const source = this.audioContext.createBufferSource();
        source.buffer = this.generateBrownNoise();
        source.loop = true;
        
        // 低通滤波器 + LFO 模拟海浪起伏
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        filter.Q.value = 1;
        
        // 创建 LFO（低频振荡器）
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        lfo.frequency.value = 0.2; // 5秒一个周期
        lfoGain.gain.value = 200;
        
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        
        source.connect(filter);
        filter.connect(this.gainNode);
        
        lfo.start();
        
        return source;
    }

    // 打字声效果
    createTypingSound() {
        this.createAudioContext();
        
        const source = this.audioContext.createBufferSource();
        source.buffer = this.generateWhiteNoise();
        source.loop = true;
        
        // 高通滤波器 + 快速调制模拟打字
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        filter.Q.value = 5;
        
        source.connect(filter);
        filter.connect(this.gainNode);
        
        return source;
    }

    // 播放指定类型的音频
    play(type) {
        if (this.currentType === type && this.isPlaying) {
            return; // 已经在播放相同类型
        }
        
        // 先停止当前播放
        if (this.isPlaying) {
            this.stop(true); // 快速停止，不淡出
        }
        
        this.currentType = type;
        
        // 创建对应的音频源
        switch (type) {
            case 'rain':
                this.currentSource = this.createRainSound();
                break;
            case 'cafe':
                this.currentSource = this.createCafeSound();
                break;
            case 'forest':
                this.currentSource = this.createForestSound();
                break;
            case 'ocean':
                this.currentSource = this.createOceanSound();
                break;
            case 'typing':
                this.currentSource = this.createTypingSound();
                break;
            default:
                return;
        }
        
        // 开始播放
        this.currentSource.start(0);
        this.isPlaying = true;
        
        // 淡入效果
        this.fadeIn();
    }

    // 停止播放
    stop(immediate = false) {
        if (!this.isPlaying) return;
        
        if (immediate) {
            this.stopImmediate();
        } else {
            this.fadeOut();
        }
    }

    stopImmediate() {
        if (this.currentSource) {
            try {
                this.currentSource.stop();
            } catch (e) {
                // 忽略已停止的错误
            }
            this.currentSource = null;
        }
        
        if (this.gainNode) {
            this.gainNode.gain.value = 0;
        }
        
        this.isPlaying = false;
        this.currentType = null;
    }

    // 淡入效果
    fadeIn() {
        if (!this.gainNode) return;
        
        const duration = 2000; // 2秒淡入
        const steps = 50;
        const stepTime = duration / steps;
        const volumeStep = this.targetVolume / steps;
        
        let currentStep = 0;
        
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
        }
        
        this.gainNode.gain.value = 0;
        
        this.fadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = volumeStep * currentStep;
            
            if (this.gainNode) {
                this.gainNode.gain.value = Math.min(newVolume, this.targetVolume);
            }
            
            if (currentStep >= steps) {
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;
            }
        }, stepTime);
    }

    // 淡出效果
    fadeOut() {
        if (!this.gainNode) return;
        
        const duration = 1500; // 1.5秒淡出
        const steps = 50;
        const stepTime = duration / steps;
        const currentVolume = this.gainNode.gain.value;
        const volumeStep = currentVolume / steps;
        
        let currentStep = 0;
        
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
        }
        
        this.fadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = currentVolume - (volumeStep * currentStep);
            
            if (this.gainNode) {
                this.gainNode.gain.value = Math.max(newVolume, 0);
            }
            
            if (currentStep >= steps) {
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
            // 平滑过渡到新音量
            this.gainNode.gain.linearRampToValueAtTime(
                this.targetVolume,
                this.audioContext.currentTime + 0.3
            );
        }
    }

    // 获取当前状态
    getState() {
        return {
            type: this.currentType,
            volume: this.targetVolume * 100,
            isPlaying: this.isPlaying
        };
    }
}

// 创建全局实例
window.AmbientSound = new AmbientSoundManager();
