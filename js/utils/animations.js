// Reality App - 动画和特效系统
// 管理所有页面的动画效果

const AnimationEffects = {
    // 初始化所有动画
    init() {
        console.log('✨ 初始化动画系统...');
    },

    // 创建菜单页面的粒子效果
    createMenuParticles() {
        const bgAnimation = document.getElementById('bgAnimation');
        if (!bgAnimation) {
            console.warn('背景动画容器不存在');
            return;
        }

        // 清空现有粒子
        bgAnimation.innerHTML = '';

        // 创建流动粒子
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'bg-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (15 + Math.random() * 10) + 's';

            // 随机大小
            const size = Math.random() * 6 + 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';

            bgAnimation.appendChild(particle);
        }

        // 创建发光点
        for (let i = 0; i < 10; i++) {
            const glowPoint = document.createElement('div');
            glowPoint.className = 'glow-point';
            glowPoint.style.left = Math.random() * 100 + '%';
            glowPoint.style.top = Math.random() * 100 + '%';
            glowPoint.style.animationDelay = Math.random() * 5 + 's';
            bgAnimation.appendChild(glowPoint);
        }

        console.log('✨ 菜单粒子效果已创建');
    },

    // 创建角色创建页面的动画
    createCharacterAnimations() {
        // 角色预览呼吸动画
        const preview = document.querySelector('.preview-avatar');
        if (preview) {
            preview.style.animation = 'breathe 3s ease-in-out infinite';
        }

        // 添加选项卡片入场动画
        const cards = document.querySelectorAll('.creation-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    },

    // 创建游戏主界面的动画
    createGameAnimations() {
        // 场景转换效果
        const sceneElement = document.getElementById('scenePreview');
        if (sceneElement) {
            this.addSceneTransition(sceneElement);
        }

        // 状态条动画
        this.animateStatBars();

        // 添加环境粒子
        this.createEnvironmentParticles();
    },

    // 场景转换效果
    addSceneTransition(element) {
        element.classList.add('scene-transition');
        setTimeout(() => {
            element.classList.remove('scene-transition');
        }, 500);
    },

    // 状态条动画
    animateStatBars() {
        const statBars = document.querySelectorAll('.stat-fill');
        statBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0';
            setTimeout(() => {
                bar.style.transition = 'width 1s ease';
                bar.style.width = width;
            }, 100);
        });
    },

    // 创建环境粒子（雨、雪、樱花等）
    createEnvironmentParticles(type = 'default') {
        const container = document.querySelector('.upper-section');
        if (!container) return;

        const particleContainer = document.createElement('div');
        particleContainer.className = 'environment-particles';
        particleContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 100;
        `;

        container.appendChild(particleContainer);

        // 根据类型创建不同的粒子
        switch(type) {
            case 'rain':
                this.createRainEffect(particleContainer);
                break;
            case 'snow':
                this.createSnowEffect(particleContainer);
                break;
            case 'sakura':
                this.createSakuraEffect(particleContainer);
                break;
            default:
                // 默认星光效果
                this.createSparkleEffect(particleContainer);
        }
    },

    // 雨效果
    createRainEffect(container) {
        for (let i = 0; i < 50; i++) {
            const drop = document.createElement('div');
            drop.style.cssText = `
                position: absolute;
                width: 2px;
                height: 15px;
                background: linear-gradient(transparent, rgba(174, 194, 224, 0.6));
                left: ${Math.random() * 100}%;
                animation: rainFall ${Math.random() * 1 + 0.5}s linear infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
            container.appendChild(drop);
        }
    },

    // 雪效果
    createSnowEffect(container) {
        for (let i = 0; i < 30; i++) {
            const flake = document.createElement('div');
            flake.style.cssText = `
                position: absolute;
                width: ${Math.random() * 10 + 5}px;
                height: ${Math.random() * 10 + 5}px;
                background: white;
                border-radius: 50%;
                opacity: ${Math.random() * 0.8 + 0.2};
                left: ${Math.random() * 100}%;
                animation: snowFall ${Math.random() * 5 + 5}s linear infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            container.appendChild(flake);
        }
    },

    // 樱花效果
    createSakuraEffect(container) {
        for (let i = 0; i < 15; i++) {
            const petal = document.createElement('div');
            petal.innerHTML = '🌸';
            petal.style.cssText = `
                position: absolute;
                font-size: ${Math.random() * 15 + 10}px;
                left: ${Math.random() * 100}%;
                animation: sakuraFall ${Math.random() * 10 + 10}s linear infinite;
                animation-delay: ${Math.random() * 10}s;
            `;
            container.appendChild(petal);
        }
    },

    // 星光效果
    createSparkleEffect(container) {
        for (let i = 0; i < 20; i++) {
            const sparkle = document.createElement('div');
            sparkle.style.cssText = `
                position: absolute;
                width: 3px;
                height: 3px;
                background: white;
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: twinkle ${Math.random() * 3 + 2}s ease-in-out infinite;
                animation-delay: ${Math.random() * 3}s;
            `;
            container.appendChild(sparkle);
        }
    },

    // 添加波纹效果
    createRipple(x, y, container) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        container.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    },

    // 添加点击反馈
    addClickFeedback(element) {
        element.addEventListener('click', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.createRipple(x, y, element);
        });
    }
};

// 添加CSS动画定义
const animationStyles = `
<style>
/* 发光点 */
.glow-point {
    position: absolute;
    width: 4px;
    height: 4px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
    animation: glow 3s ease-in-out infinite;
}

@keyframes glow {
    0%, 100% {
        opacity: 0.3;
        transform: scale(1);
    }
    50% {
        opacity: 1;
        transform: scale(1.5);
    }
}

/* 呼吸动画 */
@keyframes breathe {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

/* 场景转换 */
.scene-transition {
    animation: sceneChange 0.5s ease;
}

@keyframes sceneChange {
    0% {
        opacity: 0;
        transform: scale(0.95);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

/* 雨效果 */
@keyframes rainFall {
    to {
        transform: translateY(100vh);
    }
}

/* 雪效果 */
@keyframes snowFall {
    to {
        transform: translateY(100vh) translateX(100px) rotate(360deg);
    }
}

/* 樱花效果 */
@keyframes sakuraFall {
    to {
        transform: translateY(100vh) translateX(50px) rotate(360deg);
    }
}

/* 闪烁效果 */
@keyframes twinkle {
    0%, 100% {
        opacity: 0;
    }
    50% {
        opacity: 1;
    }
}

/* 波纹效果 */
.ripple-effect {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -50%);
    pointer-events: none;
    animation: ripple 0.6s ease-out;
}

@keyframes ripple {
    from {
        width: 0;
        height: 0;
        opacity: 1;
    }
    to {
        width: 100px;
        height: 100px;
        opacity: 0;
    }
}

/* 脉冲效果 */
@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.05);
        opacity: 0.8;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

/* 摇晃效果 */
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

/* 淡入效果 */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 滑入效果 */
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(-30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* 旋转加载 */
@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>
`;

// 初始化时添加样式
document.addEventListener('DOMContentLoaded', () => {
    document.head.insertAdjacentHTML('beforeend', animationStyles);
});

// 导出
window.AnimationEffects = AnimationEffects;
window.createParticles = () => AnimationEffects.createMenuParticles();
window.initSceneAnimations = () => AnimationEffects.createGameAnimations();