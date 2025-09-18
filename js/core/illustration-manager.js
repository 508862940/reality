/**
 * 插图管理系统
 * 管理场景插图、动态切换、显示控制
 */

class IllustrationManager {
    constructor() {
        this.currentIllustration = null;
        this.isVisible = false;
        this.illustrationContainer = null;
        this.choiceIllustrations = new Map(); // 存储选项对应的插图

        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupElements());
        } else {
            this.setupElements();
        }
    }

    setupElements() {
        // 创建插图容器（如果不存在）
        this.createIllustrationContainer();
    }

    /**
     * 创建插图容器
     */
    createIllustrationContainer() {
        // 检查是否已存在
        this.illustrationContainer = document.getElementById('illustrationContainer');

        if (!this.illustrationContainer) {
            // 在F1区创建插图容器
            const storyArea = document.getElementById('storyArea');
            if (!storyArea) return;

            const containerHTML = `
                <div id="illustrationContainer" class="illustration-container">
                    <div class="illustration-content">
                        <div class="illustration-image" id="illustrationImage">
                            <span class="illustration-emoji">🖼️</span>
                        </div>
                        <div class="illustration-caption" id="illustrationCaption">
                            插图说明
                        </div>
                        <div class="illustration-desc" id="illustrationDesc">
                            详细描述
                        </div>
                    </div>
                </div>
            `;

            // 添加到story area末尾
            storyArea.insertAdjacentHTML('beforeend', containerHTML);
            this.illustrationContainer = document.getElementById('illustrationContainer');
        }
    }

    /**
     * 设置场景插图数据
     * @param {Object} sceneData - 场景数据
     */
    setSceneIllustrations(sceneData) {
        this.choiceIllustrations.clear();

        // 检查是否有插图数据
        if (!sceneData.illustrations) {
            this.hideIndicator();
            return;
        }

        // 场景默认插图
        if (sceneData.illustrations.default) {
            this.currentIllustration = sceneData.illustrations.default;
            this.showIndicator();
        }

        // 选项对应插图
        if (sceneData.illustrations.choices) {
            Object.keys(sceneData.illustrations.choices).forEach(choiceKey => {
                this.choiceIllustrations.set(
                    choiceKey,
                    sceneData.illustrations.choices[choiceKey]
                );
            });
        }
    }

    /**
     * 根据选择更新插图
     * @param {Object} choice - 选中的选项
     * @param {number} choiceIndex - 选项索引
     */
    updateByChoice(choice, choiceIndex) {
        // 尝试通过多种方式匹配插图
        let illustration = null;

        // 1. 通过选项ID匹配
        if (choice.id && this.choiceIllustrations.has(choice.id)) {
            illustration = this.choiceIllustrations.get(choice.id);
        }
        // 2. 通过选项索引匹配
        else if (this.choiceIllustrations.has(`choice_${choiceIndex}`)) {
            illustration = this.choiceIllustrations.get(`choice_${choiceIndex}`);
        }
        // 3. 通过选项文本匹配
        else if (this.choiceIllustrations.has(choice.text)) {
            illustration = this.choiceIllustrations.get(choice.text);
        }
        // 4. 通过目标匹配
        else if (choice.target && this.choiceIllustrations.has(choice.target)) {
            illustration = this.choiceIllustrations.get(choice.target);
        }

        if (illustration) {
            this.currentIllustration = illustration;
            this.updateDisplay();
            this.showIndicator(choice.text);
        }
    }

    /**
     * 处理多选组合
     * @param {Array} choices - 选中的多个选项
     */
    updateByMultiChoice(choices) {
        // 检查是否有组合插图
        const comboKey = choices.map(c => c.id || c.text).sort().join('+');

        if (this.choiceIllustrations.has(comboKey)) {
            this.currentIllustration = this.choiceIllustrations.get(comboKey);
            this.updateDisplay();
            this.showIndicator('组合效果');
        } else {
            // 显示第一个有插图的选项
            for (let choice of choices) {
                if (choice.id && this.choiceIllustrations.has(choice.id)) {
                    this.currentIllustration = this.choiceIllustrations.get(choice.id);
                    this.updateDisplay();
                    this.showIndicator(choice.text);
                    break;
                }
            }
        }
    }

    /**
     * 更新插图显示内容
     */
    updateDisplay() {
        if (!this.currentIllustration || !this.illustrationContainer) return;

        const imageEl = document.getElementById('illustrationImage');
        const captionEl = document.getElementById('illustrationCaption');
        const descEl = document.getElementById('illustrationDesc');

        if (!imageEl || !captionEl || !descEl) return;

        // 更新内容
        if (this.currentIllustration.emoji) {
            imageEl.innerHTML = `<span class="illustration-emoji">${this.currentIllustration.emoji}</span>`;
        } else if (this.currentIllustration.image) {
            // 如果是图片URL
            imageEl.innerHTML = `<img src="${this.currentIllustration.image}" alt="${this.currentIllustration.caption || ''}" />`;
        }

        if (captionEl && this.currentIllustration.caption) {
            captionEl.textContent = this.currentIllustration.caption;
        }

        if (descEl && this.currentIllustration.description) {
            descEl.textContent = this.currentIllustration.description;
        }
    }

    /**
     * 切换插图显示/隐藏
     */
    toggle() {
        if (!this.currentIllustration) {
            this.showNoIllustrationTip();
            return;
        }

        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * 显示插图
     */
    show() {
        if (!this.illustrationContainer) return;

        this.isVisible = true;
        this.illustrationContainer.classList.add('show');

        // 更新按钮状态
        const zoomBtn = document.getElementById('zoomBtn');
        if (zoomBtn) {
            zoomBtn.classList.add('active');
        }

        // 滚动到插图位置
        setTimeout(() => {
            this.illustrationContainer.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 100);
    }

    /**
     * 隐藏插图
     */
    hide() {
        if (!this.illustrationContainer) return;

        this.isVisible = false;
        this.illustrationContainer.classList.remove('show');

        // 更新按钮状态
        const zoomBtn = document.getElementById('zoomBtn');
        if (zoomBtn) {
            zoomBtn.classList.remove('active');
        }

        // 滚动回顶部
        const storyArea = document.getElementById('storyArea');
        if (storyArea) {
            storyArea.scrollTop = 0;
        }
    }

    /**
     * 显示插图指示器
     * @param {string} tooltip - 提示文本
     */
    showIndicator(tooltip = '') {
        if (window.f2Manager) {
            window.f2Manager.updateIllustrationIndicator(true, tooltip);
        }
    }

    /**
     * 隐藏插图指示器
     */
    hideIndicator() {
        if (window.f2Manager) {
            window.f2Manager.updateIllustrationIndicator(false);
        }
        this.currentIllustration = null;
    }

    /**
     * 清空插图
     */
    clear() {
        this.currentIllustration = null;
        this.isVisible = false;
        this.choiceIllustrations.clear();

        if (this.illustrationContainer) {
            this.illustrationContainer.classList.remove('show');
        }

        this.hideIndicator();
    }

    /**
     * 显示无插图提示
     */
    showNoIllustrationTip() {
        if (window.f2Manager) {
            window.f2Manager.showTip('当前场景没有插图');
        }
    }

    /**
     * 预加载图片
     * @param {Array} imageUrls - 图片URL列表
     */
    preloadImages(imageUrls) {
        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }

    /**
     * 检查是否有插图
     */
    hasIllustration() {
        return this.currentIllustration !== null;
    }

    /**
     * 获取当前插图信息
     */
    getCurrentIllustration() {
        return this.currentIllustration;
    }

    /**
     * 特殊效果：彩蛋插图
     * @param {Object} easterEgg - 彩蛋数据
     */
    showEasterEgg(easterEgg) {
        this.currentIllustration = easterEgg;
        this.updateDisplay();

        // 添加特殊效果
        if (this.illustrationContainer) {
            this.illustrationContainer.classList.add('easter-egg');
            setTimeout(() => {
                this.illustrationContainer.classList.remove('easter-egg');
            }, 3000);
        }

        this.show();
    }
}

// 创建全局实例
window.illustrationManager = new IllustrationManager();