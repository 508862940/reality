/**
 * 三层音频系统：BGM + 环境音 + 音效
 * 支持智能混音、动态环境音、道具音效
 */

class AudioSystem {
    constructor() {
        // 三层播放器
        this.bgmPlayer = new Audio();
        this.bgmPlayer.loop = true;

        // 环境音三层（可同时播放）
        this.ambientLayers = {
            weather: new Audio(),    // 天气层
            time: new Audio(),       // 时间层
            location: new Audio()    // 地点层
        };

        // 设置环境音循环
        Object.values(this.ambientLayers).forEach(layer => {
            layer.loop = true;
        });

        // 音效池（支持多个同时播放）
        this.sfxPool = [];
        this.maxSfxInstances = 5;

        // 初始化音效池
        for(let i = 0; i < this.maxSfxInstances; i++) {
            this.sfxPool.push(new Audio());
        }

        // 音量设置（从worldState读取或使用默认值）
        this.volumes = {
            master: 0.8,
            bgm: 0.6,
            ambient: 0.5,
            ambientWeather: 0.5,
            ambientTime: 0.4,
            ambientLocation: 0.3,
            sfx: 0.8
        };

        // 状态标记
        this.enabled = {
            bgm: true,
            ambient: true,
            sfx: true
        };

        // 淡入淡出控制
        this.fadeTimers = new Map();
        this.crossfadeDuration = 2000;

        // 环境音配置表
        this.ambientConfig = {
            weather: {
                sunny: null,
                cloudy: null,
                rainy: {
                    light: 'assets/sounds/ambient/weather/rain_light.mp3',
                    medium: 'assets/sounds/ambient/weather/rain_medium.mp3',
                    heavy: 'assets/sounds/ambient/weather/rain_heavy.mp3'
                },
                snowy: 'assets/sounds/ambient/weather/snow_wind.mp3',
                stormy: 'assets/sounds/ambient/weather/storm.mp3',
                foggy: 'assets/sounds/ambient/weather/fog_horn.mp3'
            },

            timeOfDay: {
                earlyMorning: 'assets/sounds/ambient/time/birds_morning.mp3',
                morning: null,
                afternoon: null,
                evening: 'assets/sounds/ambient/time/evening_cicadas.mp3',
                night: 'assets/sounds/ambient/time/night_crickets.mp3',
                lateNight: 'assets/sounds/ambient/time/night_quiet.mp3'
            },

            location: {
                indoor: {
                    bedroom: 'assets/sounds/ambient/location/indoor_quiet.mp3',
                    cafeteria: 'assets/sounds/ambient/location/crowd_chatter.mp3',
                    classroom: 'assets/sounds/ambient/location/classroom.mp3',
                    bathroom: 'assets/sounds/ambient/location/bathroom_echo.mp3',
                    library: 'assets/sounds/ambient/location/library_quiet.mp3'
                },
                outdoor: {
                    street: 'assets/sounds/ambient/location/city_traffic.mp3',
                    park: 'assets/sounds/ambient/location/nature_birds.mp3',
                    forest: 'assets/sounds/ambient/location/forest_wind.mp3',
                    beach: 'assets/sounds/ambient/location/ocean_waves.mp3'
                }
            }
        };

        // 道具音效映射
        this.itemSounds = {
            // 消耗品
            'potion_health': 'assets/sounds/sfx/items/drink_potion.mp3',
            'food_apple': 'assets/sounds/sfx/items/eat_crunch.mp3',
            'food_bread': 'assets/sounds/sfx/items/eat_soft.mp3',
            'drink_water': 'assets/sounds/sfx/items/drink_water.mp3',

            // 工具
            'tool_phone': 'assets/sounds/sfx/items/phone_ring.mp3',
            'tool_phone_vibrate': 'assets/sounds/sfx/items/phone_vibrate.mp3',
            'tool_key': 'assets/sounds/sfx/items/key_jingle.mp3',
            'tool_flashlight': 'assets/sounds/sfx/items/flashlight_click.mp3',

            // 特殊道具
            'smart_speaker': 'assets/sounds/sfx/items/speaker_beep.mp3',
            'music_box': 'assets/sounds/sfx/items/music_box_open.mp3',
            'book': 'assets/sounds/sfx/items/page_flip.mp3',
            'coin': 'assets/sounds/sfx/items/coin_collect.mp3'
        };

        // 当前状态
        this.currentBGM = null;
        this.currentAmbient = {
            weather: null,
            time: null,
            location: null,
            weatherIntensity: 0.5
        };

        // BGM结束回调
        this.bgmEndCallback = null;
        this.bgmPlayer.addEventListener('ended', () => {
            if (this.bgmEndCallback) {
                this.bgmEndCallback();
            }
        });
    }

