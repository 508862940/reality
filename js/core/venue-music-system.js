/**
 * 特殊场所音乐系统
 * 管理电影院、桌游店、KTV等特殊场所的BGM
 */

class VenueMusicSystem {
    constructor() {
        // 场所配置
        this.venues = {
            // 桌游店
            'boardgame_cafe': {
                type: 'activity',
                name: '桌游咖啡店',
                bgm: {
                    lobby: 'bgm/venue/boardgame/cafe_ambient.mp3',
                    playing: 'bgm/venue/boardgame/playing.mp3'
                },
                games: {
                    werewolf: {
                        phases: {
                            night: 'bgm/venue/boardgame/werewolf_night.mp3',
                            discussion: 'bgm/venue/boardgame/werewolf_discuss.mp3',
                            vote: 'bgm/venue/boardgame/werewolf_vote.mp3',
                            reveal: 'bgm/venue/boardgame/werewolf_reveal.mp3'
                        }
                    },
                    script_kill: {
                        acts: {
                            setup: 'bgm/venue/boardgame/script_setup.mp3',
                            investigation: 'bgm/venue/boardgame/script_investigate.mp3',
                            climax: 'bgm/venue/boardgame/script_climax.mp3'
                        }
                    },
                    uno: 'bgm/venue/boardgame/uno_fun.mp3',
                    chess: 'bgm/venue/boardgame/chess_think.mp3'
                },
                ambience: 'ambient/cafe_chatter.mp3',
                volumeProfile: { bgm: 0.5, ambient: 0.3, sfx: 0.7 }
            },

            // 电影院
            'cinema': {
                type: 'activity',
                name: '电影院',
                bgm: {
                    lobby: 'bgm/venue/cinema/lobby.mp3',
                    entering: 'bgm/venue/cinema/entering.mp3',
                    intermission: 'bgm/venue/cinema/intermission.mp3'
                },
                movies: {
                    romance: {
                        intro: 'bgm/venue/cinema/romance_intro.mp3',
                        main: 'bgm/venue/cinema/romance_main.mp3',
                        climax: 'bgm/venue/cinema/romance_climax.mp3',
                        ending: 'bgm/venue/cinema/romance_ending.mp3'
                    },
                    action: {
                        intro: 'bgm/venue/cinema/action_intro.mp3',
                        main: 'bgm/venue/cinema/action_main.mp3',
                        climax: 'bgm/venue/cinema/action_climax.mp3',
                        ending: 'bgm/venue/cinema/action_ending.mp3'
                    },
                    horror: {
                        intro: 'bgm/venue/cinema/horror_intro.mp3',
                        main: 'bgm/venue/cinema/horror_main.mp3',
                        climax: 'bgm/venue/cinema/horror_climax.mp3',
                        ending: 'bgm/venue/cinema/horror_ending.mp3'
                    },
                    comedy: {
                        intro: 'bgm/venue/cinema/comedy_intro.mp3',
                        main: 'bgm/venue/cinema/comedy_main.mp3',
                        climax: 'bgm/venue/cinema/comedy_climax.mp3',
                        ending: 'bgm/venue/cinema/comedy_ending.mp3'
                    }
                },
                specialMoments: {
                    with_zero: 'bgm/venue/cinema/date_with_zero.mp3',
                    with_observer: 'bgm/venue/cinema/date_with_observer.mp3',
                    alone: null  // 独自看电影没有特殊BGM
                },
                volumeProfile: { bgm: 0.7, ambient: 0.1, sfx: 0.8 }
            },

            // KTV
            'karaoke': {
                type: 'activity',
                name: 'KTV',
                bgm: {
                    lobby: 'bgm/venue/ktv/lobby.mp3',
                    selecting: 'bgm/venue/ktv/selecting.mp3',
                    waiting: 'bgm/venue/ktv/waiting.mp3',
                    applause: 'bgm/venue/ktv/applause.mp3'
                },
                songs: {
                    // 可选歌曲列表（简化版）
                    popular: ['bgm/venue/ktv/song_popular1.mp3', 'bgm/venue/ktv/song_popular2.mp3'],
                    classic: ['bgm/venue/ktv/song_classic1.mp3', 'bgm/venue/ktv/song_classic2.mp3'],
                    duet: ['bgm/venue/ktv/song_duet1.mp3', 'bgm/venue/ktv/song_duet2.mp3'],
                    npc_special: {
                        zero: 'bgm/venue/ktv/zero_song.mp3',
                        observer: 'bgm/venue/ktv/observer_song.mp3'
                    }
                },
                volumeProfile: { bgm: 0.8, ambient: 0.2, sfx: 0.6 }
            },

            // 游戏厅
            'arcade': {
                type: 'activity',
                name: '游戏厅',
                bgm: {
                    main: 'bgm/venue/arcade/main_floor.mp3',
                    retro: 'bgm/venue/arcade/retro_zone.mp3',
                    modern: 'bgm/venue/arcade/modern_zone.mp3'
                },
                games: {
                    fighting: 'bgm/venue/arcade/fighting_game.mp3',
                    racing: 'bgm/venue/arcade/racing_game.mp3',
                    rhythm: 'bgm/venue/arcade/rhythm_game.mp3',
                    shooting: 'bgm/venue/arcade/shooting_game.mp3'
                },
                ambience: 'ambient/arcade_noise.mp3',
                volumeProfile: { bgm: 0.6, ambient: 0.4, sfx: 0.8 }
            },

            // 酒吧
            'bar': {
                type: 'social',
                name: '酒吧',
                timeRestricted: { open: 20, close: 4 },  // 20:00-04:00营业
                bgm: {
                    early_evening: 'bgm/venue/bar/jazz_lounge.mp3',    // 20-22点
                    peak_time: 'bgm/venue/bar/dance_mix.mp3',          // 22-01点
                    late_night: 'bgm/venue/bar/slow_jazz.mp3',         // 01-04点
                    special_event: 'bgm/venue/bar/live_band.mp3'       // 特殊活动
                },
                ambience: {
                    quiet: 'ambient/bar_quiet.mp3',
                    crowded: 'ambient/bar_crowded.mp3'
                },
                volumeProfile: { bgm: 0.5, ambient: 0.5, sfx: 0.6 }
            },

            // 图书馆
            'library': {
                type: 'quiet',
                name: '图书馆',
                bgm: null,  // 图书馆通常没有BGM
                ambience: 'ambient/library_quiet.mp3',
                special: {
                    studying_with_npc: 'bgm/venue/library/soft_piano.mp3'  // 和NPC一起学习时的轻柔BGM
                },
                volumeProfile: { bgm: 0.2, ambient: 0.3, sfx: 0.1 }
            },

            // 海滩
            'beach': {
                type: 'outdoor',
                name: '海滩',
                bgm: {
                    day: 'bgm/venue/beach/sunny_beach.mp3',
                    sunset: 'bgm/venue/beach/sunset.mp3',
                    night: 'bgm/venue/beach/night_waves.mp3',
                    party: 'bgm/venue/beach/beach_party.mp3',
                    bonfire: 'bgm/venue/beach/bonfire.mp3'
                },
                ambience: 'ambient/ocean_waves.mp3',
                seasonal: {
                    summer: 1.0,   // 夏天音量正常
                    winter: 0.5    // 冬天音量降低
                },
                volumeProfile: { bgm: 0.4, ambient: 0.6, sfx: 0.5 }
            },

            // 商店
            'shop': {
                type: 'service',
                name: '商店',
                bgm: {
                    general: 'bgm/venue/shop/general_store.mp3',
                    clothing: 'bgm/venue/shop/fashion_boutique.mp3',
                    tech: 'bgm/venue/shop/tech_store.mp3',
                    bookstore: 'bgm/venue/shop/bookstore.mp3'
                },
                volumeProfile: { bgm: 0.4, ambient: 0.3, sfx: 0.7 }
            }
        };

        // 当前场所状态
        this.currentVenue = null;
        this.currentActivity = null;
        this.venueStartTime = null;
        this.savedMusicState = null;  // 进入场所前的音乐状态

        // 活动计时器
        this.activityTimer = null;

        this.init();
    }

