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
                // 简短格式：3月8日 07:30（移动端友好）
                return `${this.currentTime.month}月${this.currentTime.dayOfMonth}日 ${hourStr}:${minuteStr}`;

            case 'mobile':
                // 超简短格式：3/8 07:30（移动端超窄）
                return `${this.currentTime.month}/${this.currentTime.dayOfMonth} ${hourStr}:${minuteStr}`;

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

    // ==================== 时间消耗系统 ====================

    /**
     * 推进时间（核心方法）
     * @param {number} minutes - 要推进的分钟数（必须是5的倍数）
     * @param {string} reason - 时间消耗的原因（用于日志）
     * @returns {Object} 时间变化的详情
     */
    advanceTime(minutes, reason = '') {
        // 验证输入（必须是5的倍数）
        if (minutes % 5 !== 0 && minutes !== 0) {
            console.warn(`⚠️ 时间推进必须是5的倍数，自动调整 ${minutes} → ${Math.ceil(minutes/5)*5}`);
            minutes = Math.ceil(minutes/5) * 5;
        }

        const oldTime = { ...this.currentTime };
        const oldSeason = this.getSeason();
        const oldTimeOfDay = this.getCurrentTimeOfDay();

        // 推进总分钟数
        this.totalMinutes += minutes;

        // 重新计算当前时间
        this.currentTime = this.calculateTimeFromMinutes(this.totalMinutes);

        // 检查是否跨天和时段变化
        const dayChanged = oldTime.dayOfYear !== this.currentTime.dayOfYear;
        const seasonChanged = oldSeason !== this.getSeason();
        const newTimeOfDay = this.getCurrentTimeOfDay();
        const timeOfDayChanged = oldTimeOfDay !== newTimeOfDay;

        // 记录时间流逝
        const change = {
            minutes: minutes,
            reason: reason,
            oldTime: oldTime,
            newTime: { ...this.currentTime },
            dayChanged: dayChanged,
            seasonChanged: seasonChanged,
            timeOfDayChanged: timeOfDayChanged,
            newTimeOfDay: newTimeOfDay,
            timestamp: Date.now()
        };

        // 更新音频系统的时间环境音
        if (timeOfDayChanged && window.audioSystem) {
            window.audioSystem.updateAmbient(null, newTimeOfDay, null);
            console.log(`🎵 时段变化: ${oldTimeOfDay} → ${newTimeOfDay}`);
        }

        // 触发时间变化事件
        this.onTimeAdvance(change);

        // 通过响应式系统更新UI
        if (window.reactiveSystem) {
            window.reactiveSystem.notify('gameTime.hour', this.currentTime.hour, oldTime.hour);
            // 触发响应式系统的时间监听器
            window.reactiveSystem.notify('totalMinutes', this.totalMinutes, this.totalMinutes - minutes);
            window.reactiveSystem.notify('gameTime', this.currentTime, oldTime);

            // 🌸 如果季节变化，通知天气系统
            if (seasonChanged) {
                const seasonNames = {
                    spring: '春季',
                    summer: '夏季',
                    autumn: '秋季',
                    winter: '冬季'
                };
                window.reactiveSystem.notify('gameTime.season', seasonNames[this.getSeason()], seasonNames[oldSeason]);
                console.log(`🍂 季节变化通知: ${seasonNames[oldSeason]} → ${seasonNames[this.getSeason()]}`);
            }
        }

        // 同步到gameState
        if (window.gameState && window.gameState.gameTime) {
            Object.assign(window.gameState.gameTime, this.currentTime);
        }

        // 同步到worldState
        if (window.worldState && window.worldState.state.time) {
            window.worldState.state.time.totalMinutes = this.totalMinutes;
            Object.assign(window.worldState.state.time, this.currentTime);
        }

        // 更新UI显示
        if (window.updateLocationTime) {
            window.updateLocationTime();
        }

        console.log(`⏰ 时间推进: +${minutes}分钟 ${reason ? `(${reason})` : ''}`);

        return change;
    }

    /**
     * 时间推进后的回调
     * @param {Object} change - 时间变化详情
     */
    onTimeAdvance(change) {
        // 触发小时更新（天气系统）
        if (change.oldTime.hour !== change.newTime.hour) {
            if (window.weatherSystem && typeof window.weatherSystem.hourlyUpdate === 'function') {
                window.weatherSystem.hourlyUpdate(change.newTime.hour);
            }
        }

        // 如果跨天，触发每日事件
        if (change.dayChanged) {
            console.log(`📅 新的一天: 第${change.newTime.dayOfYear}天`);

            // 触发每日重置
            if (window.dailyReset) {
                window.dailyReset();
            }

            // 触发天气系统每日更新
            if (window.weatherSystem && typeof window.weatherSystem.dailyUpdate === 'function') {
                window.weatherSystem.dailyUpdate();
            }

            // 触发气候系统每日更新（已在weatherSystem.dailyUpdate中调用）
            // 但为了确保独立性，也可以直接调用
            if (window.climateManager && typeof window.climateManager.dailyUpdate === 'function') {
                // climateManager.dailyUpdate 会在 weatherSystem.dailyUpdate 中被调用
                // 这里注释掉避免重复调用
                // window.climateManager.dailyUpdate();
            }
        }

        // 🌤️ Stage 3: 每天早上5:00生成天气预报 + 自动存档
        if (change.newTime.hour === 5 && change.newTime.minute === 0) {
            console.log('🌅 早晨 5:00 例行事务');

            // 生成天气预报（真随机）
            if (window.weatherSystem && typeof window.weatherSystem.generateForecast === 'function') {
                console.log('🌤️ 生成今日天气预报');
                window.weatherSystem.generateForecast();
            }

            // 自动存档
            if (window.saveSystem && window.saveSystem.autoSave) {
                console.log('💾 早晨自动存档');
                window.saveSystem.autoSave('daily_morning');
            }
        }

        // 如果换季，更新天气
        if (change.seasonChanged) {
            console.log(`🍃 季节变换: ${change.newTime.season}`);
            if (window.weatherSystem && window.weatherSystem.onSeasonChange) {
                window.weatherSystem.onSeasonChange(change.newTime.season);
            }
        }

        // 显示时间流逝提示
        if (change.minutes >= 30) {
            // 30分钟以上才显示提示
            const hours = Math.floor(change.minutes / 60);
            const mins = change.minutes % 60;
            let timeStr = '';

            if (hours > 0) {
                timeStr = `${hours}小时`;
                if (mins > 0) timeStr += `${mins}分钟`;
            } else {
                timeStr = `${mins}分钟`;
            }

            // 使用特殊的时间通知类型
            if (window.showNotification) {
                window.showNotification(`⏳ ${timeStr}过去了...`, 'time', 2500);
            }

            // 大于2小时时显示时间流逝特效
            if (change.minutes >= 120) {
                this.showTimePassageEffect();
            }
        } else if (change.minutes >= 15) {
            // 15-30分钟显示简短提示
            if (window.showNotification) {
                window.showNotification(`⏱️ 片刻过去了...`, 'time', 1500);
            }
        }
    }

    /**
     * 显示时间流逝特效
     */
    showTimePassageEffect() {
        // 创建特效层
        let effectLayer = document.querySelector('.time-passage-effect');
        if (!effectLayer) {
            effectLayer = document.createElement('div');
            effectLayer.className = 'time-passage-effect';
            document.body.appendChild(effectLayer);
        }

        // 重新触发动画
        effectLayer.style.animation = 'none';
        setTimeout(() => {
            effectLayer.style.animation = 'timePassage 2s ease-out';
        }, 10);

        // 动画结束后移除元素
        setTimeout(() => {
            effectLayer.remove();
        }, 2000);
    }

    /**
     * 执行动作并消耗时间
     * @param {string} actionType - 动作类型
     * @param {string} actionName - 具体动作名称
     * @returns {number} 消耗的分钟数
     */
    performAction(actionType, actionName = '') {
        const timeConsumption = this.getActionTime(actionType, actionName);

        if (timeConsumption > 0) {
            this.advanceTime(timeConsumption, actionName || actionType);
        }

        return timeConsumption;
    }

    /**
     * 时间等级定义（全局可用）
     */
    static TIME_LEVEL = {
        INSTANT: 'instant',      // 瞬时 - 0分钟
        QUICK: 'quick',          // 快速 - 5分钟
        SHORT: 'short',          // 短暂 - 15分钟
        MEDIUM: 'medium',        // 中等 - 30分钟
        LONG: 'long',            // 较长 - 1小时
        VERY_LONG: 'very_long',  // 很长 - 2小时
        HALF_DAY: 'half_day',    // 半天 - 6小时（上午或下午）
        FULL_DAY: 'full_day',    // 全天 - 12小时（工作日）
        ENTIRE_DAY: 'entire_day' // 整天 - 24小时（睡眠等）
    };

    /**
     * 时间等级对应的分钟数
     */
    static TIME_VALUES = {
        instant: 0,
        quick: 5,
        short: 15,
        medium: 30,
        long: 60,
        very_long: 120,
        half_day: 360,   // 6小时
        full_day: 720,   // 12小时
        entire_day: 1440 // 24小时
    };

    /**
     * 获取当前时段（用于环境音）
     * @returns {string} 时段标识
     */
    getCurrentTimeOfDay() {
        const hour = this.currentTime.hour;
        if (hour >= 5 && hour < 7) return 'earlyMorning';    // 清晨
        if (hour >= 7 && hour < 12) return 'morning';        // 上午
        if (hour >= 12 && hour < 17) return 'afternoon';     // 下午
        if (hour >= 17 && hour < 19) return 'evening';       // 傍晚
        if (hour >= 19 && hour < 22) return 'night';         // 夜晚
        return 'lateNight';                                  // 深夜
    }

    /**
     * 根据时间等级获取分钟数
     * @param {string} level - 时间等级
     * @returns {number} 分钟数
     */
    getTimeByLevel(level) {
        return TimeSystem.TIME_VALUES[level] || 0;
    }

    /**
     * 获取动作消耗的时间（兼容旧版）
     * @param {string} actionType - 动作类型
     * @param {string} specificAction - 具体动作
     * @returns {number} 分钟数
     */
    getActionTime(actionType, specificAction = '') {
        // 如果actionType是时间等级，直接返回对应分钟数
        if (TimeSystem.TIME_VALUES[actionType] !== undefined) {
            return TimeSystem.TIME_VALUES[actionType];
        }

        // 动作时间消耗配置表（保留兼容性）
        const TIME_COSTS = {
            // 瞬间动作（0分钟）
            instant: {
                'open_menu': 0,
                'open_inventory': 0,
                'open_map': 0,
                'pickup_item': 0,
                'toggle_light': 0,
                'open_door': 0
            },

            // 微小互动（5分钟）
            minor: {
                'wash_face': 5,
                'brush_teeth': 5,
                'observe': 5,
                'change_clothes': 5,
                'quick_chat': 5,
                'drink_water': 5,
                'eat_snack': 5,
                'read_message': 5,
                'check_phone': 5
            },

            // 标准行为（15分钟）
            standard: {
                'organize_inventory': 15,  // 整理背包！
                'take_shower': 15,
                'prepare_meal': 15,
                'walk_nearby': 15,
                'normal_conversation': 15,
                'quick_shopping': 15,
                'water_plants': 15
            },

            // 主要事件（30分钟+）
            major: {
                'cross_district': 30,      // 跨区移动
                'work_1h': 60,
                'work_2h': 120,
                'work_4h': 240,
                'date_coffee': 60,
                'date_movie': 120,
                'study': 60,
                'exercise': 60,
                'main_quest': 120,
                'sleep_short': 360,        // 6小时
                'sleep_normal': 480,       // 8小时
                'sleep_long': 600          // 10小时
            },

            // 战斗（根据回合数）
            combat: {
                'per_round': 5             // 每回合5分钟
            },

            // 等待/休息
            wait: {
                'rest_5min': 5,
                'rest_15min': 15,
                'rest_30min': 30,
                'rest_1h': 60
            }
        };

        // 查找对应的时间消耗
        if (TIME_COSTS[actionType]) {
            if (specificAction && TIME_COSTS[actionType][specificAction] !== undefined) {
                return TIME_COSTS[actionType][specificAction];
            }
            // 如果没有具体动作，返回该类别的默认值
            const values = Object.values(TIME_COSTS[actionType]);
            return values.length > 0 ? values[0] : 0;
        }

        console.warn(`⚠️ 未知的动作类型: ${actionType}`);
        return 0;
    }

    /**
     * 简化的时间消耗接口（推荐使用）
     * @param {string} level - 时间等级 (如 'quick', 'short', 'medium'等)
     * @param {string} description - 动作描述（可选）
     * @returns {number} 消耗的分钟数
     */
    consumeTime(level, description = '') {
        const minutes = this.getTimeByLevel(level);

        if (minutes > 0) {
            // 根据等级生成默认描述
            if (!description) {
                const levelDescriptions = {
                    quick: '快速动作',
                    short: '短暂活动',
                    medium: '一般活动',
                    long: '较长活动',
                    very_long: '长时间活动',
                    half_day: '半天活动',
                    full_day: '全天活动',
                    entire_day: '整天活动'
                };
                description = levelDescriptions[level] || '进行活动';
            }

            this.advanceTime(minutes, description);
        }

        return minutes;
    }

    /**
     * 快速等待/休息
     * @param {number} minutes - 等待的分钟数
     */
    wait(minutes) {
        if (minutes <= 0) return;

        // 确保是5的倍数
        minutes = Math.ceil(minutes / 5) * 5;

        this.advanceTime(minutes, `休息${minutes}分钟`);

        // 恢复少量精力（通过响应式系统）
        if (window.reactiveGameState) {
            const energyRestore = Math.floor(minutes / 15) * 5; // 每15分钟恢复5点精力
            window.reactiveGameState.energy = Math.min(100,
                (window.reactiveGameState.energy || 80) + energyRestore
            );
        } else if (window.gameState && window.gameState.character) {
            // 降级到直接修改
            const energyRestore = Math.floor(minutes / 15) * 5;
            window.gameState.character.energy = Math.min(100,
                (window.gameState.character.energy || 80) + energyRestore
            );
            if (window.updateGameUI) {
                window.updateGameUI();
            }
        }
    }

    /**
     * 睡觉（大幅推进时间）
     * @param {number} hours - 睡眠小时数（默认8小时）
     * @returns {boolean} 是否成功入睡
     */
    sleep(hours = 8) {
        const currentHour = this.currentTime.hour;

        // 检查是否适合睡觉（晚上9点到早上6点）
        const canSleep = (currentHour >= 21 || currentHour <= 6);

        if (!canSleep && !confirm('现在不是睡觉时间，确定要睡觉吗？')) {
            return false;
        }

        const minutes = hours * 60;
        this.advanceTime(minutes, `睡眠${hours}小时`);

        // 睡醒后恢复状态（通过响应式系统）
        if (window.reactiveGameState) {
            window.reactiveGameState.energy = 100;
            window.reactiveGameState.health = Math.min(100,
                (window.reactiveGameState.health || 100) + 20
            );
        } else if (window.gameState && window.gameState.character) {
            // 降级到直接修改
            window.gameState.character.energy = 100;
            window.gameState.character.health = Math.min(100,
                (window.gameState.character.health || 100) + 20
            );
            if (window.updateGameUI) {
                window.updateGameUI();
            }
        }

        if (window.showNotification) {
            window.showNotification('☀️ 你醒来了，感觉精力充沛！', 'success');
        }

        return true;
    }
}

