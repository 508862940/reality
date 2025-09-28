/**
 * 时间系统管理器
 * 类似DoL的24小时时间管理系统
 * 支持时间推进、格式化显示、时间段检测
 */

class TimeSystem {
    constructor() {
        // 核心时间：总分钟数（180天年历系统）
        this.totalMinutes = 450;  // 游戏开始：第1年春季3月8日 07:30

        // 年历配置
        this.MINUTES_PER_YEAR = 180 * 24 * 60;  // 180天 = 259200分钟
        this.DAYS_PER_YEAR = 180;
        this.DAYS_PER_SEASON = 45;
        this.DAYS_PER_MONTH = 15;

        // 计算当前时间（保持兼容性）
        this.currentTime = this.calculateTimeFromMinutes(this.totalMinutes);

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
     * 从总分钟数计算完整时间信息
     * @param {number} totalMinutes - 总分钟数
     * @returns {Object} 完整的时间对象
     */
    calculateTimeFromMinutes(totalMinutes) {
        // 基础时间计算
        const year = Math.floor(totalMinutes / this.MINUTES_PER_YEAR) + 1;
        const minutesInYear = totalMinutes % this.MINUTES_PER_YEAR;
        const dayOfYear = Math.floor(minutesInYear / (24 * 60)) + 1;
        const minutesInDay = minutesInYear % (24 * 60);
        const hour = Math.floor(minutesInDay / 60);
        const minute = minutesInDay % 60;

        // 计算月份和季节
        let month, season, dayOfMonth;

        if (dayOfYear <= 45) {
            // 春季：3、4、5月
            season = 'spring';
            const springDay = dayOfYear;
            month = Math.ceil(springDay / 15) + 2;  // 3、4、5
            dayOfMonth = ((springDay - 1) % 15) + 1;
        } else if (dayOfYear <= 90) {
            // 夏季：6、7、8月
            season = 'summer';
            const summerDay = dayOfYear - 45;
            month = Math.ceil(summerDay / 15) + 5;  // 6、7、8
            dayOfMonth = ((summerDay - 1) % 15) + 1;
        } else if (dayOfYear <= 135) {
            // 秋季：9、10、11月
            season = 'autumn';
            const autumnDay = dayOfYear - 90;
            month = Math.ceil(autumnDay / 15) + 8;  // 9、10、11
            dayOfMonth = ((autumnDay - 1) % 15) + 1;
        } else {
            // 冬季：12、1、2月
            season = 'winter';
            const winterDay = dayOfYear - 135;
            if (winterDay <= 15) {
                month = 12;
                dayOfMonth = winterDay;
            } else if (winterDay <= 30) {
                month = 1;
                dayOfMonth = winterDay - 15;
            } else {
                month = 2;
                dayOfMonth = winterDay - 30;
            }
        }

        // 计算星期几（一周5天系统）
        const totalDays = Math.floor(totalMinutes / (24 * 60));
        const weekday = (totalDays % 5) + 1;  // 1-5：周一到周五

        // 为了兼容性，同时保留day字段（总天数）
        const day = totalDays + 1;

        return {
            // 核心数据
            totalMinutes: totalMinutes,

            // 新的年历数据
            year: year,
            month: month,
            dayOfMonth: dayOfMonth,
            dayOfYear: dayOfYear,
            season: season,

            // 兼容旧系统
            day: day,  // 保留总天数
            hour: hour,
            minute: minute,
            weekday: weekday
        };
    }

    /**
     * 推进时间
     * @param {number} minutes - 要推进的分钟数
     * @returns {Object} 时间变化信息
     */
    advanceTime(minutes) {
        if (minutes <= 0) return null;

        const oldTime = { ...this.currentTime };
        const oldSeason = this.currentTime.season;
        const oldMonth = this.currentTime.month;

        // 核心：推进总分钟数
        this.totalMinutes += minutes;

        // 重新计算所有时间信息
        this.currentTime = this.calculateTimeFromMinutes(this.totalMinutes);

        // 检查是否经过了早上5点（游戏内自动存档时间）
        const crossedSaveTime = this.checkCrossedSaveTime(oldTime, this.currentTime);

        const timeChange = {
            oldTime,
            newTime: { ...this.currentTime },
            minutesAdvanced: minutes,
            dayChanged: oldTime.day !== this.currentTime.day,
            monthChanged: oldMonth !== this.currentTime.month,
            seasonChanged: oldSeason !== this.currentTime.season,
            yearChanged: oldTime.year !== this.currentTime.year,
            periodChanged: this.getTimePeriod(oldTime) !== this.getTimePeriod(),
            crossedSaveTime: crossedSaveTime
        };

        // 通知所有监听器
        this.notifyTimeListeners(timeChange);

        // 如果经过了早上5点，触发游戏内自动存档
        if (crossedSaveTime && window.saveSystem) {
            console.log('🌅 游戏时间到达早上5点，触发自动存档');
            window.saveSystem.triggerAutoSave('daily_5am');

            // 显示游戏内提醒
            if (window.showNotification) {
                window.showNotification('☀️ 新的一天开始了，游戏已自动保存', 'info');
            }
        }

        if (this.debugMode) {
            console.log(`⏰ 时间推进 ${minutes}分钟:`, this.formatTime());
            if (timeChange.dayChanged) console.log('📅 新的一天！');
            if (timeChange.periodChanged) console.log('🌅 时间段变化:', this.getTimePeriod());
            if (crossedSaveTime) console.log('💾 经过早上5点，已触发自动存档');
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
     * @param {string} format - 格式类型：'short'|'long'|'detail'|'icon'|'date'|'full'
     * @returns {string} 格式化的时间字符串
     */
    formatTime(format = 'short') {
        const weekdays = ['', '周一', '周二', '周三', '周四', '周五'];  // 一周5天
        const seasonNames = {
            'spring': '春',
            'summer': '夏',
            'autumn': '秋',
            'winter': '冬'
        };
        const seasonIcons = {
            'spring': '🌸',
            'summer': '☀️',
            'autumn': '🍂',
            'winter': '❄️'
        };

        const hourStr = String(this.currentTime.hour).padStart(2, '0');
        const minuteStr = String(this.currentTime.minute).padStart(2, '0');

        switch (format) {
            case 'short':
                // 简短格式：周一 08:30（兼容旧版）
                return `${weekdays[this.currentTime.weekday]} ${hourStr}:${minuteStr}`;

            case 'date':
                // 日期格式：3月8日 07:30
                return `${this.currentTime.month}月${this.currentTime.dayOfMonth}日 ${hourStr}:${minuteStr}`;

            case 'long':
                // 长格式：第1年 春季 3月8日 周一 08:30
                return `第${this.currentTime.year}年 ${seasonNames[this.currentTime.season]}季 ${this.currentTime.month}月${this.currentTime.dayOfMonth}日 ${weekdays[this.currentTime.weekday]} ${hourStr}:${minuteStr}`;

            case 'detail':
                // 详细格式：Y1 春 3月8日 周一 早晨 08:30
                const period = this.getPeriodName();
                return `Y${this.currentTime.year} ${seasonNames[this.currentTime.season]} ${this.currentTime.month}月${this.currentTime.dayOfMonth}日 ${weekdays[this.currentTime.weekday]} ${period} ${hourStr}:${minuteStr}`;

            case 'icon':
                // 带图标格式：🌸 3月8日 🌅 07:30
                return `${seasonIcons[this.currentTime.season]} ${this.currentTime.month}月${this.currentTime.dayOfMonth}日 ${this.getTimeIcon()} ${hourStr}:${minuteStr}`;

            case 'full':
                // 完整格式：包含所有信息
                return `第${this.currentTime.year}年 ${this.currentTime.dayOfYear}/180天 ${seasonNames[this.currentTime.season]}季 ${this.currentTime.month}月${this.currentTime.dayOfMonth}日 ${weekdays[this.currentTime.weekday]} ${hourStr}:${minuteStr}`;

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
     * @param {Object} timeObj - 时间对象，支持多种格式
     */
    setTime(timeObj) {
        const oldTime = { ...this.currentTime };

        // 如果提供了totalMinutes，直接使用
        if (timeObj.totalMinutes !== undefined) {
            this.totalMinutes = timeObj.totalMinutes;
            this.currentTime = this.calculateTimeFromMinutes(this.totalMinutes);
        }
        // 如果提供了年月日时分，计算totalMinutes
        else if (timeObj.year !== undefined || timeObj.month !== undefined || timeObj.dayOfMonth !== undefined) {
            // 使用提供的值或当前值
            const year = timeObj.year || this.currentTime.year;
            const month = timeObj.month || this.currentTime.month;
            const dayOfMonth = timeObj.dayOfMonth || this.currentTime.dayOfMonth;
            const hour = timeObj.hour !== undefined ? timeObj.hour : this.currentTime.hour;
            const minute = timeObj.minute !== undefined ? timeObj.minute : this.currentTime.minute;

            // 计算年内第几天
            let dayOfYear;
            if (month >= 3 && month <= 5) {
                // 春季
                dayOfYear = (month - 3) * 15 + dayOfMonth;
            } else if (month >= 6 && month <= 8) {
                // 夏季
                dayOfYear = 45 + (month - 6) * 15 + dayOfMonth;
            } else if (month >= 9 && month <= 11) {
                // 秋季
                dayOfYear = 90 + (month - 9) * 15 + dayOfMonth;
            } else if (month === 12) {
                // 冬季-12月
                dayOfYear = 135 + dayOfMonth;
            } else {
                // 冬季-1、2月
                dayOfYear = 150 + (month - 1) * 15 + dayOfMonth;
            }

            // 计算总分钟数
            this.totalMinutes = (year - 1) * this.MINUTES_PER_YEAR + (dayOfYear - 1) * 24 * 60 + hour * 60 + minute;
            this.currentTime = this.calculateTimeFromMinutes(this.totalMinutes);
        }
        // 兼容旧格式（只有day, hour, minute）
        else {
            const day = timeObj.day !== undefined ? timeObj.day : this.currentTime.day;
            const hour = timeObj.hour !== undefined ? timeObj.hour : this.currentTime.hour;
            const minute = timeObj.minute !== undefined ? timeObj.minute : this.currentTime.minute;

            // 从旧格式计算总分钟数
            this.totalMinutes = (day - 1) * 24 * 60 + hour * 60 + minute;
            this.currentTime = this.calculateTimeFromMinutes(this.totalMinutes);
        }

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

        // 修正星期（一周5天）
        if (this.currentTime.weekday < 1) this.currentTime.weekday = 1;
        if (this.currentTime.weekday > 5) this.currentTime.weekday = 5;

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
     * 检查是否经过了早上5点（游戏内自动存档时间点）
     * @param {Object} oldTime - 旧时间
     * @param {Object} newTime - 新时间
     * @returns {boolean} 是否经过了5点
     */
    checkCrossedSaveTime(oldTime, newTime) {
        // 自动存档时间点：每天早上5点
        const SAVE_HOUR = 5;
        const SAVE_MINUTE = 0;

        // 如果是同一天
        if (oldTime.day === newTime.day) {
            // 检查是否从5点前跨越到5点后
            const oldMinutes = oldTime.hour * 60 + oldTime.minute;
            const newMinutes = newTime.hour * 60 + newTime.minute;
            const saveMinutes = SAVE_HOUR * 60 + SAVE_MINUTE;

            return oldMinutes < saveMinutes && newMinutes >= saveMinutes;
        }
        // 如果跨天了
        else if (newTime.day > oldTime.day) {
            // 新的一天已经过了5点
            if (newTime.hour >= SAVE_HOUR) {
                return true;
            }
            // 或者旧时间还没到5点（说明跨过了5点）
            if (oldTime.hour < SAVE_HOUR) {
                return true;
            }
        }

        return false;
    }

    /**
     * 获取序列化的时间数据（用于存档）
     * @returns {Object} 可序列化的时间数据
     */
    serialize() {
        return {
            totalMinutes: this.totalMinutes,
            currentTime: { ...this.currentTime },
            version: '2.0'  // 升级版本号
        };
    }

    /**
     * 从序列化数据加载时间（用于读档）
     * @param {Object} data - 序列化的时间数据
     */
    deserialize(data) {
        if (!data) return;

        // 检查版本，处理兼容性
        if (data.version === '2.0' && data.totalMinutes !== undefined) {
            // 新版本存档
            this.totalMinutes = data.totalMinutes;
            this.currentTime = this.calculateTimeFromMinutes(this.totalMinutes);
        } else if (data.currentTime) {
            // 旧版本存档（1.0或无版本号）
            const oldTime = data.currentTime;
            // 从旧格式转换：使用day字段计算totalMinutes
            const day = oldTime.day || 1;
            const hour = oldTime.hour || 0;
            const minute = oldTime.minute || 0;

            this.totalMinutes = (day - 1) * 24 * 60 + hour * 60 + minute;
            this.currentTime = this.calculateTimeFromMinutes(this.totalMinutes);

            console.log('📦 从旧版存档升级时间系统');
        }

        if (this.debugMode) {
            console.log('⏰ 时间系统从存档加载:', this.formatTime('detail'));
        }
    }

    /**
     * 兼容worldState的save/load方法
     */
    save() {
        return this.serialize();
    }

    load(data) {
        this.deserialize(data);
    }

    /**
     * 获取季节信息
     */
    getSeason() {
        return this.currentTime.season;
    }

    /**
     * 获取季节图标
     */
    getSeasonIcon() {
        const icons = {
            'spring': '🌸',
            'summer': '☀️',
            'autumn': '🍂',
            'winter': '❄️'
        };
        return icons[this.currentTime.season] || '🌍';
    }

    /**
     * 获取季节中文名
     */
    getSeasonName() {
        const names = {
            'spring': '春季',
            'summer': '夏季',
            'autumn': '秋季',
            'winter': '冬季'
        };
        return names[this.currentTime.season] || '未知';
    }

    /**
     * 检查是否是休息日
     * @returns {boolean} 周三或周五为休息日
     */
    isRestDay() {
        return this.currentTime.weekday === 3 || this.currentTime.weekday === 5;
    }

    /**
     * 获取星期名称（包含休息日标记）
     */
    getWeekdayName() {
        const weekdays = ['', '周一', '周二', '周三', '周四', '周五'];
        let name = weekdays[this.currentTime.weekday];
        if (this.isRestDay()) {
            name += '(休)';
        }
        return name;
    }

    /**
     * 检查是否是特定节日
     */
    isHoliday() {
        const month = this.currentTime.month;
        const day = this.currentTime.dayOfMonth;

        // 定义节日
        if (month === 1 && day === 1) return '新年';
        if (month === 2 && day === 14) return '情人节';
        if (month === 4 && day <= 7) return '樱花节';
        if (month === 8 && day >= 10 && day <= 12) return '夏日祭';
        if (month === 10 && day === 15) return '万圣节';
        if (month === 12 && day === 15) return '圣诞节';

        return null;
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