    /**
     * 初始化
     */
    init() {
        // 监听位置变化
        window.addEventListener('locationChange', (e) => {
            this.onLocationChange(e.detail);
        });

        console.log('🏛️ 特殊场所音乐系统已初始化');
    }

    /**
     * 进入场所
     */
    enterVenue(venueId, options = {}) {
        const venue = this.venues[venueId];
        if (!venue) {
            console.warn(`⚠️ 未知场所: ${venueId}`);
            return false;
        }

        // 检查时间限制
        if (venue.timeRestricted && window.timeSystem) {
            const hour = window.timeSystem.currentTime.hour;
            const { open, close } = venue.timeRestricted;

            const isOpen = close > open ?
                (hour >= open && hour < close) :  // 正常营业时间
                (hour >= open || hour < close);   // 跨午夜营业

            if (!isOpen) {
                console.log(`🔒 ${venue.name}未营业 (营业时间: ${open}:00-${close}:00)`);
                return false;
            }
        }

        console.log(`🏛️ 进入${venue.name}`);

        // 保存当前音乐状态
        if (window.musicPriority) {
            this.savedMusicState = window.musicPriority.getStatus();
        }

        // 播放场所BGM
        this.playVenueBGM(venueId, options.area || 'lobby');

        // 更新状态
        this.currentVenue = venueId;
        this.venueStartTime = Date.now();

        // 调整音量配置
        if (venue.volumeProfile && window.audioSystem) {
            Object.keys(venue.volumeProfile).forEach(layer => {
                window.audioSystem.setLayerVolume(layer, venue.volumeProfile[layer]);
            });
        }

        return true;
    }