// 创建全局时间系统实例
window.timeSystem = new TimeSystem();

// 测试时间消耗系统
window.testTime = {
    // 测试各种时间消耗
    testActions: () => {
        console.log('🧪 测试时间消耗系统...');
        console.log('当前时间:', window.timeSystem.formatTime('detail'));

        // 测试洗脸（5分钟）
        console.log('\n1. 洗脸...');
        window.timeSystem.performAction('minor', 'wash_face');

        // 测试整理背包（15分钟）
        setTimeout(() => {
            console.log('\n2. 整理背包...');
            window.timeSystem.performAction('standard', 'organize_inventory');
        }, 2000);

        // 测试跨区移动（30分钟）
        setTimeout(() => {
            console.log('\n3. 跨区移动...');
            window.timeSystem.performAction('major', 'cross_district');
        }, 4000);

        // 测试工作2小时（120分钟）
        setTimeout(() => {
            console.log('\n4. 工作2小时...');
            window.timeSystem.performAction('major', 'work_2h');
        }, 6000);
    },

    // 快速推进时间
    advance: (minutes) => {
        window.timeSystem.advanceTime(minutes, '测试推进');
    },

    // 测试休息
    rest: (minutes = 30) => {
        window.timeSystem.wait(minutes);
    },

    // 测试睡觉
    sleep: (hours = 8) => {
        window.timeSystem.sleep(hours);
    },

    // 显示当前时间
    now: () => {
        console.log('📅 当前时间:', window.timeSystem.formatTime('detail'));
        console.log('⏰ 总分钟数:', window.timeSystem.totalMinutes);
        return window.timeSystem.currentTime;
    }
};

