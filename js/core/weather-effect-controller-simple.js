/**
 * 简化版天气特效控制器 - 用于测试
 */

console.log('开始加载 WeatherEffectController...');

class WeatherEffectController {
    constructor() {
        console.log('WeatherEffectController 构造函数被调用');
        this.currentEffect = null;
        this.effectContainer = null;
    }

    showEffect(type, intensity = 0.5) {
        console.log(`显示特效: ${type}, 强度: ${intensity}`);

        // 移除旧效果
        this.removeEffect();

        // 创建效果容器
        this.effectContainer = document.getElementById('weatherEffectContainer');
        if (!this.effectContainer) {
            this.effectContainer = document.createElement('div');
            this.effectContainer.id = 'weatherEffectContainer';
            this.effectContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1000;
            `;
            document.body.appendChild(this.effectContainer);
        }

        if (type === 'rainbow') {
            this.createRainbowEffect(intensity);
        }

        this.currentEffect = type;
    }

    createRainbowEffect(intensity) {
        console.log('创建彩虹效果 v5.2 简化版');

        // 创建彩虹容器
        const container = document.createElement('div');
        container.className = 'rainbow-container';
        container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        `;

        // 创建简单的彩虹渐变
        const rainbow = document.createElement('div');
        rainbow.style.cssText = `
            position: absolute;
            top: 10%;
            left: 20%;
            width: 60%;
            height: 40%;
            background: linear-gradient(to right,
                rgba(255, 0, 0, 0.3),
                rgba(255, 127, 0, 0.3),
                rgba(255, 255, 0, 0.3),
                rgba(0, 255, 0, 0.3),
                rgba(0, 0, 255, 0.3),
                rgba(75, 0, 130, 0.3),
                rgba(148, 0, 211, 0.3)
            );
            filter: blur(20px);
            opacity: ${intensity};
            animation: fadeIn 3s ease-in-out;
        `;

        container.appendChild(rainbow);
        this.effectContainer.appendChild(container);

        // 添加简单动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: ${intensity}; }
            }
        `;
        document.head.appendChild(style);
    }

    removeEffect() {
        console.log('移除特效');
        if (this.effectContainer) {
            this.effectContainer.innerHTML = '';
        }
        this.currentEffect = null;
    }

    destroy() {
        this.removeEffect();
        if (this.effectContainer && this.effectContainer.parentNode) {
            this.effectContainer.parentNode.removeChild(this.effectContainer);
        }
    }
}

// 导出到全局
window.WeatherEffectController = WeatherEffectController;
console.log('✅ WeatherEffectController 类已导出到 window');

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    if (window.weatherEffectController && window.weatherEffectController.destroy) {
        window.weatherEffectController.destroy();
    }
});