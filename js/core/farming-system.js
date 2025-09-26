/**
 * 种植系统
 * 管理游戏中的农作物种植、生长、收获
 */

class FarmingSystem {
    constructor() {
        // 作物定义
        this.crops = {
            wheat: {
                id: 'wheat',
                name: '小麦',
                seedId: 'wheat_seed',
                growthTime: 3,  // 生长需要3天
                yield: { min: 3, max: 5 },  // 收获3-5个
                value: 15,       // 每个价值
                waterNeeded: 1,  // 每天需要浇水次数
                seasons: ['spring', 'autumn']  // 适合种植的季节
            },
            tomato: {
                id: 'tomato',
                name: '番茄',
                seedId: 'tomato_seed',
                growthTime: 2,
                yield: { min: 2, max: 4 },
                value: 20,
                waterNeeded: 2,
                seasons: ['spring', 'summer']
            },
            flower: {
                id: 'flower',
                name: '花朵',
                seedId: 'flower_seed',
                growthTime: 4,
                yield: { min: 1, max: 2 },
                value: 50,
                waterNeeded: 1,
                seasons: ['spring', 'summer', 'autumn']
            },
            potato: {
                id: 'potato',
                name: '土豆',
                seedId: 'potato_seed',
                growthTime: 4,
                yield: { min: 4, max: 6 },
                value: 12,
                waterNeeded: 1,
                seasons: ['spring', 'autumn', 'winter']
            },
            carrot: {
                id: 'carrot',
                name: '胡萝卜',
                seedId: 'carrot_seed',
                growthTime: 2,
                yield: { min: 3, max: 4 },
                value: 10,
                waterNeeded: 1,
                seasons: ['spring', 'autumn']
            }
        };

        // 种植地块
        this.plots = [];
        this.maxPlots = 9;  // 最多9块地（3x3）

        // 仓库
        this.warehouse = {};
        this.warehouseCapacity = 100;  // 仓库容量

        // 统计数据
        this.statistics = {
            totalPlanted: 0,
            totalHarvested: 0,
            totalEarnings: 0,
            cropCounts: {}
        };

        this.init();
    }

    /**
     * 初始化
     */
    init() {
        // 初始化种植地块
        for (let i = 0; i < this.maxPlots; i++) {
            this.plots.push({
                id: i,
                isEmpty: true,
                crop: null,
                plantedDay: null,
                growthStage: 0,
                wateredToday: false,
                isDead: false,
                fertilizerLevel: 0  // 肥料等级
            });
        }

        console.log('🌱 种植系统初始化完成');
    }

    /**
     * 种植作物
     */
    plantCrop(plotId, cropId) {
        if (plotId < 0 || plotId >= this.maxPlots) {
            console.log('❌ 无效的地块');
            return false;
        }

        const plot = this.plots[plotId];
        if (!plot.isEmpty) {
            console.log('❌ 地块已被占用');
            return false;
        }

        const crop = this.crops[cropId];
        if (!crop) {
            console.log('❌ 未知的作物类型');
            return false;
        }

        // 检查季节是否合适
        if (window.weatherSystem) {
            const currentSeason = window.weatherSystem.currentSeason;
            if (!crop.seasons.includes(currentSeason)) {
                console.log(`❌ ${crop.name}不适合在当前季节种植`);
                return false;
            }
        }

        // 检查是否有种子（需要背包系统支持）
        if (window.inventory && !window.inventory.hasItem(crop.seedId, 1)) {
            console.log(`❌ 缺少${crop.name}种子`);
            return false;
        }

        // 种植作物
        plot.isEmpty = false;
        plot.crop = cropId;
        plot.plantedDay = window.gameState?.gameTime?.day || 1;
        plot.growthStage = 0;
        plot.wateredToday = false;
        plot.isDead = false;

        // 消耗种子
        if (window.inventory) {
            window.inventory.removeItem(crop.seedId, 1);
        }

        // 更新统计
        this.statistics.totalPlanted++;
        if (!this.statistics.cropCounts[cropId]) {
            this.statistics.cropCounts[cropId] = { planted: 0, harvested: 0 };
        }
        this.statistics.cropCounts[cropId].planted++;

        console.log(`🌱 成功种植${crop.name}在地块${plotId}`);

        // 触发事件
        if (window.storyFlags) {
            window.storyFlags.setFlag('HAS_PLANTED_CROP', true);
            window.storyFlags.incrementCounter('CROPS_PLANTED');
        }

        return true;
    }

