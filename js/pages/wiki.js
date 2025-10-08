/**
 * Reality游戏百科 - 主逻辑
 * 功能：分类导航、搜索、文章渲染、PWA优化
 * 版本：1.0
 * 日期：2025-10-03
 */

// ===== 状态管理 =====
const WikiState = {
    currentCategory: 'all',
    currentArticle: null,
    searchQuery: '',
    allArticles: [],
    filteredArticles: []
};

// ===== 分类映射 =====
const CategoryConfig = {
    'all': { name: '📖 全部文章', emoji: '📖' },
    'systems': { name: '⚙️ 游戏系统', emoji: '⚙️' },
    'climate': { name: '🌍 气候系统', emoji: '🌍' },
    'time': { name: '⏰ 时间系统', emoji: '⏰' },
    'characters': { name: '👥 角色图鉴', emoji: '👥' },
    'story': { name: '📜 剧情背景', emoji: '📜' },
    'tips': { name: '💡 实用攻略', emoji: '💡' }
};

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', async () => {
    showLoading();

    // 等待 game-wiki.js 加载完成
    let retryCount = 0;
    while (!window.gameWikiData && retryCount < 10) {
        console.log(`[Wiki] 等待数据加载... (${retryCount + 1}/10)`);
        await new Promise(resolve => setTimeout(resolve, 100));
        retryCount++;
    }

    console.log('[Wiki] window.gameWikiData =', window.gameWikiData);

    if (!window.gameWikiData) {
        console.error('❌ 游戏百科数据加载失败，请刷新页面重试');
        console.log('[Wiki] 检查以下内容：');
        console.log('1. js/data/game-wiki.js 是否正确加载？');
        console.log('2. 浏览器控制台是否有其他错误？');
        hideLoading();
        return;
    }

    initializeWiki();
    hideLoading();
});

/**
 * 初始化百科系统
 */
function initializeWiki() {
    // 加载文章数据
    loadArticles();

    // 渲染UI
    renderCategories();
    renderArticleList('all');

    // 设置事件监听
    setupEventListeners();

    // PWA优化：预加载常用分类
    preloadPopularCategories();
}

/**
 * 加载文章数据
 */
function loadArticles() {
    if (!window.gameWikiData || !window.gameWikiData.articles) {
        console.error('游戏百科数据未加载！');
        WikiState.allArticles = [];
        return;
    }

    // Convert articles object to array
    WikiState.allArticles = Object.values(window.gameWikiData.articles);
    WikiState.filteredArticles = [...WikiState.allArticles];
}

/**
 * 渲染分类按钮
 */
function renderCategories() {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = '';

    Object.keys(CategoryConfig).forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', key === WikiState.currentCategory);

        if (key === WikiState.currentCategory) {
            btn.classList.add('active');
        }

        btn.textContent = CategoryConfig[key].name;
        btn.onclick = () => switchCategory(key);

        categoryList.appendChild(btn);
    });
}

/**
 * 切换分类
 * @param {string} category - 分类名
 */
function switchCategory(category) {
    WikiState.currentCategory = category;
    WikiState.searchQuery = ''; // 清空搜索
    document.getElementById('searchInput').value = '';

    renderCategories();
    renderArticleList(category);
    showArticleListView();

    // PWA优化：预加载该分类的文章
    preloadCategoryArticles(category);
}

/**
 * 渲染文章列表
 * @param {string} category - 分类名
 */
function renderArticleList(category) {
    const articleList = document.getElementById('articleList');
    const listTitle = document.getElementById('listTitle');
    const articleCount = document.getElementById('articleCount');
    const emptyState = document.getElementById('emptyState');

    // 过滤文章
    let articles = category === 'all'
        ? WikiState.allArticles
        : WikiState.allArticles.filter(a => a.category === category);

    // 应用搜索
    if (WikiState.searchQuery) {
        articles = articles.filter(a =>
            a.title.includes(WikiState.searchQuery) ||
            a.content.includes(WikiState.searchQuery)
        );
    }

    WikiState.filteredArticles = articles;

    // 更新标题
    listTitle.textContent = CategoryConfig[category]?.name || '搜索结果';
    articleCount.textContent = `${articles.length} 篇`;

    // 清空列表
    articleList.innerHTML = '';

    // 无文章显示空状态
    if (articles.length === 0) {
        emptyState.classList.remove('hidden');
        articleList.classList.add('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    articleList.classList.remove('hidden');

    // 渲染文章卡片（使用DocumentFragment优化）
    const fragment = document.createDocumentFragment();

    articles.forEach((article, index) => {
        const card = createArticleCard(article, index);
        fragment.appendChild(card);
    });

    articleList.appendChild(fragment);
}

/**
 * 创建文章卡片
 * @param {Object} article - 文章对象
 * @param {number} index - 索引
 * @returns {HTMLElement}
 */
function createArticleCard(article, index) {
    const card = document.createElement('div');
    card.className = 'article-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.onclick = () => showArticleDetail(article.id);

    // 键盘支持
    card.onkeypress = (e) => {
        if (e.key === 'Enter') showArticleDetail(article.id);
    };

    const categoryName = CategoryConfig[article.category]?.name || article.category;
    const preview = getArticlePreview(article.content, 100);

    card.innerHTML = `
        <h3 class="article-card-title">${article.title}</h3>
        <p class="article-card-preview">${preview}</p>
        <div class="article-card-footer">
            <span class="article-card-category">${categoryName}</span>
        </div>
    `;

    // PWA优化：延迟加载非首屏卡片
    if (index > 12) {
        card.style.opacity = '0';
        requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.3s ease';
            card.style.opacity = '1';
        });
    }

    return card;
}

