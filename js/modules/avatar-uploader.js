/* ================================
   文件名：avatar-uploader.js
   功能：头像上传、裁剪、压缩
   依赖：Storage
   
   主要功能：
   - 图片选择和预览
   - 图片裁剪（正方形）
   - 图片压缩（限制大小）
   - 保存到 localStorage
   
   最后更新：2026-04-21
   ================================ */

const AvatarUploader = (function() {
    'use strict';

    let callback = null;
    let currentImage = null;

    // 配置
    const CONFIG = {
        maxSize: 500 * 1024, // 500KB
        outputSize: 200, // 输出尺寸 200x200
        quality: 0.8, // 压缩质量
        acceptTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    };

    // 打开上传器
    function open(onUpload, options = {}) {
        callback = onUpload;
        const {
            title = '上传头像',
            currentAvatar = null
        } = options;

        const modal = createModal(title, currentAvatar);
        document.body.appendChild(modal);
        bindEvents(modal);
    }

    // 创建模态框
    function createModal(title, currentAvatar) {
        const modal = document.createElement('div');
        modal.className = 'avatar-uploader-modal';
        modal.innerHTML = `
            <div class="uploader-overlay"></div>
            <div class="uploader-content">
                <div class="uploader-header">
                    <h2 class="uploader-title">${title}</h2>
                    <button class="uploader-close" data-action="close">×</button>
                </div>

                <div class="uploader-body">
                    <!-- 当前头像预览 -->
                    <div class="avatar-preview-section">
                        <div class="avatar-preview-circle" id="avatar-preview">
                            ${currentAvatar ? 
                                `<img src="${currentAvatar}" alt="当前头像">` : 
                                '<div class="avatar-placeholder">👤</div>'
                            }
                        </div>
                        <p class="preview-hint">预览效果</p>
                    </div>

                    <!-- 上传区域 -->
                    <div class="upload-section">
                        <input type="file" 
                               id="avatar-file-input" 
                               accept="image/*" 
                               style="display: none;">
                        
                        <button class="upload-btn primary-btn" data-action="select-file">
                            📁 选择图片
                        </button>
                        
                        <p class="upload-hint">
                            支持 JPG、PNG、GIF、WebP 格式<br>
                            建议尺寸：200x200 像素以上<br>
                            文件大小：不超过 500KB
                        </p>
                    </div>

                    <!-- 裁剪区域（初始隐藏）-->
                    <div class="crop-section" id="crop-section" style="display: none;">
                        <div class="crop-container">
                            <canvas id="crop-canvas"></canvas>
                        </div>
                        <div class="crop-controls">
                            <button class="control-btn" data-action="zoom-in">🔍 放大</button>
                            <button class="control-btn" data-action="zoom-out">🔍 缩小</button>
                            <button class="control-btn" data-action="rotate">🔄 旋转</button>
                        </div>
                    </div>
                </div>

                <div class="uploader-footer">
                    <button class="secondary-btn" data-action="close">取消</button>
                    <button class="primary-btn" data-action="confirm" id="confirm-btn" disabled>
                        ✅ 确认上传
                    </button>
                </div>
            </div>
        `;
        return modal;
    }

    // 绑定事件
    function bindEvents(modal) {
        const fileInput = modal.querySelector('#avatar-file-input');
        const cropSection = modal.querySelector('#crop-section');
        const canvas = modal.querySelector('#crop-canvas');
        const ctx = canvas.getContext('2d');
        const confirmBtn = modal.querySelector('#confirm-btn');
        
        let scale = 1;
        let rotation = 0;

        // 关闭按钮
        modal.querySelectorAll('[data-action="close"]').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });

        // 点击遮罩关闭
        modal.querySelector('.uploader-overlay').addEventListener('click', () => {
            modal.remove();
        });

        // 选择文件按钮
        modal.querySelector('[data-action="select-file"]').addEventListener('click', () => {
            fileInput.click();
        });

        // 文件选择
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // 验证文件类型
            if (!CONFIG.acceptTypes.includes(file.type)) {
                alert('不支持的图片格式，请选择 JPG、PNG、GIF 或 WebP 格式');
                return;
            }

            // 验证文件大小
            if (file.size > CONFIG.maxSize) {
                alert(`图片文件过大，请选择小于 ${CONFIG.maxSize / 1024}KB 的图片`);
                return;
            }

            // 读取图片
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    currentImage = img;
                    scale = 1;
                    rotation = 0;
                    drawImage(canvas, ctx, img, scale, rotation);
                    cropSection.style.display = 'block';
                    confirmBtn.disabled = false;
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });

        // 放大
        modal.querySelector('[data-action="zoom-in"]').addEventListener('click', () => {
            if (!currentImage) return;
            scale = Math.min(scale + 0.1, 3);
            drawImage(canvas, ctx, currentImage, scale, rotation);
        });

        // 缩小
        modal.querySelector('[data-action="zoom-out"]').addEventListener('click', () => {
            if (!currentImage) return;
            scale = Math.max(scale - 0.1, 0.5);
            drawImage(canvas, ctx, currentImage, scale, rotation);
        });

        // 旋转
        modal.querySelector('[data-action="rotate"]').addEventListener('click', () => {
            if (!currentImage) return;
            rotation = (rotation + 90) % 360;
            drawImage(canvas, ctx, currentImage, scale, rotation);
        });

        // 确认上传
        confirmBtn.addEventListener('click', () => {
            if (!currentImage) return;

            // 生成最终头像
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = CONFIG.outputSize;
            finalCanvas.height = CONFIG.outputSize;
            const finalCtx = finalCanvas.getContext('2d');

            // 绘制到最终画布
            drawImage(finalCanvas, finalCtx, currentImage, scale, rotation);

            // 转换为 base64
            const avatarData = finalCanvas.toDataURL('image/jpeg', CONFIG.quality);

            // 更新预览
            const preview = modal.querySelector('#avatar-preview');
            preview.innerHTML = `<img src="${avatarData}" alt="新头像">`;

            // 回调
            if (callback) {
                callback(avatarData);
            }

            // 延迟关闭，让用户看到预览
            setTimeout(() => {
                modal.remove();
            }, 500);
        });
    }

    // 绘制图片到画布
    function drawImage(canvas, ctx, img, scale, rotation) {
        const size = CONFIG.outputSize;
        canvas.width = size;
        canvas.height = size;

        // 清空画布
        ctx.clearRect(0, 0, size, size);

        // 保存状态
        ctx.save();

        // 移动到中心点
        ctx.translate(size / 2, size / 2);

        // 旋转
        ctx.rotate((rotation * Math.PI) / 180);

        // 缩放
        ctx.scale(scale, scale);

        // 计算绘制尺寸（保持比例，填充画布）
        const imgRatio = img.width / img.height;
        let drawWidth, drawHeight;

        if (imgRatio > 1) {
            // 横图
            drawHeight = size;
            drawWidth = size * imgRatio;
        } else {
            // 竖图
            drawWidth = size;
            drawHeight = size / imgRatio;
        }

        // 绘制图片（居中）
        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

        // 恢复状态
        ctx.restore();

        // 绘制裁剪框（圆形）
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 公开 API
    return {
        open
    };
})();

// 挂载到全局
window.AvatarUploader = AvatarUploader;
