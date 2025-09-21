/**
 * 时间系统管理器
 * 类似DoL的24小时时间管理系统
 * 支持时间推进、格式化显示、时间段检测
 */

class TimeSystem {
    constructor() {
        // 游戏开始时间：第1天 07:30（和opening场景对应）
        this.currentTime = {
            day: 1,           // 第几天（从1开始）
            hour: 7,          // 小时 (0-23)
            minute: 30,       // 分钟 (0-59)
            weekday: 1        // 星期几 (1=周一, 7=周日)
        };

        // 时间流逝监听器
        this.timeListeners = [];

        // 调试模式
        this.debugMode = false;

        this.init();
    }

    init() {
        if (this.debugMode) {
            console.log('⏰ TimeSystem 初始化完成');
            console.log('📅 当前时间:', this.formatTime());
        }
    }

    /**
     * 推进时间
     * @param {number} minutes - 要推进的分钟数
     * @returns {Object} 时间变化信息
     */
    advanceTime(minutes) {
        if (minutes <= 0) return null;

        const oldTime = { ...this.currentTime };

        // 添加分钟
        this.currentTime.minute += minutes;

        // 处理分钟溢出
        if (this.currentTime.minute >= 60) {
            const hoursToAdd = Math.floor(this.currentTime.minute / 60);
            this.currentTime.minute = this.currentTime.minute % 60;
            this.currentTime.hour += hoursToAdd;
        }

        // 处理小时溢出（新的一天）
        if (this.currentTime.hour >= 24) {
            const daysToAdd = Math.floor(this.currentTime.hour / 24);
            this.currentTime.hour = this.currentTime.hour % 24;
            this.currentTime.day += daysToAdd;

            // 更新星期几
            this.currentTime.weekday += daysToAdd;
            if (this.currentTime.weekday > 7) {
                this.currentTime.weekday = ((this.currentTime.weekday - 1) % 7) + 1;
            }
        }

        const timeChange = {
            oldTime,
            newTime: { ...this.currentTime },
            minutesAdvanced: minutes,
            dayChanged: oldTime.day !== this.currentTime.day,
            periodChanged: this.getTimePeriod(oldTime) !== this.getTimePeriod()
        };

        // 通知所有监听器
        this.notifyTimeListeners(timeChange);

        if (this.debugMode) {
            console.log(`⏰ 时间推进 ${minutes}分钟:`, this.formatTime());
            if (timeChange.dayChanged) console.log('📅 新的一天！');
            if (timeChange.periodChanged) console.log('🌅 时间段变化:', this.getTimePeriod());
        }

        return timeChange;
    }

    /**
     * 获取当前时间段
     * @param {Object} time - 可选的时间对象，默认使用当前时间
     * @returns {string} 'morning'|'afternoon'|'evening'|'night'
     */
    getTimePeriod(time = null) {
        const hour = time ? time.hour : this.currentTime.hour;

        if (hour >= 6 && hour < 12) return 'morning';      // 06:00-11:59 早晨
        if (hour >= 12 && hour < 18) return 'afternoon';   // 12:00-17:59 下午
        if (hour >= 18 && hour < 22) return 'evening';     // 18:00-21:59 傍晚
        return 'night';                                     // 22:00-05:59 夜晚
    }

    /**
     * 获取时间段对应的图标
     * @param {Object} time - 可选的时间对象
     * @returns {string} emoji图标
     */
    getTimeIcon(time = null) {
        const period = this.getTimePeriod(time);
        const icons = {
            'morning': '🌅',    // 日出
            'afternoon': '🌞',  // 太阳
            'evening': '🌇',    // 日落
            'night': '🌙'       // 月亮
        };
        return icons[period];
    }

    /**
     * 格式化时间显示
     * @param {string} format - 格式类型：'short'|'long'|'detail'
     * @returns {string} 格式化的时间字符串
     */
    formatTime(format = 'short') {
        const weekdays = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        const hourStr = String(this.currentTime.hour).padStart(2, '0');
        const minuteStr = String(this.currentTime.minute).padStart(2, '0');

        switch (format) {
            case 'short':
                // 简短格式：周一 08:30
                return `${weekdays[this.currentTime.weekday]} ${hourStr}:${minuteStr}`;

            case 'long':
                // 长格式：第1天 周一 08:30
                return `第${this.currentTime.day}天 ${weekdays[this.currentTime.weekday]} ${hourStr}:${minuteStr}`;

            case 'detail':
                // 详细格式：Reality第1天 周一 早晨 08:30
                const period = this.getPeriodName();
                return `Reality第${this.currentTime.day}天 ${weekdays[this.currentTime.weekday]} ${period} ${hourStr}:${minuteStr}`;

            case 'icon':
                // 带图标格式：🌅 周一 08:30
                return `${this.getTimeIcon()} ${weekdays[this.currentTime.weekday]} ${hourStr}:${minuteStr}`;

            default:
                return this.formatTime('short');
        }
    }