    /**
     * 播放BGM
     * @param {string} filename - 音频文件路径
     * @param {object} options - 播放选项
     */
    playBGM(filename, options = {}) {
        if (!this.enabled.bgm) return;

        const {
            volume = this.volumes.bgm,
            loop = true,
            fade = true,
            startTime = 0,
            source = 'scene',
            onEnd = null
        } = options;

        // 如果是同一首BGM且正在播放，不重复播放
        if (this.currentBGM === filename && !this.bgmPlayer.paused) {
            return;
        }

        // 设置结束回调
        this.bgmEndCallback = onEnd;

        // 淡出当前BGM，然后播放新的
        if (fade && !this.bgmPlayer.paused) {
            this.fadeOut(this.bgmPlayer, () => {
                this._startBGM(filename, volume, loop, startTime);
            });
        } else {
            this._startBGM(filename, volume, loop, startTime);
        }
    }

    /**
     * 内部方法：开始播放BGM
     */
    _startBGM(filename, volume, loop, startTime) {
        this.bgmPlayer.src = filename;
        this.bgmPlayer.volume = 0;
        this.bgmPlayer.loop = loop;
        this.bgmPlayer.currentTime = startTime;

        this.bgmPlayer.play().then(() => {
            this.fadeIn(this.bgmPlayer, volume * this.volumes.master);
            this.currentBGM = filename;
            console.log(`🎵 BGM播放: ${filename}`);
        }).catch(e => {
            console.log('BGM播放需要用户交互:', e);
            // 添加点击事件监听，用户交互后自动播放
            this._addUserInteractionHandler(filename, volume, loop, startTime);
        });
    }

    /**
     * 停止BGM
     */
    stopBGM(fade = true) {
        if (fade) {
            this.fadeOut(this.bgmPlayer, () => {
                this.currentBGM = null;
                this.bgmEndCallback = null;
            });
        } else {
            this.bgmPlayer.pause();
            this.bgmPlayer.currentTime = 0;
            this.currentBGM = null;
            this.bgmEndCallback = null;
        }
    }

    /**
     * 智能环境音更新
     * @param {string} weather - 天气类型
     * @param {string} timeOfDay - 时段
     * @param {string} location - 地点
     * @param {number} intensity - 强度(0-1)
     */
    updateAmbient(weather, timeOfDay, location, intensity = 1.0) {
        if (!this.enabled.ambient) return;

        // 更新天气音效
        if (weather !== undefined && weather !== null) {
            this._updateWeatherAmbient(weather, intensity);
        }

        // 更新时间音效
        if (timeOfDay !== undefined && timeOfDay !== null) {
            this._updateTimeAmbient(timeOfDay);
        }

        // 更新地点音效
        if (location !== undefined && location !== null) {
            this._updateLocationAmbient(location);
        }

        // 动态混音：雨天或暴风雨降低BGM音量
        if (this.enabled.bgm && this.bgmPlayer && !this.bgmPlayer.paused) {
            if (weather === 'rainy' || weather === 'stormy') {
                this.adjustBGMVolume(this.volumes.bgm * 0.6);
            } else {
                this.adjustBGMVolume(this.volumes.bgm);
            }
        }
    }

    /**
     * 播放音效
     * @param {string} filename - 音效文件路径
     * @param {number} volume - 音量(0-1)
     */
    playSFX(filename, volume = this.volumes.sfx) {
        if (!this.enabled.sfx) return;

        // 找一个空闲的音效播放器
        const player = this.sfxPool.find(p => p.paused || p.ended);

        if (player) {
            player.src = filename;
            player.volume = volume * this.volumes.master;
            player.loop = false;
            player.play().catch(e => {
                console.log('音效播放失败:', e);
            });
        }
    }

    /**
     * 播放道具音效
     * @param {string} itemId - 道具ID
     * @param {string} action - 动作类型
     */
    playItemSound(itemId, action = 'use') {
        const soundKey = `${itemId}_${action}`;
        const sound = this.itemSounds[soundKey] || this.itemSounds[itemId];

        if (sound) {
            this.playSFX(sound);
            console.log(`🔊 道具音效: ${itemId} - ${action}`);
        }
    }