    /**
     * 离开场所
     */
    exitVenue() {
        if (!this.currentVenue) return;

        const venue = this.venues[this.currentVenue];
        console.log(`👋 离开${venue.name}`);

        // 停止活动
        if (this.currentActivity) {
            this.endActivity();
        }

        // 恢复之前的音乐
        if (this.savedMusicState && window.musicPriority) {
            window.musicPriority.unlockMusic();

            // 恢复日常BGM
            setTimeout(() => {
                if (window.dailyBGM) {
                    window.dailyBGM.playCurrentBGM({ fadeIn: 3000 });
                }
            }, 500);
        }

        // 恢复音量
        if (window.audioSystem) {
            window.audioSystem.setLayerVolume('bgm', 0.5);
            window.audioSystem.setLayerVolume('ambient', 0.5);
            window.audioSystem.setLayerVolume('sfx', 0.8);
        }

        // 清空状态
        this.currentVenue = null;
        this.venueStartTime = null;
        this.savedMusicState = null;
    }

    /**
     * 播放场所BGM
     */
    playVenueBGM(venueId, area = 'main') {
        const venue = this.venues[venueId];
        if (!venue) return;

        let bgm = null;

        // 获取BGM路径
        if (typeof venue.bgm === 'string') {
            bgm = venue.bgm;
        } else if (venue.bgm && venue.bgm[area]) {
            bgm = venue.bgm[area];
        }

        // 播放BGM
        if (bgm && window.musicPriority) {
            window.musicPriority.requestMusic('venue', bgm, {
                fadeIn: 2000,
                volume: venue.volumeProfile?.bgm || 0.5,
                locked: true  // 锁定防止被其他音乐覆盖
            });
        }

        // 播放环境音
        if (venue.ambience) {
            const ambientPath = typeof venue.ambience === 'string' ?
                venue.ambience : venue.ambience[area];

            if (ambientPath && window.audioSystem) {
                window.audioSystem.updateAmbient(null, null, ambientPath);
            }
        }
    }

    /**
     * 开始活动
     */
    startActivity(activityType, options = {}) {
        if (!this.currentVenue) {
            console.warn('⚠️ 必须先进入场所才能开始活动');
            return false;
        }

        const venue = this.venues[this.currentVenue];
        console.log(`🎮 在${venue.name}开始活动: ${activityType}`);

        this.currentActivity = {
            type: activityType,
            startTime: Date.now(),
            options: options
        };

        // 根据活动类型播放BGM
        switch (this.currentVenue) {
            case 'boardgame_cafe':
                this.startBoardGame(activityType, options);
                break;
            case 'cinema':
                this.startMovie(activityType, options);
                break;
            case 'karaoke':
                this.startKaraoke(activityType, options);
                break;
            case 'arcade':
                this.startArcadeGame(activityType, options);
                break;
            default:
                console.log(`🎵 播放活动BGM: ${activityType}`);
        }

        return true;
    }

    /**
     * 开始桌游
     */
    startBoardGame(gameType, options = {}) {
        const venue = this.venues['boardgame_cafe'];
        const gameConfig = venue.games[gameType];

        if (!gameConfig) {
            console.warn(`⚠️ 未知桌游: ${gameType}`);
            return;
        }

        if (gameType === 'werewolf') {
            // 狼人杀有多个阶段
            this.playWerewolfPhase('night');
        } else if (gameType === 'script_kill') {
            // 剧本杀有多幕
            this.playScriptAct('setup');
        } else if (typeof gameConfig === 'string') {
            // 简单游戏直接播放BGM
            if (window.musicPriority) {
                window.musicPriority.requestMusic('minigame', gameConfig, {
                    fadeIn: 1000,
                    locked: true
                });
            }
        }
    }

    /**
     * 播放狼人杀阶段
     */
    playWerewolfPhase(phase) {
        const phases = this.venues['boardgame_cafe'].games.werewolf.phases;
        const bgm = phases[phase];

        if (bgm && window.musicPriority) {
            console.log(`🐺 狼人杀阶段: ${phase}`);

            window.musicPriority.requestMusic('minigame', bgm, {
                fadeIn: 500,
                locked: true
            });
        }

        // 设置下一阶段计时器（示例）
        const phaseOrder = ['night', 'discussion', 'vote', 'reveal'];
        const currentIndex = phaseOrder.indexOf(phase);
        const nextPhase = phaseOrder[(currentIndex + 1) % phaseOrder.length];

        if (this.activityTimer) {
            clearTimeout(this.activityTimer);
        }

        this.activityTimer = setTimeout(() => {
            if (this.currentActivity) {
                this.playWerewolfPhase(nextPhase);
            }
        }, 60000);  // 每阶段60秒
    }