    /**
     * 获取时间段中文名称
     * @returns {string} 中文时间段名称
     */
    getPeriodName() {
        const period = this.getTimePeriod();
        const names = {
            'morning': '早晨',
            'afternoon': '下午',
            'evening': '傍晚',
            'night': '夜晚'
        };
        return names[period];
    }

    /**
     * 获取当前时间信息
     * @returns {Object} 完整的时间信息对象
     */
    getCurrentTimeInfo() {
        return {
            ...this.currentTime,
            period: this.getTimePeriod(),
            periodName: this.getPeriodName(),
            icon: this.getTimeIcon(),
            formatted: {
                short: this.formatTime('short'),
                long: this.formatTime('long'),
                detail: this.formatTime('detail'),
                icon: this.formatTime('icon')
            }
        };
    }

    /**
     * 设置时间（用于调试或特殊场景）
     * @param {Object} timeObj - 时间对象 {day, hour, minute, weekday}
     */
    setTime(timeObj) {
        const oldTime = { ...this.currentTime };

        if (timeObj.day !== undefined) this.currentTime.day = timeObj.day;
        if (timeObj.hour !== undefined) this.currentTime.hour = timeObj.hour;
        if (timeObj.minute !== undefined) this.currentTime.minute = timeObj.minute;
        if (timeObj.weekday !== undefined) this.currentTime.weekday = timeObj.weekday;

        // 验证时间有效性
        this.validateTime();

        if (this.debugMode) {
            console.log('⏰ 时间设置:', this.formatTime('detail'));
        }

        // 通知时间变化
        this.notifyTimeListeners({
            oldTime,
            newTime: { ...this.currentTime },
            timeSet: true
        });
    }

    /**
     * 验证并修正时间
     */
    validateTime() {
        // 修正分钟
        if (this.currentTime.minute < 0) this.currentTime.minute = 0;
        if (this.currentTime.minute >= 60) this.currentTime.minute = 59;

        // 修正小时
        if (this.currentTime.hour < 0) this.currentTime.hour = 0;
        if (this.currentTime.hour >= 24) this.currentTime.hour = 23;

        // 修正星期
        if (this.currentTime.weekday < 1) this.currentTime.weekday = 1;
        if (this.currentTime.weekday > 7) this.currentTime.weekday = 7;

        // 修正天数
        if (this.currentTime.day < 1) this.currentTime.day = 1;
    }

    /**
     * 添加时间变化监听器
     * @param {Function} callback - 回调函数
     */
    addTimeListener(callback) {
        this.timeListeners.push(callback);
    }

    /**
     * 移除时间变化监听器
     * @param {Function} callback - 要移除的回调函数
     */
    removeTimeListener(callback) {
        const index = this.timeListeners.indexOf(callback);
        if (index > -1) {
            this.timeListeners.splice(index, 1);
        }
    }

    /**
     * 通知所有时间监听器
     * @param {Object} timeChange - 时间变化信息
     */
    notifyTimeListeners(timeChange) {
        this.timeListeners.forEach(callback => {
            try {
                callback(timeChange);
            } catch (error) {
                console.error('⏰ 时间监听器错误:', error);
            }
        });
    }

    /**
     * 获取序列化的时间数据（用于存档）
     * @returns {Object} 可序列化的时间数据
     */
    serialize() {
        return {
            currentTime: { ...this.currentTime },
            version: '1.0'
        };
    }

    /**
     * 从序列化数据加载时间（用于读档）
     * @param {Object} data - 序列化的时间数据
     */
    deserialize(data) {
        if (data && data.currentTime) {
            this.currentTime = { ...data.currentTime };
            this.validateTime();

            if (this.debugMode) {
                console.log('⏰ 时间系统从存档加载:', this.formatTime('detail'));
            }
        }
    }

    /**
     * 开启/关闭调试模式
     * @param {boolean} enabled - 是否开启调试
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        if (enabled) {
            console.log('⏰ TimeSystem 调试模式开启');
            console.log('📅 当前时间:', this.formatTime('detail'));
        }
    }
}

// 创建全局时间系统实例
window.timeSystem = new TimeSystem();

// 导出（如果需要模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimeSystem;
}