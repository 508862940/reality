/**
 * DependencyGraph - 依赖图类
 *
 * 职责：
 * - 管理所有计算节点（ComputedValue）
 * - 维护依赖关系（哪个输入影响哪些计算）
 * - 自动传播变化（输入变了通知相关节点）
 * - 检测循环依赖
 *
 * 类比：神经网络（管理所有神经元的连接）
 *
 * @version 1.0.0
 * @date 2025-10-03
 */

class DependencyGraph {
    constructor() {
        // 存储所有计算节点
        this.nodes = new Map(); // key: 节点名称, value: ComputedValue

        // 依赖关系映射
        // key: 输入源名称（如 'environment.temperature'）
        // value: 依赖它的计算节点数组
        this.dependencyMap = new Map();

        // 反向依赖映射（用于查找节点的依赖）
        // key: 节点名称, value: 它依赖的输入源数组
        this.reverseDependencyMap = new Map();

        console.log('🌐 DependencyGraph 初始化');
    }

    /**
     * 注册计算节点
     * @param {ComputedValue} computedValue - 要注册的计算节点
     */
    register(computedValue) {
        if (!(computedValue instanceof ComputedValue)) {
            console.error('❌ 注册失败：必须是 ComputedValue 实例');
            return false;
        }

        // 1. 存储节点
        this.nodes.set(computedValue.name, computedValue);

        // 2. 建立依赖关系
        computedValue.dependencies.forEach(dep => {
            // 正向映射：输入 → 计算节点
            if (!this.dependencyMap.has(dep)) {
                this.dependencyMap.set(dep, []);
            }
            this.dependencyMap.get(dep).push(computedValue);
        });

        // 3. 建立反向映射：节点 → 输入源
        this.reverseDependencyMap.set(computedValue.name, computedValue.dependencies);

        // 4. 检测循环依赖
        if (this.detectCycle(computedValue.name)) {
            console.error(`❌ 检测到循环依赖: ${computedValue.name}`);
            this.printCycle(computedValue.name);
        }

        console.log(`📌 注册节点: ${computedValue.name}`);
        console.log(`   依赖: [${computedValue.dependencies.join(', ')}]`);

        return true;
    }

    /**
     * 注销计算节点
     * @param {string} name - 节点名称
     */
    unregister(name) {
        const node = this.nodes.get(name);
        if (!node) {
            console.warn(`⚠️ 节点不存在: ${name}`);
            return false;
        }

        // 1. 从节点集合中移除
        this.nodes.delete(name);

        // 2. 清理依赖关系
        const dependencies = this.reverseDependencyMap.get(name) || [];
        dependencies.forEach(dep => {
            const affectedNodes = this.dependencyMap.get(dep) || [];
            const index = affectedNodes.indexOf(node);
            if (index !== -1) {
                affectedNodes.splice(index, 1);
            }
        });

        // 3. 清理反向映射
        this.reverseDependencyMap.delete(name);

        console.log(`🗑️ 注销节点: ${name}`);
        return true;
    }

    /**
     * 通知依赖变化
     * @param {string} key - 变化的输入源（如 'environment.temperature'）
     */
    notify(key) {
        const affectedNodes = this.dependencyMap.get(key) || [];

        if (affectedNodes.length === 0) {
            // 没有节点依赖这个输入
            return;
        }

        console.log(`🔔 依赖变化: ${key} → 影响 ${affectedNodes.length} 个节点`);

        affectedNodes.forEach(node => {
            console.log(`   → 标记脏: ${node.name}`);
            node.markDirty();
        });
    }

    /**
     * 获取受影响的节点
     * @param {string} key - 输入源名称
     * @returns {ComputedValue[]} 受影响的节点数组
     */
    getAffectedNodes(key) {
        return this.dependencyMap.get(key) || [];
    }

    /**
     * 获取节点的依赖
     * @param {string} name - 节点名称
     * @returns {string[]} 依赖的输入源数组
     */
    getDependencies(name) {
        return this.reverseDependencyMap.get(name) || [];
    }

