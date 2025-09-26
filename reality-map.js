// Reality · 世界地图脚本
// —— 数据 ——
const WORLD_MAP = {
  surface: [
    { id: "central", name: "中央广场", tags: ["情报", "线索"], desc: "城市中心，信息集散地；适合触发主线/支线的线索事件。", to: null },
    { id: "residential", name: "居住区", tags: ["起点", "休整"], desc: "User醒来的公寓；可进行休整、日记与道具整理。", to: null },
    { id: "commerce", name: "商业街", tags: ["商店", "打工"], desc: "购物、打工、收集道具与闲聊情报。", to: "shop" },
    { id: "academy", name: "学院区", tags: ["校园", "观察"], desc: "表面是学校，实则观察设施；可触发课堂/社团事件。", to: "school" },
    { id: "medical", name: "医疗中心", tags: ["治疗", "隐藏"], desc: "关键地点，地下有秘密实验室与数据接口。", to: null },
    { id: "park", name: "公园", tags: ["约会", "入口"], desc: "约会地点；里层入口之一。", to: "park" },
  ],
  inner: [
    { id: "factory", name: "废弃工厂", tags: ["Zero", "战斗"], desc: "Zero曾被关押/实验之地；高危区域。", to: null },
    { id: "tunnel", name: "地下通道", tags: ["连接", "潜入"], desc: "连接各大区域的秘密网络；适合潜入与逃离。", to: null },
    { id: "archive", name: "数据档案馆", tags: ["身份", "解密"], desc: "破解身份与真相的关键节点。", to: null },
    { id: "surveillance", name: "监控中心", tags: ["被观察", "黑客"], desc: "察觉被观察的真相；可执行入侵任务。", to: null },
  ],
  deep: [
    { id: "ai_graveyard", name: "AI墓地", tags: ["残骸", "回忆"], desc: "废弃AI存放地；触发回忆与痛感回响事件。", to: null },
    { id: "hq", name: "组织总部", tags: ["阵营", "抉择"], desc: "救活User的神秘组织；势力选择的关键点。", to: null },
    { id: "memory_bank", name: "记忆银行", tags: ["存档", "情感"], desc: "存储AI记忆与情感残影的核心设施。", to: null },
    { id: "source_room", name: "源代码室", tags: ["终局", "真相"], desc: "最终真相揭露地；关键Boss/抉择。", to: null },
  ],
};

// —— 状态 ——
let currentLayer = "surface";
let selected = null;

// —— DOM ——
const map = document.getElementById("worldMap");
const segs = [...document.querySelectorAll(".seg")];
const gotoBtn = document.getElementById("gotoBtn");
const resetBtn = document.getElementById("resetZoom");

const placeName = document.getElementById("placeName");
const placeDesc = document.getElementById("placeDesc");
const tagsWrap  = document.getElementById("tags");

// —— 工具 ——
function $(sel, root=document){ return root.querySelector(sel); }
function $all(sel, root=document){ return [...root.querySelectorAll(sel)]; }

function setLayer(layer){
  currentLayer = layer;
  // Tab UI
  segs.forEach(b=>{
    b.classList.toggle("active", b.dataset.layer === layer);
    b.setAttribute("aria-selected", b.dataset.layer === layer ? "true" : "false");
  });
  // Show/Hide groups
  $all(".layer-surface,.layer-inner,.layer-deep", map).forEach(g=>g.classList.add("hidden"));
  $all(`.layer-${layer}`, map).forEach(g=>g.classList.remove("hidden"));
  // Reset selection
  selected = null;
  renderInfo(null);
}

function renderInfo(nodeData){
  tagsWrap.innerHTML = "";
  if(!nodeData){
    placeName.textContent = "提示";
    placeDesc.textContent = "点按任意节点查看地点简介；若已接入游戏，将显示“前往此地”。";
    gotoBtn.disabled = true;
    return;
  }
  placeName.textContent = nodeData.name;
  placeDesc.textContent = nodeData.desc;
  nodeData.tags.forEach(t=>{
    const tag = document.createElement("span");
    tag.className = "chip";
    tag.textContent = t;
    tagsWrap.appendChild(tag);
  });
  // 如果与当前game.js存在映射，则可以启用跳转
  const canGo = typeof window.goToLocation === "function" && !!nodeData.to;
  gotoBtn.disabled = !canGo;
  gotoBtn.dataset.to = nodeData.to || "";
  gotoBtn.textContent = canGo ? "前往此地" : "未接入（可在 reality-map.js 中映射）";
}

function nodeDataFromEl(el){
  const id = el?.dataset?.id;
  const list = WORLD_MAP[currentLayer];
  return list?.find(n=>n.id===id) || null;
}

// —— 事件 ——
$all(".node", map).forEach(node => {
  node.addEventListener("click", e => {
    selected = nodeDataFromEl(node);
    renderInfo(selected);
  });
  node.setAttribute("tabindex","0");
  node.addEventListener("keydown", e=>{
    if(e.key==="Enter"||e.key===" "){ e.preventDefault(); node.click(); }
  });
});

segs.forEach(b => b.addEventListener("click", ()=> setLayer(b.dataset.layer)));

gotoBtn.addEventListener("click", () => {
  const target = gotoBtn.dataset.to;
  if(target && typeof window.goToLocation === "function"){
    window.goToLocation(target);
  }
});

// 简易缩放/拖拽视图（移动端友好）
(function enablePanZoom(){
  let scale = 1, ox = 0, oy = 0, isPanning = false, sx=0, sy=0;

  function apply(){
    map.style.transformOrigin = "0 0";
    map.style.transform = `translate(${ox}px, ${oy}px) scale(${scale})`;
  }

  map.addEventListener("wheel", e => {
    e.preventDefault();
    const delta = Math.sign(e.deltaY) * -0.1;
    scale = Math.min(2.5, Math.max(0.7, scale + delta));
    apply();
  }, {passive:false});

  map.addEventListener("pointerdown", e => {
    isPanning = true; sx = e.clientX - ox; sy = e.clientY - oy; map.setPointerCapture(e.pointerId);
  });
  map.addEventListener("pointermove", e => {
    if(!isPanning) return;
    ox = e.clientX - sx; oy = e.clientY - sy; apply();
  });
  map.addEventListener("pointerup", ()=> isPanning = false);

  document.getElementById("resetZoom").addEventListener("click", () => {
    scale = 1; ox = 0; oy = 0; apply();
  });

  apply();
})();

// 初始化
setLayer("surface");
renderInfo(null);

// —— 给开发者的映射提示 ——
// 你可以把 WORLD_MAP.surface[...] 的 `to` 字段映射到现有 game.js 的地点ID。
// 例如：
// - 商业街 → "shop"
// - 学院区 → "school"
// - 公园   → "park"
// 其他地点等你在 game.js/locations 中添加后，再把 `to` 补上即可。
