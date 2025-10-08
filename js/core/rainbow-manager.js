/**
 * 🌈 彩虹管理器 v5.0
 * 负责彩虹的触发、显示、消失逻辑
 * 遵循真实世界规则：短暂、区域限定、条件触发
 */

class RainbowManager {
    constructor() {
        // 彩虹状态
        this.isActive = false;
        this.startTime = null;
        this.duration = 30; // 游戏内分钟
        this.fadeOutTimer = null;

        // 配置
        this.config = {
            probability: 0.08,        // 8%基础概率
            minDuration: 20,          // 最短20分钟
            maxDuration: 45,          // 最长45分钟
            realTimeDuration: 15000,  // 真实时间15秒
            fadeInTime: 3000,         // 淡入3秒
            fadeOutTime: 3000         // 淡出3秒
        };

        // 室外区域列表
        this.outdoorLocations = new Set([
            '公园', '中央广场', '街道', '学校操场',
            '河边', '湖畔', '山顶', '天台', '花园',
            '森林入口', '海滩', '农田', '露天市场',
            '体育场', '停车场', '阳台'
        ]);

        // 监听天气变化
        this.setupWeatherListener();
    }

    /**
     * 设置天气监听器
     */
    setupWeatherListener() {
        if (window.reactiveSystem) {
            // 监听天气变化
            window.reactiveSystem.watch('environment.weather', (newWeather, oldWeather) => {
                this.onWeatherChange(newWeather, oldWeather);
            });

            // 监听位置变化
            window.reactiveSystem.watch('player.location', (newLocation) => {
                this.onLocationChange(newLocation);
            });
        }
    }

    /**
     * 天气变化时的处理
     */
    onWeatherChange(newWeather, oldWeather) {
        // 检查是否满足彩虹出现条件
        if (this.shouldShowRainbow(newWeather, oldWeather)) {
            this.triggerRainbow();
        }
    }

    /**
     * 位置变化时的处理
     */
    onLocationChange(newLocation) {
        if (this.isActive) {
            // 如果彩虹正在显示，检查新位置是否能看到
            if (!this.isOutdoorLocation(newLocation)) {
                console.log('🌈 进入室内，彩虹不可见');
                this.hideRainbowEffect();
            } else if (!this.rainbowEffectVisible) {
                console.log('🌈 回到室外，彩虹重新可见');
                this.showRainbowEffect();
            }
        }
    }

    /**
     * 判断是否应该显示彩虹
     */
    shouldShowRainbow(newWeather, oldWeather) {
        // 条件1：之前是雨天
        const wasRaining = oldWeather === 'rainy' || oldWeather === 'stormy';

        // 条件2：现在是晴天
        const isSunny = newWeather === 'sunny' || newWeather === 'cloudy';

        // 条件3：在室外
        const isOutdoor = this.isOutdoorLocation(window.gameState?.location);

        // 条件4：概率判定
        const lucky = Math.random() < this.config.probability;

        // 条件5：当前没有彩虹
        const noActiveRainbow = !this.isActive;

        console.log('🌈 彩虹判定：', {
            wasRaining,
            isSunny,
            isOutdoor,
            lucky,
            noActiveRainbow
        });

        return wasRaining && isSunny && isOutdoor && lucky && noActiveRainbow;
    }

    /**
     * 判断是否为室外区域
     */
    isOutdoorLocation(location) {
        if (!location) return false;

        // 检查是否在室外区域列表中
        if (this.outdoorLocations.has(location)) {
            return true;
        }

        // 检查关键词
        const outdoorKeywords = ['室外', '露天', '广场', '公园', '街', '路', '天台'];
        return outdoorKeywords.some(keyword => location.includes(keyword));
    }

    /**
     * 触发彩虹
     */
    triggerRainbow() {
        if (this.isActive) return;

        console.log('🌈 触发彩虹！');

        // 设置状态
        this.isActive = true;
        this.startTime = Date.now();
        this.duration = this.config.minDuration +
                       Math.random() * (this.config.maxDuration - this.config.minDuration);

        // 显示彩虹效果
        this.showRainbowEffect();

        // 显示提示
        this.showRainbowNotification();

        // 设置自动消失
        this.scheduleDisappearance();

        // 触发游戏事件
        this.triggerGameEvent();
    }