/**
 * 生成文章预览
 * @param {string} content - 文章HTML内容
 * @param {number} maxLength - 最大长度
 * @returns {string}
 */
function getArticlePreview(content, maxLength = 100) {
    const text = content.replace(/<[^>]+>/g, ''); // 去除HTML标签
    return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
}

/**
 * 显示文章详情
 * @param {string} articleId - 文章ID
 */
function showArticleDetail(articleId) {
    // 使用缓存管理器获取文章
    const article = window.wikiCache.getArticle(articleId);

    if (!article) {
        console.error(`文章未找到：${articleId}`);
        return;
    }

    WikiState.currentArticle = article;

    // 切换视图
    showArticleDetailView();

    // 填充内容
    document.getElementById('articleTitle').textContent = article.title;
    document.getElementById('articleCategoryBadge').textContent =
        CategoryConfig[article.category]?.name || article.category;
    document.getElementById('articleDate').textContent = article.date || '';
    document.getElementById('articleReadTime').textContent =
        calculateReadTime(article.content);
    document.getElementById('articleBody').innerHTML = article.content;

    // 滚动到顶部
    document.getElementById('wikiContent').scrollTop = 0;

    // PWA优化：预加载下一篇文章
    preloadNextArticle(articleId);

    // 分享按钮（PWA Web Share API）
    setupShareButton(article);
}

/**
 * 计算阅读时间
 * @param {string} content - 文章内容
 * @returns {string}
 */
function calculateReadTime(content) {
    const text = content.replace(/<[^>]+>/g, '');
    const wordCount = text.length;
    const minutes = Math.ceil(wordCount / 400); // 假设每分钟阅读400字
    return `${minutes} 分钟阅读`;
}

/**
 * 预加载下一篇文章
 * @param {string} currentId - 当前文章ID
 */
function preloadNextArticle(currentId) {
    const currentIndex = WikiState.filteredArticles.findIndex(a => a.id === currentId);
    if (currentIndex >= 0 && currentIndex < WikiState.filteredArticles.length - 1) {
        const nextArticle = WikiState.filteredArticles[currentIndex + 1];
        window.wikiCache.preloadArticle(nextArticle.id);

        // 设置"下一篇"按钮
        const nextBtn = document.getElementById('nextArticleBtn');
        nextBtn.style.display = 'block';
        nextBtn.onclick = () => showArticleDetail(nextArticle.id);
        nextBtn.textContent = `下一篇：${nextArticle.title}`;
    } else {
        document.getElementById('nextArticleBtn').style.display = 'none';
    }
}

/**
 * 设置分享按钮（PWA Web Share API）
 * @param {Object} article - 文章对象
 */
function setupShareButton(article) {
    const shareBtn = document.getElementById('shareBtn');

    if (navigator.share) {
        shareBtn.style.display = 'block';
        shareBtn.onclick = async () => {
            try {
                await navigator.share({
                    title: article.title,
                    text: getArticlePreview(article.content, 200),
                    url: window.location.href
                });
            } catch (err) {
                console.log('分享取消或失败', err);
            }
        };
    } else {
        shareBtn.style.display = 'none';
    }
}

/**
 * 搜索文章
 * @param {string} query - 搜索关键词
 */
function searchArticles(query) {
    WikiState.searchQuery = query.trim();
    renderArticleList(WikiState.currentCategory);
}

/**
 * 显示文章列表视图
 */
function showArticleListView() {
    document.getElementById('articleListView').classList.remove('hidden');
    document.getElementById('articleDetailView').classList.add('hidden');
}

/**
 * 显示文章详情视图
 */
function showArticleDetailView() {
    document.getElementById('articleListView').classList.add('hidden');
    document.getElementById('articleDetailView').classList.remove('hidden');
}

/**
 * 显示/隐藏加载动画
 */
function showLoading() {
    document.getElementById('wikiLoading').style.display = 'flex';
    document.getElementById('wikiContainer').style.display = 'none';
}

function hideLoading() {
    document.getElementById('wikiLoading').style.display = 'none';
    document.getElementById('wikiContainer').style.display = 'flex';
}

/**
 * 预加载常用分类（PWA优化）
 */
function preloadPopularCategories() {
    const popularCategories = ['systems', 'tips'];
    popularCategories.forEach(cat => {
        preloadCategoryArticles(cat);
    });
}

/**
 * 预加载某分类的文章
 * @param {string} category - 分类名
 */
function preloadCategoryArticles(category) {
    const articles = category === 'all'
        ? WikiState.allArticles
        : WikiState.allArticles.filter(a => a.category === category);

    articles.slice(0, 5).forEach(article => {
        window.wikiCache.preloadArticle(article.id);
    });
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
    // 返回主菜单
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'menu.html';
    });

    // 返回文章列表
    document.getElementById('backToListBtn').addEventListener('click', showArticleListView);

    // 搜索框
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');

    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchArticles(e.target.value);
        }, 300); // 防抖300ms
    });

    // 清除搜索
    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        WikiState.searchQuery = '';
        renderArticleList(WikiState.currentCategory);
    });

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        // ESC返回列表
        if (e.key === 'Escape' && !document.getElementById('articleDetailView').classList.contains('hidden')) {
            showArticleListView();
        }

        // Ctrl+F聚焦搜索框
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
        }
    });
}

// ===== PWA离线提示 =====
window.addEventListener('online', () => {
    console.log('网络已连接');
});

window.addEventListener('offline', () => {
    console.log('网络已断开，部分功能可能受限');
});
