/* ================================
   文件名：avatar-uploader.css
   功能：头像上传器样式（适配三套主题）
   主题：落雨日 / 春日序曲 / 无人之境
   最后更新：2026-04-21
   ================================ */

/* 模态框容器 */
.avatar-uploader-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 遮罩层 */
.uploader-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}

/* 暗色主题下的遮罩 */
[data-theme="wasteland"] .uploader-overlay {
    background: rgba(0, 0, 0, 0.8);
}

/* 内容区 */
.uploader-content {
    position: relative;
    background: var(--surface-color);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    animation: modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* 头部 */
.uploader-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 25px;
    border-bottom: 1px solid var(--border-color);
    background: var(--surface-color);
}

.uploader-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -0.02em;
}

.uploader-close {
    background: none;
    border: none;
    font-size: 2rem;
    color: var(--text-secondary);
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.uploader-close:hover {
    background: var(--border-color);
    color: var(--text-primary);
    transform: rotate(90deg);
}

/* 暗色主题下的关闭按钮 */
[data-theme="wasteland"] .uploader-close:hover {
    background: rgba(255, 255, 255, 0.1);
}

/* 主体内容 */
.uploader-body {
    padding: 30px 25px;
    max-height: calc(90vh - 160px);
    overflow-y: auto;
    background: var(--background-color);
}

/* 滚动条样式 */
.uploader-body::-webkit-scrollbar {
    width: 6px;
}

.uploader-body::-webkit-scrollbar-track {
    background: transparent;
}

.uploader-body::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 10px;
}

.uploader-body::-webkit-scrollbar-thumb:hover {
    background: var(--primary-color);
}

/* 头像预览区 */
.avatar-preview-section {
    text-align: center;
    margin-bottom: 30px;
}

.avatar-preview-circle {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    margin: 0 auto 15px;
    overflow: hidden;
    border: 3px solid var(--primary-color);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    background: var(--surface-color);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.avatar-preview-circle:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

/* 主题特定的头像边框光晕 */
[data-theme="rain"] .avatar-preview-circle {
    box-shadow: 0 8px 24px rgba(108, 122, 137, 0.3);
}

[data-theme="spring"] .avatar-preview-circle {
    box-shadow: 0 8px 24px rgba(143, 160, 140, 0.3);
}

[data-theme="wasteland"] .avatar-preview-circle {
    box-shadow: 0 8px 24px rgba(158, 158, 158, 0.2);
    border-color: var(--primary-light);
}

.avatar-preview-circle img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-placeholder {
    font-size: 4rem;
    color: var(--text-secondary);
}

.preview-hint {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 0;
    letter-spacing: 0.02em;
}

/* 上传区域 */
.upload-section {
    text-align: center;
    padding: 20px;
    background: var(--surface-color);
    border-radius: 15px;
    border: 2px dashed var(--border-color);
    margin-bottom: 20px;
    transition: all 0.3s ease;
}

.upload-section:hover {
    border-color: var(--primary-color);
    background: var(--background-color);
}

/* 暗色主题下的上传区域 */
[data-theme="wasteland"] .upload-section {
    background: rgba(255, 255, 255, 0.03);
}

[data-theme="wasteland"] .upload-section:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: var(--primary-light);
}

.upload-btn {
    margin-bottom: 15px;
    padding: 12px 30px;
    font-size: 1rem;
    background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
    border: none;
    border-radius: 12px;
    color: var(--text-inverse);
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-sm);
}

.upload-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.upload-btn:active {
    transform: translateY(0);
}

/* 暗色主题下的上传按钮 */
[data-theme="wasteland"] .upload-btn {
    background: transparent;
    border: 1px solid var(--primary-color);
    color: var(--primary-color);
}

[data-theme="wasteland"] .upload-btn:hover {
    background: var(--primary-color);
    color: var(--text-inverse);
    box-shadow: 0 0 20px rgba(158, 158, 158, 0.2);
}

.upload-hint {
    color: var(--text-secondary);
    font-size: 0.85rem;
    line-height: 1.6;
    margin: 0;
    letter-spacing: 0.01em;
}

