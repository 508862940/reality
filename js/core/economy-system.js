/**
 * 经济系统
 * 管理游戏中的市场价格、交易、货币流通
 */

class EconomySystem {
    constructor() {
        // 物品基础价格定义
        this.baseItems = {
            // 食物类
            apple: { name: '苹果', category: 'food', basePrice: 5, volatility: 0.2 },
            bread: { name: '面包', category: 'food', basePrice: 8, volatility: 0.15 },
            water: { name: '水', category: 'food', basePrice: 2, volatility: 0.1 },
            coffee: { name: '咖啡', category: 'food', basePrice: 15, volatility: 0.25 },

            // 材料类
            wood: { name: '木材', category: 'material', basePrice: 20, volatility: 0.3 },
            stone: { name: '石头', category: 'material', basePrice: 10, volatility: 0.2 },
            metal: { name: '金属', category: 'material', basePrice: 50, volatility: 0.4 },

            // 种子类
            wheat_seed: { name: '小麦种子', category: 'seed', basePrice: 10, volatility: 0.3 },
            tomato_seed: { name: '番茄种子', category: 'seed', basePrice: 15, volatility: 0.35 },
            flower_seed: { name: '花种', category: 'seed', basePrice: 25, volatility: 0.4 },

            // 工具类
            shovel: { name: '铲子', category: 'tool', basePrice: 100, volatility: 0.1 },
            pickaxe: { name: '镐子', category: 'tool', basePrice: 150, volatility: 0.1 },
            watering_can: { name: '水壶', category: 'tool', basePrice: 80, volatility: 0.05 },

            // 特殊物品
            memory_chip: { name: '记忆芯片', category: 'special', basePrice: 1000, volatility: 0.5 },
            wolf_amulet: { name: '狼护身符', category: 'special', basePrice: 500, volatility: 0.3 }
        };

        // 当前市场价格
        this.currentPrices = {};

        // 价格历史记录（最近7天）
        this.priceHistory = {};

        // 交易记录
        this.transactions = [];

        // 商店库存
        this.shopInventory = {};

        // 经济设置
        this.inflationRate = 0.02;  // 每天2%的通货膨胀
        this.taxRate = 0.1;         // 10%交易税
        this.maxTransactionHistory = 50; // 保留最近50条交易

        // 经济事件
        this.economicEvents = {
            boom: { name: '经济繁荣', priceMultiplier: 1.3, duration: 3 },
            recession: { name: '经济衰退', priceMultiplier: 0.7, duration: 3 },
            shortage: { name: '物资短缺', priceMultiplier: 1.5, duration: 2 },
            surplus: { name: '物资过剩', priceMultiplier: 0.6, duration: 2 }
        };

        this.currentEvent = null;
        this.eventDaysRemaining = 0;

        this.init();
    }

    /**
     * 初始化
     */
    init() {
        // 初始化所有物品的当前价格
        this.updateAllPrices();

        // 初始化商店库存
        this.generateShopInventory();

        console.log('💰 经济系统初始化完成');
    }

    /**
     * 更新所有物品价格
     */
    updateAllPrices() {
        for (const [itemId, item] of Object.entries(this.baseItems)) {
            if (!this.currentPrices[itemId]) {
                this.currentPrices[itemId] = item.basePrice;
            }

            // 初始化价格历史
            if (!this.priceHistory[itemId]) {
                this.priceHistory[itemId] = [item.basePrice];
            }
        }
    }

    /**
     * 每日价格更新
     */
    dailyPriceUpdate() {
        // 处理经济事件
        if (this.eventDaysRemaining > 0) {
            this.eventDaysRemaining--;
            if (this.eventDaysRemaining === 0) {
                console.log(`📊 经济事件结束: ${this.currentEvent.name}`);
                this.currentEvent = null;
            }
        }

        // 随机触发新的经济事件
        if (!this.currentEvent && Math.random() < 0.1) { // 10%概率
            this.triggerEconomicEvent();
        }

        // 更新每个物品的价格
        for (const [itemId, item] of Object.entries(this.baseItems)) {
            const oldPrice = this.currentPrices[itemId];
            const newPrice = this.calculateNewPrice(itemId, item);

            this.currentPrices[itemId] = newPrice;

            // 记录价格历史
            this.priceHistory[itemId].push(newPrice);
            if (this.priceHistory[itemId].length > 7) {
                this.priceHistory[itemId].shift(); // 只保留7天历史
            }

            // 如果价格变化显著，记录日志
            const changePercent = Math.abs((newPrice - oldPrice) / oldPrice * 100);
            if (changePercent > 20) {
                console.log(`💹 ${item.name}价格${newPrice > oldPrice ? '上涨' : '下跌'} ${changePercent.toFixed(1)}%`);
            }
        }

        // 更新商店库存
        this.generateShopInventory();
    }

