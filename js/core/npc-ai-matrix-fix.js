// 临时脚本：批量修改决策矩阵，在索引[5]和[6]位置插入Zero血量和Zero心情权重

const actions = {
    "远离User": {
        insert: [0.0, -0.4],  // [5] Zero血量, [6] Zero心情（心情差时更想远离）
        comment: "自己状态不好时更想远离"
    },
    "热情打招呼": {
        insert: [0.3, 0.5],  // [5] Zero血量, [6] Zero心情（血量和心情都要好才能热情）
        comment: "自己状态好才能热情社交"
    },
    "冷淡回应": {
        insert: [0.0, -0.3],  // [5] Zero血量, [6] Zero心情（心情差时更容易冷淡）
        comment: "自己心情差时容易冷淡"
    },
    "狼魂爆发": {
        insert: [-0.5, -0.6],  // [5] Zero血量（受伤易失控）, [6] Zero心情（心情差易暴走）
        comment: "自己状态差时容易失控"
    }
};

console.log(JSON.stringify(actions, null, 2));
