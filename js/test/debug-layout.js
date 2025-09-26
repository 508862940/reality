/**
 * 清晰的布局调试工具
 * 只用于检查和修复F区布局问题
 */

(function() {
    'use strict';

    const LayoutDebugger = {
        // 检查F区当前状态
        checkLayout() {
            console.log('========== F区布局检查 ==========');

            // 检查F1区
            const storyArea = document.getElementById('storyArea');
            const dialogueHistoryArea = document.getElementById('dialogueHistoryArea');

            console.log('📖 F1区域检查:');
            if (storyArea) {
                console.log('  - story-area:', {
                    display: window.getComputedStyle(storyArea).display,
                    childCount: storyArea.children.length,
                    innerHTML长度: storyArea.innerHTML.length,
                    可见: storyArea.offsetParent !== null
                });

                // 检查是否有重复内容
                const choices = storyArea.querySelectorAll('.story-choice');
                console.log('  - 选项数量:', choices.length);

                // 检查是否有重复的文本
                const texts = storyArea.querySelectorAll('.story-text');
                console.log('  - 文本段落数:', texts.length);
            }

            if (dialogueHistoryArea) {
                console.log('  - dialogue-history-area:', {
                    display: window.getComputedStyle(dialogueHistoryArea).display,
                    可见: dialogueHistoryArea.offsetParent !== null
                });
            }

            // 检查F2区
            const sceneControlArea = document.getElementById('sceneControlArea');
            const aiInputArea = document.getElementById('aiInputArea');

            console.log('🎮 F2区域检查:');
            if (sceneControlArea) {
                console.log('  - scene-control-area:', {
                    display: window.getComputedStyle(sceneControlArea).display,
                    buttonCount: sceneControlArea.querySelectorAll('.control-btn').length,
                    可见: sceneControlArea.offsetParent !== null
                });
            }

            if (aiInputArea) {
                console.log('  - ai-input-area:', {
                    display: window.getComputedStyle(aiInputArea).display,
                    可见: aiInputArea.offsetParent !== null
                });
            }

            // 检查是否有重叠
            this.checkOverlap();
        },

        // 检查元素重叠
        checkOverlap() {
            const storyArea = document.getElementById('storyArea');
            const sceneControlArea = document.getElementById('sceneControlArea');

            if (storyArea && sceneControlArea) {
                const rect1 = storyArea.getBoundingClientRect();
                const rect2 = sceneControlArea.getBoundingClientRect();

                const overlap = !(rect1.right < rect2.left ||
                                rect1.left > rect2.right ||
                                rect1.bottom < rect2.top ||
                                rect1.top > rect2.bottom);

                if (overlap) {
                    console.error('❌ F1和F2区域重叠！');
                    console.log('  F1区域:', rect1);
                    console.log('  F2区域:', rect2);
                } else {
                    console.log('✅ F1和F2区域没有重叠');
                }
            }
        },

        // 清理重复内容
        cleanDuplicates() {
            console.log('🧹 清理重复内容...');

            const storyArea = document.getElementById('storyArea');
            if (!storyArea) return;

            // 查找所有story-text元素
            const texts = storyArea.querySelectorAll('.story-text');
            const uniqueTexts = new Set();
            const toRemove = [];

            texts.forEach(text => {
                const content = text.textContent.trim();
                if (uniqueTexts.has(content)) {
                    toRemove.push(text);
                    console.log('  找到重复文本:', content.substring(0, 50) + '...');
                } else {
                    uniqueTexts.add(content);
                }
            });

            // 移除重复的元素
            toRemove.forEach(el => el.remove());

            if (toRemove.length > 0) {
                console.log(`✅ 已移除 ${toRemove.length} 个重复元素`);
            } else {
                console.log('✅ 没有发现重复内容');
            }
        },

        // 修复布局
        fixLayout() {
            console.log('🔧 开始修复布局...');

            // 1. 清理重复内容
            this.cleanDuplicates();

            // 2. 确保正确的显示状态
            const mode = window.f2Manager?.currentMode || 'scene';

            if (mode === 'scene') {
                // 场景模式
                const storyArea = document.getElementById('storyArea');
                const dialogueHistoryArea = document.getElementById('dialogueHistoryArea');
                const sceneControlArea = document.getElementById('sceneControlArea');
                const aiInputArea = document.getElementById('aiInputArea');

                if (storyArea) {
                    storyArea.style.display = 'block';
                    storyArea.style.removeProperty('position');
                    storyArea.style.removeProperty('z-index');
                }

                if (dialogueHistoryArea) {
                    dialogueHistoryArea.style.display = 'none';
                }

                if (sceneControlArea) {
                    sceneControlArea.style.display = 'flex';
                    sceneControlArea.style.removeProperty('position');
                    sceneControlArea.style.marginTop = '10px';
                }

                if (aiInputArea) {
                    aiInputArea.style.display = 'none';
                }

                console.log('✅ 已设置为场景模式布局');
            }

            // 3. 修复lower-section
            const lowerSection = document.querySelector('.lower-section');
            if (lowerSection) {
                lowerSection.style.display = 'flex';
                lowerSection.style.flexDirection = 'column';
                lowerSection.style.overflow = 'hidden';
            }

            console.log('✅ 布局修复完成');
        },

        // 显示布局信息
        showInfo() {
            const info = {
                F2管理器模式: window.f2Manager?.currentMode || '未知',
                场景管理器: window.sceneManager ? '已加载' : '未加载',
                当前场景: window.sceneManager?.currentScene?.id || '无',
                游戏状态: window.gameState ? '已初始化' : '未初始化'
            };

            console.table(info);
        }
    };

    // 导出到全局
    window.LayoutDebug = LayoutDebugger;

    // 页面加载完成后自动检查
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                console.log('🔍 自动布局检查...');
                LayoutDebugger.checkLayout();
                LayoutDebugger.showInfo();
            }, 1000);
        });
    } else {
        setTimeout(() => {
            console.log('🔍 自动布局检查...');
            LayoutDebugger.checkLayout();
            LayoutDebugger.showInfo();
        }, 500);
    }

    console.log('💡 布局调试工具已加载');
    console.log('可用命令:');
    console.log('  LayoutDebug.checkLayout() - 检查当前布局');
    console.log('  LayoutDebug.cleanDuplicates() - 清理重复内容');
    console.log('  LayoutDebug.fixLayout() - 修复布局问题');
    console.log('  LayoutDebug.showInfo() - 显示系统信息');
})();