    /**
     * 计算新价格
     */
    calculateNewPrice(itemId, item) {
        let price = this.currentPrices[itemId];

        // 基础波动
        const volatility = item.volatility;
        const change = (Math.random() - 0.5) * 2 * volatility;
        price *= (1 + change);

        // 应用通货膨胀
        price *= (1 + this.inflationRate / 30); // 日通胀率

        // 应用经济事件影响
        if (this.currentEvent) {
            price *= this.currentEvent.priceMultiplier;
        }

        // 应用季节影响
        price = this.applySeasonalEffect(itemId, price);

        // 确保价格在合理范围内
        const minPrice = item.basePrice * 0.3;
        const maxPrice = item.basePrice * 3;
        price = Math.max(minPrice, Math.min(maxPrice, price));

        return Math.round(price);
    }

    /**
     * 应用季节影响
     */
    applySeasonalEffect(itemId, price) {
        if (!window.weatherSystem) return price;

        const season = window.weatherSystem.currentSeason;
        const item = this.baseItems[itemId];

        // 种子在春季更贵
        if (item.category === 'seed' && season === 'spring') {
            price *= 1.2;
        }
        // 食物在冬季更贵
        else if (item.category === 'food' && season === 'winter') {
            price *= 1.3;
        }
        // 材料在夏季便宜（建筑旺季）
        else if (item.category === 'material' && season === 'summer') {
            price *= 0.9;
        }

        return price;
    }

    /**
     * 触发经济事件
     */
    triggerEconomicEvent() {
        const events = Object.values(this.economicEvents);
        const event = events[Math.floor(Math.random() * events.length)];

        this.currentEvent = event;
        this.eventDaysRemaining = event.duration;

        console.log(`📊 经济事件: ${event.name} (持续${event.duration}天)`);

        // 通知玩家
        if (window.showNotification) {
            window.showNotification(`📊 ${event.name}！物价将受到影响`);
        }
    }

    /**
     * 生成商店库存
     */
    generateShopInventory() {
        this.shopInventory = {};

        // 随机选择要出售的物品
        const itemIds = Object.keys(this.baseItems);
        const shopItemCount = 8 + Math.floor(Math.random() * 5); // 8-12种物品

        for (let i = 0; i < shopItemCount; i++) {
            const itemId = itemIds[Math.floor(Math.random() * itemIds.length)];

            if (!this.shopInventory[itemId]) {
                // 随机库存数量
                let quantity = Math.floor(Math.random() * 20) + 5;

                // 特殊物品库存较少
                if (this.baseItems[itemId].category === 'special') {
                    quantity = Math.floor(Math.random() * 3) + 1;
                }

                this.shopInventory[itemId] = {
                    quantity,
                    price: this.currentPrices[itemId]
                };
            }
        }
    }

    /**
     * 购买物品
     */
    buyItem(itemId, quantity = 1) {
        if (!this.shopInventory[itemId]) {
            console.log('❌ 商店没有这个物品');
            return false;
        }

        const shopItem = this.shopInventory[itemId];
        if (shopItem.quantity < quantity) {
            console.log('❌ 库存不足');
            return false;
        }

        const totalPrice = Math.ceil(shopItem.price * quantity * (1 + this.taxRate));

        // 检查玩家金钱
        if (!window.gameState?.character?.money || window.gameState.character.money < totalPrice) {
            console.log('❌ 金钱不足');
            return false;
        }

        // 执行交易
        window.gameState.character.money -= totalPrice;
        shopItem.quantity -= quantity;

        // 记录交易
        this.recordTransaction('buy', itemId, quantity, shopItem.price, totalPrice);

        console.log(`✅ 购买成功: ${this.baseItems[itemId].name} x${quantity}, 花费 ¥${totalPrice}`);

        // 添加到玩家背包（需要背包系统支持）
        if (window.inventory) {
            window.inventory.addItem(itemId, quantity);
        }

        return true;
    }