    /**
     * 开始看电影
     */
    startMovie(movieType, options = {}) {
        const movies = this.venues['cinema'].movies;
        const movie = movies[movieType];

        if (!movie) {
            console.warn(`⚠️ 未知电影类型: ${movieType}`);
            return;
        }

        console.log(`🎬 开始播放${movieType}电影`);

        // 检查是否和NPC一起看
        if (options.companion) {
            const specialBGM = this.venues['cinema'].specialMoments[`with_${options.companion}`];
            if (specialBGM) {
                // 特殊约会BGM会在关键时刻播放
                this.currentActivity.specialBGM = specialBGM;
            }
        }

        // 播放电影序列
        this.playMovieSequence(movie, 'intro');
    }

    /**
     * 播放电影序列
     */
    playMovieSequence(movie, phase) {
        const bgm = movie[phase];

        if (bgm && window.musicPriority) {
            console.log(`🎬 电影阶段: ${phase}`);

            window.musicPriority.requestMusic('minigame', bgm, {
                fadeIn: phase === 'intro' ? 3000 : 2000,
                locked: true
            });
        }

        // 设置下一阶段
        const sequence = ['intro', 'main', 'climax', 'ending'];
        const currentIndex = sequence.indexOf(phase);

        if (currentIndex < sequence.length - 1) {
            const durations = {
                'intro': 30000,   // 30秒
                'main': 180000,   // 3分钟
                'climax': 60000   // 1分钟
            };

            if (this.activityTimer) {
                clearTimeout(this.activityTimer);
            }

            this.activityTimer = setTimeout(() => {
                if (this.currentActivity) {
                    this.playMovieSequence(movie, sequence[currentIndex + 1]);
                }
            }, durations[phase] || 60000);
        }
    }

    /**
     * 结束活动
     */
    endActivity() {
        if (!this.currentActivity) return;

        console.log(`🏁 结束活动: ${this.currentActivity.type}`);

        // 清除计时器
        if (this.activityTimer) {
            clearTimeout(this.activityTimer);
            this.activityTimer = null;
        }

        // 返回场所大厅BGM
        if (this.currentVenue) {
            this.playVenueBGM(this.currentVenue, 'lobby');
        }

        this.currentActivity = null;
    }

    /**
     * 获取当前状态
     */
    getStatus() {
        return {
            currentVenue: this.currentVenue,
            venueName: this.currentVenue ? this.venues[this.currentVenue].name : '无',
            currentActivity: this.currentActivity,
            timeInVenue: this.venueStartTime ?
                Math.floor((Date.now() - this.venueStartTime) / 1000) + '秒' : null
        };
    }

    /**
     * 位置变化处理
     */
    onLocationChange(detail) {
        const { location, type } = detail;

        // 检查是否进入/离开特殊场所
        if (this.venues[location]) {
            this.enterVenue(location);
        } else if (this.currentVenue && location !== this.currentVenue) {
            this.exitVenue();
        }
    }
}

// 创建全局实例
window.venueMusic = new VenueMusicSystem();

// 测试命令
window.testVenue = {
    // 进入场所
    enter: (venue) => window.venueMusic.enterVenue(venue),
    exit: () => window.venueMusic.exitVenue(),

    // 开始活动
    play: (activity) => window.venueMusic.startActivity(activity),
    endPlay: () => window.venueMusic.endActivity(),

    // 特定活动
    werewolf: () => {
        window.venueMusic.enterVenue('boardgame_cafe');
        window.venueMusic.startActivity('werewolf');
    },
    movie: (type = 'romance') => {
        window.venueMusic.enterVenue('cinema');
        window.venueMusic.startActivity(type);
    },

    // 查看状态
    status: () => console.table(window.venueMusic.getStatus()),
    list: () => {
        console.log('🏛️ 可用场所:');
        Object.keys(window.venueMusic.venues).forEach(id => {
            const v = window.venueMusic.venues[id];
            console.log(`  ${id}: ${v.name} (${v.type})`);
        });
    }
};

console.log('🏛️ 特殊场所音乐系统已加载');
console.log('测试命令:');
console.log('  testVenue.list()       - 查看所有场所');
console.log('  testVenue.enter("cinema") - 进入电影院');
console.log('  testVenue.movie()      - 看电影');
console.log('  testVenue.werewolf()   - 玩狼人杀');
console.log('  testVenue.status()     - 查看状态');

// 导出到全局
window.VenueMusicSystem = VenueMusicSystem;