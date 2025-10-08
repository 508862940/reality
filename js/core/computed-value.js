/**
 * ComputedValue - 计算属性类
 *
 * 职责：
 * - 代表一个计算属性（如体感温度）
 * - 管理依赖关系
 * - 延迟计算优化（脏标记机制）
 * - 防止循环依赖
 *
 * 类比：神经元（接收信号、处理、输出）
 *
 * @version 1.0.0
 * @date 2025-10-03
 */

class ComputedValue {
    /**
     * 构造函数
     * @param {string} name - 计算属性名称（如 'temperature.apparent'）
     * @param {string[]} dependencies - 依赖的输入源（如 ['environment.temperature', 'clothing.modifier']）
     * @param {Function} computeFn - 计算函数（返回计算结果）
     */
    constructor(name, dependencies, computeFn) {
        this.name = name;
        this.dependencies = dependencies;
        this.computeFn = computeFn;

        // 状态管理
        this.isDirty = true;           // 脏标记：是否需要重新计算
        this.cachedValue = null;       // 缓存值：上次计算的结果
        this.isComputing = false;      // 计算标记：防止循环依赖
        this.computeScheduled = false; // 调度标记：是否已加入下一帧计算队列

        // 性能监控
        this.computeCount = 0;         // 计算次数统计
        this.lastComputeTime = 0;      // 上次计算时间

        console.log(`✨ 创建计算属性: ${this.name}`);
        console.log(`   依赖: [${this.dependencies.join(', ')}]`);
    }

    /**
     * 标记为脏（需要重新计算）
     * 调用时机：依赖的输入源发生变化
     */
    markDirty() {
        if (!this.isDirty) {
            this.isDirty = true;
            console.log(`🔴 标记脏: ${this.name}`);
            this.scheduleCompute();
        }
    }

    /**
     * 安排计算（延迟到下一帧）
     * 使用 requestAnimationFrame 确保在浏览器下一次重绘前执行
     */
    scheduleCompute() {
        if (!this.computeScheduled) {
            this.computeScheduled = true;

            requestAnimationFrame(() => {
                this.compute();
                this.computeScheduled = false;
            });
        }
    }

    /**
     * 执行计算
     * - 检查脏标记
     * - 防止循环依赖
     * - 执行计算函数
     * - 更新缓存
     * - 通知响应式系统
     */
    compute() {
        // 1. 检查是否需要计算
        if (!this.isDirty) {
            console.log(`⏭️ 跳过计算: ${this.name}（已是最新值）`);
            return;
        }

        // 2. 防止循环依赖
        if (this.isComputing) {
            console.error(`❌ 循环依赖检测: ${this.name}`);
            console.error(`   可能的依赖链: ${this.dependencies.join(' → ')}`);
            return;
        }

        // 3. 开始计算
        this.isComputing = true;
        const startTime = performance.now();

        try {
            // 执行计算函数
            this.cachedValue = this.computeFn();
            this.isDirty = false;
            this.computeCount++;

            // 记录耗时
            const duration = performance.now() - startTime;
            this.lastComputeTime = duration;

            console.log(`✅ 计算完成: ${this.name} = ${this.cachedValue}`);
            console.log(`   耗时: ${duration.toFixed(2)}ms | 总计算次数: ${this.computeCount}`);

            // 4. 通知响应式系统（触发级联更新）
            if (window.reactiveSystem) {
                window.reactiveSystem.notify(this.name, this.cachedValue);
            }

        } catch (error) {
            console.error(`❌ 计算错误: ${this.name}`, error);
            console.error(`   计算函数:`, this.computeFn.toString());
        } finally {
            this.isComputing = false;
        }
    }

    /**
     * 立即计算（同步）
     * 使用场景：必须立即获取最新值时（少用）
     */
    computeNow() {
        if (this.isDirty) {
            // 临时取消调度
            this.computeScheduled = false;
            this.compute();
        }
    }

    /**
     * 获取值（智能判断）
     * - 如果是脏的，立即计算
     * - 否则返回缓存值
     */
    get value() {
        if (this.isDirty) {
            this.computeNow();
        }
        return this.cachedValue;
    }

    /**
     * 手动设置值（调试用）
     * 注意：会清除脏标记
     */
    setValue(value) {
        this.cachedValue = value;
        this.isDirty = false;
        console.log(`🔧 手动设置: ${this.name} = ${value}`);
    }

    /**
     * 重置状态（测试用）
     */
    reset() {
        this.isDirty = true;
        this.cachedValue = null;
        this.isComputing = false;
        this.computeScheduled = false;
        this.computeCount = 0;
        this.lastComputeTime = 0;
        console.log(`🔄 重置: ${this.name}`);
    }

    /**
     * 获取调试信息
     */
    getDebugInfo() {
        return {
            name: this.name,
            dependencies: this.dependencies,
            isDirty: this.isDirty,
            cachedValue: this.cachedValue,
            isComputing: this.isComputing,
            computeScheduled: this.computeScheduled,
            computeCount: this.computeCount,
            lastComputeTime: this.lastComputeTime
        };
    }

    /**
     * 打印调试信息
     */
    debug() {
        console.group(`🔍 ComputedValue 调试: ${this.name}`);
        console.log('依赖:', this.dependencies);
        console.log('当前值:', this.cachedValue);
        console.log('是否脏:', this.isDirty);
        console.log('正在计算:', this.isComputing);
        console.log('已调度:', this.computeScheduled);
        console.log('计算次数:', this.computeCount);
        console.log('上次耗时:', this.lastComputeTime.toFixed(2) + 'ms');
        console.groupEnd();
    }
}

/**
 * 工厂函数：创建计算属性
 * 简化创建过程
 */
function createComputed(name, dependencies, computeFn) {
    const computed = new ComputedValue(name, dependencies, computeFn);

    // 自动注册到响应式系统
    if (window.reactiveSystem) {
        window.reactiveSystem.registerComputed(computed);
    } else {
        console.warn(`⚠️ ReactiveSystem 未初始化，无法注册: ${name}`);
    }

    return computed;
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.ComputedValue = ComputedValue;
    window.createComputed = createComputed;
}

// 模块导出（如果支持）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ComputedValue, createComputed };
}

console.log('✅ ComputedValue 模块已加载');
