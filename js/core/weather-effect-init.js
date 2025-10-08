/**
 * 天气特效控制器初始化
 * 确保weatherEffectController被正确创建
 */

(function() {
    console.log('🌈 开始初始化天气特效控制器...');

    function initWeatherEffectController() {
        // 检查类是否存在
        if (typeof window.WeatherEffectController === 'undefined') {
            console.error('❌ WeatherEffectController类不存在！');
            return false;
        }

        // 检查实例是否已存在
        if (window.weatherEffectController) {
            console.log('✅ weatherEffectController实例已存在');
            return true;
        }

        // 创建实例
        try {
            window.weatherEffectController = new WeatherEffectController();
            console.log('✅ weatherEffectController实例创建成功');

            // 🔥 延迟设置响应式监听器，等待worldState.state.character创建
            // setupReactiveListeners需要监听character.location，但character Proxy在world-state.js中创建
            // 所以需要延迟到worldState初始化后再设置
            if (window.weatherEffectController.setupReactiveListeners) {
                // 方案1: 如果worldState已存在且character已创建，立即设置
                if (window.worldState?.state?.character) {
                    window.weatherEffectController.setupReactiveListeners();
                } else {
                    // 方案2: 延迟到worldState初始化后
                    const checkWorldState = setInterval(() => {
                        if (window.worldState?.state?.character) {
                            clearInterval(checkWorldState);
                            window.weatherEffectController.setupReactiveListeners();
                            console.log('🔗 天气特效监听器已延迟设置（worldState就绪后）');
                        }
                    }, 100); // 每100ms检查一次

                    // 超时保护（5秒后强制设置）
                    setTimeout(() => {
                        clearInterval(checkWorldState);
                        if (window.weatherEffectController?.setupReactiveListeners && !window.weatherEffectController._listenersSetup) {
                            console.warn('⚠️ worldState超时，强制设置监听器');
                            window.weatherEffectController.setupReactiveListeners();
                        }
                    }, 5000);
                }
            }

            return true;
        } catch(e) {
            console.error('❌ 创建weatherEffectController失败:', e);
            return false;
        }
    }

    // 立即尝试初始化
    const immediateResult = initWeatherEffectController();

    if (!immediateResult) {
        console.log('⏳ 等待页面加载完成后再试...');

        // DOM加载完成后再试
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                console.log('📄 DOM加载完成，再次尝试初始化...');
                initWeatherEffectController();
            });
        }

        // 窗口加载完成后再试
        window.addEventListener('load', () => {
            console.log('🪟 窗口加载完成，再次尝试初始化...');
            initWeatherEffectController();
        });

        // 延迟1秒再试
        setTimeout(() => {
            console.log('⏰ 延迟1秒，再次尝试初始化...');
            initWeatherEffectController();
        }, 1000);
    }

    // 导出初始化函数供手动调用
    window.initWeatherEffectController = initWeatherEffectController;
})();