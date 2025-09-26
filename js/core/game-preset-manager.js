/**
 * 游戏预设管理器
 * 管理游戏的所有设置预设（不包括API设置）
 * API设置由 APIPresetManager 独立管理
 */

const GamePresetManager = {
    // 默认预设
    defaultPreset: {
        id: 'preset_default',
        name: '默认预设',
        createTime: Date.now(),

        // 链接到API预设（不重复存储API设置）
        apiPresetId: null,

        // 游戏设置
        settings: {
            // 角色预设（游戏开始后不可变）
            character: {
                // 默认为null，在角色创建时填充
                gender: null,          // 'male', 'female', 'futanari'
                bodyType: null,        // 'small', 'medium', 'large'
                initialStats: {        // 初始属性点分配
                    strength: 5,
                    agility: 5,
                    intelligence: 5,
                    charisma: 5,
                    luck: 5
                },
                traits: [],            // 选择的特性/天赋
                appearance: {}         // 外貌细节
            },

            // 基础游戏设置
            difficulty: 'normal',
            autoSave: true,
            skipTutorial: false,
            showHints: true,

            // 世界设置
            startSeason: 'spring',
            npcDensity: 'normal',
            economyDifficulty: 'normal',
            timeSpeed: 1,

            // NPC设置
            importantNpcPersonality: 'canonical',
            npcMemoryDepth: 'normal',
            customNpcs: {},

            // 音量设置
            volumeMaster: 70,
            volumeSfx: 80,
            volumeMusic: 60,
            volumeVoice: 90,

            // 美化模组
            uiTheme: 'default',
            fontSize: 'normal',
            animations: true,

            // 扩展包设置
            expansionPacks: {
                campus: true,
                city: false,
                festival: false,
                career: false
            }
        }
    },

    // 初始化
    init() {
        // 从localStorage加载预设
        const saved = localStorage.getItem('game_presets');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.presets = data.presets || [this.defaultPreset];
                this.activePresetId = data.activePresetId || this.presets[0].id;
            } catch (e) {
                console.error('加载游戏预设失败:', e);
                this.resetToDefaults();
            }
        } else {
            this.resetToDefaults();
        }

        // 确保至少有一个预设
        if (!this.presets || this.presets.length === 0) {
            this.resetToDefaults();
        }
    },

    // 重置为默认值
    resetToDefaults() {
        this.presets = [{ ...this.defaultPreset }];
        this.activePresetId = this.defaultPreset.id;
        this.save();
    },

    // 保存到localStorage
    save() {
        const data = {
            presets: this.presets,
            activePresetId: this.activePresetId
        };
        localStorage.setItem('game_presets', JSON.stringify(data));
        console.log('💾 游戏预设已保存');
    },

    // 获取所有预设
    getAllPresets() {
        if (!this.presets) this.init();
        return this.presets;
    },

    // 获取当前激活的预设
    getActivePreset() {
        if (!this.presets) this.init();
        return this.presets.find(p => p.id === this.activePresetId);
    },

    // 切换预设
    switchPreset(presetId) {
        const preset = this.presets.find(p => p.id === presetId);
        if (preset) {
            this.activePresetId = presetId;
            this.save();

            // 应用预设到UI
            this.applyPresetToUI(preset);

            console.log(`🎮 切换到预设: ${preset.name}`);
            return true;
        }
        return false;
    },

    // 创建新预设
    createPreset(name = '新预设') {
        // 基于当前设置创建新预设
        const currentSettings = this.getCurrentSettingsFromUI();

        const newPreset = {
            id: `preset_${Date.now()}`,
            name: name,
            createTime: Date.now(),
            apiPresetId: window.APIPresetManager ? window.APIPresetManager.activePresetId : null,
            settings: currentSettings
        };

        this.presets.push(newPreset);
        this.activePresetId = newPreset.id;
        this.save();

        console.log(`✨ 创建新预设: ${name}`);
        return newPreset.id;
    },

    // 更新当前预设
    updateCurrentPreset(updates = null) {
        const preset = this.getActivePreset();
        if (!preset) return false;

        // 如果没有提供更新，从UI获取当前设置
        const settings = updates || this.getCurrentSettingsFromUI();

        preset.settings = { ...preset.settings, ...settings };
        preset.apiPresetId = window.APIPresetManager ? window.APIPresetManager.activePresetId : null;

        this.save();
        console.log(`💾 预设 "${preset.name}" 已更新`);
        return true;
    },

    // 删除预设
    deletePreset(presetId) {
        // 不能删除最后一个预设
        if (this.presets.length <= 1) {
            alert('不能删除最后一个预设！');
            return false;
        }

        // 不能删除默认预设
        if (presetId === 'preset_default') {
            alert('不能删除默认预设！');
            return false;
        }

        const index = this.presets.findIndex(p => p.id === presetId);
        if (index !== -1) {
            this.presets.splice(index, 1);

            // 如果删除的是当前预设，切换到第一个
            if (presetId === this.activePresetId) {
                this.activePresetId = this.presets[0].id;
                this.applyPresetToUI(this.presets[0]);
            }

            this.save();
            console.log('🗑️ 预设已删除');
            return true;
        }
        return false;
    },

    // 重命名预设
    renamePreset(presetId, newName) {
        const preset = this.presets.find(p => p.id === presetId);
        if (preset) {
            preset.name = newName;
            this.save();
            console.log(`✏️ 预设重命名为: ${newName}`);
            return true;
        }
        return false;
    },

    // 从UI获取当前设置
    getCurrentSettingsFromUI() {
        const settings = {};

        // 角色预设
        settings.character = {
            gender: document.getElementById('default-gender')?.value || null,
            bodyType: document.getElementById('default-body-type')?.value || null,
            statMode: document.getElementById('stat-mode')?.value || 'balanced',
            initialStats: this.getCustomStats() || {
                strength: 5,
                agility: 5,
                intelligence: 5,
                charisma: 5,
                luck: 5
            },
            traits: [],
            appearance: {}
        };

        // 基础游戏设置
        const difficultySelect = document.getElementById('difficulty-select');
        if (difficultySelect) settings.difficulty = difficultySelect.value;

        // Toggle switches
        document.querySelectorAll('.toggle-switch').forEach(toggle => {
            const settingName = toggle.dataset.setting;
            if (settingName) {
                settings[settingName] = toggle.classList.contains('active');
            }
        });

        // 世界设置
        const startSeason = document.getElementById('start-season');
        if (startSeason) settings.startSeason = startSeason.value;

        const npcDensity = document.getElementById('npc-density');
        if (npcDensity) settings.npcDensity = npcDensity.value;

        const economyDifficulty = document.getElementById('economy-difficulty');
        if (economyDifficulty) settings.economyDifficulty = economyDifficulty.value;

        const timeSpeed = document.getElementById('time-speed');
        if (timeSpeed) settings.timeSpeed = parseFloat(timeSpeed.value);

        // NPC设置
        const importantNpc = document.getElementById('important-npc-personality');
        if (importantNpc) settings.importantNpcPersonality = importantNpc.value;

        const npcMemory = document.getElementById('npc-memory-depth');
        if (npcMemory) settings.npcMemoryDepth = npcMemory.value;

        // 音量设置
        const volumeMaster = document.getElementById('volume-master');
        if (volumeMaster) settings.volumeMaster = parseInt(volumeMaster.value);

        const volumeSfx = document.getElementById('volume-sfx');
        if (volumeSfx) settings.volumeSfx = parseInt(volumeSfx.value);

        const volumeMusic = document.getElementById('volume-music');
        if (volumeMusic) settings.volumeMusic = parseInt(volumeMusic.value);

        const volumeVoice = document.getElementById('volume-voice');
        if (volumeVoice) settings.volumeVoice = parseInt(volumeVoice.value);

        // 美化模组
        const uiTheme = document.getElementById('ui-theme');
        if (uiTheme) settings.uiTheme = uiTheme.value;

        const fontSize = document.getElementById('font-size');
        if (fontSize) settings.fontSize = fontSize.value;

        return settings;
    },

    // 获取自定义属性（辅助方法）
    getCustomStats() {
        // 如果有自定义属性界面，从中获取
        // 否则返回null使用默认值
        return null;
    },

    // 应用预设到UI
    applyPresetToUI(preset) {
        if (!preset || !preset.settings) return;

        const s = preset.settings;

        // 角色预设
        if (s.character) {
            const gender = document.getElementById('default-gender');
            if (gender && s.character.gender) gender.value = s.character.gender;

            const bodyType = document.getElementById('default-body-type');
            if (bodyType && s.character.bodyType) bodyType.value = s.character.bodyType;

            const statMode = document.getElementById('stat-mode');
            if (statMode && s.character.statMode) statMode.value = s.character.statMode;
        }

        // 基础游戏设置
        const difficultySelect = document.getElementById('difficulty-select');
        if (difficultySelect && s.difficulty) difficultySelect.value = s.difficulty;

        // Toggle switches
        if (s.autoSave !== undefined) {
            const autoSaveToggle = document.querySelector('[data-setting="autoSave"]');
            if (autoSaveToggle) {
                autoSaveToggle.classList.toggle('active', s.autoSave);
            }
        }

        if (s.skipTutorial !== undefined) {
            const skipToggle = document.querySelector('[data-setting="skipTutorial"]');
            if (skipToggle) {
                skipToggle.classList.toggle('active', s.skipTutorial);
            }
        }

        if (s.showHints !== undefined) {
            const hintsToggle = document.querySelector('[data-setting="showHints"]');
            if (hintsToggle) {
                hintsToggle.classList.toggle('active', s.showHints);
            }
        }

        if (s.animations !== undefined) {
            const animToggle = document.querySelector('[data-setting="animations"]');
            if (animToggle) {
                animToggle.classList.toggle('active', s.animations);
            }
        }

        // 世界设置
        const startSeason = document.getElementById('start-season');
        if (startSeason && s.startSeason) startSeason.value = s.startSeason;

        const npcDensity = document.getElementById('npc-density');
        if (npcDensity && s.npcDensity) npcDensity.value = s.npcDensity;

        const economyDifficulty = document.getElementById('economy-difficulty');
        if (economyDifficulty && s.economyDifficulty) economyDifficulty.value = s.economyDifficulty;

        const timeSpeed = document.getElementById('time-speed');
        if (timeSpeed && s.timeSpeed) timeSpeed.value = s.timeSpeed.toString();

        // NPC设置
        const importantNpc = document.getElementById('important-npc-personality');
        if (importantNpc && s.importantNpcPersonality) importantNpc.value = s.importantNpcPersonality;

        const npcMemory = document.getElementById('npc-memory-depth');
        if (npcMemory && s.npcMemoryDepth) npcMemory.value = s.npcMemoryDepth;

        // 音量设置
        const volumeMaster = document.getElementById('volume-master');
        if (volumeMaster && s.volumeMaster !== undefined) volumeMaster.value = s.volumeMaster;

        const volumeSfx = document.getElementById('volume-sfx');
        if (volumeSfx && s.volumeSfx !== undefined) volumeSfx.value = s.volumeSfx;

        const volumeMusic = document.getElementById('volume-music');
        if (volumeMusic && s.volumeMusic !== undefined) volumeMusic.value = s.volumeMusic;

        const volumeVoice = document.getElementById('volume-voice');
        if (volumeVoice && s.volumeVoice !== undefined) volumeVoice.value = s.volumeVoice;

        // 美化模组
        const uiTheme = document.getElementById('ui-theme');
        if (uiTheme && s.uiTheme) uiTheme.value = s.uiTheme;

        const fontSize = document.getElementById('font-size');
        if (fontSize && s.fontSize) fontSize.value = s.fontSize;

        // 切换关联的API预设
        if (preset.apiPresetId && window.APIPresetManager) {
            window.APIPresetManager.switchPreset(preset.apiPresetId);
        }
    },

    // 导出预设
    exportPreset(presetId = null) {
        const preset = presetId ?
            this.presets.find(p => p.id === presetId) :
            this.getActivePreset();

        if (!preset) return null;

        const exportData = {
            version: '1.0.0',
            type: 'game_preset',
            preset: preset,
            exportTime: Date.now()
        };

        return JSON.stringify(exportData, null, 2);
    },

    // 导入预设
    importPreset(jsonString) {
        try {
            const data = JSON.parse(jsonString);

            // 验证格式
            if (data.type !== 'game_preset' || !data.preset) {
                throw new Error('无效的预设文件格式');
            }

            // 生成新ID避免冲突
            const importedPreset = {
                ...data.preset,
                id: `preset_${Date.now()}`,
                name: `${data.preset.name} (导入)`
            };

            this.presets.push(importedPreset);
            this.save();

            console.log(`📥 预设导入成功: ${importedPreset.name}`);
            return importedPreset.id;
        } catch (e) {
            console.error('导入预设失败:', e);
            alert('导入失败：文件格式不正确');
            return null;
        }
    },

    // 检查是否需要创建预设（新用户）
    needsPresetCreation() {
        // 如果只有默认预设且没有修改过，则需要创建
        if (this.presets.length === 1 && this.presets[0].id === 'preset_default') {
            // 检查是否有保存过的游戏数据
            const hasSaves = localStorage.getItem('yoyo_game_state') ||
                            localStorage.getItem('game_saves');
            return !hasSaves;
        }
        return false;
    }
};

// 导出到全局
window.GamePresetManager = GamePresetManager;

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GamePresetManager.init());
} else {
    GamePresetManager.init();
}