    /**
     * 显示彩虹效果
     */
    showRainbowEffect() {
        if (!window.weatherEffectController) return;

        this.rainbowEffectVisible = true;

        // 使用优化后的彩虹效果
        const container = document.createElement('div');
        container.id = 'rainbow-effect-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 50;
            animation: rainbow-appear ${this.config.fadeInTime}ms ease-out forwards;
        `;

        // 创建彩虹光漏
        this.createRainbowLeaks(container);

        document.body.appendChild(container);
    }

    /**
     * 创建彩虹光漏效果
     */
    createRainbowLeaks(container) {
        // 主虹配置（7色）
        const rainbowColors = [
            { color1: '255, 100, 100', color2: '255, 150, 50', opacity: 0.6 },   // 红-橙
            { color1: '255, 200, 50', color2: '255, 255, 100', opacity: 0.55 },  // 橙-黄
            { color1: '200, 255, 100', color2: '100, 255, 150', opacity: 0.5 },  // 黄-绿
            { color1: '100, 255, 200', color2: '100, 200, 255', opacity: 0.5 },  // 绿-青
            { color1: '100, 150, 255', color2: '120, 100, 255', opacity: 0.45 }, // 青-蓝
            { color1: '150, 100, 255', color2: '200, 100, 255', opacity: 0.4 },  // 蓝-靛
            { color1: '255, 100, 200', color2: '255, 150, 255', opacity: 0.35 }  // 靛-紫
        ];

        rainbowColors.forEach((config, index) => {
            const leak = document.createElement('div');

            // 弧形排列
            const angle = -30 + (index * 10);  // 从左上到右下的弧形
            const distance = 30 + (index * 5);

            leak.style.cssText = `
                position: absolute;
                top: ${10 + index * 8}%;
                left: ${5 + index * 12}%;
                width: ${35 - index * 2}%;
                height: ${40 - index * 2}%;
                background: radial-gradient(
                    ellipse at 50% 50%,
                    rgba(${config.color1}, ${config.opacity}) 0%,
                    rgba(${config.color2}, ${config.opacity * 0.7}) 30%,
                    rgba(${config.color1}, ${config.opacity * 0.3}) 60%,
                    transparent 80%
                );
                filter: blur(${25 + index * 3}px);
                transform: rotate(${angle}deg);
                animation: rainbow-float ${8 + index}s ease-in-out infinite;
                mix-blend-mode: screen;
            `;

            container.appendChild(leak);
        });

        // 添加整体光晕
        const glow = document.createElement('div');
        glow.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 120%;
            height: 120%;
            background: radial-gradient(
                ellipse at 30% 30%,
                rgba(255, 255, 255, 0.05) 0%,
                rgba(255, 255, 200, 0.03) 30%,
                transparent 60%
            );
            filter: blur(100px);
        `;
        container.appendChild(glow);
    }

    /**
     * 隐藏彩虹效果（进入室内时）
     */
    hideRainbowEffect() {
        this.rainbowEffectVisible = false;
        const container = document.getElementById('rainbow-effect-container');
        if (container) {
            container.style.display = 'none';
        }
    }

