/**
 * 场景管理系统
 * 管理F1区的场景切换、选项处理、内容加载
 */

class SceneManager {
    constructor() {
        this.currentScene = null;
        this.currentChoice = null;
        this.sceneHistory = [];
        this.canReset = true;
        this.lastSceneSnapshot = null;

        // 场景容器
        this.storyArea = null;
        this.isTransitioning = false;

        // 初始化
        this.init();
    }

    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupElements());
        } else {
            this.setupElements();
        }
    }

    setupElements() {
        this.storyArea = document.getElementById('storyArea');
        if (!this.storyArea) {
            console.error('Story area not found!');
            return;
        }
    }

    /**
     * 加载场景
     * @param {Object} sceneData - 场景数据
     */
    loadScene(sceneData) {
        if (this.isTransitioning) return;

        this.currentScene = sceneData;
        this.currentChoice = null;
        this.canReset = true;

        // 保存当前场景快照（用于重置）
        this.lastSceneSnapshot = this.getCurrentSnapshot();

        // 设置场景插图数据
        if (window.illustrationManager) {
            // 从场景数据或插图数据库获取插图
            const illustrations = window.getSceneIllustrations ?
                window.getSceneIllustrations(sceneData.id) :
                sceneData.illustrations;

            if (illustrations) {
                window.illustrationManager.setSceneIllustrations({
                    ...sceneData,
                    illustrations: illustrations
                });
            } else {
                window.illustrationManager.clear();
            }
        }

        // 淡出当前内容
        this.fadeOut(() => {
            // 清空内容
            this.clearContent();

            // 构建新场景
            this.buildScene(sceneData);

            // 淡入新内容
            this.fadeIn();
        });
    }

    /**
     * 构建场景内容
     */
    buildScene(sceneData) {
        let html = '';

        // 场景文本
        html += '<div class="story-text">';

        // 位置标签（如果有）
        if (sceneData.location) {
            html += `<div class="location-tag">📍 ${sceneData.location}</div>`;
        }

        // 场景描述
        if (sceneData.text) {
            if (Array.isArray(sceneData.text)) {
                sceneData.text.forEach(paragraph => {
                    html += `<p>${paragraph}</p>`;
                });
            } else {
                html += `<p>${sceneData.text}</p>`;
            }
        }

        html += '</div>';

        // 选项区域
        if (sceneData.choices && sceneData.choices.length > 0) {
            html += '<div class="choices-container">';

            // 多选场景
            if (sceneData.multiChoice) {
                // 多选容器
                html += '<div class="multi-choice-container">';

                // 多选提示
                const minChoices = sceneData.minChoices || 1;
                const maxChoices = sceneData.maxChoices || sceneData.choices.length;
                html += `
                    <div class="multi-choice-hint">
                        请选择 ${minChoices}-${maxChoices} 个选项
                        (<span class="selected-count" id="selectedCount">0</span>/${maxChoices})
                    </div>
                `;

                sceneData.choices.forEach((choice, index) => {
                    html += `
                        <div class="multi-choice-item" data-index="${index}" data-value="${choice.value || ''}" data-id="${choice.id || ''}">
                            <input type="checkbox" id="choice_${index}">
                            <label for="choice_${index}">
                                ${choice.text}
                                ${choice.description ? `<div class="choice-desc">${choice.description}</div>` : ''}
                            </label>
                        </div>
                    `;
                });

                // 多选确认按钮
                html += `
                    <button class="multi-choice-confirm" id="multiConfirmBtn" onclick="sceneManager.confirmMultiChoice()" disabled>
                        ✓ 确认选择
                    </button>
                `;

                html += '</div>'; // 关闭multi-choice-container
            } else {
                // 单选场景
                sceneData.choices.forEach((choice, index) => {
                    html += `
                        <div class="story-choice" data-index="${index}" data-target="${choice.target || ''}">
                            ${choice.text}
                        </div>
                    `;
                });
            }

            html += '</div>';
        }

        // 插入内容
        this.storyArea.innerHTML = html;

        // 绑定事件
        this.bindEvents();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 单选选项点击
        const choices = this.storyArea.querySelectorAll('.story-choice');
        choices.forEach(choice => {
            choice.addEventListener('click', (e) => {
                this.selectChoice(e.target);
            });
        });

        // 多选选项点击
        const multiChoices = this.storyArea.querySelectorAll('.multi-choice-item');
        multiChoices.forEach(choice => {
            choice.addEventListener('click', (e) => {
                // 防止点击label时重复触发
                if (e.target.tagName === 'LABEL' || e.target.classList.contains('choice-desc')) {
                    return;
                }

                const checkbox = choice.querySelector('input[type="checkbox"]');
                const maxChoices = this.currentScene.maxChoices || this.currentScene.choices.length;
                const currentSelected = this.storyArea.querySelectorAll('.multi-choice-item.selected').length;

                // 如果是选中状态，允许取消
                if (checkbox.checked) {
                    checkbox.checked = false;
                    choice.classList.remove('selected');
                }
                // 如果未选中且未达到上限，允许选中
                else if (currentSelected < maxChoices) {
                    checkbox.checked = true;
                    choice.classList.add('selected');

                    // 更新插图显示
                    const choiceData = this.currentScene.choices[parseInt(choice.dataset.index)];
                    if (window.illustrationManager && choiceData) {
                        window.illustrationManager.updateByChoice(choiceData, parseInt(choice.dataset.index));
                    }
                }

                // 更新计数和按钮状态
                this.updateMultiChoiceState();
            });
        });
    }

    /**
     * 选择选项（单选）
     */
    selectChoice(element) {
        // 移除其他选中状态
        this.storyArea.querySelectorAll('.story-choice').forEach(choice => {
            choice.classList.remove('selected');
        });

        // 标记选中
        element.classList.add('selected');

        // 记录选择
        const index = parseInt(element.dataset.index);
        this.currentChoice = this.currentScene.choices[index];

        // 更新插图显示
        if (window.illustrationManager && this.currentChoice) {
            window.illustrationManager.updateByChoice(this.currentChoice, index);
        }

        // 更新继续按钮状态
        this.updateContinueButton(true);
    }

    /**
     * 更新多选状态
     */
    updateMultiChoiceState() {
        const selectedItems = this.storyArea.querySelectorAll('.multi-choice-item.selected');
        const selectedCount = selectedItems.length;
        const minChoices = this.currentScene.minChoices || 1;
        const maxChoices = this.currentScene.maxChoices || this.currentScene.choices.length;

        // 更新计数显示
        const countElement = document.getElementById('selectedCount');
        if (countElement) {
            countElement.textContent = selectedCount;
        }

        // 更新确认按钮状态
        const confirmBtn = document.getElementById('multiConfirmBtn');
        if (confirmBtn) {
            const isValid = selectedCount >= minChoices && selectedCount <= maxChoices;
            confirmBtn.disabled = !isValid;

            if (isValid) {
                confirmBtn.textContent = `✓ 确认选择 (${selectedCount})`;
            } else if (selectedCount < minChoices) {
                confirmBtn.textContent = `请选择至少 ${minChoices} 项`;
            } else {
                confirmBtn.textContent = `最多只能选择 ${maxChoices} 项`;
            }
        }

        // 显示选择限制提示
        if (selectedCount >= maxChoices) {
            const unselectedItems = this.storyArea.querySelectorAll('.multi-choice-item:not(.selected)');
            unselectedItems.forEach(item => {
                item.style.opacity = '0.5';
                item.style.pointerEvents = 'none';
            });
        } else {
            const allItems = this.storyArea.querySelectorAll('.multi-choice-item');
            allItems.forEach(item => {
                item.style.opacity = '1';
                item.style.pointerEvents = 'auto';
            });
        }
    }

    /**
     * 确认多选
     */
    confirmMultiChoice() {
        const selected = [];
        const checkboxes = this.storyArea.querySelectorAll('.multi-choice-item input:checked');

        checkboxes.forEach(checkbox => {
            const item = checkbox.parentElement;
            const index = parseInt(item.dataset.index);
            selected.push(this.currentScene.choices[index]);
        });

        if (selected.length === 0) {
            this.showNotice('请至少选择一项');
            return;
        }

        this.currentChoice = selected;

        // 更新多选插图
        if (window.illustrationManager && selected.length > 0) {
            window.illustrationManager.updateByMultiChoice(selected);
        }

        this.proceedToNext();
    }

    /**
     * 继续到下一场景
     */
    proceedToNext() {
        if (!this.currentChoice) {
            this.showNotice('请先做出选择');
            return;
        }

        // 保存到历史
        this.sceneHistory.push({
            scene: this.currentScene,
            choice: this.currentChoice
        });

        // 获取下一场景
        const nextScene = this.getNextScene(this.currentChoice);

        if (nextScene) {
            // 检查是否是AI对话场景
            if (nextScene.type === 'ai_dialogue') {
                this.switchToAIMode(nextScene);
            } else {
                this.loadScene(nextScene);
            }
        } else {
            this.showNotice('场景加载失败');
        }
    }

    /**
     * 重置当前场景
     */
    resetScene() {
        if (!this.canReset) {
            this.showNotice('本场景不可重置');
            return;
        }

        if (!this.lastSceneSnapshot) {
            this.showNotice('没有可重置的内容');
            return;
        }

        // 只能重置一次
        this.canReset = false;

        // 清空插图选择
        if (window.illustrationManager) {
            // 重新设置场景插图
            const illustrations = window.getSceneIllustrations ?
                window.getSceneIllustrations(this.lastSceneSnapshot.id) :
                this.lastSceneSnapshot.illustrations;

            if (illustrations) {
                window.illustrationManager.setSceneIllustrations({
                    ...this.lastSceneSnapshot,
                    illustrations: illustrations
                });
            }
        }

        // 恢复场景
        this.loadScene(this.lastSceneSnapshot);

        this.showNotice('已重置到选择前');
    }

    /**
     * 获取下一场景
     */
    getNextScene(choice) {
        // 这里应该从场景数据库或文件中获取
        // 现在返回模拟数据
        if (Array.isArray(choice)) {
            // 多选情况
            return this.getMultiChoiceScene(choice);
        } else {
            // 单选情况
            return this.getSingleChoiceScene(choice);
        }
    }

    /**
     * 获取单选场景
     */
    getSingleChoiceScene(choice) {
        // TODO: 从场景数据中获取
        // 模拟返回
        return {
            id: 'next_scene',
            location: choice.target || '未知地点',
            text: [`你选择了：${choice.text}`, '新的场景展开了...'],
            choices: [
                { text: '→ 继续探索', target: 'explore' },
                { text: '→ 返回', target: 'back' }
            ]
        };
    }

    /**
     * 获取多选场景
     */
    getMultiChoiceScene(choices) {
        // 如果当前场景是选择物品场景，跳转到特定结果场景
        if (this.currentScene.id === 'select_items') {
            const selectedItems = choices.map(c => c.text).join('、');

            // 获取预定义的结果场景
            if (window.OpeningScenes && window.OpeningScenes.items_selected) {
                const resultScene = JSON.parse(JSON.stringify(window.OpeningScenes.items_selected));

                // 替换文本中的占位符
                resultScene.text = resultScene.text.map(text =>
                    text.replace('{selectedItems}', selectedItems)
                );

                return resultScene;
            }
        }

        // 默认多选结果处理
        const selected = choices.map(c => c.text).join('、');
        return {
            id: 'multi_result',
            location: '结果',
            text: [`你选择了：${selected}`, '这些选择产生了影响...'],
            choices: [
                { text: '→ 查看结果', target: 'result' },
                { text: '→ 继续', target: 'continue' }
            ]
        };
    }

    /**
     * 切换到AI模式
     */
    switchToAIMode(sceneData) {
        // 触发F2区切换
        if (window.f2Manager) {
            window.f2Manager.switchToAIMode();
        }

        // 加载AI对话场景
        this.loadAIDialogueScene(sceneData);
    }

    /**
     * 加载AI对话场景
     */
    loadAIDialogueScene(sceneData) {
        // AI对话不清空内容，而是累积
        const html = `
            <div class="ai-dialogue-scene">
                <div class="npc-greeting">
                    <span class="npc-name">${sceneData.npcName}</span>
                    <p>${sceneData.greeting}</p>
                </div>
                <div id="dialogueHistory"></div>
            </div>
        `;

        this.storyArea.innerHTML = html;
    }

    /**
     * 淡出效果
     */
    fadeOut(callback) {
        this.isTransitioning = true;
        this.storyArea.style.opacity = '0';

        setTimeout(() => {
            if (callback) callback();
            this.isTransitioning = false;
        }, 300);
    }

    /**
     * 淡入效果
     */
    fadeIn(callback) {
        setTimeout(() => {
            this.storyArea.style.opacity = '1';
            if (callback) callback();
        }, 50);
    }

    /**
     * 清空内容
     */
    clearContent() {
        this.storyArea.innerHTML = '';
    }

    /**
     * 获取当前场景快照
     */
    getCurrentSnapshot() {
        return JSON.parse(JSON.stringify(this.currentScene));
    }

    /**
     * 显示提示
     */
    showNotice(message) {
        // 更新E区提醒栏
        const noticeText = document.getElementById('noticeText');
        if (noticeText) {
            noticeText.textContent = `💡 ${message}`;
        }
    }

    /**
     * 更新继续按钮状态
     */
    updateContinueButton(enabled) {
        // 通知F2区管理器更新按钮状态
        if (window.f2Manager) {
            window.f2Manager.updateContinueButton(enabled);
        }
    }
}

// 创建全局实例
window.sceneManager = new SceneManager();