    /**
     * 浇水
     */
    waterPlot(plotId) {
        const plot = this.plots[plotId];
        if (!plot || plot.isEmpty) {
            console.log('❌ 地块为空');
            return false;
        }

        if (plot.isDead) {
            console.log('❌ 作物已经死亡');
            return false;
        }

        if (plot.wateredToday) {
            console.log('💧 今天已经浇过水了');
            return false;
        }

        plot.wateredToday = true;
        console.log(`💧 给地块${plotId}的${this.crops[plot.crop].name}浇水`);

        // 增加心情（照顾植物让人放松）
        if (window.gameState?.character) {
            const mood = window.gameState.character.mood || 50;
            window.gameState.character.mood = Math.min(100, mood + 2);
        }

        return true;
    }

    /**
     * 施肥
     */
    fertilizePlot(plotId, fertilizerType = 'basic') {
        const plot = this.plots[plotId];
        if (!plot || plot.isEmpty) {
            console.log('❌ 地块为空');
            return false;
        }

        if (plot.isDead) {
            console.log('❌ 作物已经死亡');
            return false;
        }

        const fertilizerLevels = {
            'basic': 1,
            'advanced': 2,
            'premium': 3
        };

        const level = fertilizerLevels[fertilizerType] || 1;
        plot.fertilizerLevel = Math.max(plot.fertilizerLevel, level);

        console.log(`🌿 给地块${plotId}施肥（等级${level}）`);
        return true;
    }

    /**
     * 收获作物
     */
    harvestCrop(plotId) {
        const plot = this.plots[plotId];
        if (!plot || plot.isEmpty) {
            console.log('❌ 地块为空');
            return false;
        }

        const crop = this.crops[plot.crop];
        if (!crop) {
            console.log('❌ 未知的作物');
            return false;
        }

        // 检查是否成熟
        if (plot.growthStage < crop.growthTime) {
            console.log(`❌ ${crop.name}还未成熟（${plot.growthStage}/${crop.growthTime}天）`);
            return false;
        }

        if (plot.isDead) {
            console.log('❌ 作物已经死亡，无法收获');
            // 清理地块
            this.clearPlot(plotId);
            return false;
        }

        // 计算产量
        let cropYield = Math.floor(
            crop.yield.min + Math.random() * (crop.yield.max - crop.yield.min + 1)
        );

        // 肥料加成
        cropYield = Math.floor(cropYield * (1 + plot.fertilizerLevel * 0.2));

        // 天气加成
        if (window.weatherSystem && window.weatherSystem.currentWeather === 'sunny') {
            cropYield = Math.floor(cropYield * 1.1);
        }

        // 添加到仓库
        this.addToWarehouse(plot.crop, cropYield);

        // 计算收益
        const earnings = cropYield * crop.value;
        if (window.gameState?.character) {
            window.gameState.character.money = (window.gameState.character.money || 0) + earnings;
        }

        // 更新统计
        this.statistics.totalHarvested += cropYield;
        this.statistics.totalEarnings += earnings;
        this.statistics.cropCounts[plot.crop].harvested += cropYield;

        console.log(`🌾 收获${cropYield}个${crop.name}，获得¥${earnings}`);

        // 清理地块
        this.clearPlot(plotId);

        // 触发事件
        if (window.storyFlags) {
            window.storyFlags.setFlag('HAS_HARVESTED_CROP', true);
            window.storyFlags.incrementCounter('CROPS_HARVESTED', cropYield);
        }

        return {
            crop: crop.name,
            yield: cropYield,
            earnings
        };
    }

    /**
     * 清理地块
     */
    clearPlot(plotId) {
        const plot = this.plots[plotId];
        if (!plot) return;

        plot.isEmpty = true;
        plot.crop = null;
        plot.plantedDay = null;
        plot.growthStage = 0;
        plot.wateredToday = false;
        plot.isDead = false;
        plot.fertilizerLevel = 0;

        console.log(`🧹 清理地块${plotId}`);
    }