    /**
     * 出售物品
     */
    sellItem(itemId, quantity = 1) {
        if (!this.baseItems[itemId]) {
            console.log('❌ 未知物品');
            return false;
        }

        // 检查玩家背包（需要背包系统支持）
        if (window.inventory && !window.inventory.hasItem(itemId, quantity)) {
            console.log('❌ 物品不足');
            return false;
        }

        const sellPrice = Math.floor(this.currentPrices[itemId] * 0.7); // 卖出价格是市价的70%
        const totalEarnings = sellPrice * quantity;

        // 执行交易
        if (window.gameState?.character) {
            window.gameState.character.money = (window.gameState.character.money || 0) + totalEarnings;
        }

        // 从背包移除
        if (window.inventory) {
            window.inventory.removeItem(itemId, quantity);
        }

        // 记录交易
        this.recordTransaction('sell', itemId, quantity, sellPrice, totalEarnings);

        console.log(`✅ 出售成功: ${this.baseItems[itemId].name} x${quantity}, 获得 ¥${totalEarnings}`);

        return true;
    }

    /**
     * 记录交易
     */
    recordTransaction(type, itemId, quantity, unitPrice, totalPrice) {
        const transaction = {
            type,
            itemId,
            itemName: this.baseItems[itemId].name,
            quantity,
            unitPrice,
            totalPrice,
            day: window.gameState?.gameTime?.day || 1,
            timestamp: Date.now()
        };

        this.transactions.push(transaction);

        // 限制交易记录数量
        if (this.transactions.length > this.maxTransactionHistory) {
            this.transactions.shift();
        }
    }

    /**
     * 获取物品当前价格
     */
    getItemPrice(itemId) {
        return this.currentPrices[itemId] || 0;
    }

    /**
     * 获取价格趋势
     */
    getPriceTrend(itemId) {
        const history = this.priceHistory[itemId];
        if (!history || history.length < 2) return 'stable';

        const recent = history[history.length - 1];
        const previous = history[history.length - 2];

        if (recent > previous * 1.1) return 'rising';
        if (recent < previous * 0.9) return 'falling';
        return 'stable';
    }

    /**
     * 获取商店库存信息
     */
    getShopInfo() {
        const items = [];

        for (const [itemId, shopItem] of Object.entries(this.shopInventory)) {
            const item = this.baseItems[itemId];
            items.push({
                id: itemId,
                name: item.name,
                category: item.category,
                price: shopItem.price,
                quantity: shopItem.quantity,
                trend: this.getPriceTrend(itemId)
            });
        }

        return {
            items,
            taxRate: this.taxRate,
            event: this.currentEvent ? this.currentEvent.name : null
        };
    }

    /**
     * 获取交易统计
     */
    getTransactionStats() {
        let totalSpent = 0;
        let totalEarned = 0;
        let itemsBought = 0;
        let itemsSold = 0;

        for (const transaction of this.transactions) {
            if (transaction.type === 'buy') {
                totalSpent += transaction.totalPrice;
                itemsBought += transaction.quantity;
            } else {
                totalEarned += transaction.totalPrice;
                itemsSold += transaction.quantity;
            }
        }

        return {
            totalSpent,
            totalEarned,
            netProfit: totalEarned - totalSpent,
            itemsBought,
            itemsSold,
            transactionCount: this.transactions.length
        };
    }

    /**
     * 保存经济数据
     */
    save() {
        return {
            currentPrices: this.currentPrices,
            priceHistory: this.priceHistory,
            transactions: this.transactions.slice(-20), // 只保存最近20条
            shopInventory: this.shopInventory,
            currentEvent: this.currentEvent,
            eventDaysRemaining: this.eventDaysRemaining
        };
    }

    /**
     * 加载经济数据
     */
    load(data) {
        if (data.currentPrices) this.currentPrices = data.currentPrices;
        if (data.priceHistory) this.priceHistory = data.priceHistory;
        if (data.transactions) this.transactions = data.transactions;
        if (data.shopInventory) this.shopInventory = data.shopInventory;
        if (data.currentEvent) this.currentEvent = data.currentEvent;
        if (data.eventDaysRemaining !== undefined) this.eventDaysRemaining = data.eventDaysRemaining;

        console.log('💰 经济数据已恢复');
    }

    /**
     * 重置经济系统
     */
    reset() {
        this.currentPrices = {};
        this.priceHistory = {};
        this.transactions = [];
        this.shopInventory = {};
        this.currentEvent = null;
        this.eventDaysRemaining = 0;

        this.init();
    }
}

// 创建全局实例
window.economySystem = new EconomySystem();

// 导出供模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EconomySystem;
}

console.log('💰 经济系统已加载');