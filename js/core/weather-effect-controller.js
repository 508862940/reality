/**
 * Reality游戏 - 天气特效控制器 v2.0
 * 动态生成和管理6种天气的视觉特效
 * 版本：2.0
 * 日期：2025-10-04
 *
 * 功能：
 * - 动态创建/移除特效DOM元素
 * - 粒子数量自适应（根据性能）
 * - 特效强度控制
 * - 平滑过渡和清理
 *
 * 支持特效：
 * - sakura: 樱花飘落（粉色+白色花瓣）
 * - rainbow: 雨后彩虹（发光透明渐变）
 * - meteor_shower: 流星雨（弧形轨迹）
 * - polluted: 污染雾霾（灰尘+雾气）
 * - rainy: 雨天（雨滴下落）
 * - snowy: 雪天（雪花飘落）
 */

class WeatherEffectController {
    constructor() {
        this.currentEffect = null;
        this.effectContainer = null;
        this.particles = [];
        this.animationFrame = null;
        this.meteorInterval = null;
        this.lightningInterval = null;  // 闪电定时器
        this.rainbowTimeout = null;     // 彩虹自动消失定时器

        // 性能配置
        this.performanceLevel = this.detectPerformance();
        this.particleCounts = {
            low: {
                sakura: 20,
                meteor: 3,
                polluted: 15,
                stars: 40,
                rain: 50,
                storm: 150,    // v3.0: 暴雨（3倍密度）
                snow: 30
            },
            medium: {
                sakura: 40,
                meteor: 5,
                polluted: 25,
                stars: 80,
                rain: 100,
                storm: 300,    // v3.0: 暴雨（3倍密度）
                snow: 60
            },
            high: {
                sakura: 60,
                meteor: 8,
                polluted: 35,
                stars: 120,
                rain: 150,
                storm: 450,    // v3.0: 暴雨（3倍密度）
                snow: 90
            }
        };
    }

    /**
     * 检测设备性能等级
     */
    detectPerformance() {
        const cores = navigator.hardwareConcurrency || 2;
        if (cores >= 8) return 'high';
        if (cores >= 4) return 'medium';
        return 'low';
    }

    /**
     * 显示特效
     * @param {string} effectType - 特效类型
     * @param {number} intensity - 强度 0-1
     */
    showEffect(effectType, intensity = 1.0) {
        console.log(`🎨 showEffect被调用: ${effectType}, 强度: ${intensity}`);

        // 🔥 修复：立即停止当前特效，不使用异步消散动画
        this.removeEffect(true);  // immediate = true，强制立即停止

        this.currentEffect = effectType;
        console.log(`✅ currentEffect已设置: ${this.currentEffect}`);

        this.createEffectContainer(effectType);
        console.log(`✅ 效果容器已创建`);

        switch (effectType) {
            case 'sakura':
                this.createSakuraEffect(intensity);
                break;
            case 'rainbow':
                console.log(`🌈 准备调用createRainbowEffect...`);
                this.createRainbowEffect(intensity);
                console.log(`🌈 createRainbowEffect调用完成`);
                break;
            case 'meteor_shower':
                this.createMeteorEffect(intensity);
                break;
            case 'polluted':
                this.createPollutedEffect(intensity);
                break;
            case 'rainy':
                this.createRainyEffect(intensity, false);  // v3.0: 普通雨，无闪电
                break;
            case 'stormy':
                this.createRainyEffect(intensity, true);   // v3.0: 暴雨+闪电
                break;
            case 'snowy':
                this.createSnowyEffect(intensity);
                break;
            default:
                console.warn('未知的天气特效类型:', effectType);
        }

        this.effectContainer.classList.add('weather-effect-fade-in');
    }

    /**
     * 移除当前特效
     */
    removeEffect(immediate = false) {
        if (!this.effectContainer) {
            console.log('⚠️ removeEffect: 容器不存在，跳过移除');
            return;
        }
        console.log(`🗑️ removeEffect被调用: ${this.currentEffect}, immediate: ${immediate}`);

        // 彩虹使用特殊的自然消散动画
        if (this.currentEffect === 'rainbow') {
            this.removeRainbowWithDisperse();
            return;
        }

        // 雨天使用渐弱消散（自然停止）
        if ((this.currentEffect === 'rainy' || this.currentEffect === 'stormy') && !immediate) {
            this.removeRainWithFadeOut();
            return;
        }

        // 🔥 立即停止：直接删除DOM，不使用动画
        if (immediate) {
            console.log('💥 立即删除特效（无动画）');
            if (this.effectContainer && this.effectContainer.parentNode) {
                this.effectContainer.parentNode.removeChild(this.effectContainer);
            }
            this.effectContainer = null;
            this.particles = [];
            this.currentEffect = null;

            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
            }

            if (this.meteorInterval) {
                clearTimeout(this.meteorInterval);
                this.meteorInterval = null;
            }

            if (this.lightningInterval) {
                clearTimeout(this.lightningInterval);
                this.lightningInterval = null;
            }
            return;
        }

        // 渐隐停止：使用淡出动画
        this.effectContainer.classList.add('weather-effect-fade-out');