// 导出时间等级常量到全局
window.TIME_LEVEL = TimeSystem.TIME_LEVEL;
window.TIME_VALUES = TimeSystem.TIME_VALUES;

console.log('⏰ 时间消耗系统已加载！');
console.log('');
console.log('📋 时间等级系统（基于24小时制）：');
console.log('  instant    - 瞬时 (0分钟)    - UI操作、查看信息');
console.log('  quick      - 快速 (5分钟)    - 简单互动、捡东西');
console.log('  short      - 短暂 (15分钟)   - 日常小事、整理背包');
console.log('  medium     - 中等 (30分钟)   - 跨区移动、认真对话');
console.log('  long       - 较长 (1小时)    - 上课、训练、约会');
console.log('  very_long  - 很长 (2小时)    - 看电影、大型战斗');
console.log('  half_day   - 半天 (6小时)    - 上午/下午工作');
console.log('  full_day   - 全天 (12小时)   - 全天工作班');
console.log('  entire_day - 整天 (24小时)   - 睡眠、昏迷');
console.log('');
console.log('🎮 测试命令：');
console.log('  testTime.testActions() - 测试各种动作的时间消耗');
console.log('  testTime.advance(60)   - 推进60分钟');
console.log('  testTime.rest(30)      - 休息30分钟');
console.log('  testTime.sleep(8)      - 睡8小时');
console.log('  testTime.now()         - 显示当前时间');
console.log('');
console.log('✨ 场景中使用示例：');
console.log('  choice: { text: "去操场", timeLevel: "medium" }');
console.log('  choice: { text: "睡觉", timeLevel: "full_day" }');

// 导出（如果需要模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimeSystem;
}