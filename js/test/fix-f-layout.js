/**
 * 紧急修复F区布局混乱
 */

console.log('🔧 开始修复F区布局...');

// 立即修复函数
function fixLayout() {
    // 1. 确保F1区正确显示
    const storyArea = document.getElementById('storyArea');
    if (storyArea) {
        storyArea.style.display = 'block';
        storyArea.style.flex = '1';
        storyArea.style.overflow = 'auto';
        console.log('✅ F1区域已修复');
    }

    // 2. 确保场景控制区正确显示
    const sceneControlArea = document.getElementById('sceneControlArea');
    if (sceneControlArea) {
        sceneControlArea.style.display = 'flex';
        sceneControlArea.style.position = 'relative';
        sceneControlArea.style.marginTop = '10px';
        console.log('✅ F2场景控制区已修复');
    }

    // 3. 隐藏AI输入区（如果不在AI模式）
    const aiInputArea = document.getElementById('aiInputArea');
    if (aiInputArea && window.f2Manager?.currentMode !== 'ai') {
        aiInputArea.style.display = 'none';
        aiInputArea.classList.remove('active');
        console.log('✅ AI输入区已隐藏');
    }

    // 4. 隐藏对话历史区
    const dialogueHistoryArea = document.getElementById('dialogueHistoryArea');
    if (dialogueHistoryArea && window.f2Manager?.currentMode !== 'ai') {
        dialogueHistoryArea.style.display = 'none';
        console.log('✅ 对话历史区已隐藏');
    }

    // 5. 确保快捷菜单隐藏
    const quickMenu = document.getElementById('quickMenu');
    if (quickMenu) {
        quickMenu.style.display = 'none';
        quickMenu.classList.remove('active');
        console.log('✅ 快捷菜单已隐藏');
    }

    // 6. 确保快捷菜单遮罩隐藏
    const quickMenuOverlay = document.getElementById('quickMenuOverlay');
    if (quickMenuOverlay) {
        quickMenuOverlay.style.display = 'none';
        console.log('✅ 快捷菜单遮罩已隐藏');
    }

    // 7. 修复lower-section布局
    const lowerSection = document.querySelector('.lower-section');
    if (lowerSection) {
        lowerSection.style.display = 'flex';
        lowerSection.style.flexDirection = 'column';
        lowerSection.style.position = 'relative';
        lowerSection.style.overflow = 'hidden';
        console.log('✅ 下半部分布局已修复');
    }

    // 8. 清理可能的重复元素
    const duplicateAreas = document.querySelectorAll('.ai-input-area');
    if (duplicateAreas.length > 0) {
        duplicateAreas.forEach(area => {
            if (area.id !== 'aiInputArea') {
                area.remove();
                console.log('✅ 移除重复的AI输入区');
            }
        });
    }

    console.log('🎉 F区布局修复完成！');

    // 强制重置F2管理器到场景模式
    if (window.f2Manager) {
        window.f2Manager.switchToSceneMode();
        console.log('✅ 已切换到场景模式');
    }
}

// 立即执行修复
fixLayout();

// 导出全局函数供手动调用
window.fixFLayout = fixLayout;

console.log('💡 如果还有问题，可以在控制台输入 fixFLayout() 再次修复');