/* 裁剪区域 */
.crop-section {
    margin-top: 20px;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.crop-container {
    background: var(--surface-color);
    border-radius: 15px;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
    border: 1px solid var(--border-color);
}

/* 暗色主题下的裁剪容器 */
[data-theme="wasteland"] .crop-container {
    background: rgba(0, 0, 0, 0.3);
}

#crop-canvas {
    max-width: 100%;
    border-radius: 50%;
    box-shadow: var(--shadow-md);
}

.crop-controls {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
}

.control-btn {
    padding: 10px 20px;
    background: var(--surface-color);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    color: var(--text-primary);
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
}

.control-btn:hover {
    background: var(--primary-color);
    color: var(--text-inverse);
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
}

.control-btn:active {
    transform: translateY(0);
}

/* 暗色主题下的控制按钮 */
[data-theme="wasteland"] .control-btn {
    background: rgba(255, 255, 255, 0.05);
}

[data-theme="wasteland"] .control-btn:hover {
    background: var(--primary-color);
    color: var(--text-inverse);
}

/* 底部按钮 */
.uploader-footer {
    display: flex;
    gap: 15px;
    padding: 20px 25px;
    border-top: 1px solid var(--border-color);
    background: var(--surface-color);
}

.uploader-footer button {
    flex: 1;
    padding: 12px;
    border-radius: 10px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    letter-spacing: 0.02em;
}

.secondary-btn {
    background: var(--surface-color);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
}

.secondary-btn:hover {
    background: var(--background-color);
    border-color: var(--primary-color);
}

/* 暗色主题下的次要按钮 */
[data-theme="wasteland"] .secondary-btn {
    background: rgba(255, 255, 255, 0.05);
}

[data-theme="wasteland"] .secondary-btn:hover {
    background: rgba(255, 255, 255, 0.1);
}

.primary-btn {
    background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
    border: none;
    color: var(--text-inverse);
    box-shadow: var(--shadow-sm);
}

.primary-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.primary-btn:active:not(:disabled) {
    transform: translateY(0);
}

.primary-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

/* 暗色主题下的主要按钮 */
[data-theme="wasteland"] .primary-btn {
    background: transparent;
    border: 1px solid var(--primary-color);
    color: var(--primary-color);
}

[data-theme="wasteland"] .primary-btn:hover:not(:disabled) {
    background: var(--primary-color);
    color: var(--text-inverse);
    box-shadow: 0 0 20px rgba(158, 158, 158, 0.2);
}

[data-theme="wasteland"] .primary-btn:disabled {
    opacity: 0.3;
    border-color: var(--text-secondary);
    color: var(--text-secondary);
}

/* 响应式 */
@media (max-width: 768px) {
    .uploader-content {
        width: 95%;
        max-width: none;
    }

    .uploader-header {
        padding: 16px 20px;
    }

    .uploader-title {
        font-size: 1.3rem;
    }

    .uploader-body {
        padding: 24px 20px;
    }

    .avatar-preview-circle {
        width: 120px;
        height: 120px;
    }

    .avatar-placeholder {
        font-size: 3rem;
    }

    .crop-controls {
        flex-wrap: wrap;
    }

    .control-btn {
        flex: 1;
        min-width: 100px;
    }

    .uploader-footer {
        padding: 16px 20px;
    }
}

@media (max-width: 480px) {
    .uploader-content {
        width: 100%;
        border-radius: 20px 20px 0 0;
        max-height: 95vh;
    }

    .uploader-title {
        font-size: 1.2rem;
    }

    .avatar-preview-circle {
        width: 100px;
        height: 100px;
    }

    .avatar-placeholder {
        font-size: 2.5rem;
    }

    .upload-btn {
        width: 100%;
    }

    .control-btn {
        flex: 1 1 calc(50% - 5px);
        min-width: 0;
    }

    .uploader-footer {
        flex-direction: column;
        gap: 10px;
    }

    .uploader-footer button {
        width: 100%;
    }
}

/* 加载动画 */
@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid var(--border-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}

/* 主题过渡动画 */
.avatar-uploader-modal,
.avatar-uploader-modal * {
    transition: 
        background-color 0.3s ease,
        border-color 0.3s ease,
        color 0.3s ease,
        box-shadow 0.3s ease;
}
