/**
 * F2区域调试工具
 */

console.log('🔍 F2区域调试开始...');

// 检查F2管理器是否存在
if (window.f2Manager) {
    console.log('✅ f2Manager已加载');
    console.log('  当前模式:', window.f2Manager.currentMode);
    console.log('  场景控制区:', window.f2Manager.sceneControlArea);
    console.log('  AI输入区:', window.f2Manager.aiInputArea);
} else {
    console.error('❌ f2Manager未加载！');
}

// 检查DOM元素
const lowerSection = document.querySelector('.lower-section');
const storyArea = document.getElementById('storyArea');
const sceneControl = document.getElementById('sceneControlArea');
const aiInput = document.getElementById('aiInputArea');

console.log('📋 DOM检查:');
console.log('  lower-section:', lowerSection ? '✅存在' : '❌不存在');
console.log('  story-area:', storyArea ? '✅存在' : '❌不存在');
console.log('  scene-control-area:', sceneControl ? '✅存在' : '❌不存在');
console.log('  ai-input-area:', aiInput ? '✅存在' : '❌不存在');

// 手动创建场景控制区
function manualCreateSceneControl() {
    console.log('🔧 手动创建场景控制区...');

    const lowerSection = document.querySelector('.lower-section');
    if (!lowerSection) {
        console.error('❌ 找不到lower-section！');
        return;
    }

    // 检查是否已存在
    if (document.getElementById('sceneControlArea')) {
        console.log('⚠️ 场景控制区已存在');
        return;
    }

    // 创建场景控制区HTML
    const controlHTML = `
        <div class="scene-control-area" id="sceneControlArea" style="
            display: flex;
            gap: 15px;
            padding: 20px;
            background: rgba(30, 30, 45, 0.95);
            border-radius: 15px;
            justify-content: center;
            align-items: center;
        ">
            <button class="control-btn continue-btn" id="continueBtn" style="
                padding: 10px 20px;
                background: #4a5568;
                color: white;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-size: 16px;
            ">
                ▶️ 继续
            </button>
            <button class="control-btn reset-btn" id="resetBtn" style="
                padding: 10px 20px;
                background: #4a5568;
                color: white;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-size: 16px;
            ">
                🔄 重置
            </button>
            <button class="control-btn zoom-btn" id="zoomBtn" style="
                padding: 10px 20px;
                background: #4a5568;
                color: white;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-size: 16px;
            ">
                🔍 查看
            </button>
            <button class="control-btn more-btn" id="moreBtn" style="
                padding: 10px 20px;
                background: #8b5cf6;
                color: white;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-size: 16px;
            ">
                ⋮ 更多
            </button>
        </div>
    `;

    // 添加到页面
    lowerSection.insertAdjacentHTML('beforeend', controlHTML);
    console.log('✅ 场景控制区已创建');

    // 重新初始化f2Manager
    if (window.f2Manager) {
        window.f2Manager.sceneControlArea = document.getElementById('sceneControlArea');
        window.f2Manager.setupElements();
        console.log('✅ f2Manager已重新初始化');
    }
}

// 检查初始化时机
function checkInitTiming() {
    console.log('⏰ 检查初始化时机...');
    console.log('  DOM状态:', document.readyState);

    if (document.readyState === 'loading') {
        console.log('  ⚠️ DOM还在加载中，等待DOMContentLoaded...');
        document.addEventListener('DOMContentLoaded', () => {
            console.log('  ✅ DOMContentLoaded触发');
            manualCreateSceneControl();
        });
    } else {
        console.log('  ✅ DOM已加载完成');
        manualCreateSceneControl();
    }
}

// 立即执行检查
checkInitTiming();

// 导出到全局
window.manualCreateSceneControl = manualCreateSceneControl;
window.debugF2 = {
    check: () => {
        console.log('🔍 F2调试信息:');
        console.log('  f2Manager:', window.f2Manager);
        console.log('  sceneControlArea:', document.getElementById('sceneControlArea'));
        console.log('  aiInputArea:', document.getElementById('aiInputArea'));
        console.log('  当前模式:', window.f2Manager?.currentMode);
    },
    fix: manualCreateSceneControl
};

console.log('💡 提示: 使用 debugF2.check() 检查状态，debugF2.fix() 修复问题');