/**
 * 检查F2区域位置问题
 */

function checkF2Position() {
    console.log('🔍 检查F2区域位置...');

    // 1. 检查lower-section结构
    const lowerSection = document.querySelector('.lower-section');
    if (lowerSection) {
        console.log('lower-section子元素:', lowerSection.children.length);
        for (let i = 0; i < lowerSection.children.length; i++) {
            const child = lowerSection.children[i];
            console.log(`  ${i}: ${child.tagName}.${child.className} (id=${child.id})`);

            // 显示位置信息
            const rect = child.getBoundingClientRect();
            console.log(`     位置: top=${rect.top}, bottom=${rect.bottom}`);
        }
    }

    // 2. 检查AI输入区
    const aiInputArea = document.getElementById('aiInputArea');
    if (aiInputArea) {
        const rect = aiInputArea.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(aiInputArea);
        console.log('AI输入区信息:');
        console.log('  位置:', rect);
        console.log('  position:', computedStyle.position);
        console.log('  display:', computedStyle.display);
        console.log('  父元素:', aiInputArea.parentElement?.className);
    }

    // 3. 检查场景控制区
    const sceneControl = document.getElementById('sceneControlArea');
    if (sceneControl) {
        const rect = sceneControl.getBoundingClientRect();
        console.log('场景控制区位置:', rect);
    }

    // 4. 检查是否有多个F2元素
    const allF2Elements = document.querySelectorAll('[id*="aiInput"], [id*="sceneControl"]');
    console.log('所有F2相关元素:', allF2Elements.length);
    allF2Elements.forEach(el => {
        console.log(`  - ${el.tagName}#${el.id}`);
    });
}

// 修复F2位置
function fixF2Position() {
    console.log('🔧 尝试修复F2位置...');

    const aiInputArea = document.getElementById('aiInputArea');
    const lowerSection = document.querySelector('.lower-section');

    if (aiInputArea && lowerSection) {
        // 确保AI输入区在lower-section的最底部
        if (aiInputArea.parentElement !== lowerSection) {
            console.log('AI输入区不在正确的父元素中，移动它...');
            lowerSection.appendChild(aiInputArea);
        }

        // 确保lower-section是flex布局
        lowerSection.style.display = 'flex';
        lowerSection.style.flexDirection = 'column';

        // 确保F1区域(story-area或dialogue-history)占用剩余空间
        const storyArea = document.getElementById('storyArea');
        const dialogueArea = document.getElementById('dialogueHistoryArea');

        if (storyArea) {
            storyArea.style.flex = '1';
            storyArea.style.minHeight = '0';
            storyArea.style.overflow = 'auto';
        }

        if (dialogueArea) {
            dialogueArea.style.flex = '1';
            dialogueArea.style.minHeight = '0';
            dialogueArea.style.overflow = 'auto';
        }

        // 确保AI输入区不会flex增长
        aiInputArea.style.flex = '0 0 auto';
        aiInputArea.style.height = 'auto';

        console.log('✅ 位置修复完成');
    }
}

// 导出
window.checkF2 = {
    check: checkF2Position,
    fix: fixF2Position
};

// 自动检查
setTimeout(() => {
    checkF2Position();
    console.log('💡 使用 checkF2.fix() 修复位置');
}, 1000);

console.log('🔍 F2位置检查工具已加载');