    /**
     * 淡入效果
     */
    fadeIn(player, targetVolume, duration = this.crossfadeDuration) {
        if (!player) return;

        const step = targetVolume / (duration / 50);

        // 清除之前的定时器
        clearInterval(this.fadeTimers.get(player));

        const timer = setInterval(() => {
            if (player.volume < targetVolume - step) {
                player.volume = Math.min(player.volume + step, 1.0);
            } else {
                player.volume = Math.min(targetVolume, 1.0);
                clearInterval(timer);
                this.fadeTimers.delete(player);
            }
        }, 50);

        this.fadeTimers.set(player, timer);
    }

    /**
     * 淡出效果
     */
    fadeOut(player, callback, duration = this.crossfadeDuration) {
        if (!player) return;

        const step = player.volume / (duration / 50);

        // 清除之前的定时器
        clearInterval(this.fadeTimers.get(player));

        const timer = setInterval(() => {
            if (player.volume > step) {
                player.volume = Math.max(player.volume - step, 0);
            } else {
                player.volume = 0;
                player.pause();
                clearInterval(timer);
                this.fadeTimers.delete(player);
                if (callback) callback();
            }
        }, 50);

        this.fadeTimers.set(player, timer);
    }

    /**
     * 调整BGM音量
     */
    adjustBGMVolume(volume) {
        if (this.bgmPlayer && !this.bgmPlayer.paused) {
            this.fadeIn(this.bgmPlayer, volume * this.volumes.master, 500);
        }
    }

    /**
     * 设置主音量
     */
    setMasterVolume(volume) {
        this.volumes.master = Math.max(0, Math.min(1, volume));
        this._applyVolumeChanges();
    }

    /**
     * 设置分层音量
     */
    setLayerVolume(layer, volume) {
        if (this.volumes.hasOwnProperty(layer)) {
            this.volumes[layer] = Math.max(0, Math.min(1, volume));
            this._applyVolumeChanges();
        }
    }

    /**
     * 应用音量变化
     */
    _applyVolumeChanges() {
        // BGM音量
        if (this.bgmPlayer && !this.bgmPlayer.paused) {
            this.bgmPlayer.volume = this.volumes.bgm * this.volumes.master;
        }

        // 环境音音量
        const ambientMaster = this.volumes.ambient * this.volumes.master;
        this.ambientLayers.weather.volume = this.volumes.ambientWeather * ambientMaster;
        this.ambientLayers.time.volume = this.volumes.ambientTime * ambientMaster;
        this.ambientLayers.location.volume = this.volumes.ambientLocation * ambientMaster;
    }

    /**
     * 保存音频状态（用于存档）
     */
    saveState() {
        return {
            volumes: { ...this.volumes },
            enabled: { ...this.enabled },
            current: {
                bgm: {
                    file: this.currentBGM,
                    time: this.bgmPlayer.currentTime,
                    volume: this.bgmPlayer.volume
                },
                ambient: { ...this.currentAmbient }
            },
            advanced: {
                crossfadeDuration: this.crossfadeDuration
            }
        };
    }

    /**
     * 恢复音频状态（用于读档）
     */
    loadState(savedState) {
        if (!savedState) return;

        console.log('🔊 恢复音频状态:', savedState);

        // 恢复音量设置
        if (savedState.volumes) {
            this.volumes = { ...this.volumes, ...savedState.volumes };
            this._applyVolumeChanges();
        }

        // 恢复开关设置
        if (savedState.enabled) {
            this.enabled = { ...this.enabled, ...savedState.enabled };
        }

        // 恢复高级设置
        if (savedState.advanced) {
            this.crossfadeDuration = savedState.advanced.crossfadeDuration || 2000;
        }

        // 恢复BGM
        if (savedState.current?.bgm?.file && this.enabled.bgm) {
            this.playBGM(savedState.current.bgm.file, {
                startTime: savedState.current.bgm.time || 0,
                fade: false
            });
        }

        // 恢复环境音
        if (savedState.current?.ambient && this.enabled.ambient) {
            const amb = savedState.current.ambient;
            this.currentAmbient = { ...amb };
            // 延迟恢复环境音，确保其他系统已初始化
            setTimeout(() => {
                this.updateAmbient(amb.weather, amb.time, amb.location, amb.weatherIntensity);
            }, 100);
        }
    }

    // ========== 私有方法 ==========