    /**
     * 检测循环依赖（深度优先搜索）
     * @param {string} startNode - 起始节点
     * @returns {boolean} 是否存在循环
     */
    detectCycle(startNode) {
        const visited = new Set();
        const recursionStack = new Set();

        const dfs = (node) => {
            if (recursionStack.has(node)) {
                return true; // 发现循环
            }

            if (visited.has(node)) {
                return false; // 已访问过，无循环
            }

            visited.add(node);
            recursionStack.add(node);

            // 检查依赖
            const dependencies = this.getDependencies(node);
            for (const dep of dependencies) {
                // 如果依赖也是一个计算节点
                if (this.nodes.has(dep)) {
                    if (dfs(dep)) {
                        return true;
                    }
                }
            }

            recursionStack.delete(node);
            return false;
        };

        return dfs(startNode);
    }

    /**
     * 打印循环依赖路径
     * @param {string} startNode - 起始节点
     */
    printCycle(startNode) {
        const visited = new Set();
        const path = [];

        const dfs = (node) => {
            if (path.includes(node)) {
                // 找到循环
                const cycleStart = path.indexOf(node);
                const cycle = path.slice(cycleStart).concat(node);
                console.error(`   循环路径: ${cycle.join(' → ')}`);
                return true;
            }

            if (visited.has(node)) {
                return false;
            }

            visited.add(node);
            path.push(node);

            const dependencies = this.getDependencies(node);
            for (const dep of dependencies) {
                if (this.nodes.has(dep)) {
                    if (dfs(dep)) {
                        return true;
                    }
                }
            }

            path.pop();
            return false;
        };

        dfs(startNode);
    }

    /**
     * 打印依赖图（调试用）
     */
    printGraph() {
        console.group('📊 依赖图:');

        if (this.dependencyMap.size === 0) {
            console.log('   （空）');
        } else {
            this.dependencyMap.forEach((nodes, key) => {
                const nodeNames = nodes.map(n => n.name).join(', ');
                console.log(`   ${key} → [${nodeNames}]`);
            });
        }

        console.groupEnd();
    }

    /**
     * 打印反向依赖图（调试用）
     */
    printReverseGraph() {
        console.group('📊 反向依赖图:');

        if (this.reverseDependencyMap.size === 0) {
            console.log('   （空）');
        } else {
            this.reverseDependencyMap.forEach((deps, node) => {
                console.log(`   ${node} ← [${deps.join(', ')}]`);
            });
        }

        console.groupEnd();
    }

    /**
     * 获取所有节点
     * @returns {Map} 节点集合
     */
    getAllNodes() {
        return this.nodes;
    }

    /**
     * 获取节点数量
     * @returns {number}
     */
    getNodeCount() {
        return this.nodes.size;
    }

    /**
     * 清空所有节点
     */
    clear() {
        this.nodes.clear();
        this.dependencyMap.clear();
        this.reverseDependencyMap.clear();
        console.log('🗑️ 依赖图已清空');
    }

    /**
     * 获取完整的依赖链
     * @param {string} name - 节点名称
     * @returns {string[]} 依赖链（从输入源到最终节点）
     */
    getDependencyChain(name) {
        const chain = [];
        const visited = new Set();

        const dfs = (node) => {
            if (visited.has(node)) return;
            visited.add(node);

            const deps = this.getDependencies(node);
            deps.forEach(dep => {
                if (this.nodes.has(dep)) {
                    dfs(dep);
                } else {
                    // 输入源（叶子节点）
                    if (!chain.includes(dep)) {
                        chain.push(dep);
                    }
                }
            });

            chain.push(node);
        };

        dfs(name);
        return chain;
    }

    /**
     * 打印依赖链（调试用）
     * @param {string} name - 节点名称
     */
    printDependencyChain(name) {
        const chain = this.getDependencyChain(name);
        console.log(`🔗 依赖链: ${chain.join(' → ')}`);
    }

    /**
     * 获取调试信息
     */
    getDebugInfo() {
        return {
            nodeCount: this.nodes.size,
            dependencyCount: this.dependencyMap.size,
            nodes: Array.from(this.nodes.keys()),
            dependencies: Object.fromEntries(this.dependencyMap)
        };
    }

    /**
     * 完整调试输出
     */
    debug() {
        console.group('🔍 DependencyGraph 调试信息');
        console.log('节点数量:', this.nodes.size);
        console.log('依赖关系数量:', this.dependencyMap.size);
        this.printGraph();
        this.printReverseGraph();
        console.groupEnd();
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.DependencyGraph = DependencyGraph;
}

// 模块导出（如果支持）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DependencyGraph;
}

console.log('✅ DependencyGraph 模块已加载');
