// Reality App - 路由系统
// 管理页面切换和导航

const AppRouter = {
    // 当前页面
    currentPage: null,

    // 页面历史
    history: [],

    // 页面配置
    pages: {
        'menu': {
            path: 'pages/menu.html',
            title: 'Reality - 主菜单',
            scripts: ['js/pages/menu.js'],
            styles: ['css/menu.css']
        },
        'character-creation': {
            path: 'pages/character-creation.html',
            title: 'Reality - 创建角色',
            scripts: ['js/pages/character-creation.js'],
            styles: ['css/character-creation.css']
        },
        'game-main': {
            path: 'pages/game-main.html',
            title: 'Reality - 游戏中',
            scripts: ['js/pages/game-main.js'],
            styles: ['css/game-main.css']
        }
    },

    // 初始化路由
    init() {
        console.log('🚀 初始化路由系统...');

        // 监听浏览器后退按钮
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.page) {
                this.navigate(event.state.page, false);
            }
        });

        // 加载初始页面（菜单）
        this.navigate('menu');
    },

    // 导航到页面
    async navigate(pageName, pushState = true) {
        console.log(`📍 导航到: ${pageName}`);

        const pageConfig = this.pages[pageName];
        if (!pageConfig) {
            console.error(`❌ 页面不存在: ${pageName}`);
            return;
        }

        // 更新浏览器历史
        if (pushState) {
            history.pushState({ page: pageName }, '', `#${pageName}`);
        }

        // 更新页面标题
        document.title = pageConfig.title;

        try {
            // 加载页面内容
            const container = document.getElementById('app-container');

            // 创建新页面容器
            const newPageDiv = document.createElement('div');
            newPageDiv.className = 'page-container';
            newPageDiv.id = `${pageName}-page`;

            // 加载HTML内容
            const response = await fetch(pageConfig.path);
            if (!response.ok) {
                throw new Error(`Failed to load page: ${pageConfig.path}`);
            }

            const html = await response.text();

            // 提取body内容
            const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
            if (bodyMatch) {
                newPageDiv.innerHTML = bodyMatch[1];
            } else {
                newPageDiv.innerHTML = html;
            }

            // 添加到容器
            container.appendChild(newPageDiv);

            // 切换页面动画
            if (this.currentPage) {
                const oldPageDiv = document.getElementById(`${this.currentPage}-page`);
                if (oldPageDiv) {
                    oldPageDiv.classList.remove('active');
                    oldPageDiv.classList.add('prev');
                    setTimeout(() => {
                        oldPageDiv.remove();
                    }, 300);
                }
            }

            // 激活新页面
            setTimeout(() => {
                newPageDiv.classList.add('active');
            }, 50);

            // 更新当前页面
            this.currentPage = pageName;
            this.history.push(pageName);

            // 执行页面初始化
            this.initializePage(pageName);

            console.log(`✅ 页面加载成功: ${pageName}`);

        } catch (error) {
            console.error('❌ 页面加载失败:', error);
            this.showError('页面加载失败', error.message);
        }
    },

    // 初始化页面
    initializePage(pageName) {
        console.log(`🔧 初始化页面: ${pageName}`);

        // 根据页面执行不同的初始化
        switch(pageName) {
            case 'menu':
                // 初始化菜单页面
                if (typeof initMenuPage === 'function') {
                    initMenuPage();
                }
                // 创建粒子特效
                if (typeof createParticles === 'function') {
                    createParticles();
                }
                // 检查存档
                if (typeof checkSaveFiles === 'function') {
                    checkSaveFiles();
                }
                break;

            case 'character-creation':
                // 初始化角色创建页面
                if (typeof initCharacterCreation === 'function') {
                    initCharacterCreation();
                }
                // 初始化角色预览
                if (typeof updateCharacterPreview === 'function') {
                    updateCharacterPreview();
                }
                break;

            case 'game-main':
                // 初始化游戏主界面
                if (typeof initGameMain === 'function') {
                    initGameMain();
                }
                // 初始化游戏系统
                if (typeof initAdvancedGame === 'function') {
                    initAdvancedGame();
                }
                // 初始化场景动画
                if (typeof initSceneAnimations === 'function') {
                    initSceneAnimations();
                }
                break;
        }

        // 重新绑定所有事件
        this.bindPageEvents(pageName);
    },

    // 绑定页面事件
    bindPageEvents(pageName) {
        // 这里处理页面特定的事件绑定
        console.log(`🔗 绑定页面事件: ${pageName}`);
    },

    // 返回上一页
    goBack() {
        if (this.history.length > 1) {
            this.history.pop(); // 移除当前页
            const previousPage = this.history[this.history.length - 1];
            this.navigate(previousPage, false);
        }
    },

    // 显示错误
    showError(title, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h3>${title}</h3>
            <p>${message}</p>
            <button onclick="this.parentElement.remove()">确定</button>
        `;
        document.body.appendChild(errorDiv);
    }
};

// 全局导航函数
window.navigateTo = function(page) {
    AppRouter.navigate(page);
};

// 全局返回函数
window.goBack = function() {
    AppRouter.goBack();
};

// 导出
window.AppRouter = AppRouter;