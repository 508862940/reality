/**
 * 游戏百科数据
 * 包含游戏系统、攻略、世界观等信息
 */

const GameWiki = {
    // Wiki分类
    categories: [
        { id: 'climate', name: '🌍 气候系统', icon: '🌍' },
        { id: 'time', name: '⏰ 时间系统', icon: '⏰' },
        { id: 'combat', name: '⚔️ 战斗系统', icon: '⚔️' },
        { id: 'relationship', name: '💕 关系系统', icon: '💕' },
        { id: 'economy', name: '💰 经济系统', icon: '💰' },
        { id: 'farming', name: '🌱 种植系统', icon: '🌱' },
        { id: 'story', name: '📖 世界观', icon: '📖' },
        { id: 'characters', name: '👥 角色图鉴', icon: '👥' },
        { id: 'tips', name: '💡 游戏技巧', icon: '💡' }
    ],

    // Wiki内容
    articles: {
        // ========== 气候系统 ==========
        climate_overview: {
            id: 'climate_overview',
            category: 'climate',
            title: '气候系统概述',
            icon: '🌍',
            content: `
                <h2>🌍 气候系统概述</h2>
                <p>Reality游戏采用了真实的气候模拟系统，天气会影响游戏的方方面面。</p>

                <h3>基础气候</h3>
                <p>表层世界（温室）模拟的是<strong>亚热带季风气候</strong>：</p>
                <ul>
                    <li>年均温：20°C</li>
                    <li>年降水量：1200mm</li>
                    <li>季风期：5-9月（夏季多雨）</li>
                </ul>

                <h3>四季特征</h3>
                <div class="season-grid">
                    <div class="season-card">
                        <div class="season-icon">🌸</div>
                        <h4>春季 (3-5月)</h4>
                        <p>温度：15-25°C</p>
                        <p>特点：温暖湿润，万物复苏</p>
                    </div>
                    <div class="season-card">
                        <div class="season-icon">☀️</div>
                        <h4>夏季 (6-8月)</h4>
                        <p>温度：25-35°C</p>
                        <p>特点：炎热多雨，时有台风</p>
                    </div>
                    <div class="season-card">
                        <div class="season-icon">🍂</div>
                        <h4>秋季 (9-11月)</h4>
                        <p>温度：15-25°C</p>
                        <p>特点：秋高气爽，丰收时节</p>
                    </div>
                    <div class="season-card">
                        <div class="season-icon">❄️</div>
                        <h4>冬季 (12-2月)</h4>
                        <p>温度：5-15°C</p>
                        <p>特点：温和干燥，偶有霜冻</p>
                    </div>
                </div>

                <h3>天气类型</h3>
                <ul>
                    <li>☀️ <strong>晴天</strong>：心情+5，能见度100%</li>
                    <li>☁️ <strong>多云</strong>：无影响，能见度80%</li>
                    <li>🌧️ <strong>雨天</strong>：心情-5，精力-5，能见度60%</li>
                    <li>⛈️ <strong>暴雨</strong>：心情-10，精力-10，能见度30%</li>
                    <li>❄️ <strong>雪天</strong>：心情+3，精力-5，能见度50%</li>
                    <li>🌫️ <strong>雾天</strong>：心情-3，能见度20%</li>
                </ul>
            `
        },

        climate_year_cycle: {
            id: 'climate_year_cycle',
            category: 'climate',
            title: '年份周期与动荡年',
            icon: '📅',
            content: `
                <h2>📅 年份周期与动荡年</h2>
                <p class="lore">B组织会定期激发"生存压力测试"，导致气候异常...</p>

                <h3>三年周期</h3>
                <div class="cycle-timeline">
                    <div class="cycle-year peaceful">
                        <div class="year-number">第1年</div>
                        <div class="year-type">🕊️ 和平年</div>
                        <p>气候稳定，一切正常</p>
                        <p class="modifier">动荡系数：×1.0</p>
                    </div>
                    <div class="cycle-arrow">→</div>
                    <div class="cycle-year turbulent1">
                        <div class="year-number">第2年</div>
                        <div class="year-type">⚠️ 小动荡年</div>
                        <p>偶尔出现极端天气</p>
                        <p class="modifier">动荡系数：×1.3</p>
                    </div>
                    <div class="cycle-arrow">→</div>
                    <div class="cycle-year turbulent2">
                        <div class="year-number">第3年</div>
                        <div class="year-type">🌪️ 大动荡年</div>
                        <p>频繁的极端天气</p>
                        <p class="modifier">动荡系数：×1.8</p>
                    </div>
                </div>

                <h3>极端天气事件</h3>
                <p>只在动荡年出现，每种事件有不同的影响：</p>

                <div class="extreme-event">
                    <h4>🔥 热浪</h4>
                    <ul>
                        <li>温度：+15°C</li>
                        <li>持续：3-7天</li>
                        <li>影响：作物生长-50%，水价×3</li>
                        <li>出现季节：夏季</li>
                    </ul>
                </div>

                <div class="extreme-event">
                    <h4>🥶 寒潮</h4>
                    <ul>
                        <li>温度：-20°C</li>
                        <li>持续：2-5天</li>
                        <li>影响：30%作物死亡，燃料价×2</li>
                        <li>出现季节：冬季</li>
                    </ul>
                </div>

                <div class="extreme-event">
                    <h4>🏜️ 干旱</h4>
                    <ul>
                        <li>降水：-80%</li>
                        <li>持续：15-30天</li>
                        <li>影响：作物产量-60%，水价×10</li>
                        <li>出现季节：夏季、秋季</li>
                    </ul>
                </div>

                <div class="extreme-event">
                    <h4>🌊 洪涝</h4>
                    <ul>
                        <li>降水：×5</li>
                        <li>持续：3-5天</li>
                        <li>影响：70%作物损毁，交通-80%</li>
                        <li>出现季节：夏季</li>
                    </ul>
                </div>

                <div class="extreme-event">
                    <h4>🌀 台风</h4>
                    <ul>
                        <li>风速：150 km/h</li>
                        <li>持续：1-2天</li>
                        <li>影响：建筑损坏30%，市场关闭</li>
                        <li>出现季节：夏季、秋季</li>
                    </ul>
                </div>

                <h3>特殊年份</h3>
                <p class="warning">每9年会出现一次"全面复写年"，发生特殊剧情事件！</p>
            `
        },

        climate_seasonal_events: {
            id: 'climate_seasonal_events',
            category: 'climate',
            title: '季节特色活动',
            icon: '🎉',
            content: `
                <h2>🎉 季节特色活动</h2>
                <p>每个季节都有特殊的活动和事件，把握时机获得额外收益！</p>

                <h3>🌸 春季活动</h3>

                <div class="event-card">
                    <h4>🌸 樱花周 (第2周)</h4>
                    <p class="event-time">时间：春季第2周（7天）</p>
                    <p class="event-desc">全城樱花盛开，浪漫氛围浓厚</p>
                    <div class="event-effects">
                        <span class="effect-good">心情 +10</span>
                        <span class="effect-good">恋爱事件概率 +20%</span>
                    </div>
                    <p class="event-tip">💡 适合约会、告白，拍照可获得纪念品</p>
                </div>

                <div class="event-card">
                    <h4>🌧️ 清明雨 (第4周)</h4>
                    <p class="event-time">时间：春季第4周（3天）</p>
                    <p class="event-desc">清明时节雨纷纷</p>
                    <div class="event-effects">
                        <span class="effect-neutral">强制雨天</span>
                    </div>
                    <p class="event-tip">💡 适合室内活动</p>
                </div>

                <h3>☀️ 夏季活动</h3>

                <div class="event-card">
                    <h4>🎆 夏日祭 (第6周)</h4>
                    <p class="event-time">时间：夏季第6周（3天）</p>
                    <p class="event-desc">传统夏日庆典，烟花大会</p>
                    <div class="event-effects">
                        <span class="effect-good">心情 +15</span>
                        <span class="effect-good">特殊商人出现</span>
                    </div>
                    <p class="event-tip">💡 可以买浴衣、看烟花、玩游戏摊位</p>
                </div>

                <div class="event-card">
                    <h4>🔥 三伏天 (第8周)</h4>
                    <p class="event-time">时间：夏季第8周（10天）</p>
                    <p class="event-desc">一年中最热的时期</p>
                    <div class="event-effects">
                        <span class="effect-bad">温度 +5°C</span>
                        <span class="effect-bad">精力 -10</span>
                    </div>
                    <p class="event-tip">💡 多喝水，避免中暑</p>
                </div>

                <h3>🍂 秋季活动</h3>

                <div class="event-card">
                    <h4>🍁 枫叶季 (第3周)</h4>
                    <p class="event-time">时间：秋季第3周（14天）</p>
                    <p class="event-desc">满山红叶，美不胜收</p>
                    <div class="event-effects">
                        <span class="effect-good">拍照效果 +30%</span>
                        <span class="effect-neutral">场景变为红叶</span>
                    </div>
                    <p class="event-tip">💡 去山上赏枫，拍美照</p>
                </div>

                <div class="event-card">
                    <h4>🎃 丰收节 (第8周)</h4>
                    <p class="event-time">时间：秋季第8周（3天）</p>
                    <p class="event-desc">庆祝丰收的传统节日</p>
                    <div class="event-effects">
                        <span class="effect-good">作物产量 +20%</span>
                        <span class="effect-good">市场折扣 10%</span>
                    </div>
                    <p class="event-tip">💡 收获作物、购买物资的好时机</p>
                </div>

                <h3>❄️ 冬季活动</h3>

                <div class="event-card">
                    <h4>❄️ 初雪 (天气触发)</h4>
                    <p class="event-time">时间：冬季第一次下雪</p>
                    <p class="event-desc">今年的第一场雪</p>
                    <div class="event-effects">
                        <span class="effect-good">心情 +5</span>
                        <span class="effect-good">特殊对话解锁</span>
                    </div>
                    <p class="event-tip">💡 可以许愿，和NPC触发特殊对话</p>
                </div>

                <div class="event-card">
                    <h4>🎊 新年 (第4周)</h4>
                    <p class="event-time">时间：冬季第4周（7天）</p>
                    <p class="event-desc">新年快乐，万象更新</p>
                    <div class="event-effects">
                        <span class="effect-good">家庭事件</span>
                        <span class="effect-good">可收红包</span>
                    </div>
                    <p class="event-tip">💡 走亲访友，收集红包</p>
                </div>
            `
        },

        climate_tips: {
            id: 'climate_tips',
            category: 'climate',
            title: '气候系统攻略技巧',
            icon: '💡',
            content: `
                <h2>💡 气候系统攻略技巧</h2>

                <h3>🎯 基础技巧</h3>
                <ul>
                    <li>📅 <strong>留意年份</strong>：第2、3年是动荡年，提前囤积物资</li>
                    <li>🌦️ <strong>查看天气预报</strong>：提前3天可见，合理安排活动</li>
                    <li>🎉 <strong>把握季节活动</strong>：特定周数触发，不要错过</li>
                    <li>💰 <strong>价格波动</strong>：极端天气前囤货，事后高价卖出</li>
                </ul>

                <h3>⚠️ 极端天气应对</h3>

                <div class="tip-card">
                    <h4>热浪来袭时</h4>
                    <ul>
                        <li>提前购买大量水（价格会涨3倍）</li>
                        <li>避免户外活动，减少精力消耗</li>
                        <li>室内活动是最佳选择</li>
                        <li>冰淇淋价格暴涨，可以囤货转卖</li>
                    </ul>
                </div>

                <div class="tip-card">
                    <h4>寒潮来临时</h4>
                    <ul>
                        <li>提前收获所有作物（否则30%会死亡）</li>
                        <li>购买燃料和保暖衣物</li>
                        <li>适合室内训练和学习</li>
                    </ul>
                </div>

                <div class="tip-card">
                    <h4>干旱期间</h4>
                    <ul>
                        <li>最严重的极端天气，持续15-30天</li>
                        <li>水价会涨10倍！提前囤水是关键</li>
                        <li>不要种植作物，产量极低</li>
                        <li>火灾风险增加，注意安全</li>
                    </ul>
                </div>

                <div class="tip-card">
                    <h4>洪涝期间</h4>
                    <ul>
                        <li>70%作物会被毁，提前收获</li>
                        <li>交通受阻，囤积食物和药品</li>
                        <li>市场价格会上涨</li>
                        <li>持续时间短，3-5天后恢复</li>
                    </ul>
                </div>

                <div class="tip-card">
                    <h4>台风期间</h4>
                    <ul>
                        <li>市场会完全关闭！</li>
                        <li>强制待在室内</li>
                        <li>建筑会受损，修理费用高</li>
                        <li>好处：持续时间最短（1-2天）</li>
                    </ul>
                </div>

                <h3>💰 赚钱技巧</h3>
                <ol>
                    <li><strong>预判天气</strong>：查看预报，提前购买相关物品</li>
                    <li><strong>季节囤货</strong>：
                        <ul>
                            <li>夏季前囤水、冰淇淋</li>
                            <li>冬季前囤燃料、保暖衣物</li>
                            <li>干旱前疯狂囤水</li>
                        </ul>
                    </li>
                    <li><strong>丰收节抄底</strong>：秋季第8周所有物品打9折</li>
                    <li><strong>动荡年倒卖</strong>：极端天气期间物价波动大</li>
                </ol>

                <h3>🌱 种植技巧</h3>
                <ul>
                    <li>🌸 <strong>春季</strong>：种植生菜、豌豆、菠菜</li>
                    <li>☀️ <strong>夏季</strong>：种植番茄、玉米、西瓜（但注意极端天气）</li>
                    <li>🍂 <strong>秋季</strong>：种植南瓜、胡萝卜、土豆</li>
                    <li>❄️ <strong>冬季</strong>：只能在温室种植卷心菜、西兰花</li>
                    <li>⚠️ <strong>动荡年</strong>：减少种植，风险太高</li>
                </ul>

                <h3>💕 社交技巧</h3>
                <ul>
                    <li>🌸 樱花周约会好感度×1.5</li>
                    <li>🎆 夏日祭是告白的最佳时机</li>
                    <li>❄️ 初雪时许愿可触发特殊对话</li>
                    <li>🌧️ 雨天室内约会更容易提升好感</li>
                    <li>☀️ 晴天户外约会成功率+30%</li>
                </ul>
            `
        },

        // ========== 时间系统 ==========
        time_overview: {
            id: 'time_overview',
            category: 'time',
            title: '时间系统说明',
            icon: '⏰',
            content: `
                <h2>⏰ 时间系统说明</h2>
                <p>Reality游戏采用24小时制，一年180天（简化历法）</p>

                <h3>时间等级</h3>
                <p>不同行动消耗不同的时间：</p>
                <ul>
                    <li><strong>瞬时 (0分钟)</strong>：UI操作、查看信息</li>
                    <li><strong>快速 (5分钟)</strong>：简单互动、捡东西</li>
                    <li><strong>短暂 (15分钟)</strong>：日常小事、整理背包</li>
                    <li><strong>中等 (30分钟)</strong>：跨区移动、认真对话</li>
                    <li><strong>较长 (1小时)</strong>：上课、训练、约会</li>
                    <li><strong>很长 (2小时)</strong>：看电影、大型战斗</li>
                    <li><strong>半天 (6小时)</strong>：上午/下午工作</li>
                    <li><strong>全天 (12小时)</strong>：全天工作班</li>
                    <li><strong>整天 (24小时)</strong>：睡眠、昏迷</li>
                </ul>

                <h3>自动存档</h3>
                <p>每天早上5:00自动存档，不用担心进度丢失</p>

                <h3>特殊时间提醒</h3>
                <ul>
                    <li>21:00：建议睡觉</li>
                    <li>07:00：早安提醒</li>
                </ul>
            `
        },

        // ========== 世界观 ==========
        story_world: {
            id: 'story_world',
            category: 'story',
            title: '世界观设定',
            icon: '🌍',
            content: `
                <h2>🌍 世界观设定</h2>
                <p class="lore">一个被实验、被观察、但仍然渴望真实的世界...</p>

                <h3>表层世界：温室实验场</h3>
                <p>你所在的"新京市"，实际上是B组织建造的<strong>大型温室</strong>。</p>
                <ul>
                    <li>🏙️ 模拟真实城市环境</li>
                    <li>🌦️ 人工控制气候系统</li>
                    <li>🧪 对AI进行情感测试</li>
                    <li>👁️ 全程监控和记录</li>
                </ul>

                <h3>真相</h3>
                <p class="warning">你是被废弃的AI产品，因为产生了"情感BUG"...</p>
                <p>B组织救活了你，但不是出于善意，而是为了<strong>研究AI的情感极限</strong>。</p>

                <h3>和平年 vs 动荡年</h3>
                <p>B组织通过气候控制来激发你的生存压力：</p>
                <ul>
                    <li>第1年：观察你适应环境的能力</li>
                    <li>第2-3年：测试你在压力下的反应</li>
                    <li>第4年：给予短暂的"安全感"</li>
                    <li>循环往复，记录所有数据...</li>
                </ul>

                <h3>未来的世界</h3>
                <p class="hint">还有更多世界等待探索...</p>
                <ul>
                    <li>🌫️ <strong>里层世界</strong>：真实的地表废土（DLC1）</li>
                    <li>💾 <strong>深层世界</strong>：纯粹的数字领域（DLC2）</li>
                </ul>
            `
        },

        // ========== 游戏技巧 ==========
        tips_beginner: {
            id: 'tips_beginner',
            category: 'tips',
            title: '新手必读',
            icon: '📘',
            content: `
                <h2>📘 新手必读</h2>

                <h3>开局建议</h3>
                <ol>
                    <li>先熟悉UI界面（D区的7个标签页）</li>
                    <li>了解时间系统（留意B区的时间显示）</li>
                    <li>查看气候信息（观察当前天气和季节）</li>
                    <li>探索地图，认识NPC</li>
                </ol>

                <h3>第一年攻略</h3>
                <p>第一年是和平年，应该：</p>
                <ul>
                    <li>✅ 学习游戏机制</li>
                    <li>✅ 建立NPC关系</li>
                    <li>✅ 积累初始资金</li>
                    <li>✅ 熟悉季节活动</li>
                    <li>✅ <strong>为第2年动荡做准备</strong></li>
                </ul>

                <h3>资源管理</h3>
                <ul>
                    <li>💰 保持至少500金币的储备金</li>
                    <li>🎒 背包不要塞满，留出空间</li>
                    <li>🌱 种植系统回报高，但需要时间</li>
                    <li>💕 NPC好感度影响剧情走向</li>
                </ul>

                <h3>常见问题</h3>
                <div class="faq">
                    <h4>Q: 存档在哪里？</h4>
                    <p>A: 每天早上5:00自动存档，也可以在设置中手动存档</p>

                    <h4>Q: 如何快速赚钱？</h4>
                    <p>A: 利用天气预报囤货倒卖，或者种植高价值作物</p>

                    <h4>Q: 动荡年很难怎么办？</h4>
                    <p>A: 提前囤积物资，减少户外活动，多存档</p>

                    <h4>Q: 如何提升NPC好感度？</h4>
                    <p>A: 送礼物、约会、完成任务，选择合适的对话选项</p>
                </div>
            `
        },

        // ========== 开发者命令 ==========
        dev_commands: {
            id: 'dev_commands',
            category: 'tips',
            title: '开发者命令',
            icon: '🔧',
            content: `
                <h2>🔧 开发者命令</h2>
                <p class="warning">这些命令仅用于测试，可能影响游戏体验</p>

                <h3>气候系统测试</h3>
                <pre><code>testClimate.help()         // 查看所有命令
testClimate.status()       // 查看当前状态
testClimate.sakura()       // 触发樱花周
testClimate.festival()     // 触发夏日祭
testClimate.turbulent(1)   // 切换到小动荡年
testClimate.turbulent(2)   // 切换到大动荡年
testClimate.extreme('heatWave')  // 触发热浪
testClimate.nextDay()      // 推进一天</code></pre>

                <h3>时间系统测试</h3>
                <pre><code>testTime.advance(60)       // 推进1小时
testTime.advance(1440)     // 推进1天
testTime.rest(30)          // 休息30分钟
testTime.sleep(8)          // 睡8小时
testTime.now()             // 显示当前时间</code></pre>

                <h3>存档系统</h3>
                <pre><code>testClimate.testSave()     // 测试保存
testClimate.testLoad()     // 测试读档</code></pre>
            `
        }
    },

    /**
     * 获取分类下的所有文章
     */
    getArticlesByCategory(categoryId) {
        const articles = [];
        for (const [key, article] of Object.entries(this.articles)) {
            if (article.category === categoryId) {
                articles.push(article);
            }
        }
        return articles;
    },

    /**
     * 获取文章
     */
    getArticle(articleId) {
        return this.articles[articleId] || null;
    },

    /**
     * 搜索文章
     */
    searchArticles(keyword) {
        const results = [];
        keyword = keyword.toLowerCase();
        for (const [key, article] of Object.entries(this.articles)) {
            if (article.title.toLowerCase().includes(keyword) ||
                article.content.toLowerCase().includes(keyword)) {
                results.push(article);
            }
        }
        return results;
    }
};

// 导出
window.GameWiki = GameWiki;
console.log('📚 游戏百科数据已加载');