    /**
     * 更新天气环境音
     */
    _updateWeatherAmbient(weather, intensity) {
        const layer = this.ambientLayers.weather;
        let soundFile = null;

        // 根据天气和强度选择音效
        if (weather === 'rainy') {
            if (intensity < 0.3) {
                soundFile = this.ambientConfig.weather.rainy.light;
            } else if (intensity < 0.7) {
                soundFile = this.ambientConfig.weather.rainy.medium;
            } else {
                soundFile = this.ambientConfig.weather.rainy.heavy;
            }
        } else if (typeof this.ambientConfig.weather[weather] === 'string') {
            soundFile = this.ambientConfig.weather[weather];
        }

        // 如果音效改变，切换播放
        if (soundFile !== this.currentAmbient.weather) {
            if (this.currentAmbient.weather) {
                // 淡出旧音效
                this.fadeOut(layer, () => {
                    if (soundFile) {
                        this._startAmbientLayer(layer, soundFile, 'ambientWeather');
                    }
                });
            } else if (soundFile) {
                // 直接播放新音效
                this._startAmbientLayer(layer, soundFile, 'ambientWeather');
            }
            this.currentAmbient.weather = soundFile;
            this.currentAmbient.weatherIntensity = intensity;
        }
    }

    /**
     * 更新时间环境音
     */
    _updateTimeAmbient(timeOfDay) {
        const layer = this.ambientLayers.time;
        const soundFile = this.ambientConfig.timeOfDay[timeOfDay];

        if (soundFile !== this.currentAmbient.time) {
            if (this.currentAmbient.time) {
                this.fadeOut(layer, () => {
                    if (soundFile) {
                        this._startAmbientLayer(layer, soundFile, 'ambientTime');
                    }
                });
            } else if (soundFile) {
                this._startAmbientLayer(layer, soundFile, 'ambientTime');
            }
            this.currentAmbient.time = soundFile;
        }
    }

    /**
     * 更新地点环境音
     */
    _updateLocationAmbient(location) {
        const layer = this.ambientLayers.location;
        let soundFile = null;

        // 解析地点格式: "indoor/bedroom" 或 "outdoor/park"
        if (location.includes('/')) {
            const [type, place] = location.split('/');
            soundFile = this.ambientConfig.location[type]?.[place];
        }

        if (soundFile !== this.currentAmbient.location) {
            if (this.currentAmbient.location) {
                this.fadeOut(layer, () => {
                    if (soundFile) {
                        this._startAmbientLayer(layer, soundFile, 'ambientLocation');
                    }
                });
            } else if (soundFile) {
                this._startAmbientLayer(layer, soundFile, 'ambientLocation');
            }
            this.currentAmbient.location = soundFile;
        }
    }

    /**
     * 开始播放环境音层
     */
    _startAmbientLayer(layer, soundFile, volumeKey) {
        layer.src = soundFile;
        layer.volume = 0;
        layer.loop = true;

        layer.play().then(() => {
            const targetVolume = this.volumes[volumeKey] * this.volumes.ambient * this.volumes.master;
            this.fadeIn(layer, targetVolume);
            console.log(`🌍 环境音播放: ${soundFile}`);
        }).catch(e => {
            console.log('环境音播放需要用户交互:', e);
        });
    }

    /**
     * 添加用户交互处理器（解决浏览器自动播放限制）
     */
    _addUserInteractionHandler(filename, volume, loop, startTime) {
        const handler = () => {
            this._startBGM(filename, volume, loop, startTime);
            document.removeEventListener('click', handler);
            document.removeEventListener('keydown', handler);
        };

        document.addEventListener('click', handler, { once: true });
        document.addEventListener('keydown', handler, { once: true });

        console.log('⚠️ 音频播放需要用户交互，请点击页面或按任意键');
    }

    /**
     * 测试音频系统
     */
    test() {
        console.log('🎵 音频系统测试开始');

        // 测试BGM
        console.log('测试BGM...');
        this.playBGM('assets/sounds/bgm/menu.mp3');

        // 测试音效
        setTimeout(() => {
            console.log('测试音效...');
            this.playSFX('assets/sounds/sfx/ui/click.mp3');
        }, 1000);

        // 测试环境音
        setTimeout(() => {
            console.log('测试环境音...');
            this.updateAmbient('rainy', 'night', 'indoor/bedroom', 0.5);
        }, 2000);

        console.log('🎵 音频系统测试结束（音频会继续播放）');
    }
}

// 导出到全局
window.AudioSystem = AudioSystem;

// 初始化提示
console.log('🔊 音频系统已加载');
console.log('使用 window.audioSystem = new AudioSystem() 初始化');
console.log('使用 window.audioSystem.test() 测试音频系统');