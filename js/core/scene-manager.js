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

        // 重置系统：世界快照历史管理
        this.lastWorldSnapshot = null;  // 上一步的世界快照
        this.canResetToLastStep = false;  // 是否可以重置到上一步
        this.justResetted = false;  // 标记刚刚重置过
        this.isRestoring = false;  // 标记正在恢复中

        // 废弃旧的重置系统（保留以防兼容性问题）
        this.canReset = false;
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

        // 持久化选择状态（解决场景切换丢失问题）
        this.persistentChoiceState = {
            selectedItems: [],       // 已选择的物品数据
            choiceEffects: {},       // 选择产生的效果
            choiceDescription: '',   // 选择描述文本
            timeCost: 0             // 时间消耗
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

        console.log('📝 loadScene被调用，场景ID:', sceneData?.id);

        // 更新状态为加载中
        this.updateSceneState({ status: 'loading' });

        this.currentScene = sceneData;
        this.currentChoice = null;
        this.previewChoice = null;  // 重置预览状态
        this.isPreviewMode = false;
        this.canReset = true;

        // 保存当前场景快照（用于重置）
        this.lastSceneSnapshot = this.getCurrentSnapshot();

        // 更新全局游戏状态中的场景信息
        if (window.gameState) {
            window.gameState.currentSceneId = sceneData.id || null;
            window.gameState.currentChoiceId = null;
            // 添加到场景历史（最多保留20个）
            if (!window.gameState.sceneHistory) {
                window.gameState.sceneHistory = [];
            }
            window.gameState.sceneHistory.push({
                sceneId: sceneData.id,
                timestamp: Date.now()
            });
            if (window.gameState.sceneHistory.length > 20) {
                window.gameState.sceneHistory.shift();
            }
        }

        // 注意：自动存档移到场景加载完成后触发（在fadeIn回调中）
        // 这样可以确保保存的是新场景而不是旧场景

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
                console.log('✨ fadeIn回调执行，场景ID:', sceneData.id);

                // 场景加载完成，更新状态为就绪
                this.updateSceneState({ status: 'ready' });

                // 场景完全加载后，更新世界状态
                if (window.worldState) {
                    console.log('📊 准备更新世界状态，场景ID:', sceneData.id);
                    window.worldState.updateCurrentScene(sceneData);
                } else {
                    console.log('⚠️ worldState不存在，无法更新场景');
                }

                // 触发自动存档 - 场景切换完成
                // 但如果是从存档恢复的场景（isRestoring标记），不要触发存档
                if (window.saveSystem && !this.isRestoring) {
                    console.log('📸 场景加载完成，触发自动存档，场景ID:', sceneData.id);
                    window.saveSystem.triggerAutoSave('scene_change');
                } else {
                    console.log('⏭️ 跳过自动存档，isRestoring:', this.isRestoring);
                }
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
                    // 替换模板变量
                    const processedParagraph = this.processTextTemplate(paragraph);
                    html += `<p>${processedParagraph}</p>`;
                });
            } else {
                // 替换模板变量
                const processedText = this.processTextTemplate(sceneData.text);
                html += `<p>${processedText}</p>`;
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
                const minChoices = sceneData.minChoices !== undefined ? sceneData.minChoices : 1;
                const maxChoices = sceneData.maxChoices || sceneData.choices.length;

                let hintText;
                if (minChoices === 0) {
                    hintText = `可选择 0-${maxChoices} 个选项（可以什么都不选）`;
                } else {
                    hintText = `请选择 ${minChoices}-${maxChoices} 个选项`;
                }

                html += `
                    <div class="multi-choice-hint">
                        ${hintText}
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
                const initialDisabled = minChoices > 0 ? 'disabled' : '';
                const initialText = minChoices === 0 ? '✓ 确认不带任何物品' : '✓ 确认选择';

                html += `
                    <div class="multi-choice-buttons">
                        <button class="multi-choice-confirm" id="multiConfirmBtn" onclick="sceneManager.confirmMultiChoice()" ${initialDisabled}>
                            ${initialText}
                        </button>
                        <button class="multi-choice-reset" id="multiResetBtn" onclick="sceneManager.resetMultiChoice()" title="重新选择">
                            🔄 重新选择
                        </button>
                    </div>
                `;

                html += '</div>'; // 关闭multi-choice-container
            } else {
                // 单选场景
                let renderedCount = 0;
                let hiddenCount = 0;
                console.log(`📝 开始渲染选项，总数: ${sceneData.choices.length}`);

                sceneData.choices.forEach((choice, index) => {
                    console.log(`  [${index}] 处理选项: "${choice.text}"`);
                    // 🔍 Stage 4: 条件检查
                    let isDisabled = false;
                    let isHidden = false;
                    let failReasons = [];
                    let conditionDesc = '';

                    // 检查显示条件（隐藏选项）
                    if (choice.showConditions && window.ConditionEngine) {
                        const context = this.buildConditionContext();
                        console.log(`🔍 检查选项 #${index} "${choice.text}" 的showConditions:`, {
                            showConditions: choice.showConditions,
                            contextMoney: context.character?.money,
                            contextTime: context.time,
                            contextWeather: context.weather,
                            fullContext: context
                        });

                        const canShow = window.ConditionEngine.check(choice.showConditions, context);
                        isHidden = !canShow;

                        console.log(`👁️ 检查结果: canShow=${canShow}, isHidden=${isHidden}`);

                        // 如果隐藏，直接跳过不渲染
                        if (isHidden) {
                            console.log(`🙈 选项 "${choice.text}" 被隐藏（条件不满足）`);
                            hiddenCount++;
                            return; // forEach 的 return 相当于 continue
                        } else {
                            console.log(`✨ 选项 "${choice.text}" 显示（条件满足）`);
                        }
                    }

                    // 如果选项被隐藏了，上面的return已经执行，下面的代码不会运行
                    // 只有显示的选项才会继续执行下面的代码

                    // 检查可用条件（灰化选项）
                    if (choice.conditions && window.ConditionEngine) {
                        const context = this.buildConditionContext();
                        isDisabled = !window.ConditionEngine.check(choice.conditions, context);

                        if (isDisabled) {
                            // 获取失败原因
                            failReasons = window.ConditionEngine.getFailReasons(choice.conditions, context);
                        }

                        // 获取条件描述（可选，用于debug）
                        conditionDesc = window.ConditionEngine.describe(choice.conditions);
                    }

                    // 生成选项HTML
                    const disabledClass = isDisabled ? 'disabled' : '';
                    const disabledAttr = isDisabled ? 'data-disabled="true"' : '';
                    const failReasonsAttr = failReasons.length > 0
                        ? `data-fail-reasons="${failReasons.join('；')}"`
                        : '';

                    html += `
                        <div class="story-choice ${disabledClass}"
                             data-index="${index}"
                             data-target="${choice.target || ''}"
                             ${disabledAttr}
                             ${failReasonsAttr}
                             ${conditionDesc ? `title="${conditionDesc}"` : ''}>
                            ${choice.text}
                            ${isDisabled ? '<span class="lock-icon">🔒</span>' : ''}
                        </div>
                    `;
                    renderedCount++;
                    console.log(`  ✅ 渲染了选项 #${renderedCount}: "${choice.text}"`);
                });

                console.log(`📊 渲染统计: 总计${sceneData.choices.length}个选项, 渲染了${renderedCount}个, 隐藏了${hiddenCount}个`);
            }

            html += '</div>';
        }

        // 插入内容
        this.storyArea.innerHTML = html;

        // 调试：检查实际渲染的选项数量
        console.log(`🎯 storyArea元素:`, this.storyArea);
        console.log(`📄 HTML长度: ${html.length} 字符`);

        const renderedChoices = this.storyArea.querySelectorAll('.story-choice');
        console.log(`🔍 实际DOM中的选项数量: ${renderedChoices.length}`);
        renderedChoices.forEach((choice, index) => {
            const text = choice.textContent.trim();
            const styles = window.getComputedStyle(choice);
            const isVisible = styles.display !== 'none' &&
                            styles.visibility !== 'hidden' &&
                            parseFloat(styles.opacity) > 0;
            const rect = choice.getBoundingClientRect();

            console.log(`  DOM[${index}]: ${text.substring(0, 30)}...`, {
                display: styles.display,
                visibility: styles.visibility,
                opacity: styles.opacity,
                isVisible: isVisible,
                position: `top:${rect.top.toFixed(0)}px, height:${rect.height.toFixed(0)}px`,
                inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight
            });
        });

        // 查看是否有隐藏选项的文本
        if (html.includes('隐藏选项')) {
            console.log('✅ HTML包含"隐藏选项"文本');
        } else {
            console.log('❌ HTML不包含"隐藏选项"文本');
        }
        if (html.includes('特殊选项')) {
            console.log('✅ HTML包含"特殊选项"文本');
        } else {
            console.log('❌ HTML不包含"特殊选项"文本');
        }

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
                // 🔒 Stage 4: 检查是否禁用
                if (choice.classList.contains('disabled') || choice.dataset.disabled === 'true') {
                    console.log('⚠️ 选项被禁用，不能选择');

                    // 显示失败原因提示
                    if (choice.dataset.failReasons) {
                        this.showDisabledTooltip(choice, choice.dataset.failReasons);
                    }
                    return;
                }

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
        const minChoices = this.currentScene.minChoices !== undefined ? this.currentScene.minChoices : 1;
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
                if (selectedCount === 0 && minChoices === 0) {
                    confirmBtn.textContent = `✓ 确认不带任何物品`;
                } else {
                    confirmBtn.textContent = `✓ 确认选择 (${selectedCount})`;
                }
                confirmBtn.style.background = 'linear-gradient(135deg, #8b92f6, #f093fb)';
            } else if (selectedCount < minChoices) {
                if (minChoices === 0) {
                    confirmBtn.textContent = `✓ 可以不选择任何物品`;
                } else {
                    confirmBtn.textContent = `请选择至少 ${minChoices} 项`;
                }
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
        // 隐藏多选确认按钮，等待F2继续按钮确认
        const confirmBtn = document.getElementById('multiConfirmBtn');
        if (confirmBtn) {
            confirmBtn.style.display = 'none';
        }

        // 获取当前选择
        const selectedItems = this.storyArea.querySelectorAll('.multi-choice-item.selected');
        const selectedChoices = [];

        selectedItems.forEach(item => {
            const index = parseInt(item.dataset.index);
            if (this.currentScene.choices[index]) {
                selectedChoices.push(this.currentScene.choices[index]);
            }
        });

        // 保存到持久化状态
        this.persistentChoiceState.selectedItems = [...selectedChoices];

        // 计算选择效果
        let choiceEffects = {};
        if (selectedChoices.length === 0 && this.currentScene.zeroChoiceEffect?.effects) {
            choiceEffects = { ...this.currentScene.zeroChoiceEffect.effects };
        } else {
            selectedChoices.forEach(choice => {
                if (choice.effects) {
                    Object.keys(choice.effects).forEach(key => {
                        choiceEffects[key] = (choiceEffects[key] || 0) + choice.effects[key];
                    });
                }
            });
        }
        this.persistentChoiceState.choiceEffects = choiceEffects;

        // 生成选择描述
        if (selectedChoices.length === 0) {
            this.persistentChoiceState.choiceDescription = this.currentScene.zeroChoiceEffect?.description || '什么都没有选择';
        } else {
            const itemNames = selectedChoices.map(choice => {
                // 优先使用description，否则清理text
                if (choice.description) {
                    return choice.description;
                }
                // 使用更安全的emoji移除方式
                let cleanText = choice.text;
                // 移除所有emoji（Unicode emoji范围）
                cleanText = cleanText.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
                // 移除箭头符号
                cleanText = cleanText.replace(/→/g, '');
                // 移除多余空格
                cleanText = cleanText.trim();
                return cleanText;
            }).join('、');
            this.persistentChoiceState.choiceDescription = `你带上了：${itemNames}`;
        }

        // 设置预览状态（0选择也要设置）
        this.previewChoice = selectedChoices;
        this.isPreviewMode = true;

        // 更新状态为预览模式
        this.updateSceneState({
            status: 'previewing',
            selectedCount: selectedChoices.length
        });

        console.log('📝 小纸条：多选确认完成，进入预览模式，选择数量:', selectedChoices.length);
        console.log('📝 小纸条：选择描述:', this.persistentChoiceState.choiceDescription);
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
        if (this.currentScene.multiChoice &&
            (!this.previewChoice || (Array.isArray(this.previewChoice) && this.previewChoice.length === 0))) {
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
        console.log('🎭 [原始] proceedToNext被调用');
        console.log('🎭 [原始] isPreviewMode:', this.isPreviewMode);
        console.log('🎭 [原始] previewChoice:', this.previewChoice);
        console.log('🎭 [原始] currentChoice:', this.currentChoice);

        // 更新状态为转换中
        this.updateSceneState({ status: 'transitioning' });

        // 🔄 重置系统：保存当前世界快照（在执行选择之前）
        if (!this.justResetted && window.worldState) {
            // 只有不是刚重置的情况下，才保存快照
            this.saveWorldSnapshot();
        }

        // 如果处于预览模式，先确认预览选择
        if (this.isPreviewMode) {
            console.log('🎭 [原始] 进入预览确认流程');
            if (!this.confirmPreviewChoice()) {
                console.log('🎭 [原始] 预览确认失败');
                // 确认失败，恢复状态
                this.updateSceneState({ status: 'previewing' });
                return;
            }
            console.log('🎭 [原始] 预览确认成功，currentChoice:', this.currentChoice);
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

        // 🔄 重置系统：点击继续后，刷新重置能力
        this.canResetToLastStep = true;
        this.justResetted = false;

        // 📝 小纸条：应用选择结果到游戏状态
        console.log('📝 小纸条：准备应用选择结果到游戏状态');
        this.applyChoiceResults(this.currentChoice, this.currentScene);

        // 注意：移除这里的自动存档触发，因为此时还在旧场景
        // 自动存档会在新场景加载完成后触发（loadScene的fadeIn回调中）
        // 这样确保存档保存的是新场景而不是旧场景

        // 🔥 立即强制更新UI，不等待场景切换
        // PWA和网页版都使用forceUpdateUI
        this.forceUpdateUI();

        // 触发自定义事件，通知其他系统UI已更新
        window.dispatchEvent(new CustomEvent('gameStateUpdated', {
            detail: {
                character: window.gameState?.character,
                time: window.timeSystem?.currentTime
            }
        }));

        // 检查当前状态是否是AI对话模式
        if (this.sceneState.status === 'ai_dialogue') {
            console.log('🎭 当前在AI对话模式，跳过场景跳转');
            return;
        }

        // 获取下一场景
        const nextScene = this.getNextScene(this.currentChoice);

        console.log('🎯 获取到的下一场景:', nextScene ? nextScene.id : 'null');

        if (nextScene) {
            // 检查是否是AI对话场景
            if (nextScene.type === 'ai_dialogue') {
                this.switchToAIMode(nextScene);
            } else {
                console.log('🚀 准备加载新场景:', nextScene.id);
                this.loadScene(nextScene);
            }
        } else {
            // 静默处理场景加载失败
            console.warn('场景加载失败:', this.currentChoice);
        }
    }

    /**
     * 结束AI对话模式
     */
    endAIDialogue() {
        console.log('🎭 场景管理器：结束AI对话模式');

        // 恢复到ready状态
        this.updateSceneState({
            status: 'ready',
            selectedCount: 0,
            canProceed: false
        });

        // 清除AI对话相关的选择
        this.currentChoice = null;
        this.selectedChoiceId = null;
    }

    /**
     * 重置到上一步 - 新的重置系统
     */
    resetScene() {
        console.log('📝 小纸条：重置按钮被点击了！');

        // 检查是否可以重置
        if (!this.canResetToLastStep) {
            console.log('❌ 小纸条：不能重置，需要先继续后才能重置');
            return; // 静默处理
        }

        if (!this.lastWorldSnapshot) {
            console.log('❌ 小纸条：没有世界快照，无法重置');
            return; // 静默处理
        }

        console.log('📝 小纸条：重置开始 - 回到上一步');
        console.log('📝 小纸条：当前状态:', this.sceneState.status);

        // 添加时光倒流视觉特效
        this.playTimeRewindEffect();

        // 延迟恢复世界快照，让特效先播放
        setTimeout(() => {
            // 恢复世界快照
            this.restoreWorldSnapshot();
            console.log('✅ 小纸条：重置到上一步完成');
        }, 750); // 特效播放时间
    }

    /**
     * 播放时光倒流视觉特效
     */
    playTimeRewindEffect() {
        // 获取游戏容器
        const gameContainer = document.querySelector('.game-container') ||
                              document.querySelector('.upper-section')?.parentElement;

        if (!gameContainer) return;

        // 创建涟漪效果
        this.createRippleEffect(gameContainer);

        // 创建粒子效果
        for (let i = 0; i < 15; i++) {
            setTimeout(() => this.createTimeParticle(gameContainer), i * 50);
        }

        // 添加模糊动画效果
        gameContainer.classList.add('time-rewind-effect');

        // 移除动画类
        setTimeout(() => {
            gameContainer.classList.remove('time-rewind-effect');
        }, 1500);
    }

    /**
     * 创建涟漪效果
     */
    createRippleEffect(container) {
        const ripple = document.createElement('div');
        ripple.className = 'time-ripple';
        container.appendChild(ripple);
        setTimeout(() => ripple.remove(), 1500);
    }

    /**
     * 创建时光粒子
     */
    createTimeParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'time-particle';

        // 随机位置和飘移方向
        const randomX = Math.random() * 100;
        const randomDrift = (Math.random() - 0.5) * 100;

        particle.style.left = `${randomX}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.setProperty('--drift', `${randomDrift}px`);

        container.appendChild(particle);
        setTimeout(() => particle.remove(), 2000);
    }

    /**
     * 重置到上一步（兼容旧方法名）
     */
    resetToLastStep() {
        this.resetScene();
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
            // 获取预定义的结果场景
            if (window.OpeningScenes && window.OpeningScenes.items_selected) {
                const resultScene = JSON.parse(JSON.stringify(window.OpeningScenes.items_selected));

                // 生成描述文本
                let itemsDescription;
                if (choices.length === 0) {
                    // 0选择的情况
                    itemsDescription = this.currentScene.zeroChoiceEffect?.description ||
                        '你思考了一会，最终决定什么都不带。';
                } else {
                    // 有选择的情况
                    const selectedItems = choices.map(c => c.text).join('、');
                    itemsDescription = `背包里现在有：${selectedItems}`;
                }

                // 替换文本中的占位符
                resultScene.text = resultScene.text.map(text =>
                    text.replace('{selectedItemsDescription}', itemsDescription)
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
            // 处理时间消耗（优先处理，因为其他效果可能依赖时间）
            this.calculateAndApplyTimeCost(choice, scene);

            // 处理属性变化效果
            if (choice.effects ||
                (Array.isArray(choice) && choice.some(c => c.effects)) ||
                (Array.isArray(choice) && choice.length === 0 && scene.zeroChoiceEffect?.effects) ||
                (Array.isArray(choice) && Object.keys(this.persistentChoiceState.choiceEffects).length > 0)) {
                this.applyEffects(choice);
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
     * @param {Object|Array} choice - 选择对象或选择数组
     */
    applyEffects(choice) {
        console.log('应用属性效果:', choice);

        let effectsToApply = {};

        // 优先使用持久化状态的效果（多选场景已经计算过）
        if (Array.isArray(choice) && Object.keys(this.persistentChoiceState.choiceEffects).length > 0) {
            effectsToApply = { ...this.persistentChoiceState.choiceEffects };
            console.log('📝 小纸条：使用持久化选择效果:', effectsToApply);
        } else if (Array.isArray(choice)) {
            // 多选场景 - 重新计算（后备方案）
            if (choice.length === 0) {
                // 0选择的效果
                if (this.currentScene.zeroChoiceEffect && this.currentScene.zeroChoiceEffect.effects) {
                    effectsToApply = this.currentScene.zeroChoiceEffect.effects;
                }
            } else {
                // 合并多个选择的效果
                choice.forEach(item => {
                    if (item.effects) {
                        Object.keys(item.effects).forEach(key => {
                            effectsToApply[key] = (effectsToApply[key] || 0) + item.effects[key];
                        });
                    }
                });
            }
        } else {
            // 单选场景
            if (choice.effects) {
                effectsToApply = choice.effects;
            }
        }

        // 应用合并后的效果
        if (Object.keys(effectsToApply).length > 0) {
            console.log('最终应用的效果:', effectsToApply);

            // 更新gameState中的角色属性
            if (window.gameState && window.gameState.character) {
                // 🎯 使用响应式系统（如果存在）
                const targetState = window.reactiveGameState || window.gameState.character;

                Object.keys(effectsToApply).forEach(stat => {
                    const currentValue = targetState[stat] || 0;
                    const newValue = currentValue + effectsToApply[stat];

                    // 更新数据 - 如果是响应式，UI会自动更新！
                    targetState[stat] = Math.max(0, newValue);

                    // 同步到原始gameState（保持数据一致）
                    if (window.reactiveGameState && window.gameState.character) {
                        window.gameState.character[stat] = targetState[stat];
                    }

                    // 🔥 关键：同步到worldState，确保存档时能保存！
                    if (window.worldState && window.worldState.state.player.stats[stat] !== undefined) {
                        window.worldState.state.player.stats[stat] = targetState[stat];
                        console.log(`🔄 已同步${stat}到worldState:`, targetState[stat]);
                    }

                    const change = effectsToApply[stat];
                    const sign = change >= 0 ? '+' : '';
                    console.log(`📝 小纸条：${stat} ${currentValue} → ${targetState[stat]} (${sign}${change})`);
                });

                // 🎯 如果有响应式系统，就不需要手动更新了！
                if (!window.reactiveGameState) {
                    // 只有在没有响应式系统时才手动更新
                    console.log(`📝 小纸条：无响应式系统，手动更新UI`);
                    this.directUpdateDOM();
                } else {
                    console.log(`✨ 响应式系统已自动更新UI！`);
                }

                // 注意：移除这里的保存游戏状态调用
                // 因为此时还在旧场景，应该等新场景加载完成后再保存
            }

            // 备用方案：调用gameEngine
            if (window.gameEngine && window.gameEngine.updateStats) {
                window.gameEngine.updateStats(effectsToApply);
            }

            // 应用效果后清理持久化状态（避免影响下个场景）
            if (Array.isArray(choice) && Object.keys(this.persistentChoiceState.choiceEffects).length > 0) {
                this.clearPersistentChoiceState();
            }
        }
    }

    /**
     * 显示禁用选项的提示
     * Stage 4: 显示为什么选项不可用
     */
    showDisabledTooltip(element, reasons) {
        // 创建或获取提示框
        let tooltip = document.getElementById('condition-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'condition-tooltip';
            tooltip.className = 'condition-tooltip';
            document.body.appendChild(tooltip);
        }

        // 设置内容
        tooltip.innerHTML = `
            <div class="tooltip-header">🔒 条件不满足</div>
            <div class="tooltip-content">${reasons}</div>
        `;

        // 定位（在元素上方）
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.top - 10) + 'px';
        tooltip.style.transform = 'translateY(-100%)';

        // 显示
        tooltip.classList.add('show');

        // 3秒后自动隐藏
        setTimeout(() => {
            tooltip.classList.remove('show');
        }, 3000);

        // 点击其他地方隐藏
        const hideTooltip = () => {
            tooltip.classList.remove('show');
            document.removeEventListener('click', hideTooltip);
        };
        setTimeout(() => {
            document.addEventListener('click', hideTooltip);
        }, 100);
    }

    /**
     * 构建条件检查的上下文
     * Stage 4: 集合当前游戏状态供条件引擎使用
     */
    buildConditionContext() {
        const context = {};

        // 1. 游戏时间
        if (window.timeSystem) {
            context.gameTime = window.timeSystem.currentTime;
            context.time = window.timeSystem.currentTime; // 兼容性：有些地方可能用context.time
        } else if (window.worldState?.state?.time) {
            context.gameTime = window.worldState.state.time;
            context.time = window.worldState.state.time;
        }

        // 2. 角色状态和属性
        const character = {};
        if (window.worldState?.state?.player?.stats) {
            // 复制所有stats作为character属性
            Object.assign(character, window.worldState.state.player.stats);
        }

        // 添加其他属性
        if (window.worldState?.state?.player?.attributes) {
            Object.assign(character, window.worldState.state.player.attributes);
        }

        // 添加季节作为属性
        if (window.worldState?.state?.environment?.season) {
            character.season = window.worldState.state.environment.season;
        }

        // 添加关系作为属性
        if (window.worldState?.state?.relationships?.zero) {
            character.zero_affection = window.worldState.state.relationships.zero.affection || 0;
        }

        context.character = character;

        // 3. 处理inventory - 转换为字符串数组或对象
        const inventory = {};
        if (window.worldState?.state?.player?.inventory?.items) {
            const items = window.worldState.state.player.inventory.items;
            if (Array.isArray(items)) {
                // 转换 [{name: '钥匙', count: 1}] 为 {'钥匙': 1}
                items.forEach(item => {
                    if (typeof item === 'string') {
                        inventory[item] = 1;
                    } else if (item.name) {
                        inventory[item.name] = item.count || 1;
                    }
                });
            }
        }
        context.inventory = inventory;

        // 4. 当前位置
        if (window.worldState?.state?.player?.position) {
            context.location = window.worldState.state.player.position.location;
        } else if (window.gameState?.character?.location) {
            context.location = window.gameState.character.location;
        }

        // 5. 天气
        if (window.weatherSystem) {
            context.weather = window.weatherSystem.currentWeather;
        } else if (window.worldState?.state?.environment?.weather) {
            context.weather = window.worldState.state.environment.weather;
        }

        // 6. 剧情标记（预留）
        if (window.worldState?.state?.story?.flags) {
            context.flags = window.worldState.state.story.flags;
        } else if (window.storyFlags) {
            context.flags = window.storyFlags;
        }

        console.log('📋 构建条件上下文:', {
            time: context.gameTime,
            weather: context.weather,
            character: context.character,
            inventory: context.inventory,
            location: context.location
        });
        return context;
    }

    /**
     * 更新游戏时间
     * @param {number} minutes - 消耗的分钟数
     * @param {string} reason - 时间消耗的原因
     */
    updateGameTime(minutes, reason = '') {
        console.log(`⏰ 时间流逝 ${minutes} 分钟${reason ? ` (${reason})` : ''}`);
        // 调用时间系统推进时间
        if (window.timeSystem && window.timeSystem.advanceTime) {
            window.timeSystem.advanceTime(minutes, reason);
        }
        // UI更新已由advanceTime内部处理，通过响应式系统
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
     * 计算并应用时间消耗
     * @param {Object|Array} choice - 选择对象或选择数组（多选）
     * @param {Object} scene - 当前场景
     */
    calculateAndApplyTimeCost(choice, scene) {
        let totalTimeCost = 0;
        let timeReason = '';

        if (Array.isArray(choice)) {
            // 多选场景的时间计算
            console.log('📝 小纸条：计算多选场景时间消耗');

            // 基础动作时间（例如整理背包的动作本身）
            if (scene.actionTimeCost) {
                totalTimeCost += scene.actionTimeCost;
                console.log(`📝 小纸条：基础动作时间 +${scene.actionTimeCost}分钟`);
            }

            // 根据场景ID判断具体动作
            if (scene.id && scene.id.includes('organize_bag')) {
                timeReason = '整理背包';
            } else if (scene.id && scene.id.includes('shopping')) {
                timeReason = '购物';
            } else {
                timeReason = scene.title || '整理物品';
            }

            if (choice.length === 0) {
                // 0选择的额外时间消耗（什么都不选也要花时间）
                if (scene.zeroChoiceEffect && scene.zeroChoiceEffect.timeCost) {
                    totalTimeCost += scene.zeroChoiceEffect.timeCost;
                    console.log(`📝 小纸条：0选择思考时间 +${scene.zeroChoiceEffect.timeCost}分钟`);
                }
                timeReason += '（犹豫不决）';
            } else {
                // 每个物品的额外时间
                if (scene.itemTimeCost) {
                    const itemTime = choice.length * scene.itemTimeCost;
                    totalTimeCost += itemTime;
                    console.log(`📝 小纸条：${choice.length}个物品时间 +${itemTime}分钟`);
                }
                timeReason += `（选择了${choice.length}件物品）`;
            }
        } else {
            // 单选场景的时间消耗
            if (choice) {
                // 优先使用新的timeLevel系统
                if (choice.timeLevel) {
                    totalTimeCost = window.timeSystem.getTimeByLevel(choice.timeLevel);
                    timeReason = choice.text || '做出选择';
                    console.log(`📝 小纸条：使用时间等级 ${choice.timeLevel} = ${totalTimeCost}分钟`);
                }
                // 兼容旧的timeCost属性
                else if (choice.timeCost) {
                    totalTimeCost = choice.timeCost;
                    timeReason = choice.text || '做出选择';
                    console.log(`📝 小纸条：单选时间消耗 +${totalTimeCost}分钟`);
                }
            }
        }

        // 应用时间消耗
        if (totalTimeCost > 0) {
            // 确保时间是5的倍数
            if (totalTimeCost % 5 !== 0) {
                totalTimeCost = Math.ceil(totalTimeCost / 5) * 5;
            }
            this.updateGameTime(totalTimeCost, timeReason);
            console.log(`📝 小纸条：总时间消耗 ${totalTimeCost}分钟`);
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

    /**
     * 处理文本模板替换
     * @param {string} text - 原始文本
     * @returns {string} 处理后的文本
     */
    processTextTemplate(text) {
        let processedText = text;

        // 替换选择描述模板
        if (processedText.includes('{selectedItemsDescription}')) {
            const description = this.persistentChoiceState.choiceDescription || '什么都没有带';
            processedText = processedText.replace('{selectedItemsDescription}', description);
        }

        return processedText;
    }

    /**
     * 清理持久化状态（在合适的时机调用）
     */
    clearPersistentChoiceState() {
        this.persistentChoiceState = {
            selectedItems: [],
            choiceEffects: {},
            choiceDescription: '',
            timeCost: 0
        };
        console.log('📝 小纸条：持久化选择状态已清理');
    }

    /**
     * 直接更新DOM - 适用于PWA环境
     */
    directUpdateDOM() {
        console.log('🎯 PWA模式 - 直接更新DOM元素');

        // 如果当前不在状态标签页，需要先切换或更新内容
        const currentTab = document.querySelector('.tab-btn.active')?.dataset?.tab;

        if (currentTab === 'status') {
            // 在状态页，直接更新状态条
            this.updateStatusBars();
        } else {
            // 不在状态页，需要更新当前标签页的HTML内容
            this.refreshCurrentTabContent(currentTab);
        }

        // 总是更新B区时间和位置
        this.updateTimeAndLocation();
    }

    /**
     * 更新状态条
     */
    updateStatusBars() {
        if (!window.gameState?.character) return;

        const char = window.gameState.character;

        // 批量更新所有状态条
        const stats = [
            { id: 'health', value: char.health || 100, isPercent: true },
            { id: 'mood', value: char.mood || 50, isPercent: true },
            { id: 'money', value: char.money || 0, isPercent: false },
            { id: 'energy', value: char.energy || 80, isPercent: true },
            { id: 'spirit', value: char.spirit, isPercent: true }
        ];

        stats.forEach(stat => {
            if (stat.value === undefined) return;

            const bar = document.getElementById(`${stat.id}Bar`);
            const text = document.getElementById(`${stat.id}Value`);

            if (bar && text) {
                const width = stat.isPercent ? stat.value : Math.min(100, stat.value / 10);
                bar.style.width = `${width}%`;
                text.textContent = stat.value;
                console.log(`✅ 更新${stat.id}: ${stat.value}`);
            }
        });
    }

    /**
     * 刷新当前标签页内容
     */
    refreshCurrentTabContent(tabName) {
        if (!tabName) return;

        const content = document.getElementById('functionContent');
        if (!content) return;

        // 这里应该调用生成标签页内容的函数
        // 但为了避免跨文件调用，直接更新关键数据
        console.log(`📝 刷新${tabName}标签页内容`);
    }

    /**
     * 更新时间和位置
     */
    updateTimeAndLocation() {
        // 更新时间
        if (window.timeSystem) {
            const timeEl = document.getElementById('currentTime');
            if (timeEl) {
                const timeStr = window.timeSystem.formatTime('icon');
                timeEl.textContent = timeStr;
                console.log(`✅ 更新时间: ${timeStr}`);
            }
        }

        // 更新位置
        if (window.gameState?.character?.location) {
            const locEl = document.getElementById('currentLocation');
            if (locEl) {
                locEl.textContent = window.gameState.character.location;
                console.log(`✅ 更新位置: ${window.gameState.character.location}`);
            }
        }
    }

    /**
     * 保存世界快照
     */
    saveWorldSnapshot() {
        if (!window.worldState) {
            console.warn('⚠️ worldState不存在，无法保存快照');
            return;
        }

        // 获取完整的世界状态
        this.lastWorldSnapshot = window.worldState.getFullState();
        console.log('💾 已保存世界快照，时间点:', this.lastWorldSnapshot.time);
    }

    /**
     * 恢复世界快照
     */
    restoreWorldSnapshot() {
        if (!this.lastWorldSnapshot || !window.worldState) {
            console.error('❌ 无法恢复世界快照');
            return;
        }

        console.log('🔄 开始恢复世界快照...');

        // 设置恢复标记
        this.isRestoring = true;
        this.justResetted = true;
        this.canResetToLastStep = false;

        // 恢复世界状态
        window.worldState.loadFullState(this.lastWorldSnapshot);

        // 恢复场景（如果有）
        if (this.lastWorldSnapshot.currentSceneData && this.lastWorldSnapshot.currentSceneData.scene) {
            console.log('📖 恢复场景:', this.lastWorldSnapshot.currentSceneData.scene.id);

            // 清除当前的选择状态
            this.currentChoice = null;
            this.previewChoice = null;
            this.isPreviewMode = false;

            // 重新加载场景
            this.loadScene(this.lastWorldSnapshot.currentSceneData.scene);
        }

        // 🌟 触发响应式系统更新（替代forceUpdateUI）
        this.triggerReactiveUpdate();

        // 通知F2管理器更新重置按钮状态
        if (window.f2Manager) {
            window.f2Manager.updateResetButton(false);
        }

        // 清除恢复标记
        setTimeout(() => {
            this.isRestoring = false;
            console.log('📖 恢复标记已清除');
        }, 500);
    }

    /**
     * 触发响应式系统更新
     */
    triggerReactiveUpdate() {
        console.log('✨ 触发响应式系统更新...');

        // 如果有响应式系统，让它自动更新UI
        if (window.reactiveGameState && window.worldState) {
            const restoredStats = window.worldState.state.player.stats;
            const restoredPosition = window.worldState.state.player.position;

            // 批量更新响应式数据（会自动触发UI更新）
            console.log('📊 更新响应式数据:', restoredStats);

            // 更新所有状态值
            Object.keys(restoredStats).forEach(key => {
                if (window.reactiveGameState[key] !== undefined) {
                    // 响应式系统会自动检测变化并更新UI
                    window.reactiveGameState[key] = restoredStats[key];
                }
            });

            // 更新位置
            if (window.reactiveGameState.location !== undefined) {
                window.reactiveGameState.location = restoredPosition.location;
            }

            console.log('✅ 响应式更新完成，UI已自动刷新');
        }
        // 降级方案：如果没有响应式系统，使用原来的强制更新
        else if (window.gameState && window.gameState.character) {
            console.log('⚠️ 无响应式系统，使用降级方案');
            this.forceUpdateUI();
        }
        // 如果响应式系统还没初始化，使用批量更新
        else if (window.reactiveSystem && window.worldState) {
            console.log('📊 使用响应式批量更新');
            const restoredStats = window.worldState.state.player.stats;
            window.reactiveSystem.batchUpdate(restoredStats);
        }
    }

    /**
     * 强制更新UI - 直接操作DOM
     */
    forceUpdateUI() {
        // 检测是否在PWA模式
        const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone ||
                      document.referrer.includes('android-app://');

        console.log(isPWA ? '📱 PWA模式 - 强制更新UI' : '🌐 网页模式 - 强制更新UI');

        // 直接更新D区状态条
        if (window.gameState && window.gameState.character) {
            const char = window.gameState.character;

            // 更新体力条
            const healthBar = document.getElementById('healthBar');
            const healthValue = document.getElementById('healthValue');
            if (healthBar && healthValue) {
                const health = char.health || 0;
                healthBar.style.width = health + '%';
                healthValue.textContent = health;
                console.log(`✅ 更新体力: ${health}`);
            }

            // 更新心情条
            const moodBar = document.getElementById('moodBar');
            const moodValue = document.getElementById('moodValue');
            if (moodBar && moodValue) {
                const mood = char.mood || 0;
                moodBar.style.width = mood + '%';
                moodValue.textContent = mood;
                console.log(`✅ 更新心情: ${mood}`);
            }

            // 更新金钱条
            const moneyBar = document.getElementById('moneyBar');
            const moneyValue = document.getElementById('moneyValue');
            if (moneyBar && moneyValue) {
                const money = char.money || 0;
                moneyBar.style.width = Math.min(100, money / 10) + '%';
                moneyValue.textContent = money;
                console.log(`✅ 更新金钱: ${money}`);
            }

            // 更新精力条
            const energyBar = document.getElementById('energyBar');
            const energyValue = document.getElementById('energyValue');
            if (energyBar && energyValue) {
                const energy = char.energy || 0;
                energyBar.style.width = energy + '%';
                energyValue.textContent = energy;
                console.log(`✅ 更新精力: ${energy}`);
            }

            // 更新精神条（如果有）
            const spiritBar = document.getElementById('spiritBar');
            const spiritValue = document.getElementById('spiritValue');
            if (spiritBar && spiritValue && char.spirit !== undefined) {
                spiritBar.style.width = char.spirit + '%';
                spiritValue.textContent = char.spirit;
                console.log(`✅ 更新精神: ${char.spirit}`);
            }
        }

        // 更新B区时间位置
        if (window.timeSystem) {
            const currentTime = document.getElementById('currentTime');
            if (currentTime) {
                const timeStr = window.timeSystem.formatTime('icon');
                currentTime.textContent = timeStr;
                console.log(`✅ 更新时间: ${timeStr}`);
            }
        }

        // 更新位置
        if (window.gameState && window.gameState.character) {
            const currentLocation = document.getElementById('currentLocation');
            if (currentLocation) {
                const location = window.gameState.character.location || '未知地点';
                currentLocation.textContent = location;
                console.log(`✅ 更新位置: ${location}`);
            }
        }

        console.log('🔥 UI强制更新完成');
    }
}

// 创建全局实例
window.sceneManager = new SceneManager();

// 如果worldState有待恢复的场景数据，立即恢复
// 暂时禁用 - 让game-bootstrap统一处理场景恢复
// if (window.worldState && window.worldState.tryRestorePendingScene) {
//     // 设置恢复标记，避免触发自动存档
//     window.sceneManager.isRestoring = true;
//     setTimeout(() => {
//         if (window.worldState.tryRestorePendingScene()) {
//             console.log('📖 场景管理器初始化后，成功恢复待处理场景');
//         }
//         // 恢复完成后清除标记
//         setTimeout(() => {
//             window.sceneManager.isRestoring = false;
//             console.log('📖 场景恢复标记已清除');
//         }, 500);
//     }, 10);
// }