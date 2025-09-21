/**
 * 场景管理系统
 * 管理F1区的场景切换、选项处理、内容加载
 */

class SceneManager {
    constructor() {
        this.currentScene = null;
        this.currentChoice = null;
        this.previewChoice = null;  // 预览中的选择
        this.isPreviewMode = false;  // 是否处于预览模式
        this.sceneHistory = [];
        this.canReset = true;
        this.lastSceneSnapshot = null;

        // 状态更新系统
        this.sceneState = {
            status: 'loading',      // loading, ready, previewing, confirmed, transitioning
            choiceType: null,       // single, multi, text, none
            selectedCount: 0,       // 当前选择数量
            minChoices: 0,          // 最小选择数
            maxChoices: 0,          // 最大选择数
            canProceed: false,      // 是否可以继续
            hasConflicts: false     // 是否有冲突
        };

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

        // 更新状态为加载中
        this.updateSceneState({ status: 'loading' });

        this.currentScene = sceneData;
        this.currentChoice = null;
        this.previewChoice = null;  // 重置预览状态
        this.isPreviewMode = false;
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
            this.fadeIn(() => {
                // 场景加载完成，更新状态为就绪
                this.updateSceneState({ status: 'ready' });
            });
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

                // 多选确认按钮区域
                html += `
                    <div class="multi-choice-buttons">
                        <button class="multi-choice-confirm" id="multiConfirmBtn" onclick="sceneManager.confirmMultiChoice()" disabled>
                            ✓ 确认选择
                        </button>
                        <button class="multi-choice-reset" id="multiResetBtn" onclick="sceneManager.resetMultiChoice()" title="重新选择">
                            🔄 重新选择
                        </button>
                    </div>
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

                    // 更新多选预览插图
                    const choiceData = this.currentScene.choices[parseInt(choice.dataset.index)];
                    if (window.illustrationManager && choiceData) {
                        // 多选场景支持累积预览
                        this.updateMultiChoicePreview();
                    }
                }

                // 更新计数和按钮状态
                this.updateMultiChoiceState();

                // 更新多选预览状态
                this.updateMultiChoicePreview();
            });
        });
    }

    /**
     * 选择选项（单选）- 现在只进行预览，不立即确认
     */
    selectChoice(element) {
        // 检查是否点击的是已预览的选项（取消预览）
        if (element.classList.contains('preview')) {
            this.cancelPreview();
            return;
        }

        // 移除其他预览状态
        this.storyArea.querySelectorAll('.story-choice').forEach(choice => {
            choice.classList.remove('preview', 'selected');
        });

        // 标记为预览状态（触感式效果）
        element.classList.add('preview');

        // 记录预览选择（包含索引信息）
        const index = parseInt(element.dataset.index);
        this.previewChoice = {
            ...this.currentScene.choices[index],
            index: index  // 保存索引以便后续使用
        };
        this.isPreviewMode = true;

        // 更新状态为预览模式
        this.updateSceneState({
            status: 'previewing',
            selectedCount: 1
        });

        // 静默预览，保持沉浸感

        // 暂不更新插图（预留接口，放大镜点击时再显示）
        // if (window.illustrationManager && this.previewChoice) {
        //     window.illustrationManager.updateByChoice(this.previewChoice, index);
        // }
    }

    /**
     * 取消预览状态
     */
    cancelPreview() {
        // 清除预览状态
        this.storyArea.querySelectorAll('.story-choice').forEach(choice => {
            choice.classList.remove('preview', 'selected');
        });

        // 重置预览变量
        this.previewChoice = null;
        this.isPreviewMode = false;
        this.currentChoice = null;

        // 更新状态为就绪
        this.updateSceneState({
            status: 'ready',
            selectedCount: 0
        });

        // 清除插图预览
        if (window.illustrationManager) {
            window.illustrationManager.clear();
        }

        // 静默取消，保持沉浸感
    }

    /**
     * 检查智能冲突
     * @param {NodeList} selectedItems - 选中的项目
     * @returns {Object} 冲突检测结果
     */
    checkSmartConflicts(selectedItems) {
        // 如果场景没有定义冲突规则，返回无冲突
        if (!this.currentScene.conflicts) {
            return { hasConflict: false, message: '' };
        }

        // 获取选中项的索引
        const selectedIndices = Array.from(selectedItems).map(item =>
            parseInt(item.dataset.index)
        );

        // 检查每个冲突规则
        for (const conflict of this.currentScene.conflicts) {
            // 检查是否同时选中了冲突的选项
            const conflictingIndices = conflict.indices || [];
            const selectedConflicting = conflictingIndices.filter(idx =>
                selectedIndices.includes(idx)
            );

            if (selectedConflicting.length > 1) {
                return {
                    hasConflict: true,
                    message: conflict.message || '这些选项不能同时选择'
                };
            }
        }

        return { hasConflict: false, message: '' };
    }

    /**
     * 显示冲突警告
     * @param {Object} conflictResult - 冲突检测结果
     */
    showConflictWarning(conflictResult) {
        // 获取或创建警告区域
        let warningArea = document.getElementById('conflictWarning');

        if (!warningArea) {
            // 创建警告区域元素
            warningArea = document.createElement('div');
            warningArea.id = 'conflictWarning';
            warningArea.className = 'conflict-warning';

            // 插入到多选容器中
            const multiChoiceContainer = this.storyArea.querySelector('.multi-choice-container');
            if (multiChoiceContainer) {
                multiChoiceContainer.appendChild(warningArea);
            }
        }

        if (conflictResult.hasConflict) {
            // 显示警告
            warningArea.textContent = `⚠️ ${conflictResult.message}`;
            warningArea.style.display = 'block';
            warningArea.style.cssText = `
                display: block;
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.3);
                border-radius: 6px;
                padding: 10px;
                margin: 10px 0;
                color: #fbbf24;
                font-size: 12px;
                animation: shake 0.5s ease-in-out;
            `;
        } else {
            // 隐藏警告
            warningArea.style.display = 'none';
        }
    }

    /**
     * 更新多选预览
     */
    updateMultiChoicePreview() {
        console.log('📝 小纸条：更新多选预览开始');

        // 获取当前选中的所有项目
        const selectedItems = this.storyArea.querySelectorAll('.multi-choice-item.selected');
        const selectedChoices = [];

        selectedItems.forEach(item => {
            const index = parseInt(item.dataset.index);
            if (this.currentScene.choices[index]) {
                selectedChoices.push(this.currentScene.choices[index]);
            }
        });

        console.log(`📝 小纸条：多选发现 ${selectedChoices.length} 个选择`);

        // 统一状态更新：避免重复调用
        const newState = {
            selectedCount: selectedChoices.length
        };

        // 如果有选择，进入预览模式
        if (selectedChoices.length > 0) {
            console.log('📝 小纸条：多选进入预览模式');
            this.previewChoice = selectedChoices;
            this.isPreviewMode = true;

            newState.status = 'previewing';

            // 渐进式插图预览（可选：显示合并效果）
            if (window.illustrationManager) {
                window.illustrationManager.updateByMultiChoice(selectedChoices);
            }
        } else {
            console.log('📝 小纸条：多选无选择，回到就绪状态');
            // 没有选择时清除预览
            this.previewChoice = null;
            this.isPreviewMode = false;

            newState.status = 'ready';

            if (window.illustrationManager) {
                window.illustrationManager.clear();
            }
        }

        // 一次性状态更新，避免多次回调
        this.updateSceneState(newState);
    }

    /**
     * 更新多选状态
     */
    updateMultiChoiceState() {
        const selectedItems = this.storyArea.querySelectorAll('.multi-choice-item.selected');
        const selectedCount = selectedItems.length;
        const minChoices = this.currentScene.minChoices || 1;
        const maxChoices = this.currentScene.maxChoices || this.currentScene.choices.length;

        // 智能冲突检测
        const conflictResult = this.checkSmartConflicts(selectedItems);

        // 更新计数显示
        const countElement = document.getElementById('selectedCount');
        if (countElement) {
            countElement.textContent = selectedCount;
        }

        // 更新确认按钮状态
        const confirmBtn = document.getElementById('multiConfirmBtn');
        if (confirmBtn) {
            const isValid = selectedCount >= minChoices && selectedCount <= maxChoices && !conflictResult.hasConflict;
            confirmBtn.disabled = !isValid;

            if (conflictResult.hasConflict) {
                confirmBtn.textContent = `⚠️ ${conflictResult.message}`;
                confirmBtn.style.background = 'rgba(239, 68, 68, 0.3)';
            } else if (isValid) {
                confirmBtn.textContent = `✓ 确认选择 (${selectedCount})`;
                confirmBtn.style.background = 'linear-gradient(135deg, #8b92f6, #f093fb)';
            } else if (selectedCount < minChoices) {
                confirmBtn.textContent = `请选择至少 ${minChoices} 项`;
                confirmBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            } else {
                confirmBtn.textContent = `最多只能选择 ${maxChoices} 项`;
                confirmBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            }
        }

        // 显示冲突警告
        this.showConflictWarning(conflictResult);

        // 显示选择限制提示
        if (selectedCount >= maxChoices || conflictResult.hasConflict) {
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
     * 重新选择多选项
     */
    resetMultiChoice() {
        // 清除所有选择
        const selectedItems = this.storyArea.querySelectorAll('.multi-choice-item.selected');
        selectedItems.forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = false;
            }
            item.classList.remove('selected');
        });

        // 恢复所有选项可用状态
        const allItems = this.storyArea.querySelectorAll('.multi-choice-item');
        allItems.forEach(item => {
            item.style.opacity = '1';
            item.style.pointerEvents = 'auto';
        });

        // 隐藏冲突警告
        const warningArea = document.getElementById('conflictWarning');
        if (warningArea) {
            warningArea.style.display = 'none';
        }

        // 重置插图
        if (window.illustrationManager) {
            window.illustrationManager.clear();
        }

        // 清除预览状态
        this.previewChoice = null;
        this.isPreviewMode = false;
        this.currentChoice = null;

        // 更新状态为就绪
        this.updateSceneState({
            status: 'ready',
            selectedCount: 0
        });

        // 重新显示确认按钮
        const confirmBtn = document.getElementById('multiConfirmBtn');
        if (confirmBtn) {
            confirmBtn.style.display = 'block';
            confirmBtn.disabled = true; // 初始禁用，等待重新选择
        }

        // 更新按钮状态
        this.updateMultiChoiceState();

        // 静默重置，保持沉浸感
    }

    /**
     * 确认多选（预览阶段）- 现在主要用于隐藏确认按钮
     */
    confirmMultiChoice() {
        // 直接使用当前的预览状态（由updateMultiChoicePreview管理）
        // 隐藏多选确认按钮，等待F2继续按钮确认
        const confirmBtn = document.getElementById('multiConfirmBtn');
        if (confirmBtn) {
            confirmBtn.style.display = 'none';
        }

        // 确保已进入预览模式（如果有选择的话）
        if (!this.isPreviewMode && this.storyArea.querySelectorAll('.multi-choice-item.selected').length > 0) {
            this.updateMultiChoicePreview();
        }

        // 静默预览，保持沉浸感
        // 预览状态通过视觉反馈传达给用户
    }


    /**
     * 确认预览选择 - 完整的确认执行机制
     * @returns {boolean} 是否成功确认
     */
    confirmPreviewChoice() {
        // 检查是否在预览模式
        if (!this.isPreviewMode) {
            // 如果不在预览模式但有确认的选择，可以直接继续
            if (this.currentChoice) {
                return true;
            }
            return false;
        }

        // 多选场景允许无选择（0选择也可确认）
        if (!this.previewChoice && this.currentScene.multiChoice) {
            // 0选择的多选场景
            this.currentChoice = [];
            this.isPreviewMode = false;
            this.previewChoice = null;
            return true;
        }

        // 单选场景必须有预览选择
        if (!this.previewChoice && !this.currentScene.multiChoice) {
            return false;
        }

        // 执行选择确认
        if (Array.isArray(this.previewChoice)) {
            // 多选确认
            this.confirmMultiPreview();
        } else {
            // 单选确认
            this.confirmSinglePreview();
        }

        // 设置为确认状态
        this.currentChoice = this.previewChoice;
        this.isPreviewMode = false;
        this.previewChoice = null;

        // 更新状态为确认模式
        this.updateSceneState({
            status: 'confirmed',
            selectedCount: Array.isArray(this.currentChoice) ? this.currentChoice.length : 1
        });

        return true;
    }

    /**
     * 确认单选预览
     */
    confirmSinglePreview() {
        // 找到预览的选项并切换为确认状态
        const previewElement = this.storyArea.querySelector('.story-choice.preview');
        if (previewElement) {
            previewElement.classList.remove('preview');
            previewElement.classList.add('selected', 'confirmed');

            // 更新插图显示
            if (window.illustrationManager && this.previewChoice) {
                const index = parseInt(previewElement.dataset.index);
                window.illustrationManager.updateByChoice(this.previewChoice, index);
            }
        }
    }

    /**
     * 确认多选预览
     */
    confirmMultiPreview() {
        // 标记所有选中项为确认状态
        const selectedItems = this.storyArea.querySelectorAll('.multi-choice-item.selected');
        selectedItems.forEach(item => {
            item.classList.add('confirmed');
            item.style.opacity = '1';
            item.style.pointerEvents = 'none'; // 确认后不可再修改
        });

        // 禁用未选中的项目
        const unselectedItems = this.storyArea.querySelectorAll('.multi-choice-item:not(.selected)');
        unselectedItems.forEach(item => {
            item.style.opacity = '0.3';
            item.style.pointerEvents = 'none';
        });

        // 隐藏重新选择按钮（确认后不可重新选择）
        const resetBtn = document.getElementById('multiResetBtn');
        if (resetBtn) {
            resetBtn.style.display = 'none';
        }

        // 更新多选插图
        if (window.illustrationManager && Array.isArray(this.previewChoice) && this.previewChoice.length > 0) {
            window.illustrationManager.updateByMultiChoice(this.previewChoice);
        }
    }

    /**
     * 继续到下一场景
     */
    proceedToNext() {
        // 更新状态为转换中
        this.updateSceneState({ status: 'transitioning' });

        // 如果处于预览模式，先确认预览选择
        if (this.isPreviewMode) {
            if (!this.confirmPreviewChoice()) {
                // 确认失败，恢复状态
                this.updateSceneState({ status: 'previewing' });
                return;
            }
        }

        // 静默处理，如果没有选择，直接返回
        if (!this.currentChoice) {
            // 恢复状态
            this.updateSceneState({ status: 'ready' });
            return;
        }

        // 保存到历史
        this.sceneHistory.push({
            scene: this.currentScene,
            choice: this.currentChoice
        });

        // 📝 小纸条：应用选择结果到游戏状态
        console.log('📝 小纸条：准备应用选择结果到游戏状态');
        this.applyChoiceResults(this.currentChoice, this.currentScene);

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
            // 静默处理场景加载失败
            console.warn('场景加载失败:', this.currentChoice);
        }
    }

    /**
     * 重置当前场景 - 简化重置系统
     */
    resetScene() {
        console.log('📝 小纸条：重置按钮被点击了！');

        if (!this.canReset) {
            console.log('❌ 小纸条：不能重置，canReset =', this.canReset);
            return; // 静默处理，不可重置时直接返回
        }

        if (!this.lastSceneSnapshot) {
            console.log('❌ 小纸条：没有场景快照，无法重置');
            return; // 静默处理，没有快照时直接返回
        }

        console.log('📝 小纸条：重置开始 - 当前状态:', this.sceneState.status);
        console.log('📝 小纸条：重置开始 - 当前选择:', this.currentChoice);

        // 执行完全重置
        this.performFullReset();

        // 重置计数管理
        this.canReset = false;
        console.log('📝 小纸条：重置计数已设为false，下次不能再重置');

        // 通知F2管理器重置状态变化
        if (window.f2Manager) {
            console.log('📝 小纸条：通知F2Manager重置状态');
            window.f2Manager.resetState();
        }

        console.log('✅ 小纸条：重置场景完成');
    }

    /**
     * 执行完全重置
     */
    performFullReset() {
        console.log('执行完全重置...');

        // 清除所有状态
        this.clearAllStates();

        // 重新加载场景（使用快照）
        this.loadScene(this.lastSceneSnapshot);

        console.log('完全重置执行完毕');
    }


    /**
     * 清除所有状态
     */
    clearAllStates() {
        console.log('清除所有状态...');

        // 清除选择状态
        this.currentChoice = null;
        this.previewChoice = null;
        this.isPreviewMode = false;

        // 重置状态系统
        this.sceneState = {
            status: 'loading',
            choiceType: null,
            selectedCount: 0,
            minChoices: 0,
            maxChoices: 0,
            canProceed: false,
            hasConflicts: false
        };

        // 清除插图
        if (window.illustrationManager) {
            window.illustrationManager.clear();
        }

        // 清除DOM中的选择状态
        if (this.storyArea) {
            // 清除单选状态
            const singleChoices = this.storyArea.querySelectorAll('.story-choice');
            singleChoices.forEach(choice => {
                choice.classList.remove('preview', 'selected', 'confirmed');
            });

            // 清除多选状态
            const multiChoices = this.storyArea.querySelectorAll('.multi-choice-item');
            multiChoices.forEach(item => {
                item.classList.remove('selected', 'confirmed');
                item.style.opacity = '';
                item.style.pointerEvents = '';
                const checkbox = item.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = false;
                }
            });

            // 重新显示多选确认按钮
            const confirmBtn = document.getElementById('multiConfirmBtn');
            if (confirmBtn) {
                confirmBtn.style.display = 'block';
                confirmBtn.disabled = true;
            }

            // 清除冲突警告
            const warningArea = document.getElementById('conflictWarning');
            if (warningArea) {
                warningArea.style.display = 'none';
            }
        }

        console.log('所有状态已清除');
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
        // 从OpeningScenes中获取下一场景
        if (choice.target && window.OpeningScenes && window.OpeningScenes[choice.target]) {
            return window.OpeningScenes[choice.target];
        }

        // 检查MemoryFragments等其他场景集合
        if (choice.target && window.MemoryFragments && window.MemoryFragments[choice.target]) {
            return window.MemoryFragments[choice.target];
        }

        // 如果没有找到对应场景，返回默认场景
        return {
            id: 'next_scene',
            location: choice.target || '未知地点',
            text: [`你选择了：${choice.text}`, `（场景 ${choice.target} 尚未实现）`],
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
     * 更新场景状态系统
     * @param {Object} updates - 要更新的状态属性
     */
    updateSceneState(updates = {}) {
        const oldStatus = this.sceneState.status;
        const oldSelectedCount = this.sceneState.selectedCount;

        // 合并状态更新
        Object.assign(this.sceneState, updates);

        // 📝 小纸条：状态变化了
        if (oldStatus !== this.sceneState.status) {
            console.log(`📝 小纸条：场景状态变化 ${oldStatus} → ${this.sceneState.status}`);
        }
        if (updates.selectedCount !== undefined) {
            console.log(`📝 小纸条：选择数量变化 → ${this.sceneState.selectedCount}`);
        }

        // 根据场景类型自动检测状态（仅在没有明确传值时）
        if (this.currentScene) {
            // 检测选择类型
            if (this.currentScene.multiChoice) {
                this.sceneState.choiceType = 'multi';
                this.sceneState.minChoices = this.currentScene.minChoices || 0;
                this.sceneState.maxChoices = this.currentScene.maxChoices || this.currentScene.choices.length;
            } else if (this.currentScene.choices && this.currentScene.choices.length > 0) {
                this.sceneState.choiceType = 'single';
                this.sceneState.minChoices = 1;
                this.sceneState.maxChoices = 1;
            } else {
                this.sceneState.choiceType = 'text';
                this.sceneState.minChoices = 0;
                this.sceneState.maxChoices = 0;
            }

            // 只在没有明确传递selectedCount时才重新计算
            if (!updates.hasOwnProperty('selectedCount')) {
                this.sceneState.selectedCount = this.getSelectedCount();
            }

            // 检测冲突状态
            if (this.sceneState.choiceType === 'multi' && this.storyArea) {
                const selectedItems = this.storyArea.querySelectorAll('.multi-choice-item.selected');
                const conflictResult = this.checkSmartConflicts(selectedItems);
                this.sceneState.hasConflicts = conflictResult.hasConflict;
            }
        }

        // 更新继续按钮状态
        this.updateContinueButtonFromState();

        // 调用状态变化回调（防止循环调用）
        if (oldStatus !== this.sceneState.status || oldSelectedCount !== this.sceneState.selectedCount) {
            this.onSceneStateChange();
        }
    }

    /**
     * 获取当前选择数量
     * @returns {number} 选择数量
     */
    getSelectedCount() {
        if (this.sceneState.choiceType === 'single') {
            return this.isPreviewMode || this.currentChoice ? 1 : 0;
        } else if (this.sceneState.choiceType === 'multi') {
            const selectedItems = this.storyArea.querySelectorAll('.multi-choice-item.selected');
            return selectedItems.length;
        }
        return 0;
    }

    /**
     * 根据状态更新继续按钮
     */
    updateContinueButtonFromState() {
        let canProceed = false;
        let mode = 'disabled';

        switch (this.sceneState.status) {
            case 'ready':
                if (this.sceneState.choiceType === 'text') {
                    canProceed = true;
                    mode = 'normal';
                } else if (this.sceneState.choiceType === 'multi' && this.sceneState.selectedCount === 0) {
                    canProceed = true;  // 多选允许0选择
                    mode = 'normal';
                }
                break;

            case 'previewing':
                if (this.sceneState.selectedCount >= this.sceneState.minChoices &&
                    this.sceneState.selectedCount <= this.sceneState.maxChoices &&
                    !this.sceneState.hasConflicts) {
                    canProceed = true;
                    mode = 'preview';
                }
                break;

            case 'confirmed':
                canProceed = true;
                mode = 'confirmed';
                break;
        }

        this.sceneState.canProceed = canProceed;
        this.updateContinueButton(canProceed, mode);
    }

    /**
     * 状态变化回调
     */
    onSceneStateChange() {
        // 可以在这里添加状态变化的副作用
        // 例如：更新UI、触发动画、发送分析数据等
        console.debug('Scene state updated:', this.sceneState);

        // 更新F2管理器的状态指示
        if (window.f2Manager) {
            window.f2Manager.onSceneStateChange(this.sceneState);
        }
    }

    /**
     * 获取场景规则
     * @returns {Object} 场景规则对象
     */
    getSceneRules() {
        if (!this.currentScene) {
            return { type: 'none', canProceed: false };
        }

        // 检查自定义规则（特殊场景）
        if (this.currentScene.rules) {
            return {
                type: 'special',
                canProceed: this.currentScene.rules.canProceed || false,
                message: this.currentScene.rules.message || '请遵循场景规则'
            };
        }

        // 检查是否为多选场景
        if (this.currentScene.multiChoice || this.currentScene.maxChoices > 1) {
            return {
                type: 'multi',
                canProceed: true, // 多选场景0选择也可继续（灵活性）
                minChoices: this.currentScene.minChoices || 0,
                maxChoices: this.currentScene.maxChoices || this.currentScene.choices.length
            };
        }

        // 检查是否为单选场景
        if (this.currentScene.choices && this.currentScene.choices.length > 0) {
            return {
                type: 'single',
                canProceed: false, // 单选场景必须有preview选择
                message: '请先选择一个选项'
            };
        }

        // 无选择场景（纯文本）
        return {
            type: 'text',
            canProceed: true,
            message: '点击继续'
        };
    }

    /**
     * 检查是否可以继续到下一步
     * @returns {Object} 检查结果 {canProceed: boolean, message: string, mode: string}
     */
    canProceedToNext() {
        const rules = this.getSceneRules();

        switch (rules.type) {
            case 'single':
                // 单选场景：必须有预览选择
                if (this.isPreviewMode && this.previewChoice) {
                    return {
                        canProceed: true,
                        message: '点击确认选择',
                        mode: 'preview'
                    };
                }
                return {
                    canProceed: false,
                    message: rules.message || '请先选择一个选项',
                    mode: 'disabled'
                };

            case 'multi':
                // 多选场景：0选择也可继续（灵活性）
                if (this.isPreviewMode) {
                    const selectedCount = Array.isArray(this.previewChoice) ? this.previewChoice.length : 0;
                    return {
                        canProceed: true,
                        message: selectedCount > 0 ? `确认${selectedCount}项选择` : '确认跳过选择',
                        mode: 'preview'
                    };
                }
                return {
                    canProceed: true,
                    message: '可以直接继续或先选择',
                    mode: 'normal'
                };

            case 'special':
                // 特殊场景：按自定义规则判断
                return {
                    canProceed: rules.canProceed,
                    message: rules.message,
                    mode: rules.canProceed ? 'normal' : 'disabled'
                };

            case 'text':
                // 纯文本场景：直接可继续
                return {
                    canProceed: true,
                    message: rules.message || '点击继续',
                    mode: 'normal'
                };

            default:
                // 无场景或其他情况
                return {
                    canProceed: false,
                    message: '场景未加载',
                    mode: 'disabled'
                };
        }
    }

    /**
     * 应用选择结果到游戏状态
     * @param {Object} choice - 选择对象
     * @param {Object} scene - 当前场景
     */
    applyChoiceResults(choice, scene) {
        console.log('📝 小纸条：开始应用选择结果', choice);

        try {
            // 处理属性变化效果
            if (choice.effect) {
                this.applyEffects(choice.effect);
            }

            // 处理时间消耗
            if (choice.timeCost) {
                this.updateGameTime(choice.timeCost);
            }

            // 处理物品获得/失去
            if (choice.items) {
                this.updateInventory(choice.items);
            }

            // 处理技能变化
            if (choice.skills) {
                this.updateSkills(choice.skills);
            }

            console.log('✅ 小纸条：选择结果应用完成');
        } catch (error) {
            console.error('❌ 应用选择结果时出错:', error);
        }
    }

    /**
     * 应用属性效果
     * @param {Object} effects - 效果对象
     */
    applyEffects(effects) {
        console.log('应用属性效果:', effects);
        // 这里可以调用游戏引擎的属性更新方法
        if (window.gameEngine && window.gameEngine.updateStats) {
            window.gameEngine.updateStats(effects);
        }
    }

    /**
     * 更新游戏时间
     * @param {number} minutes - 消耗的分钟数
     */
    updateGameTime(minutes) {
        console.log(`时间流逝 ${minutes} 分钟`);
        // 这里可以调用时间系统的更新方法
        if (window.timeSystem && window.timeSystem.advance) {
            window.timeSystem.advance(minutes);
        }
    }

    /**
     * 更新背包
     * @param {Array} items - 物品变化数组
     */
    updateInventory(items) {
        console.log('更新背包:', items);
        // 这里可以调用背包系统的更新方法
        if (window.inventorySystem && window.inventorySystem.updateItems) {
            window.inventorySystem.updateItems(items);
        }
    }

    /**
     * 更新技能
     * @param {Object} skills - 技能变化对象
     */
    updateSkills(skills) {
        console.log('更新技能:', skills);
        // 这里可以调用技能系统的更新方法
        if (window.skillSystem && window.skillSystem.updateSkills) {
            window.skillSystem.updateSkills(skills);
        }
    }

    /**
     * 更新继续按钮状态
     * @param {boolean} enabled - 是否启用
     * @param {string} mode - 模式：'preview' 或 'confirmed'
     */
    updateContinueButton(enabled, mode = 'confirmed') {
        // 通知F2区管理器更新按钮状态
        if (window.f2Manager) {
            window.f2Manager.updateContinueButton(enabled, mode);
        }
    }
}

// 创建全局实例
window.sceneManager = new SceneManager();