        setTimeout(() => {
            if (this.effectContainer && this.effectContainer.parentNode) {
                this.effectContainer.parentNode.removeChild(this.effectContainer);
            }
            this.effectContainer = null;
            this.particles = [];
            this.currentEffect = null;

            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
            }

            if (this.meteorInterval) {
                clearTimeout(this.meteorInterval);  // v3.0: 改用setTimeout
                this.meteorInterval = null;
            }

            if (this.lightningInterval) {
                clearTimeout(this.lightningInterval);  // v3.0: 清除闪电定时器
                this.lightningInterval = null;
            }
        }, 1000);
    }

    /**
     * 🌈 彩虹自然消散
     */
    removeRainbowWithDisperse() {
        if (!this.effectContainer) return;

        console.log('🌈 彩虹开始自然消散...');

        // 清除自动消失定时器
        if (this.rainbowTimeout) {
            clearTimeout(this.rainbowTimeout);
            this.rainbowTimeout = null;
        }

        // 找到所有光漏元素
        const lightLeaks = this.effectContainer.querySelectorAll('.rainbow-light-leak');

        // 为每个光漏应用不同的消散动画
        const disperseAnimations = ['rainbow-disperse-natural-1', 'rainbow-disperse-natural-2', 'rainbow-disperse-natural-3'];

        lightLeaks.forEach((leak, index) => {
            // 移除原有动画
            leak.style.animation = '';

            // 应用消散动画（循环使用3种动画）
            const animationName = disperseAnimations[index % 3];
            leak.style.animation = `${animationName} 3s ease-out forwards`;
        });

        // 3秒后清理容器
        setTimeout(() => {
            if (this.effectContainer && this.effectContainer.parentNode) {
                this.effectContainer.parentNode.removeChild(this.effectContainer);
            }
            this.effectContainer = null;
            this.particles = [];
            this.currentEffect = null;
        }, 3000);
    }

    /**
     * 🌧️ 雨天渐弱消散
     */
    removeRainWithFadeOut() {
        if (!this.effectContainer) return;

        console.log('🌧️ 雨天开始渐弱消散...');

        // 清除闪电
        if (this.lightningInterval) {
            clearTimeout(this.lightningInterval);
            this.lightningInterval = null;
        }

        const rainDrops = this.effectContainer.querySelectorAll('.rain-drop');
        const totalDrops = rainDrops.length;

        // 分3个阶段逐渐减少雨滴
        const stage1Time = 1000; // 1秒后移除1/3
        const stage2Time = 2000; // 2秒后再移除1/3
        const stage3Time = 3000; // 3秒后移除剩余

        // 阶段1：移除1/3的雨滴
        setTimeout(() => {
            const removeCount = Math.floor(totalDrops / 3);
            for (let i = 0; i < removeCount; i++) {
                if (rainDrops[i]) {
                    rainDrops[i].style.opacity = '0';
                    rainDrops[i].style.transition = 'opacity 0.5s';
                }
            }
        }, stage1Time);

        // 阶段2：再移除1/3
        setTimeout(() => {
            const removeCount = Math.floor(totalDrops / 3);
            for (let i = removeCount; i < removeCount * 2; i++) {
                if (rainDrops[i]) {
                    rainDrops[i].style.opacity = '0';
                    rainDrops[i].style.transition = 'opacity 0.5s';
                }
            }
        }, stage2Time);

        // 阶段3：移除剩余并清理
        setTimeout(() => {
            if (this.effectContainer && this.effectContainer.parentNode) {
                this.effectContainer.parentNode.removeChild(this.effectContainer);
            }
            this.effectContainer = null;
            this.particles = [];
            this.currentEffect = null;
        }, stage3Time + 500);
    }

    /**
     * 创建特效容器
     */
    createEffectContainer(effectType) {
        this.effectContainer = document.createElement('div');
        this.effectContainer.className = `weather-effect-${effectType.replace('_', '-')}`;
        this.effectContainer.setAttribute('aria-hidden', 'true');
        document.body.appendChild(this.effectContainer);
    }

    /**
     * 🌸 创建樱花飘落特效 v2.0
     * 增加白色小花瓣（15%概率）
     */
    createSakuraEffect(intensity) {
        const count = Math.floor(
            this.particleCounts[this.performanceLevel].sakura * intensity
        );

        for (let i = 0; i < count; i++) {
            const petal = document.createElement('div');
            petal.className = 'sakura-petal';

            // 15%概率生成白色花瓣
            if (Math.random() < 0.15) {
                petal.classList.add('white');
            }

            // 随机大小
            const sizes = ['small', 'medium', 'large'];
            petal.classList.add(sizes[Math.floor(Math.random() * sizes.length)]);

            // 随机位置
            petal.style.left = `${Math.random() * 100}%`;

            // 随机延迟和时长
            petal.style.animationDelay = `${Math.random() * 10}s`;
            petal.style.animationDuration = `${8 + Math.random() * 7}s`;

            // 随机漂移
            const driftX = -50 + Math.random() * 100;
            petal.style.setProperty('--drift-x', `${driftX}px`);

            this.effectContainer.appendChild(petal);
            this.particles.push(petal);
        }

        console.log(`🌸 樱花特效已创建：${count}片花瓣`);
    }

    /**
     * 🌈 创建雨后彩虹特效 v5.2
     * 柔和渐现 + 自然消散优化版
     */
    createRainbowEffect(intensity) {
        console.log('创建彩虹效果 v5.2');

        const container = document.createElement('div');
        container.className = 'rainbow-container';
        container.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            pointer-events: none;
        `;

        // 创建光漏配置 - 减少模糊，提高透明度
        const lightLeaks = [
            {
                top: '5%', left: '10%', width: '35%', height: '45%',
                color1: '255, 100, 100', color2: '255, 180, 80',
                blur: 20, opacity: 0.75, delay: 0
            },
            {
                top: '0%', left: '35%', width: '40%', height: '40%',
                color1: '255, 220, 100', color2: '255, 255, 150',
                blur: 22, opacity: 0.7, delay: 300
            },
            {
                top: '8%', right: '10%', width: '45%', height: '50%',
                color1: '100, 255, 150', color2: '150, 255, 200',
                blur: 25, opacity: 0.65, delay: 600
            },
            {
                top: '15%', left: '25%', width: '50%', height: '35%',
                color1: '150, 150, 255', color2: '200, 100, 255',
                blur: 18, opacity: 0.6, delay: 900
            },
            {
                bottom: '20%', right: '15%', width: '30%', height: '40%',
                color1: '180, 100, 255', color2: '255, 100, 200',
                blur: 20, opacity: 0.55, delay: 1200
            }
        ];

        // 渐进式创建光漏
        lightLeaks.forEach((leak, index) => {
            setTimeout(() => {
                const element = document.createElement('div');
                element.className = 'rainbow-light-leak';

                let posStyle = '';
                if (leak.top) posStyle += `top: ${leak.top};`;
                if (leak.bottom) posStyle += `bottom: ${leak.bottom};`;
                if (leak.left) posStyle += `left: ${leak.left};`;
                if (leak.right) posStyle += `right: ${leak.right};`;

                element.style.cssText = `
                    position: absolute;
                    ${posStyle}
                    width: ${leak.width};
                    height: ${leak.height};
                    border-radius: 50%;
                    background: radial-gradient(ellipse at center,
                        rgba(${leak.color1}, ${leak.opacity * intensity}) 0%,
                        rgba(${leak.color2}, ${leak.opacity * intensity * 0.7}) 40%,
                        transparent 70%);
                    filter: blur(${leak.blur}px);
                    mix-blend-mode: screen;
                    opacity: 0;
                    animation: rainbow-fade-in 2s ease-out forwards;
                `;

                element.style.setProperty('--blur', `${leak.blur}px`);
                element.style.setProperty('--base-opacity', leak.opacity * intensity);

                container.appendChild(element);
            }, leak.delay);
        });

        this.effectContainer.appendChild(container);

        // 调试：检查所有创建的元素
        const leakCount = container.querySelectorAll('.rainbow-leak').length;
        const bandCount = container.querySelectorAll('.alexander-dark-band').length;
        console.log(`🌈 彩虹特效v3.0已创建：${leakCount}个光漏 + ${bandCount}个暗带`);
        console.log('彩虹容器:', container);
        console.log('效果容器:', this.effectContainer);

        // 清除之前的彩虹定时器
        console.log('🔍 检查旧定时器:', this.rainbowTimeout);
        if (this.rainbowTimeout) {
            clearTimeout(this.rainbowTimeout);
            this.rainbowTimeout = null;
            console.log('✅ 旧定时器已清除');
        }

        // 设置15-20秒后自动消散
        const duration = 15000 + Math.random() * 5000; // 15-20秒随机
        console.log(`🌈 彩虹将在 ${Math.round(duration/1000)} 秒后自然消散`);

        this.rainbowTimeout = setTimeout(() => {
            console.log('⏰ 定时器触发! currentEffect:', this.currentEffect);
            if (this.currentEffect === 'rainbow') {
                console.log('🌈 彩虹自动消散时间到');
                this.removeEffect();
            } else {
                console.log('❌ currentEffect不是rainbow，跳过消散');
            }
        }, duration);

        console.log('✅ 定时器已设置, ID:', this.rainbowTimeout);
    }

    /**
     * 创建主虹光漏（外红内紫）- 深色背景优化版
     */
    createPrimaryRainbow(parent, intensity) {
        console.log('createPrimaryRainbow called with intensity:', intensity);
        console.log('parent element:', parent);

        const leaks = [
            // 左上角：红色→橙色（主虹外侧，红端）
            {
                top: -10, left: -10, width: 40, height: 50,
                colorStart: '255, 120, 120', colorEnd: '255, 180, 60',
                blur: 35, opacity: 0.65, duration: 8
            },
            // 右上角：黄色→绿色（主虹中段）
            {
                top: -5, right: -10, width: 45, height: 55,
                colorStart: '255, 235, 120', colorEnd: '120, 255, 180',
                blur: 40, opacity: 0.6, duration: 10
            },
            // 右下角：蓝色→靛色（主虹内侧）
            {
                bottom: -10, right: -5, width: 50, height: 60,
                colorStart: '120, 220, 255', colorEnd: '100, 130, 255',
                blur: 50, opacity: 0.55, duration: 12
            },
            // 左下角：紫色→粉色（主虹最内侧，紫端）
            {
                bottom: -15, left: -8, width: 42, height: 48,
                colorStart: '180, 130, 255', colorEnd: '255, 180, 220',
                blur: 45, opacity: 0.5, duration: 14
            }
        ];

        leaks.forEach((config, index) => {
            console.log(`Creating primary leak ${index + 1}`, config);

            const leak = document.createElement('div');
            leak.className = `rainbow-leak rainbow-primary-${index + 1}`;

            // 位置和尺寸
            let posStyle = '';
            if (config.top !== undefined) posStyle += `top: ${config.top}%;`;
            if (config.bottom !== undefined) posStyle += `bottom: ${config.bottom}%;`;
            if (config.left !== undefined) posStyle += `left: ${config.left}%;`;
            if (config.right !== undefined) posStyle += `right: ${config.right}%;`;

            leak.style.cssText = `
                position: absolute;
                ${posStyle}
                width: ${config.width}%;
                height: ${config.height}%;
                background: radial-gradient(
                    ellipse at ${30 + index * 10}% ${30 + index * 10}%,
                    rgba(${config.colorStart}, ${config.opacity * intensity}) 0%,
                    rgba(${config.colorEnd}, ${config.opacity * intensity * 0.6}) 40%,
                    transparent 70%
                );
                filter: blur(${config.blur}px);
                animation: rainbow-primary-drift ${config.duration}s ease-in-out infinite;
            `;

            parent.appendChild(leak);
            console.log(`Primary leak ${index + 1} appended to parent`);
        });
    }

    /**
     * 创建副虹光漏（外紫内红，颜色反向）- 深色背景优化版
     */
    createSecondaryRainbow(parent, intensity) {
        const leaks = [
            // 左上角外侧：紫色→蓝色（副虹外侧，紫端）
            {
                top: -15, left: -15, width: 35, height: 40,
                colorStart: '180, 130, 255', colorEnd: '120, 220, 255',
                blur: 50, opacity: 0.35, duration: 10
            },
            // 右上角外侧：绿色→黄色（副虹中段）
            {
                top: -8, right: -15, width: 38, height: 45,
                colorStart: '120, 255, 180', colorEnd: '255, 235, 120',
                blur: 55, opacity: 0.3, duration: 12
            },
            // 右侧：橙色→红色（副虹内侧，红端）
            {
                top: 10, right: -10, width: 40, height: 50,
                colorStart: '255, 180, 60', colorEnd: '255, 120, 120',
                blur: 60, opacity: 0.28, duration: 14
            },
            // 上方中央：淡蓝→淡紫（副虹补充）
            {
                top: -5, left: 30, width: 30, height: 35,
                colorStart: '200, 230, 255', colorEnd: '230, 200, 255',
                blur: 58, opacity: 0.25, duration: 16
            }
        ];

        leaks.forEach((config, index) => {
            const leak = document.createElement('div');
            leak.className = `rainbow-leak rainbow-secondary-${index + 1}`;

            // 位置和尺寸
            let posStyle = '';
            if (config.top !== undefined) posStyle += `top: ${config.top}%;`;
            if (config.left !== undefined) posStyle += `left: ${config.left}%;`;
            if (config.right !== undefined) posStyle += `right: ${config.right}%;`;

            leak.style.cssText = `
                position: absolute;
                ${posStyle}
                width: ${config.width}%;
                height: ${config.height}%;
                background: radial-gradient(
                    ellipse at ${40 + index * 15}% ${25 + index * 10}%,
                    rgba(${config.colorStart}, ${config.opacity * intensity}) 0%,
                    rgba(${config.colorEnd}, ${config.opacity * intensity * 0.5}) 35%,
                    transparent 65%
                );
                filter: blur(${config.blur}px);
                animation: rainbow-secondary-drift ${config.duration}s ease-in-out infinite;
            `;

            parent.appendChild(leak);
        });
    }

    /**
     * 创建亚历山大暗带（主虹和副虹之间的暗区）
     * 深色背景优化：使用微弱提亮而非压暗
     */
    createDarkBand(parent, intensity) {
        const band = document.createElement('div');
        band.className = 'alexander-dark-band';
        band.style.cssText = `
            position: absolute;
            top: 15%;
            left: 0;
            width: 100%;
            height: 25%;
            background: rgba(255, 255, 255, ${0.02 * intensity});
            backdrop-filter: brightness(1.05) saturate(0.9);
            -webkit-backdrop-filter: brightness(1.05) saturate(0.9);
            animation: dark-band-pulse 6s ease-in-out infinite;
            pointer-events: none;
        `;
        parent.appendChild(band);
    }

    /**
     * 🌠 创建流星雨特效 v3.0 - 基于真实物理规律
     * - 辐射点系统（左上角20%, 15%）
     * - 随机生成间隔（1-3秒）
     * - 速度分层（快流星短轨迹，慢流星长轨迹）
     * - 彩色流星（80%白+20%彩色）
     */
    createMeteorEffect(intensity) {
        // 星空背景
        const starsContainer = document.createElement('div');
        starsContainer.className = 'meteor-stars';
        this.effectContainer.appendChild(starsContainer);

        // 创建背景星星
        const starCount = Math.floor(
            this.particleCounts[this.performanceLevel].stars * intensity
        );

        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 3}s`;
            starsContainer.appendChild(star);
        }

        // 创建初始流星
        const meteorCount = Math.floor(
            this.particleCounts[this.performanceLevel].meteor * intensity
        );

        for (let i = 0; i < meteorCount; i++) {
            setTimeout(() => this.createMeteor(), i * 500);
        }

        // 持续生成新流星（随机间隔1-3秒）
        const scheduleNextMeteor = () => {
            const interval = 1000 + Math.random() * 2000;  // 1-3秒随机
            this.meteorInterval = setTimeout(() => {
                this.createMeteor();
                scheduleNextMeteor();  // 递归调度下一颗
            }, interval);
        };
        scheduleNextMeteor();

        console.log(`🌠 流星雨特效已创建（v3.0物理规律）：${meteorCount}颗初始流星 + ${starCount}颗星星`);
    }

    /**
     * 创建单个流星（v3.0 - 基于辐射点的真实物理模拟）
     */
    createMeteor() {
        if (!this.effectContainer) return;

        const meteor = document.createElement('div');
        meteor.className = 'meteor';

        // 辐射点位置（左上角）
        const radiantX = 20;
        const radiantY = 15;

        // 从辐射点附近随机偏移出发
        const startX = radiantX + (Math.random() - 0.5) * 10;  // ±5%偏移
        const startY = radiantY + (Math.random() - 0.5) * 10;
        meteor.style.left = `${startX}%`;
        meteor.style.top = `${startY}%`;

        // 速度分层：快流星 vs 慢流星
        const isFast = Math.random() > 0.5;
        const speed = isFast ?
            0.75 + Math.random() * 0.25 :  // 快速：0.75-1.0
            0.4 + Math.random() * 0.35;    // 慢速：0.4-0.75

        // 轨迹长度与速度联动
        const distance = isFast ?
            400 + Math.random() * 500 :  // 快流星：长轨迹（400-900px）
            150 + Math.random() * 300;   // 慢流星：短轨迹（150-450px）

        // 持续时间与速度反比
        const duration = isFast ?
            0.8 + Math.random() * 1.2 :  // 快流星：0.8-2秒
            2.5 + Math.random() * 1.5;   // 慢流星：2.5-4秒

        // 从辐射点向外辐射（右下方扇形区域）
        const angle = Math.random() * 120 - 60;  // ±60度扇形范围
        const radians = (angle + 45) * Math.PI / 180;  // +45度=右下方基准

        // 计算终点坐标
        const meteorX = distance * Math.cos(radians);
        const meteorY = distance * Math.sin(radians);
        meteor.style.setProperty('--meteor-x', `${meteorX}px`);
        meteor.style.setProperty('--meteor-y', `${meteorY}px`);
        meteor.style.setProperty('--duration', `${duration}s`);

        // 流星颜色（80%白+20%彩色）
        const color = this.getMeteorColor();
        meteor.style.setProperty('--meteor-color', color.core);
        meteor.style.setProperty('--meteor-glow', color.glow);
        meteor.style.setProperty('--meteor-trail', color.trail);

        this.effectContainer.appendChild(meteor);
        this.particles.push(meteor);

        // 动画结束后移除
        setTimeout(() => {
            if (meteor.parentNode) {
                meteor.parentNode.removeChild(meteor);
            }
            const index = this.particles.indexOf(meteor);
            if (index > -1) {
                this.particles.splice(index, 1);
            }
        }, duration * 1000);
    }

    /**
     * 获取流星颜色（基于化学成分）
     * 80%白色（高速流星）+ 20%彩色（化学元素）
     */
    getMeteorColor() {
        const rand = Math.random();

        if (rand < 0.8) {
            // 80%白色（主要）
            return {
                core: '#ffffff',
                glow: 'rgba(255, 255, 255, 0.9)',
                trail: 'rgba(255, 255, 255, 0.8)'
            };
        } else if (rand < 0.85) {
            // 5%蓝绿色（镁）
            return {
                core: '#7dd3fc',
                glow: 'rgba(125, 211, 252, 0.7)',
                trail: 'rgba(125, 211, 252, 0.5)'
            };
        } else if (rand < 0.9) {
            // 5%橘黄色（钠）
            return {
                core: '#fbbf24',
                glow: 'rgba(251, 191, 36, 0.7)',
                trail: 'rgba(251, 191, 36, 0.5)'
            };
        } else {
            // 10%淡蓝色（微弱蓝光）
            return {
                core: '#e0f2fe',
                glow: 'rgba(224, 242, 254, 0.6)',
                trail: 'rgba(224, 242, 254, 0.4)'
            };
        }
    }

    /**
     * ☢️ 创建污染雾霾特效 v2.0
     * 参考污染天演示.html
     */
    createPollutedEffect(intensity) {
        // 全局暗化滤镜
        const overlay = document.createElement('div');
        overlay.className = 'polluted-overlay';
        overlay.style.opacity = intensity;
        this.effectContainer.appendChild(overlay);

        // 3层雾气（多层叠加营造深度）
        for (let i = 0; i < 3; i++) {
            const fog = document.createElement('div');
            fog.className = 'polluted-fog';
            fog.style.animationDelay = `${-i * 10}s`;
            this.effectContainer.appendChild(fog);
        }

        // 灰尘粒子
        const particleCount = Math.floor(
            this.particleCounts[this.performanceLevel].polluted * intensity
        );

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'dust-particle';

            // 随机位置
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${110 + Math.random() * 10}%`;

            // 随机延迟和时长
            particle.style.animationDelay = `${Math.random() * 10}s`;
            particle.style.animationDuration = `${15 + Math.random() * 10}s`;

            // 随机漂移
            const driftX = -30 + Math.random() * 60;
            particle.style.setProperty('--drift-x', `${driftX}px`);

            this.effectContainer.appendChild(particle);
            this.particles.push(particle);
        }

        console.log(`☢️ 污染雾霾特效已创建：${particleCount}个灰尘粒子`);
    }

    /**
     * 🌧️ 创建雨天特效 v3.0
     * @param {number} intensity - 强度
     * @param {boolean} isStorm - 是否为暴雨（带闪电）
     */
    createRainyEffect(intensity, isStorm = false) {
        // 选择粒子数（普通雨 vs 暴雨）
        const particleType = isStorm ? 'storm' : 'rain';
        const count = Math.floor(
            this.particleCounts[this.performanceLevel][particleType] * intensity
        );

        // 渐强效果：分3批添加雨滴
        const batch1 = Math.floor(count * 0.3); // 30%
        const batch2 = Math.floor(count * 0.3); // 30%
        const batch3 = count - batch1 - batch2;  // 40%

        // 第1批：立即添加（小雨）
        this.createRainBatch(batch1, isStorm, 0, 0.3);

        // 第2批：1秒后添加（中雨）
        setTimeout(() => {
            this.createRainBatch(batch2, isStorm, 1000, 0.6);
        }, 1000);

        // 第3批：2秒后添加（大雨）
        setTimeout(() => {
            this.createRainBatch(batch3, isStorm, 2000, 1.0);
        }, 2000);

        // v3.0: 如果是暴雨，2秒后启动闪电效果
        if (isStorm) {
            setTimeout(() => {
                this.startLightning();
            }, 2000);
            console.log(`⛈️ 暴雨特效已创建：${count}个雨滴（渐强3秒） + 闪电效果`);
        } else {
            console.log(`🌧️ 雨天特效已创建：${count}个雨滴（渐强2秒）`);
        }
    }

    /**
     * 创建一批雨滴
     */
    createRainBatch(count, isStorm, delayOffset, opacityFactor) {
        if (!this.effectContainer) return;

        for (let i = 0; i < count; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';

            // 暴雨：粗大雨滴，快速，倾斜
            if (isStorm) {
                drop.classList.add('storm');
            } else {
                // 普通雨：细雨，随机强度
                const rand = Math.random();
                if (rand < 0.2) {
                    drop.classList.add('light');
                } else if (rand > 0.8) {
                    drop.classList.add('heavy');
                }
            }

            // 🌂 雨伞遮挡：检查是否有伞
            const hasUmbrella = this.checkUmbrella();
            const isPWA = this.isPWAMode();
            let leftPosition;

            if (hasUmbrella) {
                if (isPWA) {
                    // 🎮 PWA模式：有伞时完全不创建雨滴（跳过）
                    drop.remove();
                    continue;
                } else {
                    // 🌐 网页模式：有伞时避开屏幕中央区域
                    // 伞的遮挡区域：屏幕中央40%-60%
                    const isLeftSide = Math.random() < 0.5;
                    if (isLeftSide) {
                        leftPosition = Math.random() * 40;  // 0-40%
                    } else {
                        leftPosition = 60 + Math.random() * 40;  // 60-100%
                    }
                }
            } else {
                // 无伞：随机位置
                leftPosition = Math.random() * 100;
            }

            drop.style.left = `${leftPosition}%`;

            // 速度
            const baseDuration = isStorm ? 0.2 : 0.3;  // 暴雨更快
            const randomDuration = Math.random() * 0.4;
            drop.style.animationDelay = `${Math.random() * 2}s`;
            drop.style.animationDuration = `${baseDuration + randomDuration}s`;

            // 初始透明度（渐强效果）
            drop.style.opacity = '0';
            drop.style.transition = 'opacity 1s ease-in';

            this.effectContainer.appendChild(drop);
            this.particles.push(drop);

            // 延迟显示（实现渐强）
            setTimeout(() => {
                if (drop.parentNode) {
                    drop.style.opacity = opacityFactor;
                }
            }, 50 + i * 10); // 每个雨滴错开10ms
        }
    }

    /**
     * ⚡ 启动闪电效果（20-30秒随机间隔）
     */
    startLightning() {
        const scheduleLightning = () => {
            const interval = 20000 + Math.random() * 10000;  // 20-30秒
            this.lightningInterval = setTimeout(() => {
                this.createLightning();
                scheduleLightning();  // 递归调度下一次
            }, interval);
        };

        // 首次闪电延迟5-10秒
        setTimeout(() => {
            this.createLightning();
            scheduleLightning();
        }, 5000 + Math.random() * 5000);
    }

    /**
     * ⚡ 创建单次闪电（混合方案：全屏闪光+简化纹理）
     */
    createLightning() {
        if (!this.effectContainer) return;

        // 1. 全屏闪光层
        const flash = document.createElement('div');
        flash.className = 'lightning-flash';
        this.effectContainer.appendChild(flash);

        // 2. 闪电纹理（随机位置）
        const bolt = document.createElement('div');
        bolt.className = 'lightning-bolt';
        bolt.style.left = `${30 + Math.random() * 40}%`;  // 30-70%随机位置
        this.effectContainer.appendChild(bolt);

        // 300ms后自动移除
        setTimeout(() => {
            if (flash.parentNode) flash.parentNode.removeChild(flash);
            if (bolt.parentNode) bolt.parentNode.removeChild(bolt);
        }, 300);

        console.log('⚡ 闪电！');
    }

    /**
     * ❄️ 创建雪天特效
     */
    createSnowyEffect(intensity) {
        const count = Math.floor(
            this.particleCounts[this.performanceLevel].snow * intensity
        );

        for (let i = 0; i < count; i++) {
            const flake = document.createElement('div');
            flake.className = 'snow-flake';

            // 随机大小
            const sizes = ['small', 'medium', 'large'];
            flake.classList.add(sizes[Math.floor(Math.random() * sizes.length)]);

            // 随机位置
            flake.style.left = `${Math.random() * 100}%`;

            // 随机延迟和速度
            flake.style.animationDelay = `${Math.random() * 10}s`;
            flake.style.animationDuration = `${10 + Math.random() * 5}s`;

            this.effectContainer.appendChild(flake);
            this.particles.push(flake);
        }

        console.log(`❄️ 雪天特效已创建：${count}片雪花`);
    }

    /**
     * 更新特效强度
     */
    updateIntensity(intensity) {
        if (!this.effectContainer) return;

        if (this.currentEffect === 'rainbow' || this.currentEffect === 'polluted') {
            this.effectContainer.style.opacity = intensity;
        } else {
            const currentType = this.currentEffect;
            this.showEffect(currentType, intensity);
        }
    }

    /**
     * 获取当前特效信息
     */
    getEffectInfo() {
        return {
            type: this.currentEffect,
            particleCount: this.particles.length,
            performanceLevel: this.performanceLevel,
            isActive: this.effectContainer !== null
        };
    }

    /**
     * 🆕 更新天气特效可见性 v2.0
     * 根据visibilityConditions自动判断可见性和强度
     */
    updateVisibility() {
        // 🔥 关键修复：即使容器不存在，也要检查是否应该重新创建
        if (!this.currentEffect) {
            console.log('⚠️ updateVisibility: 没有当前特效，跳过');
            return;
        }

        const weatherType = this.currentEffect;

        // 如果容器不存在，记录状态
        const containerExists = !!this.effectContainer;
        if (!containerExists) {
            console.log(`📦 updateVisibility: 容器不存在，检查是否需要重新创建 (${weatherType})`);
        }

        // 从天气系统获取当前天气配置
        const weatherConfig = window.weatherSystem?.weatherTypes?.[weatherType];
        if (!weatherConfig) {
            console.warn(`⚠️ 未找到天气配置: ${weatherType}`);
            return;
        }

        // 获取可见性条件
        const visConditions = weatherConfig.visibilityConditions;
        if (!visConditions) {
            // 没有可见性条件，保持可见
            this.setEffectVisibility(true, 1.0);
            return;
        }

        // 获取当前上下文
        const currentLocation = window.worldState?.state?.character?.location || '';
        const currentLocationMeta = this.getLocationMetadata(currentLocation);

        // 1. 检查outdoor限制
        if (visConditions.outdoor === true && currentLocationMeta.isIndoor) {
            // 检查是否穿透室内
            if (!visConditions.penetrates_indoor) {
                console.log(`🏠 ${weatherType}特效：室内不可见`);
                this.setEffectVisibility(false);
                return;
            }
        }

        // 2. 检查sky_visible限制（彩虹、流星雨需要）
        if (visConditions.sky_visible === true && !currentLocationMeta.skyVisible) {
            console.log(`🏢 ${weatherType}特效：天空被遮挡，不可见`);
            this.setEffectVisibility(false);
            return;
        }

        // 3. 检查locations条件
        if (visConditions.locations) {
            const { enhanced, visible, hidden } = visConditions.locations;

            // 检查hidden（优先级最高）
            if (hidden && this.locationMatches(currentLocation, hidden)) {
                console.log(`🚫 ${weatherType}特效：当前位置被隐藏 (${currentLocation})`);
                this.setEffectVisibility(false);
                return;
            }

            // 检查enhanced（增强区域）
            if (enhanced && this.locationMatches(currentLocation, enhanced)) {
                console.log(`✨ ${weatherType}特效：增强区域 (${currentLocation})`);
                this.setEffectVisibility(true, 1.5);  // 150%强度
                return;
            }

            // 检查visible（普通可见区域）
            if (visible) {
                if (visible.includes('all_outdoor') && !currentLocationMeta.isIndoor) {
                    // 所有户外可见
                    this.setEffectVisibility(true, 1.0);
                    return;
                } else if (this.locationMatches(currentLocation, visible)) {
                    console.log(`👁️ ${weatherType}特效：可见区域 (${currentLocation})`);
                    this.setEffectVisibility(true, 1.0);
                    return;
                }
            }

            // 如果定义了locations但都不匹配，默认隐藏
            console.log(`❌ ${weatherType}特效：不在可见区域内`);
            this.setEffectVisibility(false);
            return;
        }

        // 4. 检查weather_required（流星雨需要晴天）
        if (visConditions.weather_required) {
            const currentWeather = window.weatherSystem?.currentWeather;
            if (!visConditions.weather_required.includes(currentWeather)) {
                console.log(`☁️ ${weatherType}特效：天气条件不满足`);
                this.setEffectVisibility(false);
                return;
            }
        }

        // 5. 检查time条件（流星雨需要夜晚）
        if (visConditions.time) {
            const timeCondition = { time: visConditions.time };
            if (!window.ConditionEngine?.check(timeCondition)) {
                console.log(`🕐 ${weatherType}特效：时间条件不满足`);
                this.setEffectVisibility(false);
                return;
            }
        }

        // 所有条件都满足，默认可见
        this.setEffectVisibility(true, 1.0);
    }

    /**
     * 获取位置元数据（室内/户外、天空可见性）
     */
    getLocationMetadata(location) {
        const indoorKeywords = ['indoor', 'building', 'room', 'house', 'apartment', 'office', 'mall', 'shop'];
        const skyBlockedKeywords = ['underground', 'tunnel', 'cave', 'basement', 'subway', 'dense_forest'];

        const isIndoor = indoorKeywords.some(keyword => location.toLowerCase().includes(keyword));
        const skyVisible = !skyBlockedKeywords.some(keyword => location.toLowerCase().includes(keyword)) && !isIndoor;

        return { isIndoor, skyVisible };
    }

    /**
     * 检查当前位置是否匹配列表中的任一项
     */
    locationMatches(currentLocation, locationList) {
        if (!currentLocation || !locationList || locationList.length === 0) {
            console.log(`❌ locationMatches: 参数无效 - location: ${currentLocation}, list: ${locationList}`);
            return false;
        }

        console.log(`🔍 locationMatches: 检查 '${currentLocation}' 是否在 [${locationList.join(', ')}]`);

        const result = locationList.some(loc => {
            // 精确匹配或包含匹配
            const matches = currentLocation === loc || currentLocation.includes(loc);
            if (matches) {
                console.log(`  ✅ 匹配成功: '${currentLocation}' 包含 '${loc}'`);
            }
            return matches;
        });

        if (!result) {
            console.log(`  ❌ 没有匹配项`);
        }

        return result;
    }

    /**
     * 🆕 设置特效可见性和强度 v5.1 防递归版本
     * @param {boolean} visible - 是否可见
     * @param {number} intensityMultiplier - 强度倍数（1.0=正常，1.5=增强，0=隐藏）
     */
    setEffectVisibility(visible, intensityMultiplier = 1.0) {
        if (visible) {
            // 如果需要显示，但容器不存在，说明被移除了，需要重新创建
            if (!this.effectContainer && this.currentEffect) {
                console.log(`🔄 容器不存在，重新创建特效: ${this.currentEffect}`);

                // 防止递归：直接调用创建方法，不调用 showEffect
                this.createEffectContainer(this.currentEffect);

                // 根据特效类型创建粒子
                switch (this.currentEffect) {
                    case 'sakura':
                        this.createSakuraEffect(intensityMultiplier);
                        break;
                    case 'rainbow':
                        this.createRainbowEffect(intensityMultiplier);
                        break;
                    case 'meteor_shower':
                        this.createMeteorEffect(intensityMultiplier);
                        break;
                    case 'polluted':
                        this.createPollutedEffect(intensityMultiplier);
                        break;
                    case 'rainy':
                        this.createRainyEffect(intensityMultiplier, false);
                        break;
                    case 'stormy':
                        this.createRainyEffect(intensityMultiplier, true);
                        break;
                    case 'snowy':
                        this.createSnowyEffect(intensityMultiplier);
                        break;
                }

                console.log(`✅ 特效已重新创建`);

                // 🔥 重要：重新创建后，立即再次检查可见性（避免递归）
                // 这次不会递归，因为 effectContainer 已存在
                setTimeout(() => {
                    this.updateVisibility();
                }, 0);
                return;
            }

            if (!this.effectContainer) return;

            // 显示已有特效
            this.effectContainer.style.display = 'block';
            this.effectContainer.style.visibility = 'visible';
            this.effectContainer.style.opacity = '1.0';

            // 🌟 增强区域：添加视觉增强效果
            if (intensityMultiplier > 1.0) {
                console.log(`✨ 增强区域，特效强度: ${intensityMultiplier}x`);
                this.effectContainer.classList.add('enhanced-zone');
                // 增强效果：粒子更大、更亮、更多光晕
                this.effectContainer.style.filter = 'brightness(1.3) saturate(1.2)';
                this.effectContainer.style.transform = 'scale(1.1)';
            } else {
                this.effectContainer.classList.remove('enhanced-zone');
                this.effectContainer.style.filter = '';
                this.effectContainer.style.transform = '';
            }
        } else {
            // 🔥 v5.1 终极方案：直接移除DOM元素（最彻底）
            if (this.effectContainer && this.effectContainer.parentNode) {
                // 保存当前特效类型
                const savedEffect = this.currentEffect;

                // 从DOM中移除容器
                this.effectContainer.parentNode.removeChild(this.effectContainer);
                console.log('🚫 特效DOM已完全移除（彻底停止渲染）');

                // 清理引用（但保留currentEffect）
                this.effectContainer = null;
                this.particles = [];
                this.currentEffect = savedEffect;
            }
        }
    }

    /**
     * 🆕 设置响应式监听 v2.0（在初始化时调用）
     */
    setupReactiveListeners() {
        // 🔥 防止重复设置
        if (this._listenersSetup) {
            console.warn('⚠️ 响应式监听器已设置，跳过重复设置');
            return;
        }

        if (!window.reactiveSystem) {
            console.warn('⚠️ ReactiveSystem未加载，天气可见性将无法自动更新');
            return;
        }

        // 监听位置变化（更新可见性）
        window.reactiveSystem.watch('character.location', (newLocation) => {
            console.log(`📍 位置变化: ${newLocation} → 更新天气特效可见性`);
            this.updateVisibility();
        });

        // 🔥 移除天气变化监听器 - 天气变化由 showEffect() 处理，不需要 updateVisibility()
        // 天气系统会直接调用 showEffect() 来切换特效
        // updateVisibility() 只负责根据位置/时间调整已有特效的可见性

        // 监听时间变化（流星雨需要夜晚）
        window.reactiveSystem.watch('gameTime.hour', (newHour) => {
            // 只在关键时间点更新（节省性能）
            if (newHour === 20 || newHour === 4 || newHour === 6) {
                console.log(`🕐 时间变化: ${newHour}点 → 更新天气特效可见性`);
                this.updateVisibility();
            }
        });

        this._listenersSetup = true; // 标记已设置
        console.log('✅ 天气特效响应式监听器已设置 (location, time)');
    }

    /**
     * 🎮 检测是否为PWA模式
     * @returns {boolean} - 是否为PWA模式
     */
    isPWAMode() {
        // 检测多种PWA标志
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true ||
               document.referrer.includes('android-app://');
    }

    /**
     * 🌂 检查玩家是否有雨伞（或其他遮挡物）
     * @returns {boolean} - 是否有伞
     */
    checkUmbrella() {
        // 🔍 检查多种来源：
        // 1. 玩家背包中的雨伞道具
        const inventory = window.worldState?.state?.character?.inventory || [];
        const hasUmbrellaItem = inventory.some(item =>
            item.id === 'umbrella' || item.type === 'umbrella'
        );

        // 2. 当前装备的雨伞
        const equippedItem = window.worldState?.state?.character?.equipped?.accessory;
        const hasEquippedUmbrella = equippedItem?.id === 'umbrella';

        // 3. NPC给予的临时buff（持续性保护）
        // 使用场景：NPC给了你防雨斗篷、防护罩等持续性道具
        // 特点：有持续时间，即使NPC离开，buff还在继续生效
        // 示例：Zero送你防雨斗篷 → 即使Zero走了，斗篷还在身上挡雨
        const buffs = window.worldState?.state?.character?.buffs || [];
        const hasUmbrellaBuff = buffs.some(buff => buff.id === 'umbrella_protection');

        // 4. NPC主动打伞+跟随（实时动作）
        // 使用场景：NPC正在给你打伞，并且跟随你移动
        // 特点：NPC离开范围后，场景标记应立即移除，雨会恢复
        // 示例：Zero看到下雨主动撑伞跟着你 → Zero走了标记移除，雨恢复
        // ⚠️ 重要：不是"NPC跟随"就有伞，而是"NPC主动帮你打伞"这个行为
        const sceneFlags = window.worldState?.state?.scene?.flags || {};
        const npcHoldingUmbrella = sceneFlags.npc_holding_umbrella === true;

        return hasUmbrellaItem || hasEquippedUmbrella || hasUmbrellaBuff || npcHoldingUmbrella;
    }

    /**
     * 清理资源
     */
    destroy() {
        this.removeEffect();
        if (this.meteorInterval) {
            clearTimeout(this.meteorInterval);  // v3.0: 改用setTimeout
        }
    }
}

// 导出到全局，让world-state.js来创建实例
window.WeatherEffectController = WeatherEffectController;

// 页面卸载时清理（仅在实例存在时）
window.addEventListener('beforeunload', () => {
    if (window.weatherEffectController && window.weatherEffectController.destroy) {
        window.weatherEffectController.destroy();
    }
});
