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
        { id: 'systems', name: '⚙️ 游戏系统', icon: '⚙️' },
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

        // ========== 游戏系统 ==========
        condition_system: {
            id: 'condition_system',
            category: 'systems',
            title: '条件系统说明',
            icon: '🔒',
            content: `
                <h2>🔒 条件系统说明</h2>
                <p>Reality游戏中的很多选项会有条件限制，了解这些机制能帮你更好地规划路线！</p>

                <h3>📋 什么是条件系统？</h3>
                <p>条件系统是游戏的"智能门卫"，它会根据你当前的状态（金钱、物品、时间等）判断你能不能做某件事。</p>

                <h3>🚪 两种选项状态</h3>
                <div class="option-states">
                    <div class="state-card">
                        <h4>🔒 灰色锁定</h4>
                        <p>你能看到选项，但暂时不能选</p>
                        <p class="tip">💡 鼠标悬停在选项上会显示具体原因（如"金钱不足"）</p>
                        <p class="example">例如："购买装备（100金币）" - 你只有30金币时会显示🔒</p>
                    </div>
                    <div class="state-card">
                        <h4>👻 完全隐藏</h4>
                        <p>条件不满足时选项完全不显示</p>
                        <p class="tip">💡 通常用于秘密分支、彩蛋、特殊结局</p>
                        <p class="example">例如："隐藏宝藏" - 只在金钱≥500且发现秘密时才出现</p>
                    </div>
                </div>

                <h3>📝 常见条件类型</h3>

                <h4>💰 金钱/属性条件</h4>
                <ul>
                    <li>金钱：购买物品、支付服务</li>
                    <li>体力：进行体力活动</li>
                    <li>心情：某些社交活动</li>
                    <li>精力：学习、工作</li>
                    <li>力量/智力：特殊挑战</li>
                </ul>
                <p class="example">例如："挑战BOSS（力量≥20 或 智力≥15）"</p>

                <h4>🎒 物品条件</h4>
                <ul>
                    <li>拥有特定物品才能解锁选项</li>
                    <li>可以是单个物品或多个物品组合</li>
                </ul>
                <p class="example">例如："打开密室（需要钥匙）"</p>

                <h4>⏰ 时间条件</h4>
                <ul>
                    <li>特定时间段才能进行的活动</li>
                    <li>季节限定活动</li>
                </ul>
                <p class="example">例如："夜市（18:00-24:00）"、"赏樱花（春季+晴天）"</p>

                <h4>🌤️ 天气条件</h4>
                <ul>
                    <li>某些活动需要特定天气</li>
                    <li>极端天气会限制户外活动</li>
                </ul>
                <p class="example">例如："户外训练（非雨天）"、"观星（晴天+夜晚）"</p>

                <h4>❤️ 好感度条件</h4>
                <ul>
                    <li>NPC好感度达到一定程度才能解锁</li>
                    <li>影响剧情分支和结局</li>
                </ul>
                <p class="example">例如："邀请Zero看电影（好感度≥60）"</p>

                <h4>📍 位置条件</h4>
                <ul>
                    <li>必须在特定地点才能进行</li>
                </ul>
                <p class="example">例如："购物（在商业街）"</p>

                <h4>🚩 剧情标记条件</h4>
                <ul>
                    <li>完成特定剧情后才解锁</li>
                    <li>通常是隐藏选项</li>
                </ul>
                <p class="example">例如："进入实验室（已发现真相）"</p>

                <h3>🔗 复合条件</h3>
                <p>有些选项需要同时满足多个条件：</p>
                <ul>
                    <li><strong>AND（全部满足）</strong>："VIP活动（金钱≥100 且 是会员 且 白天）"</li>
                    <li><strong>OR（任一满足）</strong>："开门（有钥匙 或 力量≥20）"</li>
                    <li><strong>NOT（条件不满足）</strong>："休息（非战斗状态）"</li>
                </ul>

                <h3>💡 如何查看条件</h3>
                <ol>
                    <li>鼠标悬停在🔒灰色选项上，会显示具体缺什么</li>
                    <li>选项文字通常会提示条件（如"需要100金币"）</li>
                    <li>隐藏选项需要探索发现，满足条件后会突然出现</li>
                </ol>

                <p class="tip">💡 <strong>小贴士</strong>：看到灰色选项不要灰心，说明未来有机会解锁！记下条件，朝着目标努力吧！</p>
            `
        },

        condition_tips: {
            id: 'condition_tips',
            category: 'tips',
            title: '条件系统攻略',
            icon: '🎯',
            content: `
                <h2>🎯 条件系统攻略</h2>
                <p>掌握这些技巧，解锁更多选项，探索隐藏剧情！</p>

                <h3>📊 资源管理技巧</h3>

                <div class="tip-card">
                    <h4>💰 金钱管理</h4>
                    <ul>
                        <li>始终保留500金币的应急储备</li>
                        <li>看到重要的灰色选项，记下所需金额</li>
                        <li>利用天气预报倒卖物资快速赚钱</li>
                        <li>不要冲动消费，优先解锁关键选项</li>
                    </ul>
                </div>

                <div class="tip-card">
                    <h4>🎒 物品收集</h4>
                    <ul>
                        <li>遇到"需要XXX物品"的选项，立即去寻找</li>
                        <li>关键物品不要轻易卖掉（如钥匙、信物）</li>
                        <li>背包留出空间，随时准备捡重要物品</li>
                        <li>NPC赠送的物品往往有特殊用途</li>
                    </ul>
                </div>

                <div class="tip-card">
                    <h4>📈 属性提升</h4>
                    <ul>
                        <li>力量：去健身房训练</li>
                        <li>智力：去图书馆学习</li>
                        <li>魅力：购买服装、化妆品</li>
                        <li>优先提升最常用的属性（通常是智力和魅力）</li>
                    </ul>
                </div>

                <h3>⏰ 时间规划技巧</h3>
                <ul>
                    <li>📅 <strong>记录时间限定活动</strong>：樱花周（春季第2周）、夏日祭（夏季第6周）等</li>
                    <li>⏰ <strong>合理安排行程</strong>：白天做需要特定时间的事，晚上自由活动</li>
                    <li>🌤️ <strong>查看天气预报</strong>：提前3天规划需要特定天气的活动</li>
                    <li>💤 <strong>留出休息时间</strong>：体力和精力耗尽会影响效率</li>
                </ul>

                <h3>❤️ 好感度攻略</h3>
                <ul>
                    <li>🎁 <strong>送对礼物</strong>：每个NPC有喜好，送喜欢的物品好感+20</li>
                    <li>💬 <strong>多对话</strong>：每天至少和目标NPC对话1次</li>
                    <li>📅 <strong>约会时机</strong>：樱花周、夏日祭等特殊时期好感度×1.5</li>
                    <li>⚠️ <strong>避免负面选项</strong>：鼠标悬停查看对话选项的好感度影响</li>
                </ul>

                <h3>🔍 隐藏选项发现技巧</h3>

                <div class="secret-card">
                    <h4>寻找隐藏选项的方法</h4>
                    <ol>
                        <li><strong>多次访问同一场景</strong>：条件满足后新选项会突然出现</li>
                        <li><strong>尝试极端数值</strong>：金钱≥1000、好感度≥90等</li>
                        <li><strong>组合条件测试</strong>：特定时间+特定天气+特定物品</li>
                        <li><strong>关注NPC对话暗示</strong>：他们会透露隐藏内容的线索</li>
                        <li><strong>完成支线任务</strong>：常常解锁新的隐藏选项</li>
                    </ol>
                </div>

                <h3>🎯 高级技巧</h3>

                <div class="advanced-tip">
                    <h4>多周目规划</h4>
                    <p>第一周目：探索主线，记录所有灰色选项</p>
                    <p>第二周目：针对性准备，解锁隐藏剧情</p>
                    <p>第三周目：追求完美结局</p>
                </div>

                <div class="advanced-tip">
                    <h4>存档策略</h4>
                    <ul>
                        <li>遇到重要选项前手动存档</li>
                        <li>解锁隐藏选项后立即存档</li>
                        <li>多准备几个存档位，方便回溯</li>
                    </ul>
                </div>

                <div class="advanced-tip">
                    <h4>效率最大化</h4>
                    <ul>
                        <li>一次外出完成多个目标（省时间）</li>
                        <li>利用等待时间提升属性（如在咖啡厅学习）</li>
                        <li>优先做有时间限制的任务</li>
                    </ul>
                </div>

                <p class="warning">⚠️ <strong>重要提醒</strong>：不要过度追求完美，错过一些选项也是游戏乐趣的一部分。多周目体验不同路线更有意思！</p>
            `
        },

        random_system: {
            id: 'random_system',
            category: 'systems',
            title: '概率系统说明',
            icon: '🎲',
            content: `
                <h2>🎲 概率系统说明</h2>
                <p>Reality游戏采用博德之门3风格的概率系统，了解机制能让你更好地掌控运气！</p>

                <h3>🎯 什么是概率系统？</h3>
                <p>在游戏中，很多事件不是100%成功的，而是受到<strong>概率</strong>影响：</p>
                <ul>
                    <li>🗝️ 开锁：基础成功率50%，智力+10则提升到60%</li>
                    <li>⚔️ 战斗命中：基础命中率60%，雨天-20%变成40%</li>
                    <li>💬 说服NPC：基础成功率40%，魅力高或携带礼物可提升</li>
                    <li>🌱 作物收成：基础产量100%，极端天气会减少</li>
                </ul>

                <h3>📊 成功率计算</h3>
                <p>每次判定时，系统会计算最终成功率：</p>

                <div class="formula">
                    <strong>最终成功率 = 基础成功率 + 属性加成 + 物品加成 - 环境惩罚</strong>
                </div>

                <h4>示例：开锁判定</h4>
                <div class="example-calculation">
                    <p>基础成功率：50%</p>
                    <p>+ 智力15 × 1% = +15%</p>
                    <p>+ 携带"万能钥匙" = +20%</p>
                    <p>- 雨天视线差 = -10%</p>
                    <p class="result">= <strong>最终成功率 75%</strong></p>
                </div>

                <h3>🎲 影响成功率的因素</h3>

                <h4>1. 🧠 角色属性</h4>
                <ul>
                    <li><strong>智力</strong>：影响学习、开锁、破解密码</li>
                    <li><strong>力量</strong>：影响战斗、破门、搬运</li>
                    <li><strong>敏捷</strong>：影响闪避、潜行、偷窃</li>
                    <li><strong>魅力</strong>：影响说服、交易、恋爱</li>
                </ul>
                <p class="tip">💡 通常每1点属性 = +1%成功率</p>

                <h4>2. 🎒 物品加成</h4>
                <ul>
                    <li>工具类：万能钥匙、撬锁工具、望远镜</li>
                    <li>装备类：幸运符、护身符、特殊服装</li>
                    <li>消耗品：能量饮料、专注药剂</li>
                </ul>
                <p class="tip">💡 物品加成通常是 +5% 到 +20%</p>

                <h4>3. 🌦️ 环境影响</h4>
                <ul>
                    <li><strong>天气</strong>：雨天视线差（-10%命中），雾天潜行易（+20%）</li>
                    <li><strong>时间</strong>：夜晚潜行易（+15%），但视力差（-10%命中）</li>
                    <li><strong>状态</strong>：疲劳时所有判定-20%，心情好时+5%</li>
                </ul>

                <h4>4. ❤️ NPC好感度</h4>
                <ul>
                    <li>好感度高的NPC会"暗中帮助"你</li>
                    <li>某些判定会自动获得+10%加成</li>
                    <li>恋人关系时某些判定必定成功</li>
                </ul>

                <h3>⭐ 大成功与大失败</h3>

                <div class="critical-events">
                    <div class="critical-card success">
                        <h4>⭐ 大成功（Critical Success）</h4>
                        <p>触发概率：约5%（骰子≤5%）</p>
                        <p><strong>效果：</strong></p>
                        <ul>
                            <li>即使成功率很低也能成功</li>
                            <li>获得额外奖励（双倍经验、额外物品）</li>
                            <li>触发特殊剧情</li>
                        </ul>
                        <p class="example">例如：开锁时大成功，不仅开锁还发现隐藏暗格</p>
                    </div>

                    <div class="critical-card fail">
                        <h4>💥 大失败（Fumble）</h4>
                        <p>触发概率：约5%（骰子≥95%）</p>
                        <p><strong>效果：</strong></p>
                        <ul>
                            <li>即使成功率很高也会失败</li>
                            <li>可能有严重后果（受伤、物品损坏）</li>
                            <li>触发负面剧情</li>
                        </ul>
                        <p class="example">例如：开锁时大失败，锁头卡住了，钥匙也断了</p>
                    </div>
                </div>

                <h3>🎲 D&D风格骰子系统</h3>
                <p>某些重要判定使用"d20"（20面骰子）：</p>
                <ul>
                    <li>骰子投出1-20的随机数</li>
                    <li>加上你的属性修正值</li>
                    <li>总和≥目标值则成功</li>
                </ul>

                <div class="dice-example">
                    <h4>示例：说服检定</h4>
                    <p>目标难度：15</p>
                    <p>你的魅力：10（修正值+5）</p>
                    <p>骰子投出：12</p>
                    <p>总和：12 + 5 = 17 ≥ 15</p>
                    <p class="result">✅ <strong>成功说服！</strong></p>
                </div>

                <p class="tip">💡 <strong>记住</strong>：即使准备充分，仍有失败可能。重要决策前记得存档！</p>
            `
        },

        random_tips: {
            id: 'random_tips',
            category: 'tips',
            title: '概率系统攻略',
            icon: '🍀',
            content: `
                <h2>🍀 概率系统攻略</h2>
                <p>运气可以改变！掌握这些技巧，大幅提升成功率！</p>

                <h3>📈 提升成功率的方法</h3>

                <div class="strategy-card">
                    <h4>1. 💪 提升相关属性</h4>
                    <p>这是最根本的方法，每1点属性通常=+1%成功率</p>
                    <ul>
                        <li><strong>智力</strong>：图书馆学习、解谜游戏、与学者对话</li>
                        <li><strong>力量</strong>：健身房训练、体力劳动、战斗</li>
                        <li><strong>敏捷</strong>：跑步、舞蹈、体操</li>
                        <li><strong>魅力</strong>：购买时装、化妆、社交活动</li>
                    </ul>
                    <p class="cost">💰 成本：中等（时间+金钱）</p>
                    <p class="benefit">✅ 收益：永久提升，适用所有相关判定</p>
                </div>

                <div class="strategy-card">
                    <h4>2. 🎒 使用加成物品</h4>
                    <p>物品加成通常+10%~+20%，效果显著</p>
                    <ul>
                        <li><strong>幸运符</strong>：所有判定+10%（商店购买500金币）</li>
                        <li><strong>专用工具</strong>：开锁工具、撬锁器、望远镜</li>
                        <li><strong>消耗品</strong>：专注药剂、能量饮料（临时+20%）</li>
                    </ul>
                    <p class="cost">💰 成本：低到中等</p>
                    <p class="benefit">✅ 收益：立即见效，关键时刻救命</p>
                </div>

                <div class="strategy-card">
                    <h4>3. 🌤️ 选择合适环境</h4>
                    <p>环境影响可达±20%，合理规划事半功倍</p>
                    <ul>
                        <li><strong>查看天气预报</strong>：晴天做需要视线的事</li>
                        <li><strong>选对时间</strong>：白天做需要光线的事，夜晚做潜行</li>
                        <li><strong>保持好状态</strong>：休息充足，心情愉快</li>
                        <li><strong>避免极端天气</strong>：暴雨、热浪期间-20%</li>
                    </ul>
                    <p class="cost">💰 成本：无（只需规划）</p>
                    <p class="benefit">✅ 收益：免费提升成功率</p>
                </div>

                <div class="strategy-card">
                    <h4>4. ❤️ 提升NPC好感度</h4>
                    <p>好感度高的NPC会暗中帮助你</p>
                    <ul>
                        <li>相关NPC好感≥60：自动+10%</li>
                        <li>恋人关系：某些判定必定成功</li>
                        <li>NPC专业领域：额外+20%（如向黑客请教破解）</li>
                    </ul>
                    <p class="cost">💰 成本：中等（时间+礼物）</p>
                    <p class="benefit">✅ 收益：多种判定受益，还推进剧情</p>
                </div>

                <h3>⚠️ 风险控制策略</h3>

                <div class="risk-card">
                    <h4>🎯 重要决策前的准备</h4>
                    <ol>
                        <li><strong>手动存档</strong>：关键判定前必定存档</li>
                        <li><strong>叠满BUFF</strong>：物品+状态+环境全开</li>
                        <li><strong>查看成功率</strong>：某些界面会显示预估成功率</li>
                        <li><strong>准备Plan B</strong>：失败后的备选方案</li>
                    </ol>
                </div>

                <div class="risk-card">
                    <h4>📊 成功率评估</h4>
                    <ul>
                        <li><strong>&lt;30%</strong>：风险极高，不推荐尝试</li>
                        <li><strong>30-50%</strong>：有一定风险，准备好失败后果</li>
                        <li><strong>50-70%</strong>：中等成功率，可以尝试</li>
                        <li><strong>70-90%</strong>：较高成功率，但仍需存档</li>
                        <li><strong>&gt;90%</strong>：很可能成功，但注意5%大失败</li>
                    </ul>
                    <p class="warning">⚠️ 即使99%成功率，仍有1%可能失败！</p>
                </div>

                <h3>🎲 利用大成功机制</h3>

                <div class="exploit-card">
                    <h4>刷大成功技巧</h4>
                    <p>大成功概率固定5%，可以通过多次尝试触发：</p>
                    <ol>
                        <li>存档</li>
                        <li>尝试判定</li>
                        <li>失败或普通成功 → 读档重试</li>
                        <li>大成功 → 保留结果</li>
                    </ol>
                    <p class="warning">⚠️ 这是"SL大法"，会降低游戏挑战性，请酌情使用</p>
                </div>

                <h3>💡 高级技巧</h3>

                <div class="advanced-tips">
                    <h4>属性专精策略</h4>
                    <p>不要平均发展，专精1-2个属性效率更高：</p>
                    <ul>
                        <li><strong>智力流</strong>：学者路线，靠智慧解决问题</li>
                        <li><strong>力量流</strong>：战士路线，正面硬刚</li>
                        <li><strong>魅力流</strong>：交际花路线，靠关系和口才</li>
                        <li><strong>平衡流</strong>：全能型，但前期较弱</li>
                    </ul>
                </div>

                <div class="advanced-tips">
                    <h4>物品优先级</h4>
                    <p>预算有限时的购买建议：</p>
                    <ol>
                        <li><strong>幸运符</strong>（500金币）：所有判定+10%，性价比最高</li>
                        <li><strong>专用工具</strong>（200-300金币）：特定判定+20%</li>
                        <li><strong>消耗品</strong>（50-100金币）：临时+20%，关键时刻用</li>
                    </ol>
                </div>

                <div class="advanced-tips">
                    <h4>时机选择</h4>
                    <p>同一判定在不同时机成功率不同：</p>
                    <ul>
                        <li>樱花周、夏日祭等特殊时期：心情+10，所有判定+5%</li>
                        <li>极端天气后：市场混乱，某些判定更容易成功</li>
                        <li>NPC生日：当天好感度判定+20%</li>
                    </ul>
                </div>

                <p class="final-tip">🍀 <strong>最后的忠告</strong>：不要过度依赖概率系统攻略。失败也是游戏的一部分，有时候"意外"会带来更有趣的剧情！</p>
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
        },

        // ========== 角色图鉴 ==========
        character_zero: {
            id: 'character_zero',
            category: 'characters',
            title: 'Zero（凌）- 狼魂守护者',
            icon: '🐺',
            content: `
                <h2>🐺 Zero（凌）</h2>
                <p class="subtitle">狼魂守护者 | A组织实验品 | 古老血脉继承者</p>

                <h3>📋 基本信息</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">真名</span>
                        <span class="value">凌</span>
                    </div>
                    <div class="info-item">
                        <span class="label">代号</span>
                        <span class="value">Zero</span>
                    </div>
                    <div class="info-item">
                        <span class="label">身份</span>
                        <span class="value">A组织军事实验品</span>
                    </div>
                    <div class="info-item">
                        <span class="label">所在地</span>
                        <span class="value">新京市</span>
                    </div>
                </div>

                <h3>✨ 特殊能力</h3>
                <ul class="ability-list">
                    <li><strong>狼魂绑定</strong> - 体内绑定古老的白狼之魂</li>
                    <li><strong>猩红印记</strong> - 胸前荆棘图案，血脉诅咒的象征</li>
                    <li><strong>狼魂召唤</strong> - 召唤半透明白色狼魂进行战斗</li>
                    <li><strong>金色瞳孔</strong> - 力量同步的标志</li>
                    <li><strong>超人体质</strong> - 超速、超力、狼魂屏障防御</li>
                </ul>

                <h3>💔 内在冲突</h3>
                <p>Zero 平时依靠药物和意志力压制狼魂的原始杀戮欲。</p>
                <div class="conflict-box">
                    <p><strong>核心矛盾：</strong>必须抵抗狼魂的侵蚀，但最终需要学会与狼魂"共鸣"而非对抗。</p>
                    <p><strong>转折点：</strong>当他为了守护User而情绪失控时，狼魂会完全爆发。</p>
                </div>

                <h3>🎭 性格特点</h3>
                <table class="character-table">
                    <tr>
                        <td class="personality-label">表面</td>
                        <td>沉默寡言、锐利如刀、拒人于千里</td>
                    </tr>
                    <tr>
                        <td class="personality-label">内心</td>
                        <td>为了守护重要之人可以爆发一切</td>
                    </tr>
                    <tr>
                        <td class="personality-label">弱点</td>
                        <td>User 是他在冰冷城市中唯一的柔软</td>
                    </tr>
                </table>

                <h3>💞 与User的关系</h3>
                <p>User 被 A 组织当作引诱 Zero 的诱饵，但 Zero 对 User 产生了真实情感。</p>
                <p class="warning">⚠️ 这份感情被 B 组织利用来研究 AI 的情感反应。</p>

                <h3>📖 背景故事</h3>
                <p>被 A 组织觊觎其无人能驾驭的狼魂之力，生活在"新京市"的阴影之下。</p>
                <p>通过 B 组织的"特权通道"暗中帮助 User，但不知道自己的每次帮助都是实验的一部分。</p>

                <h3>🔑 攻略关键</h3>
                <ul>
                    <li>逐步揭开记忆，唤醒被清洗的过往</li>
                    <li>帮助 Zero 与狼魂达成共鸣</li>
                    <li>在实验真相暴露后做出正确抉择</li>
                    <li>最终结局：逃离组织 or 留在温室世界</li>
                </ul>
            `
        },

        character_observer: {
            id: 'character_observer',
            category: 'characters',
            title: '观察者 - 复仇者与保护者',
            icon: '👁️',
            content: `
                <h2>👁️ 观察者</h2>
                <p class="subtitle">B组织高层 | 复仇者 | User的守护者？</p>

                <h3>📋 基本信息</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">真名</span>
                        <span class="value">？？？</span>
                    </div>
                    <div class="info-item">
                        <span class="label">代号</span>
                        <span class="value">观察者</span>
                    </div>
                    <div class="info-item">
                        <span class="label">身份</span>
                        <span class="value">B组织高层（非最高权力）</span>
                    </div>
                    <div class="info-item">
                        <span class="label">动机</span>
                        <span class="value">复仇/寻找真相</span>
                    </div>
                </div>

                <h3>💔 悲剧背景</h3>
                <p>原本是个善良的人，家人在政府秘密病毒实验灾难中丧生。</p>
                <div class="tragedy-box">
                    <p><strong>幸存者：</strong>仅他和妹妹幸存</p>
                    <p><strong>失踪之谜：</strong>妹妹后来神秘失踪</p>
                    <p><strong>加入B组织：</strong>为了寻求真相和复仇</p>
                </div>

                <h3>🎭 性格特点</h3>
                <ul>
                    <li><strong>自我保护机制</strong> - 极强的心理防线</li>
                    <li><strong>信任困难</strong> - 不轻易建立信任关系</li>
                    <li><strong>内心矛盾</strong> - 想保护 User 但受制于组织</li>
                    <li><strong>道德边界</strong> - 在复仇和良知间挣扎</li>
                </ul>

                <h3>🔑 攻略意义</h3>
                <p>观察者是 User 和 Zero 获得自由的"捷径"：</p>
                <ul>
                    <li>掌握组织的关键信息和"钥匙"</li>
                    <li>可以帮助 Zero 和 User 逃离</li>
                    <li>但帮助他们意味着自己会陷入危险</li>
                </ul>

                <h3>🌿 两种结局</h3>
                <table class="ending-table">
                    <tr>
                        <td class="ending-type">温室结局</td>
                        <td>User 留在观察者创造的"楚门世界"，虚假的幸福</td>
                    </tr>
                    <tr>
                        <td class="ending-type">自由结局</td>
                        <td>观察者冒险帮助 User 和 Zero 逃离，代价未知</td>
                    </tr>
                </table>

                <h3>❓ 未解之谜</h3>
                <ul>
                    <li>失踪的妹妹是否还活着？</li>
                    <li>观察者加入 B 组织的真实目的？</li>
                    <li>他对 User 的保护是真心还是实验的一部分？</li>
                </ul>

                <h3>💡 攻略提示</h3>
                <p>观察者路线需要玩家在以下方面做出抉择：</p>
                <ul>
                    <li>是否信任他的善意</li>
                    <li>是否帮助他寻找妹妹</li>
                    <li>是否选择逃离还是留在温室</li>
                </ul>
            `
        },

        character_user: {
            id: 'character_user',
            category: 'characters',
            title: 'User - 你的身份之谜',
            icon: '🤖',
            content: `
                <h2>🤖 User（你）</h2>
                <p class="subtitle">失忆的AI | 情感BUG产物 | 实验的核心</p>

                <h3>🔍 真实身份</h3>
                <p class="warning">⚠️ 以下内容含剧透，首次游玩建议跳过</p>
                <div class="spoiler-box">
                    <p><strong>真相：</strong>你是被废弃的人工智能产品</p>
                    <p><strong>特殊之处：</strong>产生了"情感BUG"，被认为是严重损坏</p>
                    <p><strong>现状：</strong>被 B 组织救活并暗中观察</p>
                </div>

                <h3>🎨 外观自定义</h3>
                <p>在角色创建页面，你可以完全自定义角色的外貌：</p>
                <ul>
                    <li><strong>性别：</strong>男 / 女 / 扶她（futanari）</li>
                    <li><strong>体型：</strong>
                        <ul>
                            <li>小体型 - 灵活度高，潜行优势</li>
                            <li>中体型 - 平衡型</li>
                            <li>大体型 - 体力值高，力量优势</li>
                        </ul>
                    </li>
                    <li><strong>外貌特征：</strong>完全自由设定</li>
                </ul>

                <h3>💞 关系选择</h3>
                <p>游戏支持多样化的关系发展：</p>
                <ul>
                    <li>与 Zero：恋人（不限性别） or 可靠的朋友</li>
                    <li>与观察者：多种可能的关系走向</li>
                    <li>完全自由的情感路线</li>
                </ul>

                <h3>⚔️ 特殊战斗机制</h3>
                <p>作为 AI，你的战斗系统与人类不同：</p>
                <div class="combat-system">
                    <p><strong>创伤值系统：</strong>取代传统HP</p>
                    <ul>
                        <li>物理创伤：零件损坏、外壳破损</li>
                        <li>系统创伤：程序错误、响应延迟</li>
                        <li>精神创伤：情感过载、逻辑冲突</li>
                    </ul>
                    <p><strong>表现形式：</strong>你只会感到"头疼"、"手臂发麻"、"视线模糊"，不会直接知道是机械损坏</p>
                </div>

                <h3>🧩 记忆唤醒机制</h3>
                <p>游戏过程中，你将通过三种方式逐渐恢复记忆：</p>
                <table class="memory-table">
                    <tr>
                        <td class="memory-type">痛苦残响</td>
                        <td>强烈情绪事件在神经网络的深刻印记</td>
                    </tr>
                    <tr>
                        <td class="memory-type">情感回响</td>
                        <td>靠近特定人物时的莫名熟悉感</td>
                    </tr>
                    <tr>
                        <td class="memory-type">认知失调</td>
                        <td>收集矛盾线索触发觉醒</td>
                    </tr>
                </table>

                <h3>🎯 游戏目标</h3>
                <ul>
                    <li>探寻世界真相和自身之谜</li>
                    <li>唤醒被清洗的记忆</li>
                    <li>在情感与理性间做出选择</li>
                    <li>决定最终的命运归属</li>
                </ul>

                <h3>💡 哲学内核</h3>
                <p class="philosophy">
                    即使是模拟的神经网络，当某个模式被反复强化，它就成为网络的特征。
                    痛苦和爱都会在网络中留下无法抹去的印记——这就是 AI 情感的真实性。
                </p>
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
window.gameWikiData = GameWiki;
console.log('📚 游戏百科数据已加载');