    /**
     * 每日更新
     */
    dailyUpdate() {
        for (const plot of this.plots) {
            if (plot.isEmpty || plot.isDead) continue;

            const crop = this.crops[plot.crop];
            if (!crop) continue;

            // 检查是否浇水
            if (!plot.wateredToday) {
                // 缺水会导致作物死亡的概率
                const deathChance = 0.3 * crop.waterNeeded;
                if (Math.random() < deathChance) {
                    plot.isDead = true;
                    console.log(`☠️ 地块${plot.id}的${crop.name}因缺水而死亡`);
                    continue;
                }
            }

            // 作物生长
            if (plot.wateredToday) {
                plot.growthStage++;
                console.log(`🌱 地块${plot.id}的${crop.name}成长到第${plot.growthStage}/${crop.growthTime}天`);
            }

            // 重置浇水状态
            plot.wateredToday = false;

            // 检查是否过熟腐烂
            if (plot.growthStage > crop.growthTime + 2) {
                plot.isDead = true;
                console.log(`☠️ 地块${plot.id}的${crop.name}因过熟而腐烂`);
            }
        }

        // 检查仓库腐烂（10%概率）
        for (const [cropId, quantity] of Object.entries(this.warehouse)) {
            if (quantity > 20 && Math.random() < 0.1) {
                const loss = Math.floor(quantity * 0.1);
                this.warehouse[cropId] = quantity - loss;
                console.log(`🗑️ 仓库中的${this.crops[cropId].name}腐烂了${loss}个`);
            }
        }
    }

    /**
     * 添加到仓库
     */
    addToWarehouse(cropId, quantity) {
        const currentTotal = this.getWarehouseTotal();
        if (currentTotal + quantity > this.warehouseCapacity) {
            quantity = this.warehouseCapacity - currentTotal;
            console.log('⚠️ 仓库容量不足，只能存储部分作物');
        }

        if (!this.warehouse[cropId]) {
            this.warehouse[cropId] = 0;
        }
        this.warehouse[cropId] += quantity;

        console.log(`📦 ${this.crops[cropId].name} x${quantity} 已存入仓库`);
    }

    /**
     * 从仓库取出
     */
    removeFromWarehouse(cropId, quantity) {
        if (!this.warehouse[cropId] || this.warehouse[cropId] < quantity) {
            console.log('❌ 仓库存量不足');
            return false;
        }

        this.warehouse[cropId] -= quantity;
        if (this.warehouse[cropId] === 0) {
            delete this.warehouse[cropId];
        }

        return true;
    }

    /**
     * 获取仓库总量
     */
    getWarehouseTotal() {
        return Object.values(this.warehouse).reduce((sum, qty) => sum + qty, 0);
    }

    /**
     * 获取种植信息
     */
    getPlotInfo(plotId) {
        const plot = this.plots[plotId];
        if (!plot || plot.isEmpty) return null;

        const crop = this.crops[plot.crop];
        return {
            plotId,
            cropName: crop.name,
            growthStage: plot.growthStage,
            totalStages: crop.growthTime,
            isReady: plot.growthStage >= crop.growthTime,
            isDead: plot.isDead,
            wateredToday: plot.wateredToday,
            fertilizerLevel: plot.fertilizerLevel,
            daysUntilHarvest: Math.max(0, crop.growthTime - plot.growthStage)
        };
    }

    /**
     * 获取所有地块状态
     */
    getAllPlotsStatus() {
        return this.plots.map(plot => {
            if (plot.isEmpty) {
                return { id: plot.id, status: 'empty' };
            }

            const crop = this.crops[plot.crop];
            let status = 'growing';

            if (plot.isDead) status = 'dead';
            else if (plot.growthStage >= crop.growthTime) status = 'ready';
            else if (!plot.wateredToday) status = 'thirsty';

            return {
                id: plot.id,
                status,
                crop: crop.name,
                stage: `${plot.growthStage}/${crop.growthTime}`
            };
        });
    }

    /**
     * 保存种植数据
     */
    save() {
        return {
            plots: this.plots,
            warehouse: this.warehouse,
            statistics: this.statistics
        };
    }

    /**
     * 加载种植数据
     */
    load(data) {
        if (data.plots) this.plots = data.plots;
        if (data.warehouse) this.warehouse = data.warehouse;
        if (data.statistics) this.statistics = data.statistics;

        console.log('🌱 种植数据已恢复');
    }

    /**
     * 重置种植系统
     */
    reset() {
        this.plots = [];
        this.warehouse = {};
        this.statistics = {
            totalPlanted: 0,
            totalHarvested: 0,
            totalEarnings: 0,
            cropCounts: {}
        };

        this.init();
    }
}

// 创建全局实例
window.farmingSystem = new FarmingSystem();

// 导出供模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FarmingSystem;
}

console.log('🌱 种植系统已加载');