    /**
     * 显示彩虹通知
     */
    showRainbowNotification() {
        // 在E区显示提醒
        if (window.addReminder) {
            window.addReminder('🌈 雨过天晴，一道美丽的彩虹出现在天边！');
        }

        // 显示临时提示
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 30px;
            background: linear-gradient(90deg,
                rgba(255,100,100,0.9),
                rgba(255,200,100,0.9),
                rgba(100,255,100,0.9),
                rgba(100,200,255,0.9),
                rgba(200,100,255,0.9));
            color: white;
            font-size: 18px;
            font-weight: bold;
            border-radius: 30px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: notification-appear 0.5s ease-out;
        `;
        notification.textContent = '🌈 幸运！发现了彩虹！';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * 设置自动消失
     */
    scheduleDisappearance() {
        // 清除旧的定时器
        if (this.fadeOutTimer) {
            clearTimeout(this.fadeOutTimer);
        }

        // 设置新的消失定时器
        this.fadeOutTimer = setTimeout(() => {
            this.endRainbow();
        }, this.config.realTimeDuration);
    }

    /**
     * 结束彩虹 - 使用自然消散效果
     */
    endRainbow() {
        if (!this.isActive) return;

        console.log('🌈 彩虹开始自然消散...');

        // 获取所有彩虹光束
        const container = document.getElementById('rainbow-effect-container');
        if (container) {
            const beams = container.querySelectorAll('[class*="rainbow-beam"]');

            // 如果没有单独的光束元素，就获取所有子元素
            const elements = beams.length > 0 ? beams : container.children;

            // 为每个光束应用自然消散动画
            Array.from(elements).forEach((element, index) => {
                // 三种不同的消散动画，营造自然感
                const disperseAnimations = [
                    'rainbow-disperse-natural-1',
                    'rainbow-disperse-natural-2',
                    'rainbow-disperse-natural-3'
                ];

                const animationName = disperseAnimations[index % 3];
                const duration = 3 + (index * 0.3);  // 3-5秒，错开时间
                const delay = index * 0.1;  // 0-0.7秒延迟，顺序消散

                // 保存原始样式
                const originalAnimation = element.style.animation;

                // 应用消散动画
                element.style.animation = `${animationName} ${duration}s ease-out ${delay}s forwards`;

                // 如果元素没有设置CSS变量，设置默认值
                if (!element.style.getPropertyValue('--opacity')) {
                    const computedStyle = window.getComputedStyle(element);
                    element.style.setProperty('--opacity', computedStyle.opacity || '0.5');
                    element.style.setProperty('--blur-amount', computedStyle.filter.match(/blur\(([^)]+)\)/)?.[1] || '30px');
                }
            });

            // 延迟清理（等待最长的动画完成）
            setTimeout(() => {
                container.remove();
            }, 6000);  // 最长动画时间 + 缓冲
        }

        // 重置状态
        this.isActive = false;
        this.startTime = null;
        this.rainbowEffectVisible = false;

        // 显示消失提示
        if (window.addReminder) {
            window.addReminder('💨 彩虹渐渐消散在天边...');
        }
    }

    /**
     * 触发游戏事件（奖励等）
     */
    triggerGameEvent() {
        // 增加幸运值
        if (window.gameState && window.gameState.character) {
            const oldLuck = window.gameState.character.luck || 0;
            window.gameState.character.luck = Math.min(100, oldLuck + 10);
            console.log('🍀 幸运值 +10');
        }

        // 提升心情
        if (window.gameState && window.gameState.character) {
            const oldMood = window.gameState.character.mood || 50;
            window.gameState.character.mood = Math.min(100, oldMood + 5);
            console.log('😊 心情 +5');
        }

        // 触发成就
        if (window.achievementSystem) {
            window.achievementSystem.unlock('rainbow_seeker');
        }
    }

    /**
     * 手动触发彩虹（测试用）
     */
    forceRainbow() {
        console.log('🌈 强制触发彩虹');
        this.triggerRainbow();
    }

    /**
     * 获取状态
     */
    getStatus() {
        return {
            active: this.isActive,
            remainingTime: this.isActive ?
                Math.max(0, this.config.realTimeDuration - (Date.now() - this.startTime)) : 0,
            location: this.rainbowEffectVisible ? '可见' : '不可见'
        };
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow-appear {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    @keyframes rainbow-disappear {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(1.1);
        }
    }

    /* 自然消散动画1 - 向左上扩散 */
    @keyframes rainbow-disperse-natural-1 {
        0% {
            opacity: var(--opacity, 0.5);
            transform: translate(0, 0) scale(1);
            filter: blur(var(--blur-amount, 30px));
        }
        30% {
            opacity: calc(var(--opacity, 0.5) * 0.8);
            transform: translate(-20px, -10px) scale(1.1);
            filter: blur(calc(var(--blur-amount, 30px) * 1.2));
        }
        60% {
            opacity: calc(var(--opacity, 0.5) * 0.4);
            transform: translate(-50px, -30px) scale(1.3) rotate(5deg);
            filter: blur(calc(var(--blur-amount, 30px) * 1.8));
        }
        100% {
            opacity: 0;
            transform: translate(-100px, -60px) scale(1.5) rotate(10deg);
            filter: blur(calc(var(--blur-amount, 30px) * 3));
        }
    }

    /* 自然消散动画2 - 向右上扩散 */
    @keyframes rainbow-disperse-natural-2 {
        0% {
            opacity: var(--opacity, 0.5);
            transform: translate(0, 0) scale(1);
            filter: blur(var(--blur-amount, 30px));
        }
        35% {
            opacity: calc(var(--opacity, 0.5) * 0.7);
            transform: translate(15px, -20px) scale(1.15);
            filter: blur(calc(var(--blur-amount, 30px) * 1.3));
        }
        70% {
            opacity: calc(var(--opacity, 0.5) * 0.3);
            transform: translate(40px, -50px) scale(1.4) rotate(-8deg);
            filter: blur(calc(var(--blur-amount, 30px) * 2));
        }
        100% {
            opacity: 0;
            transform: translate(80px, -90px) scale(1.6) rotate(-15deg);
            filter: blur(calc(var(--blur-amount, 30px) * 4));
        }
    }

    /* 自然消散动画3 - 向下扩散 */
    @keyframes rainbow-disperse-natural-3 {
        0% {
            opacity: var(--opacity, 0.5);
            transform: translate(0, 0) scale(1);
            filter: blur(var(--blur-amount, 30px));
        }
        25% {
            opacity: calc(var(--opacity, 0.5) * 0.85);
            transform: translate(10px, 15px) scale(1.05);
            filter: blur(calc(var(--blur-amount, 30px) * 1.1));
        }
        50% {
            opacity: calc(var(--opacity, 0.5) * 0.5);
            transform: translate(30px, 40px) scale(1.25) rotate(7deg);
            filter: blur(calc(var(--blur-amount, 30px) * 1.6));
        }
        100% {
            opacity: 0;
            transform: translate(70px, 80px) scale(1.7) rotate(12deg);
            filter: blur(calc(var(--blur-amount, 30px) * 3.5));
        }
    }

    @keyframes rainbow-float {
        0%, 100% {
            transform: translate(0, 0);
        }
        50% {
            transform: translate(10px, -10px);
        }
    }

    @keyframes notification-appear {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
`;
document.head.appendChild(style);

// 创建全局实例
window.rainbowManager = new RainbowManager();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RainbowManager;
}